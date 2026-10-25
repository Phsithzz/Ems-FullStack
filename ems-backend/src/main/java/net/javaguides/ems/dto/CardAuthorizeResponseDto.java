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
public class CardAuthorizeResponseDto {
    private Long transactionId;
    private Long cardId;
    private String merchantName;
    private BigDecimal amount;
    private String currency;
    private String status; // AUTHORIZED, DECLINED, SETTLED
    private String authorizationCode;
    private String declineReason;
    private LocalDateTime timestamp;
}
