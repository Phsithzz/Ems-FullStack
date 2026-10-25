package net.javaguides.ems.controllers;

import net.javaguides.ems.dto.PaymentResponseDto;
import net.javaguides.ems.dto.TransferRequestDto;
import net.javaguides.ems.dto.WalletDto;
import net.javaguides.ems.services.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<List<WalletDto>> getAllWallets() {
        return ResponseEntity.ok(walletService.getAllWallets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalletDto> getWalletById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(walletService.getWalletById(id));
    }

    @PostMapping("/transfer")
    public ResponseEntity<PaymentResponseDto> transferFunds(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody TransferRequestDto request
    ) {
        PaymentResponseDto response = walletService.transferFunds(request, idempotencyKey);
        return ResponseEntity.ok(response);
    }
}
