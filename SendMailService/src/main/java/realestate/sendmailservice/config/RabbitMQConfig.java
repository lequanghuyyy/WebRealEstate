package realestate.webrealestaterentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "offer.exchange";

    @Bean
    public TopicExchange offerExchange() {
        return new TopicExchange(EXCHANGE);
    }
}

