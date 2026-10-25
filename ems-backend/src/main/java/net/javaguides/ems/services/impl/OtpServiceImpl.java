package net.javaguides.ems.services.impl;

import net.javaguides.ems.services.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);

    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_MINUTES = 5;
    private static final long COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    private static final String REDIS_OTP_PREFIX = "otp:";
    private static final String REDIS_COOLDOWN_PREFIX = "otp_cooldown:";
    private static final String REDIS_ATTEMPTS_PREFIX = "otp_attempts:";

    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Fallback in-memory storage when Redis is unreachable
    private static class OtpEntry {
        String code;
        Instant expiresAt;
        Instant lastRequestedAt;
        int attempts;

        OtpEntry(String code) {
            this.code = code;
            this.expiresAt = Instant.now().plus(Duration.ofMinutes(OTP_TTL_MINUTES));
            this.lastRequestedAt = Instant.now();
            this.attempts = 0;
        }
    }

    private final Map<String, OtpEntry> inMemoryStore = new ConcurrentHashMap<>();

    @Override
    public String generateAndStoreOtp(String email) {
        String otpCode = String.format("%06d", secureRandom.nextInt(1_000_000));

        boolean savedInRedis = false;
        if (redisTemplate != null) {
            try {
                String otpKey = REDIS_OTP_PREFIX + email;
                String cooldownKey = REDIS_COOLDOWN_PREFIX + email;
                String attemptsKey = REDIS_ATTEMPTS_PREFIX + email;

                redisTemplate.opsForValue().set(otpKey, otpCode, Duration.ofMinutes(OTP_TTL_MINUTES));
                redisTemplate.opsForValue().set(cooldownKey, String.valueOf(Instant.now().getEpochSecond()), Duration.ofSeconds(COOLDOWN_SECONDS));
                redisTemplate.delete(attemptsKey);

                savedInRedis = true;
                log.info("[Redis] OTP generated and saved for email: {}", email);
            } catch (Exception e) {
                log.warn("[Redis Unavailable] Falling back to In-Memory OTP store: {}", e.getMessage());
            }
        }

        if (!savedInRedis) {
            inMemoryStore.put(email, new OtpEntry(otpCode));
            log.info("[In-Memory] OTP generated and saved for email: {}", email);
        }

        return otpCode;
    }

    @Override
    public boolean verifyOtp(String email, String otpCode) {
        if (otpCode == null || otpCode.trim().isEmpty()) {
            return false;
        }

        if (redisTemplate != null) {
            try {
                String otpKey = REDIS_OTP_PREFIX + email;
                String attemptsKey = REDIS_ATTEMPTS_PREFIX + email;

                String storedOtp = redisTemplate.opsForValue().get(otpKey);
                if (storedOtp == null) {
                    log.warn("OTP expired or not found for: {}", email);
                    return false;
                }

                Long currentAttempts = redisTemplate.opsForValue().increment(attemptsKey);
                if (currentAttempts != null && currentAttempts > MAX_ATTEMPTS) {
                    log.warn("Max OTP verification attempts exceeded for: {}. Invalidating code.", email);
                    redisTemplate.delete(otpKey);
                    return false;
                }

                if (storedOtp.equals(otpCode.trim())) {
                    redisTemplate.delete(otpKey);
                    redisTemplate.delete(attemptsKey);
                    log.info("OTP verified successfully via Redis for: {}", email);
                    return true;
                } else {
                    log.warn("Invalid OTP entered for: {}. Attempt: {}/{}", email, currentAttempts, MAX_ATTEMPTS);
                    return false;
                }
            } catch (Exception e) {
                log.warn("[Redis Error] Fallback verification: {}", e.getMessage());
            }
        }

        // Fallback in-memory verification
        OtpEntry entry = inMemoryStore.get(email);
        if (entry == null || Instant.now().isAfter(entry.expiresAt)) {
            inMemoryStore.remove(email);
            return false;
        }

        entry.attempts++;
        if (entry.attempts > MAX_ATTEMPTS) {
            inMemoryStore.remove(email);
            log.warn("Max in-memory OTP attempts exceeded for: {}", email);
            return false;
        }

        if (entry.code.equals(otpCode.trim())) {
            inMemoryStore.remove(email);
            log.info("OTP verified successfully via In-Memory for: {}", email);
            return true;
        }

        return false;
    }

    @Override
    public boolean canResendOtp(String email) {
        return getRemainingCooldownSeconds(email) <= 0;
    }

    @Override
    public long getRemainingCooldownSeconds(String email) {
        if (redisTemplate != null) {
            try {
                String cooldownKey = REDIS_COOLDOWN_PREFIX + email;
                Long expire = redisTemplate.getExpire(cooldownKey);
                if (expire != null && expire > 0) {
                    return expire;
                }
                return 0;
            } catch (Exception e) {
                log.warn("[Redis Error] Fallback cooldown check: {}", e.getMessage());
            }
        }

        OtpEntry entry = inMemoryStore.get(email);
        if (entry != null) {
            long elapsedSeconds = Duration.between(entry.lastRequestedAt, Instant.now()).getSeconds();
            long remaining = COOLDOWN_SECONDS - elapsedSeconds;
            return Math.max(0, remaining);
        }

        return 0;
    }
}
