package net.javaguides.ems.services.impl;

import net.javaguides.ems.dto.PaymentResponseDto;
import net.javaguides.ems.dto.TransferRequestDto;
import net.javaguides.ems.dto.WalletDto;
import net.javaguides.ems.entity.PaymentTransaction;
import net.javaguides.ems.entity.Wallet;
import net.javaguides.ems.exception.InsufficientFundsException;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.PaymentTransactionRepository;
import net.javaguides.ems.repository.WalletRepository;
import net.javaguides.ems.services.IdempotencyService;
import net.javaguides.ems.services.LedgerService;
import net.javaguides.ems.services.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WalletServiceImpl implements WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletServiceImpl.class);

    private final WalletRepository walletRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final LedgerService ledgerService;
    private final IdempotencyService idempotencyService;

    public WalletServiceImpl(
            WalletRepository walletRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            LedgerService ledgerService,
            IdempotencyService idempotencyService
    ) {
        this.walletRepository = walletRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.ledgerService = ledgerService;
        this.idempotencyService = idempotencyService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletDto> getAllWallets() {
        return walletRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDto getWalletById(Long id) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + id));
        return mapToDto(wallet);
    }

    @Override
    public PaymentResponseDto transferFunds(TransferRequestDto request, String idempotencyKey) {
        // Enforce Idempotency Key protection
        return idempotencyService.execute(
                idempotencyKey,
                "/api/wallets/transfer",
                PaymentResponseDto.class,
                () -> executeTransferUnderLock(request, idempotencyKey)
        );
    }

    /**
     * Executes the money transfer inside a single atomic transaction.
     * Uses deterministic lock ordering (ascending ID) to eliminate deadlock hazards under high concurrency.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentResponseDto executeTransferUnderLock(TransferRequestDto request, String idempotencyKey) {
        Long sourceId = request.getSourceWalletId();
        Long targetId = request.getTargetWalletId();
        BigDecimal amount = request.getAmount();

        if (sourceId.equals(targetId)) {
            throw new IllegalArgumentException("Source and target wallets cannot be the same account");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be strictly positive");
        }

        // Lock both wallets in strictly ascending ID order to prevent deadlock
        Long firstLockId = Math.min(sourceId, targetId);
        Long secondLockId = Math.max(sourceId, targetId);

        Wallet wallet1 = walletRepository.findByIdForUpdate(firstLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + firstLockId));
        Wallet wallet2 = walletRepository.findByIdForUpdate(secondLockId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found with id: " + secondLockId));

        Wallet sourceWallet = sourceId.equals(wallet1.getId()) ? wallet1 : wallet2;
        Wallet targetWallet = targetId.equals(wallet1.getId()) ? wallet1 : wallet2;

        // Validation
        if (!sourceWallet.canDebit(amount)) {
            throw new InsufficientFundsException("Insufficient available balance in wallet: "
                    + sourceWallet.getAccountNumber()
                    + " (Available: " + sourceWallet.getAvailableBalance() + " " + sourceWallet.getCurrency() + ")");
        }

        if (!"ACTIVE".equalsIgnoreCase(targetWallet.getStatus())) {
            throw new IllegalStateException("Target wallet " + targetWallet.getAccountNumber() + " is not active");
        }

        // Perform balance movement
        sourceWallet.debit(amount);
        targetWallet.credit(amount);

        walletRepository.save(sourceWallet);
        walletRepository.save(targetWallet);

        // Record Transaction
        String txnRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PaymentTransaction txn = new PaymentTransaction();
        txn.setTransactionReference(txnRef);
        txn.setIdempotencyKey(idempotencyKey);
        txn.setSourceWallet(sourceWallet);
        txn.setTargetWallet(targetWallet);
        txn.setAmount(amount);
        txn.setFee(BigDecimal.ZERO);
        txn.setCurrency(sourceWallet.getCurrency());
        txn.setType("P2P_TRANSFER");
        txn.setStatus("SUCCESS");
        txn.setDescription(request.getDescription() != null ? request.getDescription() : "Transfer between accounts");
        txn.setCreatedAt(LocalDateTime.now());
        txn.setCompletedAt(LocalDateTime.now());

        PaymentTransaction savedTxn = paymentTransactionRepository.save(txn);

        // Post balanced double-entry ledger entry
        ledgerService.recordDoubleEntry(
                savedTxn,
                "TRANSFER",
                txn.getDescription(),
                sourceWallet,
                targetWallet,
                amount
        );

        log.info("💸 [TRANSFER SUCCESS] Ref: {} | From: {} -> To: {} | Amount: {} {}",
                txnRef, sourceWallet.getAccountNumber(), targetWallet.getAccountNumber(), amount, sourceWallet.getCurrency());

        return PaymentResponseDto.builder()
                .transactionReference(savedTxn.getTransactionReference())
                .idempotencyKey(idempotencyKey)
                .sourceWalletId(sourceWallet.getId())
                .sourceWalletName(sourceWallet.getWalletName())
                .targetWalletId(targetWallet.getId())
                .targetWalletName(targetWallet.getWalletName())
                .amount(savedTxn.getAmount())
                .fee(savedTxn.getFee())
                .currency(savedTxn.getCurrency())
                .type(savedTxn.getType())
                .status(savedTxn.getStatus())
                .description(savedTxn.getDescription())
                .createdAt(savedTxn.getCreatedAt())
                .completedAt(savedTxn.getCompletedAt())
                .build();
    }

    private WalletDto mapToDto(Wallet wallet) {
        String ownerName = "Corporate Treasury";
        if (wallet.getUser() != null) {
            ownerName = wallet.getUser().getName();
        } else if (wallet.getEmployee() != null) {
            ownerName = wallet.getEmployee().getFirstName() + " " + wallet.getEmployee().getLastName();
        }

        return WalletDto.builder()
                .id(wallet.getId())
                .accountNumber(wallet.getAccountNumber())
                .walletName(wallet.getWalletName())
                .currency(wallet.getCurrency())
                .balance(wallet.getBalance())
                .lockedBalance(wallet.getLockedBalance())
                .availableBalance(wallet.getAvailableBalance())
                .status(wallet.getStatus())
                .ownerName(ownerName)
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
