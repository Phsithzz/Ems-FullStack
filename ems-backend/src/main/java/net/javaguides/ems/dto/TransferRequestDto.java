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
public class TransferRequestDto {
    private Long sourceWalletId;
    private Long targetWalletId;
    private BigDecimal amount;
    private String currency; // "USDT"
    private String description;
}
