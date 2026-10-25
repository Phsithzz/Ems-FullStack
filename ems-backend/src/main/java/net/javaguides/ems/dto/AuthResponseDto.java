package net.javaguides.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
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

    public static AuthResponseDto authenticated(String accessToken, String email, String name, String role, String message) {
        AuthResponseDto dto = new AuthResponseDto();
        dto.setAccessToken(accessToken);
        dto.setEmail(email);
        dto.setName(name);
        dto.setRole(role);
        dto.setOtpRequired(false);
        dto.setMessage(message);
        return dto;
    }
}
