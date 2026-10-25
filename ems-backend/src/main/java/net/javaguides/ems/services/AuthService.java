package net.javaguides.ems.services;

import net.javaguides.ems.dto.AuthResponseDto;
import net.javaguides.ems.dto.LoginRequestDto;
import net.javaguides.ems.dto.RegisterRequestDto;
import net.javaguides.ems.dto.VerifyOtpRequestDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto registerDto);
    AuthResponseDto login(LoginRequestDto loginDto);
    AuthResponseDto verifyOtp(VerifyOtpRequestDto verifyDto);
    AuthResponseDto resendOtp(String email);
    AuthResponseDto refreshToken(String refreshToken);
    void logout(String refreshToken);
    AuthResponseDto getMe(String email);
}
