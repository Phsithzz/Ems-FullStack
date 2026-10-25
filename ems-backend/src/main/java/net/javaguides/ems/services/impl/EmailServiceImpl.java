package net.javaguides.ems.services.impl;

import jakarta.mail.internet.MimeMessage;
import net.javaguides.ems.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@workpay.io}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("==========================================================");
        log.info("📧 [WORKPAY 2FA DISPATCH]");
        log.info("   Recipient : {}", toEmail);
        log.info("   OTP Code  : >>> {} <<< (Valid for 5 minutes)", otpCode);
        log.info("==========================================================");

        if (mailSender == null) {
            log.warn("JavaMailSender is not initialized. OTP logged to console above.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔒 [WorkPay] Your Two-Factor Verification Code");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;'>"
                    + "<div style='display: flex; align-items: center; margin-bottom: 24px;'>"
                    + "<div style='background-color: #4F46E5; color: white; width: 40px; height: 40px; border-radius: 10px; font-weight: bold; font-size: 20px; text-align: center; line-height: 40px;'>W</div>"
                    + "<span style='margin-left: 12px; font-size: 18px; font-weight: bold; color: #1e293b;'>Work<span style='color: #4F46E5;'>Pay</span> Platform</span>"
                    + "</div>"
                    + "<h2 style='color: #0f172a; margin-top: 0;'>Two-Factor Verification Code</h2>"
                    + "<p style='color: #64748b; font-size: 14px;'>You requested a secure login or transaction authentication for your PayPulse account.</p>"
                    + "<div style='background-color: #FFF4EE; border: 1px dashed #FF844B; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;'>"
                    + "<span style='font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #FF5C35;'>" + otpCode + "</span>"
                    + "</div>"
                    + "<p style='color: #64748b; font-size: 13px;'>This code is valid for <strong>5 minutes</strong>. If you did not make this request, please change your password immediately.</p>"
                    + "<hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;' />"
                    + "<p style='color: #94a3b8; font-size: 11px; text-align: center;'>© 2026 PayPulse Platform • Enterprise Security</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP email successfully sent via SMTP to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}. (Use OTP printed in console)", toEmail, e.getMessage());
        }
    }
}
