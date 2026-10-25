package net.javaguides.ems;

import net.javaguides.ems.dto.PaymentResponseDto;
import net.javaguides.ems.dto.TransferRequestDto;
import net.javaguides.ems.entity.PaymentTransaction;
import net.javaguides.ems.entity.Wallet;
import net.javaguides.ems.repository.PaymentTransactionRepository;
import net.javaguides.ems.repository.WalletRepository;
import net.javaguides.ems.services.IdempotencyService;
import net.javaguides.ems.services.LedgerService;
import net.javaguides.ems.services.impl.WalletServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentEngineConcurrencyTest {

    private WalletRepository walletRepository;
    private PaymentTransactionRepository paymentTransactionRepository;
    private LedgerService ledgerService;
    private IdempotencyService idempotencyService;
    private WalletServiceImpl walletService;

    @BeforeEach
    void setUp() {
        walletRepository = mock(WalletRepository.class);
        paymentTransactionRepository = mock(PaymentTransactionRepository.class);
        ledgerService = mock(LedgerService.class);
        idempotencyService = mock(IdempotencyService.class);

        walletService = new WalletServiceImpl(
                walletRepository,
                paymentTransactionRepository,
                ledgerService,
                idempotencyService
        );
    }

    @Test
    @DisplayName("Should execute transfer under row locks, deducting source and crediting target")
    void shouldExecuteTransferCorrectly() {
        Wallet source = new Wallet();
        source.setId(1L);
        source.setAccountNumber("WAL-01");
        source.setWalletName("Source Wallet");
        source.setCurrency("USDT");
        source.setBalance(new BigDecimal("1000.00"));
        source.setLockedBalance(BigDecimal.ZERO);
        source.setStatus("ACTIVE");

        Wallet target = new Wallet();
        target.setId(2L);
        target.setAccountNumber("WAL-02");
        target.setWalletName("Target Wallet");
        target.setCurrency("USDT");
        target.setBalance(new BigDecimal("500.00"));
        target.setLockedBalance(BigDecimal.ZERO);
        target.setStatus("ACTIVE");

        when(walletRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(source));
        when(walletRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(target));
        when(paymentTransactionRepository.save(any(PaymentTransaction.class))).thenAnswer(i -> {
            PaymentTransaction p = i.getArgument(0);
            p.setId(500L);
            return p;
        });

        TransferRequestDto dto = new TransferRequestDto(1L, 2L, new BigDecimal("300.00"), "USDT", "Monthly Salary");
        PaymentResponseDto response = walletService.executeTransferUnderLock(dto, "IDEMP-TXN-101");

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(new BigDecimal("300.00"), response.getAmount());

        // Source decreased by 300
        assertEquals(new BigDecimal("700.00"), source.getBalance());
        // Target increased by 300
        assertEquals(new BigDecimal("800.00"), target.getBalance());

        // Verify ledger service recorded the double entry
        verify(ledgerService, times(1)).recordDoubleEntry(
                any(), eq("TRANSFER"), anyString(), eq(source), eq(target), eq(new BigDecimal("300.00"))
        );
    }

    @Test
    @DisplayName("Should call IdempotencyService to protect transfers from duplicate processing")
    void shouldDelegateToIdempotencyService() {
        TransferRequestDto dto = new TransferRequestDto(1L, 2L, new BigDecimal("100.00"), "USDT", "Payout");
        PaymentResponseDto expected = PaymentResponseDto.builder()
                .transactionReference("TXN-ALREADY-RESOLVED")
                .status("SUCCESS")
                .amount(new BigDecimal("100.00"))
                .build();

        when(idempotencyService.execute(eq("KEY-999"), eq("/api/wallets/transfer"), eq(PaymentResponseDto.class), any()))
                .thenReturn(expected);

        PaymentResponseDto actual = walletService.transferFunds(dto, "KEY-999");

        assertSame(expected, actual);
        verify(idempotencyService, times(1)).execute(eq("KEY-999"), eq("/api/wallets/transfer"), eq(PaymentResponseDto.class), any());
    }
}
