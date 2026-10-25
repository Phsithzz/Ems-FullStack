package net.javaguides.ems.security;

import net.javaguides.ems.entity.*;
import net.javaguides.ems.repository.*;
import net.javaguides.ems.services.LedgerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final WalletRepository walletRepository;
    private final CorporateCardRepository corporateCardRepository;
    private final LedgerService ledgerService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            WalletRepository walletRepository,
            CorporateCardRepository corporateCardRepository,
            LedgerService ledgerService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.walletRepository = walletRepository;
        this.corporateCardRepository = corporateCardRepository;
        this.ledgerService = ledgerService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Admin User
        User admin;
        if (userRepository.count() == 0) {
            admin = new User();
            admin.setName("Binance Pay Admin");
            admin.setEmail("admin@binance.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setEnabled(true);
            admin = userRepository.save(admin);
            log.info("🎉 [SEED] Admin created: admin@binance.com / admin123");
        } else {
            admin = userRepository.findAll().get(0);
        }

        // 2. Seed Default Employees if none exist
        Employee emp1 = null;
        Employee emp2 = null;
        if (employeeRepository.count() == 0) {
            emp1 = new Employee(null, "Alice", "Smith", "alice.smith@binance.com");
            emp2 = new Employee(null, "Bob", "Jones", "bob.jones@binance.com");
            Employee emp3 = new Employee(null, "Charlie", "Davis", "charlie.davis@binance.com");
            emp1 = employeeRepository.save(emp1);
            emp2 = employeeRepository.save(emp2);
            employeeRepository.save(emp3);
            log.info("🎉 [SEED] Default employees created");
        } else {
            emp1 = employeeRepository.findAll().get(0);
        }

        // 3. Seed Default Wallets
        if (walletRepository.count() == 0) {
            Wallet treasury = new Wallet();
            treasury.setAccountNumber("WAL-MAIN-TREASURY");
            treasury.setWalletName("Binance Corporate Treasury Reserve");
            treasury.setCurrency("USDT");
            treasury.setBalance(new BigDecimal("1000000.0000"));
            treasury.setLockedBalance(BigDecimal.ZERO);
            treasury.setStatus("ACTIVE");
            treasury.setUser(admin);
            treasury = walletRepository.save(treasury);

            Wallet opsPayroll = new Wallet();
            opsPayroll.setAccountNumber("WAL-OPS-PAYROLL");
            opsPayroll.setWalletName("TH Regional Operations & Payroll Pool");
            opsPayroll.setCurrency("USDT");
            opsPayroll.setBalance(new BigDecimal("250000.0000"));
            opsPayroll.setLockedBalance(BigDecimal.ZERO);
            opsPayroll.setStatus("ACTIVE");
            opsPayroll.setUser(admin);
            opsPayroll = walletRepository.save(opsPayroll);

            Wallet empWallet1 = new Wallet();
            empWallet1.setAccountNumber("WAL-EMP-1001");
            empWallet1.setWalletName("Alice Smith - Compensation Wallet");
            empWallet1.setCurrency("USDT");
            empWallet1.setBalance(new BigDecimal("6500.0000"));
            empWallet1.setLockedBalance(BigDecimal.ZERO);
            empWallet1.setStatus("ACTIVE");
            empWallet1.setEmployee(emp1);
            empWallet1 = walletRepository.save(empWallet1);

            Wallet empWallet2 = new Wallet();
            empWallet2.setAccountNumber("WAL-EMP-1002");
            empWallet2.setWalletName("Bob Jones - Compensation Wallet");
            empWallet2.setCurrency("USDT");
            empWallet2.setBalance(new BigDecimal("8200.0000"));
            empWallet2.setLockedBalance(BigDecimal.ZERO);
            empWallet2.setStatus("ACTIVE");
            empWallet2.setEmployee(emp2);
            walletRepository.save(empWallet2);

            // Post initial balancing double-entry ledger journals
            ledgerService.recordDoubleEntry(
                    null,
                    "CAPITAL_INJECTION",
                    "Initial Treasury Liquidity Allocation",
                    treasury,
                    opsPayroll,
                    new BigDecimal("250000.0000")
            );

            log.info("🎉 [SEED] Default wallets and initial balanced ledger journals created");

            // 4. Seed Corporate Cards
            CorporateCard card1 = new CorporateCard();
            card1.setCardNumber("4532 •••• •••• 9821");
            card1.setCardHolderName("Alice Smith");
            card1.setEmployee(emp1);
            card1.setWallet(empWallet1);
            card1.setExpiryMonth(12);
            card1.setExpiryYear(2028);
            card1.setCvvHash(passwordEncoder.encode("382"));
            card1.setCardType("BINANCE_BLACK_VIRTUAL");
            card1.setCardStatus("ACTIVE");
            card1.setDailyLimit(new BigDecimal("5000.00"));
            card1.setDailySpent(new BigDecimal("350.00"));
            card1.setMonthlyLimit(new BigDecimal("50000.00"));
            card1.setMonthlySpent(new BigDecimal("1200.00"));
            card1.setCreatedAt(LocalDateTime.now().minusDays(10));
            corporateCardRepository.save(card1);

            CorporateCard card2 = new CorporateCard();
            card2.setCardNumber("5214 •••• •••• 4172");
            card2.setCardHolderName("Binance Admin Executive");
            card2.setEmployee(null);
            card2.setWallet(treasury);
            card2.setExpiryMonth(8);
            card2.setExpiryYear(2029);
            card2.setCvvHash(passwordEncoder.encode("889"));
            card2.setCardType("BINANCE_GOLD_DEBIT");
            card2.setCardStatus("ACTIVE");
            card2.setDailyLimit(new BigDecimal("20000.00"));
            card2.setDailySpent(BigDecimal.ZERO);
            card2.setMonthlyLimit(new BigDecimal("200000.00"));
            card2.setMonthlySpent(BigDecimal.ZERO);
            card2.setCreatedAt(LocalDateTime.now().minusDays(5));
            corporateCardRepository.save(card2);

            log.info("🎉 [SEED] Virtual Corporate Cards initialized successfully");
        }
    }
}
