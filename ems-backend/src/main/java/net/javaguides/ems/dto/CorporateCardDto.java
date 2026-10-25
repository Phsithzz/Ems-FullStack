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
public class CorporateCardDto {
    private Long id;
    private String cardNumber;
    private String cardHolderName;
    private Long employeeId;
    private String employeeName;
    private Long walletId;
    private String walletAccountNumber;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cardType;
    private String cardStatus;
    private BigDecimal dailyLimit;
    private BigDecimal dailySpent;
    private BigDecimal monthlyLimit;
    private BigDecimal monthlySpent;
    private LocalDateTime createdAt;
}
