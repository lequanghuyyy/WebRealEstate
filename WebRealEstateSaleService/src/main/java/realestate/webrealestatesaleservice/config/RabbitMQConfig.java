package realestate.webrealestatesaleservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
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
@EnableRabbit
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "offer.exchange";
    public static final String PAYMENT_EXCHANGE = "payment.exchange";

    @Bean
    public TopicExchange offerExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
    
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }
    
    @Bean
    public Queue offerAcceptedSaleQueue() {
        return new Queue("offer.accepted.sale",true,false,false);
    }
    
    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue("payment.completed", true, false, false);
    }

    @Bean
    public Binding saleBinding(Queue offerAcceptedSaleQueue, TopicExchange offerExchange) {
        return BindingBuilder.bind(offerAcceptedSaleQueue).to(offerExchange).with("offer.accepted.sale");
    }
    
    @Bean
    public Binding paymentCompletedBinding(Queue paymentCompletedQueue, TopicExchange paymentExchange) {
        return BindingBuilder.bind(paymentCompletedQueue).to(paymentExchange).with("payment.completed");
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
    public MessageConverter jsonMessageConverter() {
        System.setProperty("spring.amqp.deserialization.trust.all", "true");
        return new Jackson2JsonMessageConverter();
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


