package net.javaguides.ems.services.impl;

import net.javaguides.ems.dto.*;
import net.javaguides.ems.entity.*;
import net.javaguides.ems.event.CardEvent;
import net.javaguides.ems.exception.CardOperationException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.*;
import net.javaguides.ems.services.CorporateCardService;
import net.javaguides.ems.services.EventProducerService;
import net.javaguides.ems.services.IdempotencyService;
import net.javaguides.ems.services.LedgerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CorporateCardServiceImpl implements CorporateCardService {

    private static final Logger log = LoggerFactory.getLogger(CorporateCardServiceImpl.class);

    private final CorporateCardRepository corporateCardRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final WalletRepository walletRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final LedgerService ledgerService;
    private final IdempotencyService idempotencyService;

    @Autowired(required = false)
    private EventProducerService eventProducerService;

    public CorporateCardServiceImpl(
            CorporateCardRepository corporateCardRepository,
            CardTransactionRepository cardTransactionRepository,
            WalletRepository walletRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            LedgerService ledgerService,
            IdempotencyService idempotencyService
    ) {
        this.corporateCardRepository = corporateCardRepository;
        this.cardTransactionRepository = cardTransactionRepository;
        this.walletRepository = walletRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.ledgerService = ledgerService;
        this.idempotencyService = idempotencyService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CorporateCardDto> getAllCards() {
        return corporateCardRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CorporateCardDto getCardById(Long id) {
        CorporateCard card = corporateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Card not found with id: " + id));
        return mapToDto(card);
    }

    @Override
    @Transactional
    public CorporateCardDto createCard(CreateCardRequestDto dto) {
        Wallet wallet = walletRepository.findById(dto.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + dto.getWalletId()));

        Employee employee = null;
        if (dto.getEmployeeId() != null) {
            employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));
        }

        // Generate synthetic masked card number
        SecureRandom random = new SecureRandom();
        int last4 = 1000 + random.nextInt(9000);
        String maskedCardNumber = "4532 •••• •••• " + last4;

        int currentYear = Year.now().getValue();
        int expiryYear = currentYear + 3;
        int expiryMonth = 1 + random.nextInt(12);

        CorporateCard card = new CorporateCard();
        card.setCardNumber(maskedCardNumber);
        card.setCardHolderName(dto.getCardHolderName());
        card.setEmployee(employee);
        card.setWallet(wallet);
        card.setExpiryMonth(expiryMonth);
        card.setExpiryYear(expiryYear);
        card.setCvvHash(passwordEncoder.encode(String.valueOf(100 + random.nextInt(900))));
        card.setCardType(dto.getCardType() != null ? dto.getCardType() : "PAYPULSE_BLACK_VIRTUAL");
        card.setCardStatus("ACTIVE");
        card.setDailyLimit(dto.getDailyLimit() != null ? dto.getDailyLimit() : new BigDecimal("5000.00"));
        card.setDailySpent(BigDecimal.ZERO);
        card.setMonthlyLimit(dto.getMonthlyLimit() != null ? dto.getMonthlyLimit() : new BigDecimal("50000.00"));
        card.setMonthlySpent(BigDecimal.ZERO);
        card.setCreatedAt(LocalDateTime.now());

        CorporateCard saved = corporateCardRepository.save(card);
        log.info("💳 [CORPORATE CARD ISSUED] Card: {} | Holder: {}", saved.getCardNumber(), saved.getCardHolderName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CorporateCardDto updateCardStatus(Long cardId, String status) {
        CorporateCard card = corporateCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Card not found with id: " + cardId));

        if (!"ACTIVE".equalsIgnoreCase(status) && !"FROZEN".equalsIgnoreCase(status) && !"TERMINATED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Invalid card status: " + status);
        }

        card.setCardStatus(status.toUpperCase());
        CorporateCard saved = corporateCardRepository.save(card);
        log.info("🔒 [CARD STATUS UPDATED] Card ID: {} -> {}", cardId, status.toUpperCase());
        return mapToDto(saved);
    }

    @Override
    public CardAuthorizeResponseDto authorizeTransaction(Long cardId, CardAuthorizeRequestDto dto, String idempotencyKey) {
        return idempotencyService.execute(
                idempotencyKey,
                "/api/cards/" + cardId + "/authorize",
                CardAuthorizeResponseDto.class,
                () -> executeAuthorization(cardId, dto, idempotencyKey)
        );
    }

    @Transactional
    public CardAuthorizeResponseDto executeAuthorization(Long cardId, CardAuthorizeRequestDto dto, String idempotencyKey) {
        CorporateCard card = corporateCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Card not found with id: " + cardId));

        BigDecimal amount = dto.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be strictly positive");
        }

        // 1. Status Check
        if (!"ACTIVE".equalsIgnoreCase(card.getCardStatus())) {
            return recordDeclined(card, dto, idempotencyKey, "Card is " + card.getCardStatus());
        }

        // 2. Limit Check
        if (card.getDailySpent().add(amount).compareTo(card.getDailyLimit()) > 0) {
            return recordDeclined(card, dto, idempotencyKey, "Daily spend limit exceeded (Limit: " + card.getDailyLimit() + ")");
        }
        if (card.getMonthlySpent().add(amount).compareTo(card.getMonthlyLimit()) > 0) {
            return recordDeclined(card, dto, idempotencyKey, "Monthly spend limit exceeded (Limit: " + card.getMonthlyLimit() + ")");
        }

        // 3. Wallet Hold Check with Row-level Lock
        Wallet wallet = walletRepository.findByIdForUpdate(card.getWallet().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Backing wallet not found"));

        if (!wallet.canDebit(amount)) {
            return recordDeclined(card, dto, idempotencyKey, "Insufficient funds in backing wallet");
        }

        // Place Hold
        wallet.hold(amount);
        walletRepository.save(wallet);

        // Update Card spent figures
        card.setDailySpent(card.getDailySpent().add(amount));
        card.setMonthlySpent(card.getMonthlySpent().add(amount));
        corporateCardRepository.save(card);

        // Create Transaction
        String authCode = "AUTH-" + (100000 + new SecureRandom().nextInt(900000));
        CardTransaction txn = new CardTransaction();
        txn.setCorporateCard(card);
        txn.setMerchantName(dto.getMerchantName());
        txn.setAmount(amount);
        txn.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        txn.setStatus("AUTHORIZED");
        txn.setAuthorizationCode(authCode);
        txn.setIdempotencyKey(idempotencyKey);
        txn.setCreatedAt(LocalDateTime.now());

        CardTransaction savedTxn = cardTransactionRepository.save(txn);
        log.info("✅ [CARD AUTH APPROVED] Card: {} | Merchant: {} | Amount: {} | Code: {}",
                card.getCardNumber(), dto.getMerchantName(), amount, authCode);

        // Publish Asynchronous Kafka Event (Phase 5)
        if (eventProducerService != null) {
            eventProducerService.publishCardEvent(
                    CardEvent.builder()
                            .eventId(UUID.randomUUID().toString())
                            .eventType("CARD_AUTHORIZED")
                            .cardId(card.getId())
                            .cardNumber(card.getCardNumber())
                            .merchantName(dto.getMerchantName())
                            .amount(amount)
                            .currency(txn.getCurrency())
                            .status("AUTHORIZED")
                            .authCode(authCode)
                            .timestamp(savedTxn.getCreatedAt())
                            .build()
            );
        }

        return CardAuthorizeResponseDto.builder()
                .transactionId(savedTxn.getId())
                .cardId(card.getId())
                .merchantName(dto.getMerchantName())
                .amount(amount)
                .currency(txn.getCurrency())
                .status("AUTHORIZED")
                .authorizationCode(authCode)
                .timestamp(savedTxn.getCreatedAt())
                .build();
    }

    private CardAuthorizeResponseDto recordDeclined(CorporateCard card, CardAuthorizeRequestDto dto, String idempotencyKey, String reason) {
        log.warn("❌ [CARD AUTH DECLINED] Card: {} | Reason: {}", card.getCardNumber(), reason);
        CardTransaction txn = new CardTransaction();
        txn.setCorporateCard(card);
        txn.setMerchantName(dto.getMerchantName());
        txn.setAmount(dto.getAmount());
        txn.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        txn.setStatus("DECLINED");
        txn.setDeclineReason(reason);
        txn.setIdempotencyKey(idempotencyKey);
        txn.setCreatedAt(LocalDateTime.now());

        CardTransaction saved = cardTransactionRepository.save(txn);
        return CardAuthorizeResponseDto.builder()
                .transactionId(saved.getId())
                .cardId(card.getId())
                .merchantName(dto.getMerchantName())
                .amount(dto.getAmount())
                .currency(saved.getCurrency())
                .status("DECLINED")
                .declineReason(reason)
                .timestamp(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CardAuthorizeResponseDto settleTransaction(Long transactionId) {
        CardTransaction txn = cardTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Card transaction not found: " + transactionId));

        if (!"AUTHORIZED".equalsIgnoreCase(txn.getStatus())) {
            throw new CardOperationException("Only AUTHORIZED transactions can be settled. Current status: " + txn.getStatus());
        }

        CorporateCard card = txn.getCorporateCard();
        Wallet wallet = walletRepository.findByIdForUpdate(card.getWallet().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Backing wallet not found"));

        // Capture Hold
        wallet.captureHold(txn.getAmount());
        walletRepository.save(wallet);

        txn.setStatus("SETTLED");
        txn.setSettledAt(LocalDateTime.now());
        cardTransactionRepository.save(txn);

        log.info("🏁 [CARD TXN SETTLED] Card: {} | Merchant: {} | Amount: {}",
                card.getCardNumber(), txn.getMerchantName(), txn.getAmount());

        return CardAuthorizeResponseDto.builder()
                .transactionId(txn.getId())
                .cardId(card.getId())
                .merchantName(txn.getMerchantName())
                .amount(txn.getAmount())
                .currency(txn.getCurrency())
                .status("SETTLED")
                .authorizationCode(txn.getAuthorizationCode())
                .timestamp(txn.getSettledAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardTransaction> getCardTransactions(Long cardId) {
        return cardTransactionRepository.findByCorporateCardIdOrderByCreatedAtDesc(cardId);
    }

    private CorporateCardDto mapToDto(CorporateCard card) {
        String empName = card.getEmployee() != null ?
                (card.getEmployee().getFirstName() + " " + card.getEmployee().getLastName()) : "Treasury Admin";

        return CorporateCardDto.builder()
                .id(card.getId())
                .cardNumber(card.getCardNumber())
                .cardHolderName(card.getCardHolderName())
                .employeeId(card.getEmployee() != null ? card.getEmployee().getId() : null)
                .employeeName(empName)
                .walletId(card.getWallet().getId())
                .walletAccountNumber(card.getWallet().getAccountNumber())
                .expiryMonth(card.getExpiryMonth())
                .expiryYear(card.getExpiryYear())
                .cardType(card.getCardType())
                .cardStatus(card.getCardStatus())
                .dailyLimit(card.getDailyLimit())
                .dailySpent(card.getDailySpent())
                .monthlyLimit(card.getMonthlyLimit())
                .monthlySpent(card.getMonthlySpent())
                .createdAt(card.getCreatedAt())
                .build();
    }
}
