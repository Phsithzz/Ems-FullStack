package net.javaguides.ems.services.impl;

import net.javaguides.ems.dto.AuthResponseDto;
import net.javaguides.ems.dto.LoginRequestDto;
import net.javaguides.ems.dto.RegisterRequestDto;
import net.javaguides.ems.dto.VerifyOtpRequestDto;
import net.javaguides.ems.entity.User;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.UserRepository;
import net.javaguides.ems.security.JwtTokenProvider;
import net.javaguides.ems.services.AuthService;
import net.javaguides.ems.services.EmailService;
import net.javaguides.ems.services.OtpService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           OtpService otpService,
                           EmailService emailService,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponseDto register(RegisterRequestDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + registerDto.getEmail());
        }

        String role = (registerDto.getRole() != null && !registerDto.getRole().trim().isEmpty())
                ? registerDto.getRole().trim().toUpperCase()
                : "ROLE_ADMIN";

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);

        // Auto initiate OTP for seamless activation/login
        String otp = otpService.generateAndStoreOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp);

        return AuthResponseDto.otpSent(user.getEmail(), "Registration successful. 2FA OTP code sent to your email.");
    }

    @Override
    public AuthResponseDto login(LoginRequestDto loginDto) {
        String email = loginDto.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!user.isEnabled()) {
            throw new IllegalStateException("Account is currently disabled. Please contact system admin.");
        }

        // Two-factor Authentication: Generate and dispatch OTP
        String otp = otpService.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otp);

        return AuthResponseDto.otpSent(email, "Password verified. Two-Factor Authentication code sent to your email.");
    }

    @Override
    public AuthResponseDto verifyOtp(VerifyOtpRequestDto verifyDto) {
        String email = verifyDto.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        boolean isValid = otpService.verifyOtp(email, verifyDto.getOtpCode());
        if (!isValid) {
            throw new BadCredentialsException("Invalid or expired OTP verification code.");
        }

        // Issue signed JWT access token upon successful 2FA
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getName(), user.getRole());

        return AuthResponseDto.authenticated(token, user.getEmail(), user.getName(), user.getRole(), "2FA Verification successful. Welcome back!");
    }

    @Override
    public AuthResponseDto resendOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        if (!userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceNotFoundException("User not found: " + normalizedEmail);
        }

        if (!otpService.canResendOtp(normalizedEmail)) {
            long remaining = otpService.getRemainingCooldownSeconds(normalizedEmail);
            throw new IllegalStateException("Please wait " + remaining + " seconds before requesting a new OTP.");
        }

        String otp = otpService.generateAndStoreOtp(normalizedEmail);
        emailService.sendOtpEmail(normalizedEmail, otp);

        return AuthResponseDto.otpSent(normalizedEmail, "New OTP code sent to your email.");
    }

    @Override
    public AuthResponseDto getMe(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return AuthResponseDto.authenticated(null, user.getEmail(), user.getName(), user.getRole(), "Profile retrieved.");
    }
}
