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
public class PaymentResponseDto {
    private String transactionReference;
    private String idempotencyKey;
    private Long sourceWalletId;
    private String sourceWalletName;
    private Long targetWalletId;
    private String targetWalletName;
    private BigDecimal amount;
    private BigDecimal fee;
    private String currency;
    private String type;
    private String status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
