package net.javaguides.ems.services;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
