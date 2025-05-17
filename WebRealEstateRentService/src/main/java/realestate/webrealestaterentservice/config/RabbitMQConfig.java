package realestate.webrealestaterentservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.SimpleMessageConverter;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange offerExchange() {
        return new TopicExchange("offer.exchange");
    }

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange("payment.exchange");
    }

    @Bean
    public Queue offerAcceptedRentalQueue() {
        return new Queue("offer.accepted.rental", true, false, false);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue("payment.completed", true, false, false);
    }

    @Bean
    public Binding rentalBinding() {
        return BindingBuilder.bind(offerAcceptedRentalQueue())
                .to(offerExchange())
                .with("offer.accepted.rental");
    }

    @Bean
    public Binding paymentCompletedBinding() {
        return BindingBuilder.bind(paymentCompletedQueue())
                .to(paymentExchange())
                .with("payment.completed");
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

    @Bean
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.AUTO); // AUTO hoặc MANUAL đều được nếu bạn xử lý đúng
        factory.setDefaultRequeueRejected(false); // 🚨 Ngăn RabbitMQ resend nếu listener throw exception
        return factory;
    }



}

