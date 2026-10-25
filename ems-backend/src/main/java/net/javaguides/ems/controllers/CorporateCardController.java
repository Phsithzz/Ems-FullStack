package net.javaguides.ems.controllers;

import net.javaguides.ems.dto.*;
import net.javaguides.ems.entity.CardTransaction;
import net.javaguides.ems.services.CorporateCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/cards")
public class CorporateCardController {

    private final CorporateCardService corporateCardService;

    public CorporateCardController(CorporateCardService corporateCardService) {
        this.corporateCardService = corporateCardService;
    }

    @GetMapping
    public ResponseEntity<List<CorporateCardDto>> getAllCards() {
        return ResponseEntity.ok(corporateCardService.getAllCards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CorporateCardDto> getCardById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(corporateCardService.getCardById(id));
    }

    @PostMapping
    public ResponseEntity<CorporateCardDto> createCard(@RequestBody CreateCardRequestDto dto) {
        return ResponseEntity.ok(corporateCardService.createCard(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CorporateCardDto> updateStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(corporateCardService.updateCardStatus(id, status));
    }

    @PostMapping("/{id}/authorize")
    public ResponseEntity<CardAuthorizeResponseDto> authorizeTransaction(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody CardAuthorizeRequestDto dto
    ) {
        return ResponseEntity.ok(corporateCardService.authorizeTransaction(id, dto, idempotencyKey));
    }

    @PostMapping("/transactions/{txnId}/settle")
    public ResponseEntity<CardAuthorizeResponseDto> settleTransaction(@PathVariable("txnId") Long txnId) {
        return ResponseEntity.ok(corporateCardService.settleTransaction(txnId));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<CardTransaction>> getCardTransactions(@PathVariable("id") Long id) {
        return ResponseEntity.ok(corporateCardService.getCardTransactions(id));
    }
}
