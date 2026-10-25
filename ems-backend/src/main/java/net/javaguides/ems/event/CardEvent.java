package net.javaguides.ems.event;

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
public class CardEvent {
    private String eventId;
    private String eventType; // CARD_AUTHORIZED, CARD_SETTLED, CARD_FROZEN, CARD_UNFROZEN
    private Long cardId;
    private String cardNumber;
    private String merchantName;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String authCode;
    private LocalDateTime timestamp;
}
