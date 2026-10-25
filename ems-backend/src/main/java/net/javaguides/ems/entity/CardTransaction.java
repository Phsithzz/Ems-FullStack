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
@Table(name = "card_transactions", indexes = {
        @Index(name = "idx_card_txn_card_id", columnList = "card_id"),
        @Index(name = "idx_card_txn_auth_code", columnList = "authorization_code")
})
public class CardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "card_id", nullable = false)
    private CorporateCard corporateCard;

    @Column(name = "merchant_name", nullable = false, length = 128)
    private String merchantName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency; // "USD", "USDT"

    @Column(nullable = false, length = 32)
    private String status; // "AUTHORIZED", "SETTLED", "DECLINED", "REVERSED"

    @Column(name = "authorization_code", length = 32)
    private String authorizationCode;

    @Column(name = "decline_reason", length = 255)
    private String declineReason;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "settled_at")
    private LocalDateTime settledAt;
}
