package realestate.webrealestaterentservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import realestate.webrealestaterentservice.constant.RentalStatus;
import realestate.webrealestaterentservice.dto.request.RentalStatusUpdateRequest;
import realestate.webrealestaterentservice.service.RentalService;
import spring.realestatecommon.common.event.PaymentCompletedEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedListener {
    
    private final RentalService rentalService;
    
    @RabbitListener(queues = "${spring.rabbitmq.queues.payment-completed}")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received payment completed event: {}", event);
        
        // Check if this is a RENT transaction
        if ("RENT".equals(event.getTransactionType())) {
            String transactionId = event.getTransactionId(); // The transactionId is stored in listingId field
            
            try {
                // Update rental transaction status to COMPLETED
                RentalStatusUpdateRequest statusUpdateRequest = new RentalStatusUpdateRequest();
                statusUpdateRequest.setStatus(RentalStatus.COMPLETED.name());
                
                rentalService.updateRentalTransactionStatus(transactionId, RentalStatus.COMPLETED);
                
                log.info("Updated rental transaction status to COMPLETED for transaction ID: {}", transactionId);
            } catch (Exception e) {
                log.error("Failed to update rental transaction status for transaction ID: {}", transactionId, e);
            }
        }
    }
} 