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
@Table(name = "wallets", indexes = {
        @Index(name = "idx_wallet_account_num", columnList = "account_number", unique = true)
})
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", nullable = false, unique = true, length = 64)
    private String accountNumber;

    @Column(name = "wallet_name", nullable = false, length = 100)
    private String walletName;

    @Column(nullable = false, length = 10)
    private String currency; // e.g. "USDT", "USD", "THB"

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "locked_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal lockedBalance = BigDecimal.ZERO; // For pending card authorizations / holds

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, FROZEN, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getAvailableBalance() {
        return this.balance.subtract(this.lockedBalance);
    }

    public boolean canDebit(BigDecimal amount) {
        return "ACTIVE".equalsIgnoreCase(this.status) && getAvailableBalance().compareTo(amount) >= 0;
    }

    public void debit(BigDecimal amount) {
        if (!canDebit(amount)) {
            throw new IllegalStateException("Insufficient available balance in wallet: " + this.accountNumber);
        }
        this.balance = this.balance.subtract(amount);
    }

    public void credit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void hold(BigDecimal amount) {
        if (!canDebit(amount)) {
            throw new IllegalStateException("Insufficient funds to place hold on wallet: " + this.accountNumber);
        }
        this.lockedBalance = this.lockedBalance.add(amount);
    }

    public void releaseHold(BigDecimal amount) {
        if (this.lockedBalance.compareTo(amount) < 0) {
            this.lockedBalance = BigDecimal.ZERO;
        } else {
            this.lockedBalance = this.lockedBalance.subtract(amount);
        }
    }

    public void captureHold(BigDecimal amount) {
        releaseHold(amount);
        this.balance = this.balance.subtract(amount);
    }
}
