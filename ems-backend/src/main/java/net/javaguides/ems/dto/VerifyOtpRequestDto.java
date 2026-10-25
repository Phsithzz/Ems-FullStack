package net.javaguides.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequestDto {
    private String email;
    private String otpCode;

    public VerifyOtpRequestDto() {
    }

    public VerifyOtpRequestDto(String email, String otpCode) {
        this.email = email;
        this.otpCode = otpCode;
    }
}
