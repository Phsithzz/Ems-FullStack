package net.javaguides.ems.controllers;

import jakarta.servlet.http.HttpServletResponse;
import net.javaguides.ems.dto.AuthResponseDto;
import net.javaguides.ems.dto.LoginRequestDto;
import net.javaguides.ems.dto.RegisterRequestDto;
import net.javaguides.ems.dto.VerifyOtpRequestDto;
import net.javaguides.ems.services.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Duration REFRESH_TOKEN_COOKIE_MAX_AGE = Duration.ofDays(7);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto registerDto) {
        try {
            AuthResponseDto response = authService.register(registerDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginDto) {
        try {
            AuthResponseDto response = authService.login(loginDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequestDto verifyDto,
            HttpServletResponse servletResponse
    ) {
        try {
            AuthResponseDto response = authService.verifyOtp(verifyDto);

            // Set secure HttpOnly cookie for Refresh Token
            if (response.getRefreshToken() != null) {
                ResponseCookie cookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                        .httpOnly(true)
                        .secure(false) // Set true in HTTPS production
                        .path("/api/auth")
                        .maxAge(REFRESH_TOKEN_COOKIE_MAX_AGE)
                        .sameSite("Lax")
                        .build();
                servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletResponse servletResponse
    ) {
        try {
            String token = cookieRefreshToken;
            if ((token == null || token.trim().isEmpty()) && body != null) {
                token = body.get("refreshToken");
            }

            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Refresh token cookie is missing or expired."));
            }

            AuthResponseDto response = authService.refreshToken(token);

            // Set rotated HttpOnly cookie
            if (response.getRefreshToken() != null) {
                ResponseCookie cookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                        .httpOnly(true)
                        .secure(false)
                        .path("/api/auth")
                        .maxAge(REFRESH_TOKEN_COOKIE_MAX_AGE)
                        .sameSite("Lax")
                        .build();
                servletResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Failed to refresh access token: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletResponse servletResponse
    ) {
        String token = cookieRefreshToken;
        if ((token == null || token.trim().isEmpty()) && body != null) {
            token = body.get("refreshToken");
        }

        authService.logout(token);

        // Clear HttpOnly cookie
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ResponseEntity.ok(Map.of("message", "Logged out successfully and refresh token revoked."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam("email") String email) {
        try {
            AuthResponseDto response = authService.resendOtp(email);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        AuthResponseDto response = authService.getMe(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
