package realestate.webrealestatesaleservice.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import realestate.webrealestatesaleservice.dto.ListingDto;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;
import realestate.webrealestatesaleservice.service.ListingClient;
import realestate.webrealestatesaleservice.service.SalesService;
import spring.realestatecommon.common.event.OfferAcceptedEvent;

@Component
@RequiredArgsConstructor
public class OfferAcceptedListener {
    private final ListingClient listingClient;
    private final SalesService salesService;



    @RabbitListener(queues = "offer.accepted.sale")
    @Transactional
    public void handleSaleOffer(OfferAcceptedEvent event) {
        // 1. Lấy chi tiết Listing từ ListingService
        ListingDto listing = listingClient.getListingById(event.getListingId());

        // 2. Tạo SalesTransactionRequest với dữ liệu lấy được
        SalesTransactionRequest request = new SalesTransactionRequest();
        request.setListingId(event.getListingId());
        request.setBuyerId(event.getUserId());
        request.setAgentId(event.getAgentId());

        if (event.getOfferPrice() != null) {
            request.setAmount(event.getOfferPrice());
        } else {
            request.setAmount(listing.getPrice());
        }
        request.setTransactionStatus("PENDING");

        // 3. Tạo transaction
        SalesTransactionResponse created = salesService.createTransaction(request);

//        // 4. Gửi message thanh toán tới PaymentService
//        PaymentRequestMessage payment = new PaymentRequestMessage(
//                created.getId(),
//                created.getAmount(),
//                created.getBuyerId(),
//                created.getAgentId(),
//                "SALE"
//        );
//        rabbitTemplate.convertAndSend("transaction.exchange", "transaction.created", payment);
    }
}

