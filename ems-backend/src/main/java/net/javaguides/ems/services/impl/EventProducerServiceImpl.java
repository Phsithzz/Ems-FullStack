package net.javaguides.ems.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.javaguides.ems.event.CardEvent;
import net.javaguides.ems.event.PaymentEvent;
import net.javaguides.ems.services.EventProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventProducerServiceImpl implements EventProducerService {

    private static final Logger log = LoggerFactory.getLogger(EventProducerServiceImpl.class);

    public static final String PAYMENT_EVENTS_TOPIC = "paypulse.payment.events";
    public static final String CARD_EVENTS_TOPIC = "paypulse.card.events";

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void publishPaymentEvent(PaymentEvent event) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available. Skipping Kafka publish for payment event: {}", event.getEventId());
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(PAYMENT_EVENTS_TOPIC, event.getTransactionReference(), payload)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("📨 [KAFKA PUBLISH] Topic: {} | Txn: {} | Partition: {}",
                                    PAYMENT_EVENTS_TOPIC, event.getTransactionReference(), result.getRecordMetadata().partition());
                        } else {
                            log.warn("Failed to publish Kafka message for event {}: {}", event.getEventId(), ex.getMessage());
                        }
                    });
        } catch (Exception e) {
            log.error("Serialization error publishing payment event", e);
        }
    }

    @Override
    public void publishCardEvent(CardEvent event) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available. Skipping Kafka publish for card event: {}", event.getEventId());
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(CARD_EVENTS_TOPIC, String.valueOf(event.getCardId()), payload)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("📨 [KAFKA PUBLISH] Topic: {} | Card: {} | Partition: {}",
                                    CARD_EVENTS_TOPIC, event.getCardId(), result.getRecordMetadata().partition());
                        } else {
                            log.warn("Failed to publish Kafka message for card event {}: {}", event.getEventId(), ex.getMessage());
                        }
                    });
        } catch (Exception e) {
            log.error("Serialization error publishing card event", e);
        }
    }
}
