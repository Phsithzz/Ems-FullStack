package net.javaguides.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reconciliation_reports", indexes = {
        @Index(name = "idx_recon_ref", columnList = "report_reference", unique = true)
})
public class ReconciliationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_reference", nullable = false, unique = true, length = 64)
    private String reportReference;

    @Column(name = "total_transactions", nullable = false)
    private Long totalTransactions;

    @Column(name = "total_journals", nullable = false)
    private Long totalJournals;

    @Column(name = "matched_count", nullable = false)
    private Long matchedCount;

    @Column(name = "unmatched_count", nullable = false)
    private Long unmatchedCount;

    @Column(name = "total_volume", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalVolume;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal discrepancy;

    @Column(nullable = false, length = 32)
    private String status; // "BALANCED_100", "DISCREPANCY_DETECTED"

    @Column(name = "reconciled_at", nullable = false)
    private LocalDateTime reconciledAt;

    @Column(name = "reconciled_by", length = 100)
    private String reconciledBy;
}
