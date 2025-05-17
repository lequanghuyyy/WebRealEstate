package realestate.webrealestatesaleservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import realestate.webrealestatesaleservice.constant.SaleStatus;
import realestate.webrealestatesaleservice.dto.request.StatusUpdateRequest;
import realestate.webrealestatesaleservice.service.SalesService;
import spring.realestatecommon.common.event.PaymentCompletedEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedListener {
    
    private final SalesService salesService;
    
    @RabbitListener(queues = "${spring.rabbitmq.queues.payment-completed}")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received payment completed event: {}", event);
        
        // Check if this is a SALE transaction
        if ("SALE".equals(event.getTransactionType())) {
            String transactionId = event.getTransactionId(); // The transactionId is stored in listingId field

            try {
                // Update sales transaction status to COMPLETED
                StatusUpdateRequest statusUpdateRequest = new StatusUpdateRequest();
                statusUpdateRequest.setStatus(SaleStatus.COMPLETED.name());
                
                salesService.updateTransactionStatus(transactionId, SaleStatus.COMPLETED);
                
                log.info("Updated sales transaction status to COMPLETED for transaction ID: {}", transactionId);
            } catch (Exception e) {
                log.error("Failed to update sales transaction status for transaction ID: {}", transactionId, e);
            }
        }
    }
} 