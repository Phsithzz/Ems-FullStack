package net.javaguides.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCardRequestDto {
    private Long employeeId;
    private Long walletId;
    private String cardHolderName;
    private String cardType; // "BINANCE_BLACK_VIRTUAL", "BINANCE_GOLD_DEBIT"
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
}
