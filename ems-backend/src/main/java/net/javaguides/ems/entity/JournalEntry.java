package net.javaguides.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "journal_entries", indexes = {
        @Index(name = "idx_journal_reference", columnList = "journal_reference", unique = true),
        @Index(name = "idx_journal_posted_at", columnList = "posted_at")
})
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "journal_reference", nullable = false, unique = true, length = 64)
    private String journalReference;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private PaymentTransaction transaction;

    @Column(name = "entry_type", nullable = false, length = 32)
    private String entryType; // TRANSFER, PAYROLL_PAYOUT, CARD_HOLD, CARD_CAPTURE, ADJUSTMENT

    @Column(length = 255)
    private String description;

    @Column(name = "total_debit", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalDebit = BigDecimal.ZERO;

    @Column(name = "total_credit", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalCredit = BigDecimal.ZERO;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<LedgerEntry> entries = new ArrayList<>();

    public void addEntry(LedgerEntry entry) {
        entries.add(entry);
        entry.setJournalEntry(this);
    }
}
