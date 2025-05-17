package spring.webrealestateofferservice.service;


import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import spring.realestatecommon.common.event.OfferAcceptedEvent;
import spring.webrealestateofferservice.config.RabbitMQConfig;


@Service
@RequiredArgsConstructor
public class OfferMessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishAcceptedOffer(OfferAcceptedEvent event) {
        String routingKey = event.getTransactionStyle().equalsIgnoreCase("SALE")
                ? "offer.accepted.sale"
                : "offer.accepted.rental";

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, event);
    }
}
