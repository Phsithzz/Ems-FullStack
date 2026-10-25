package net.javaguides.ems.services;

public interface OtpService {
    String generateAndStoreOtp(String email);
    boolean verifyOtp(String email, String otpCode);
    boolean canResendOtp(String email);
    long getRemainingCooldownSeconds(String email);
}
