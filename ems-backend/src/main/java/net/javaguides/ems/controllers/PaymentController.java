package net.javaguides.ems.controllers;

import net.javaguides.ems.entity.PaymentTransaction;
import net.javaguides.ems.exception.ResourceNotFoundException;
import net.javaguides.ems.repository.PaymentTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentTransactionRepository paymentTransactionRepository;

    public PaymentController(PaymentTransactionRepository paymentTransactionRepository) {
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransaction>> getAllTransactions() {
        return ResponseEntity.ok(paymentTransactionRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/transactions/{reference}")
    public ResponseEntity<PaymentTransaction> getTransactionByReference(@PathVariable("reference") String reference) {
        PaymentTransaction txn = paymentTransactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + reference));
        return ResponseEntity.ok(txn);
    }
}
