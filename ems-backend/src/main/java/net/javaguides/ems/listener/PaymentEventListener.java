package net.javaguides.ems.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.javaguides.ems.event.CardEvent;
import net.javaguides.ems.event.PaymentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class PaymentEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventListener.class);
    private static final int MAX_BUFFER_SIZE = 50;

    private final ObjectMapper objectMapper;
    // Circular buffer to hold real-time Kafka events for frontend display
    private final ConcurrentLinkedDeque<Object> liveKafkaEventStream = new ConcurrentLinkedDeque<>();

    public PaymentEventListener(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "workpay.payment.events", groupId = "workpay-consumer-group")
    public void consumePaymentEvent(String message) {
        try {
            PaymentEvent event = objectMapper.readValue(message, PaymentEvent.class);
            log.info("📥 [KAFKA CONSUME: PAYMENT] Received Txn Ref: {} | Amount: {} {}",
                    event.getTransactionReference(), event.getAmount(), event.getCurrency());

            addEventToBuffer(event);
        } catch (Exception e) {
            log.error("Failed to parse Kafka payment message", e);
        }
    }

    @KafkaListener(topics = "workpay.card.events", groupId = "workpay-consumer-group")
    public void consumeCardEvent(String message) {
        try {
            CardEvent event = objectMapper.readValue(message, CardEvent.class);
            log.info("📥 [KAFKA CONSUME: CARD] Card: {} | Merchant: {} | Status: {}",
                    event.getCardNumber(), event.getMerchantName(), event.getStatus());

            addEventToBuffer(event);
        } catch (Exception e) {
            log.error("Failed to parse Kafka card message", e);
        }
    }

    private void addEventToBuffer(Object event) {
        liveKafkaEventStream.addFirst(event);
        while (liveKafkaEventStream.size() > MAX_BUFFER_SIZE) {
            liveKafkaEventStream.removeLast();
        }
    }

    public List<Object> getRecentKafkaEvents() {
        return new ArrayList<>(liveKafkaEventStream);
    }
}
