package net.javaguides.ems.services;

import net.javaguides.ems.entity.RefreshToken;
import net.javaguides.ems.entity.User;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyExpiration(RefreshToken token);

    Optional<RefreshToken> findByToken(String token);

    RefreshToken rotateRefreshToken(String requestRefreshToken);

    void revokeToken(String token);

    void deleteByUserId(Long userId);
}
