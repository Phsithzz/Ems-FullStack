package net.javaguides.ems.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.javaguides.ems.entity.IdempotencyRecord;
import net.javaguides.ems.exception.IdempotencyConflictException;
import net.javaguides.ems.repository.IdempotencyRecordRepository;
import net.javaguides.ems.services.IdempotencyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
public class IdempotencyServiceImpl implements IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyServiceImpl.class);
    private static final Duration LOCK_TIMEOUT = Duration.ofSeconds(30);
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired
    private IdempotencyRecordRepository idempotencyRecordRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Resilient fallback memory lock map in case Redis is not connected
    private final ConcurrentHashMap<String, Long> inMemoryLocks = new ConcurrentHashMap<>();

    @Override
    public <T> T execute(String idempotencyKey, String endpoint, Class<T> responseType, Supplier<T> execution) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return execution.get();
        }

        String key = idempotencyKey.trim();

        // 1. Check existing record in DB
        Optional<IdempotencyRecord> existingOpt = idempotencyRecordRepository.findByIdempotencyKey(key);
        if (existingOpt.isPresent()) {
            IdempotencyRecord record = existingOpt.get();
            if ("RESOLVED".equalsIgnoreCase(record.getStatus())) {
                log.info("🎯 [IDEMPOTENCY HIT] Key '{}' resolved previously. Returning cached response.", key);
                try {
                    return objectMapper.readValue(record.getResponseBody(), responseType);
                } catch (Exception e) {
                    log.error("Failed to deserialize cached response for key: {}", key, e);
                    throw new RuntimeException("Corrupted idempotency cache record", e);
                }
            } else if ("PROCESSING".equalsIgnoreCase(record.getStatus())) {
                log.warn("⚠️ [IDEMPOTENCY CONFLICT] Key '{}' is currently being processed by another worker.", key);
                throw new IdempotencyConflictException("Concurrent request with Idempotency-Key '" + key + "' is currently in progress. Please retry after a few seconds.");
            }
        }

        // 2. Acquire Lock (Distributed Redis lock or in-memory lock)
        acquireLock(key);

        IdempotencyRecord record = new IdempotencyRecord();
        record.setIdempotencyKey(key);
        record.setEndpoint(endpoint);
        record.setStatus("PROCESSING");
        record.setCreatedAt(LocalDateTime.now());
        record.setLockedUntil(LocalDateTime.now().plus(LOCK_TIMEOUT));

        try {
            saveRecordInNewTx(record);
        } catch (Exception e) {
            releaseLock(key);
            log.warn("Concurrent insert collision for Idempotency-Key: {}", key);
            throw new IdempotencyConflictException("Concurrent request with Idempotency-Key '" + key + "' is already registered.");
        }

        try {
            // 3. Execute business logic
            T result = execution.get();

            // 4. Serialize & Persist result
            String jsonResult = objectMapper.writeValueAsString(result);
            record.setStatus("RESOLVED");
            record.setStatusCode(200);
            record.setResponseBody(jsonResult);
            saveRecordInNewTx(record);

            return result;
        } catch (Exception e) {
            record.setStatus("FAILED");
            record.setResponseBody(e.getMessage());
            try {
                saveRecordInNewTx(record);
            } catch (Exception ignored) {}
            throw (e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e));
        } finally {
            releaseLock(key);
        }
    }

    private void acquireLock(String key) {
        String lockKey = "lock:idempotency:" + key;
        boolean acquired = false;
        try {
            if (redisTemplate != null) {
                Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", LOCK_TIMEOUT);
                acquired = Boolean.TRUE.equals(success);
            }
        } catch (Exception e) {
            log.warn("Redis unavailable for idempotency lock, using in-memory lock fallback.");
        }

        if (!acquired && redisTemplate == null) {
            long now = System.currentTimeMillis();
            Long existingExpiry = inMemoryLocks.putIfAbsent(key, now + LOCK_TIMEOUT.toMillis());
            if (existingExpiry != null && existingExpiry > now) {
                acquired = false;
            } else {
                inMemoryLocks.put(key, now + LOCK_TIMEOUT.toMillis());
                acquired = true;
            }
        }

        if (!acquired) {
            throw new IdempotencyConflictException("Could not acquire lock for Idempotency-Key '" + key + "'. Another transaction is in progress.");
        }
    }

    private void releaseLock(String key) {
        String lockKey = "lock:idempotency:" + key;
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(lockKey);
            }
        } catch (Exception ignored) {}
        inMemoryLocks.remove(key);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveRecordInNewTx(IdempotencyRecord record) {
        idempotencyRecordRepository.save(record);
    }
}
