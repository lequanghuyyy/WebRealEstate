package spring.webrealestateofferservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;


@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "offer.exchange";
    @Bean
    public TopicExchange offerExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue offerAcceptedSaleQueue() {
        return new Queue("offer.accepted.sale");
    }

    @Bean
    public Queue offerAcceptedRentalQueue() {
        return new Queue("offer.accepted.rental");
    }

    @Bean
    public Binding saleBinding(Queue offerAcceptedSaleQueue, TopicExchange offerExchange) {
        return BindingBuilder.bind(offerAcceptedSaleQueue).to(offerExchange).with("offer.accepted.sale");
    }

    @Bean
    public Binding rentalBinding(Queue offerAcceptedRentalQueue, TopicExchange offerExchange) {
        return BindingBuilder.bind(offerAcceptedRentalQueue).to(offerExchange).with("offer.accepted.rental");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public <T> ResponseEntity<T> exchange(
            String url,
            HttpMethod method,
            Object request,
            ParameterizedTypeReference<T> responseType) {

        HttpEntity<Object> entity = new HttpEntity<>(request);
        return restTemplate().exchange(url, method, entity, responseType);
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        System.setProperty("spring.amqp.deserialization.trust.all", "true");
        return new Jackson2JsonMessageConverter(objectMapper);
    }


    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }



}



