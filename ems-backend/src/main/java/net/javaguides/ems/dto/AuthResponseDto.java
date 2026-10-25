package net.javaguides.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn; // seconds (e.g. 900)
    private String email;
    private String name;
    private String role;
    private boolean otpRequired;
    private String message;

    public AuthResponseDto() {
    }

    public static AuthResponseDto otpSent(String email, String message) {
        AuthResponseDto dto = new AuthResponseDto();
        dto.setEmail(email);
        dto.setOtpRequired(true);
        dto.setMessage(message);
        return dto;
    }

    public static AuthResponseDto authenticated(String accessToken, Long expiresIn, String email, String name, String role, String message) {
        AuthResponseDto dto = new AuthResponseDto();
        dto.setAccessToken(accessToken);
        dto.setExpiresIn(expiresIn != null ? expiresIn : 900L);
        dto.setEmail(email);
        dto.setName(name);
        dto.setRole(role);
        dto.setOtpRequired(false);
        dto.setMessage(message);
        return dto;
    }

    public static AuthResponseDto authenticated(String accessToken, String email, String name, String role, String message) {
        return authenticated(accessToken, 900L, email, name, role, message);
    }
}
