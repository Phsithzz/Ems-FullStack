package net.javaguides.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_txn_reference", columnList = "transaction_reference", unique = true),
        @Index(name = "idx_txn_idempotency_key", columnList = "idempotency_key", unique = true),
        @Index(name = "idx_txn_created_at", columnList = "created_at")
})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 64)
    private String transactionReference;

    @Column(name = "idempotency_key", unique = true, length = 128)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_wallet_id")
    private Wallet sourceWallet;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_wallet_id")
    private Wallet targetWallet;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(nullable = false, length = 10)
    private String currency; // "USDT", "USD", etc.

    @Column(nullable = false, length = 32)
    private String type; // PAYROLL_PAYOUT, P2P_TRANSFER, CARD_SETTLEMENT, DEPOSIT

    @Column(nullable = false, length = 32)
    private String status; // INITIATED, PROCESSING, SUCCESS, FAILED, REVERSED

    @Column(length = 255)
    private String description;

    @Column(name = "failure_reason", length = 512)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
