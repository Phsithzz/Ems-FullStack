package net.javaguides.ems.security;

import net.javaguides.ems.entity.User;
import net.javaguides.ems.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Binance Administrator");
            admin.setEmail("admin@binance.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setEnabled(true);

            userRepository.save(admin);

            log.info("==========================================================");
            log.info("🎉 [SEED DATA INITIALIZED]");
            log.info("   Default Admin Account Created:");
            log.info("   Email    : admin@binance.com");
            log.info("   Password : admin123");
            log.info("==========================================================");
        }
    }
}
