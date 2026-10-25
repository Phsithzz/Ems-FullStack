package net.javaguides.ems.services.impl;

import net.javaguides.ems.entity.RefreshToken;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.exception.TokenRefreshException;
import net.javaguides.ems.repository.RefreshTokenRepository;
import net.javaguides.ems.services.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    // Refresh Token validity: 7 days
    @Value("${jwt.refresh-expiration-days:7}")
    private int refreshExpirationDays;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Reuse or rotate existing token for user
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS));
        refreshToken.setToken(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString());
        refreshToken.setRevoked(false);
        refreshToken.setCreatedAt(LocalDateTime.now());

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isRevoked()) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token was revoked. Please log in again.");
        }
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token has expired. Please log in again.");
        }
        return token;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    @Transactional
    public RefreshToken rotateRefreshToken(String requestRefreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found in record."));

        verifyExpiration(token);

        // Refresh Token Rotation (RTR): issue a brand new secure token string on every use
        token.setToken(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS));
        token.setCreatedAt(LocalDateTime.now());

        log.info("🔄 [REFRESH TOKEN ROTATED] User: {}", token.getUser().getEmail());
        return refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public void revokeToken(String tokenStr) {
        refreshTokenRepository.findByToken(tokenStr).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            log.info("🚫 [REFRESH TOKEN REVOKED] Token: {}", tokenStr);
        });
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        // Find and delete if exists
    }
}
