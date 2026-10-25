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
@Table(name = "corporate_cards", indexes = {
        @Index(name = "idx_card_number", columnList = "card_number", unique = true)
})
public class CorporateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_number", nullable = false, unique = true, length = 32)
    private String cardNumber; // e.g. "4532 •••• •••• 8821"

    @Column(name = "card_holder_name", nullable = false, length = 100)
    private String cardHolderName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(name = "expiry_month", nullable = false)
    private Integer expiryMonth;

    @Column(name = "expiry_year", nullable = false)
    private Integer expiryYear;

    @Column(name = "cvv_hash", nullable = false, length = 128)
    private String cvvHash;

    @Column(name = "card_type", nullable = false, length = 32)
    private String cardType; // "WORKPAY_BLACK_VIRTUAL", "WORKPAY_PLATINUM_DEBIT"

    @Column(name = "card_status", nullable = false, length = 20)
    private String cardStatus = "ACTIVE"; // "ACTIVE", "FROZEN", "TERMINATED"

    @Column(name = "daily_limit", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyLimit = new BigDecimal("5000.00");

    @Column(name = "daily_spent", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailySpent = BigDecimal.ZERO;

    @Column(name = "monthly_limit", nullable = false, precision = 19, scale = 4)
    private BigDecimal monthlyLimit = new BigDecimal("50000.00");

    @Column(name = "monthly_spent", nullable = false, precision = 19, scale = 4)
    private BigDecimal monthlySpent = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
