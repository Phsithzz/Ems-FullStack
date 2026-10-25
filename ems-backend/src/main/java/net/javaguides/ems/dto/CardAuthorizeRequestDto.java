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
public class CardAuthorizeRequestDto {
    private String merchantName;
    private BigDecimal amount;
    private String currency; // "USDT", "USD"
}
