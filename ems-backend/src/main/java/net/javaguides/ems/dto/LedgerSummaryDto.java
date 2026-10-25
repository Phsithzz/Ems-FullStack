package net.javaguides.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerSummaryDto {
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private BigDecimal discrepancy;
    private boolean isBalanced;
    private long totalJournalEntries;
    private String statusMessage;
}
