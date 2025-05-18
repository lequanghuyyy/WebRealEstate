package spring.webrealestateofferservice.service;

import org.springframework.data.domain.Page;
import spring.webrealestateofferservice.dto.request.OfferRequest;
import spring.webrealestateofferservice.dto.response.OfferResponse;

public interface OfferService {
    OfferResponse createOffer(OfferRequest request);
    Page<OfferResponse> getOffersByListing(String listingId, int page);
    OfferResponse acceptOffer(String offerId);
    OfferResponse rejectOffer(String offerId);
    Page<OfferResponse> getAllOffers(int page);
    Page<OfferResponse> getOfferByAgentId(String agentId,int page);
    Page<OfferResponse> getOfferByUserId(String userId, int page);
    void deleteOffer(String offerId);
}
