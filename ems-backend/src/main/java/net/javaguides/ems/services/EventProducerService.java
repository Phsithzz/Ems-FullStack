package net.javaguides.ems.services;

import net.javaguides.ems.event.CardEvent;
import net.javaguides.ems.event.PaymentEvent;

public interface EventProducerService {

    void publishPaymentEvent(PaymentEvent event);

    void publishCardEvent(CardEvent event);
}
