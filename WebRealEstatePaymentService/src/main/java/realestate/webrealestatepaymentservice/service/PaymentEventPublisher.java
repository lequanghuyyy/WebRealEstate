package realestate.webrealestatepaymentservice.service;


import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.config.RabbitMQConfig;
import spring.realestatecommon.common.event.PaymentCompletedEvent;

@Service
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentCompleted(PaymentCompletedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, "payment.completed", event);
    }
}
