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
public class PaymentEvent {
    private String eventId;
    private String eventType; // PAYMENT_TRANSFERRED, PAYROLL_DISPATCHED
    private String transactionReference;
    private String sourceWallet;
    private String targetWallet;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime timestamp;
}
