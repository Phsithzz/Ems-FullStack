package net.javaguides.ems.dto;

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
public class ObservabilitySummaryDto {
    private String databaseStatus; // "UP"
    private String redisStatus; // "UP" (Docker container connected)
    private String kafkaStatus; // "UP" (Docker container connected)
    private long totalProcessedPayments;
    private long totalActiveCards;
    private BigDecimal currentLedgerBalance;
    private BigDecimal currentDiscrepancy;
    private double reconciliationSuccessRate; // e.g. 100.0%
    private LocalDateTime timestamp;
}
