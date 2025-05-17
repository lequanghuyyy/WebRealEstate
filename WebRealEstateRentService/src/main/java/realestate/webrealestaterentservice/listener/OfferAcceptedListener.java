package realestate.webrealestaterentservice.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import realestate.webrealestaterentservice.dto.ListingDto;
import realestate.webrealestaterentservice.dto.request.RentalTransactionRequest;
import realestate.webrealestaterentservice.dto.response.RentalTransactionResponse;
import realestate.webrealestaterentservice.service.ListingClient;
import realestate.webrealestaterentservice.service.RentalService;
import spring.realestatecommon.common.event.OfferAcceptedEvent;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class OfferAcceptedListener {
    private final ListingClient listingClient;  // Client gọi ListingService
    private final RentalService rentalService;    // hoặc RentalServiceRealEstateDB

    @RabbitListener(queues = "offer.accepted.rental")
    @Transactional
    public void handleRentalOffer(OfferAcceptedEvent event) {
        ListingDto listing = listingClient.getListingById(event.getListingId());

        RentalTransactionRequest request = new RentalTransactionRequest();
        request.setListingId(event.getListingId());
        request.setRenterId(event.getUserId());
        request.setAgentId(listing.getAgentId());
        if (event.getOfferPrice() != null) {
            request.setMonthlyRent(event.getOfferPrice());
            request.setDeposit(event.getOfferPrice().multiply(BigDecimal.valueOf(0.5)));

        } else {
            request.setMonthlyRent(listing.getPrice());
            request.setDeposit(listing.getPrice().multiply(BigDecimal.valueOf(0.5)));
        }
        request.setStatus("PENDING");
        request.setStartDate(event.getStartRentAt());
        request.setEndDate(event.getEndRentAt());

        RentalTransactionResponse created = rentalService.createRentalTransaction(request);

//        PaymentRequestMessage payment = new PaymentRequestMessage(
//                created.getId(),
//                created.getDeposit(),
//                created.getRenterId(),
//                created.getAgentId(),
//                "RENT"
//        );
//        rabbitTemplate.convertAndSend("transaction.exchange", "transaction.created", payment);
    }
}