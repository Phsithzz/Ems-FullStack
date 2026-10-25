package net.javaguides.ems.services;

import net.javaguides.ems.dto.PaymentResponseDto;
import net.javaguides.ems.dto.TransferRequestDto;
import net.javaguides.ems.dto.WalletDto;

import java.util.List;

public interface WalletService {

    List<WalletDto> getAllWallets();

    WalletDto getWalletById(Long id);

    /**
     * Executes a currency transfer with Idempotency Key protection,
     * deadlock-free row-level pessimistic locking, and double-entry ledger posting.
     */
    PaymentResponseDto transferFunds(TransferRequestDto request, String idempotencyKey);
}
