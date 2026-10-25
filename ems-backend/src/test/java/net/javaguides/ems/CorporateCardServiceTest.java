package net.javaguides.ems;

import net.javaguides.ems.dto.CardAuthorizeRequestDto;
import net.javaguides.ems.dto.CardAuthorizeResponseDto;
import net.javaguides.ems.dto.CorporateCardDto;
import net.javaguides.ems.entity.CardTransaction;
import net.javaguides.ems.entity.CorporateCard;
import net.javaguides.ems.entity.Wallet;
import net.javaguides.ems.exception.CardOperationException;
import net.javaguides.ems.repository.CardTransactionRepository;
import net.javaguides.ems.repository.CorporateCardRepository;
import net.javaguides.ems.repository.EmployeeRepository;
import net.javaguides.ems.repository.WalletRepository;
import net.javaguides.ems.services.CorporateCardService;
import net.javaguides.ems.services.IdempotencyService;
import net.javaguides.ems.services.LedgerService;
import net.javaguides.ems.services.impl.CorporateCardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CorporateCardServiceTest {

    private CorporateCardRepository corporateCardRepository;
    private CardTransactionRepository cardTransactionRepository;
    private WalletRepository walletRepository;
    private EmployeeRepository employeeRepository;
    private PasswordEncoder passwordEncoder;
    private LedgerService ledgerService;
    private IdempotencyService idempotencyService;
    private CorporateCardService corporateCardService;

    @BeforeEach
    void setUp() {
        corporateCardRepository = mock(CorporateCardRepository.class);
        cardTransactionRepository = mock(CardTransactionRepository.class);
        walletRepository = mock(WalletRepository.class);
        employeeRepository = mock(EmployeeRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        ledgerService = mock(LedgerService.class);
        idempotencyService = mock(IdempotencyService.class);

        // By default, execute idempotency lambda directly
        when(idempotencyService.execute(any(), any(), any(), any())).thenAnswer(i -> {
            java.util.function.Supplier<?> s = i.getArgument(3);
            return s.get();
        });

        corporateCardService = new CorporateCardServiceImpl(
                corporateCardRepository,
                cardTransactionRepository,
                walletRepository,
                employeeRepository,
                passwordEncoder,
                ledgerService,
                idempotencyService
        );
    }

    @Test
    @DisplayName("Should successfully authorize card swipe and hold funds in backing wallet")
    void shouldAuthorizeCardTransactionAndHoldFunds() {
        Wallet wallet = new Wallet();
        wallet.setId(10L);
        wallet.setAccountNumber("WAL-10");
        wallet.setBalance(new BigDecimal("1000.00"));
        wallet.setLockedBalance(BigDecimal.ZERO);
        wallet.setStatus("ACTIVE");

        CorporateCard card = new CorporateCard();
        card.setId(1L);
        card.setCardNumber("4532 •••• •••• 9999");
        card.setCardStatus("ACTIVE");
        card.setDailyLimit(new BigDecimal("1000.00"));
        card.setDailySpent(BigDecimal.ZERO);
        card.setMonthlyLimit(new BigDecimal("10000.00"));
        card.setMonthlySpent(BigDecimal.ZERO);
        card.setWallet(wallet);

        when(corporateCardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(walletRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(wallet));
        when(cardTransactionRepository.save(any(CardTransaction.class))).thenAnswer(i -> {
            CardTransaction t = i.getArgument(0);
            t.setId(99L);
            return t;
        });

        CardAuthorizeRequestDto request = new CardAuthorizeRequestDto("Amazon AWS Cloud", new BigDecimal("150.00"), "USD");
        CardAuthorizeResponseDto response = corporateCardService.authorizeTransaction(1L, request, "IDEMP-KEY-001");

        assertNotNull(response);
        assertEquals("AUTHORIZED", response.getStatus());
        assertNotNull(response.getAuthorizationCode());
        assertEquals(new BigDecimal("150.00"), response.getAmount());

        // Verify hold placed on wallet
        assertEquals(new BigDecimal("150.00"), wallet.getLockedBalance());
        assertEquals(new BigDecimal("850.00"), wallet.getAvailableBalance());
        // Verify card daily spent incremented
        assertEquals(new BigDecimal("150.00"), card.getDailySpent());
    }

    @Test
    @DisplayName("Should decline authorization if card is FROZEN")
    void shouldDeclineIfCardIsFrozen() {
        CorporateCard card = new CorporateCard();
        card.setId(1L);
        card.setCardNumber("4532 •••• •••• 9999");
        card.setCardStatus("FROZEN");
        card.setDailyLimit(new BigDecimal("1000.00"));
        card.setDailySpent(BigDecimal.ZERO);

        when(corporateCardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(cardTransactionRepository.save(any(CardTransaction.class))).thenAnswer(i -> {
            CardTransaction t = i.getArgument(0);
            t.setId(100L);
            return t;
        });

        CardAuthorizeRequestDto request = new CardAuthorizeRequestDto("Starbucks Coffee", new BigDecimal("12.50"), "USD");
        CardAuthorizeResponseDto response = corporateCardService.authorizeTransaction(1L, request, "IDEMP-KEY-002");

        assertEquals("DECLINED", response.getStatus());
        assertTrue(response.getDeclineReason().contains("FROZEN"));
    }

    @Test
    @DisplayName("Should decline authorization if daily spend limit exceeded")
    void shouldDeclineIfLimitExceeded() {
        CorporateCard card = new CorporateCard();
        card.setId(1L);
        card.setCardNumber("4532 •••• •••• 9999");
        card.setCardStatus("ACTIVE");
        card.setDailyLimit(new BigDecimal("500.00"));
        card.setDailySpent(new BigDecimal("450.00")); // Only 50 remaining!

        when(corporateCardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(cardTransactionRepository.save(any(CardTransaction.class))).thenAnswer(i -> {
            CardTransaction t = i.getArgument(0);
            t.setId(101L);
            return t;
        });

        CardAuthorizeRequestDto request = new CardAuthorizeRequestDto("Apple Store", new BigDecimal("100.00"), "USD");
        CardAuthorizeResponseDto response = corporateCardService.authorizeTransaction(1L, request, "IDEMP-KEY-003");

        assertEquals("DECLINED", response.getStatus());
        assertTrue(response.getDeclineReason().contains("Daily spend limit exceeded"));
    }
}
