package spring.webrealestateofferservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.webrealestateofferservice.constant.ListingType;
import spring.webrealestateofferservice.constant.OfferStatus;
import spring.realestatecommon.common.event.OfferAcceptedEvent;
import spring.webrealestateofferservice.dto.request.OfferRequest;
import spring.webrealestateofferservice.dto.response.OfferResponse;
import spring.webrealestateofferservice.entity.OfferEntity;
import spring.webrealestateofferservice.repository.OfferRepository;
import spring.webrealestateofferservice.service.ListingClient;
import spring.webrealestateofferservice.service.OfferMessagePublisher;
import spring.webrealestateofferservice.service.OfferService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {

    private final OfferRepository repo;
    private final OfferMessagePublisher offerMessagePublisher;
    private final ListingClient listingClient;

    @Override
    public OfferResponse createOffer(OfferRequest req) {
        OfferEntity e = OfferEntity.builder()
                .listingId(req.getListingId())
                .userId(req.getUserId())
                .offerPrice(req.getOfferPrice())
                .expiresAt(req.getExpiresAt())
                .message(req.getMessage())
                .status(OfferStatus.PENDING)
                .startRentAt(req.getStartRentAt())
                .endRentAt(req.getEndRentAt())
                .build();
        OfferEntity saved = repo.save(e);
        // Optionally publish event “OfferCreated”
        return toDto(saved);
    }

    @Override
    public Page<OfferResponse> getOffersByListing(String listingId, int page) {
        Pageable pg = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<OfferEntity> ents = repo.findByListingIdAndStatus(listingId, OfferStatus.PENDING, pg);
        return ents.map(this::toDto);
    }

    @Transactional
    @Override
    public OfferResponse acceptOffer(String offerId) {
        OfferEntity accepted = repo.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
        // set accepted
        accepted.setStatus(OfferStatus.ACCEPTED);
        // reject all other pending offers for same listing
        List<OfferEntity> others = repo.findByListingIdAndStatus(accepted.getListingId(), OfferStatus.PENDING);
        others.forEach(o -> {
            o.setStatus(OfferStatus.REJECTED);
            repo.save(o);
        });
        //
        ListingType transactionStyle = listingClient.getTransactionStyle(accepted.getListingId());
        String type = transactionStyle.name();
        System.out.println(type);
        OfferEntity saved = repo.save(accepted);
        // TODO: khởi tạo transaction Sales/Rental Service
        //
        offerMessagePublisher.publishAcceptedOffer(
                new OfferAcceptedEvent(accepted.getId(),
                        accepted.getUserId(),
                        accepted.getListingId(),
                        transactionStyle.name(),
                        accepted.getAgentId(),
                        accepted.getStartRentAt(),
                        accepted.getEndRentAt(),
                        accepted.getOfferPrice())
        );
        //
        return toDto(saved);
    }

    @Override
    public OfferResponse rejectOffer(String offerId) {
        OfferEntity e = repo.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
        e.setStatus(OfferStatus.REJECTED);
        OfferEntity saved = repo.save(e);
        return toDto(saved);
    }

    @Override
    public Page<OfferResponse> getAllOffers(int page) {
        Pageable pg = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        return repo.findAll(pg).map(this::toDto);
    }

    @Override
    public Page<OfferResponse> getOfferByUserId(String userId, int page) {
        Pageable pg = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        return repo.findOfferEntityByUserId(userId, pg).map(this::toDto);
    }

    @Override
    public void deleteOffer(String offerId) {
        repo.deleteById(offerId);
    }

    private OfferResponse toDto(OfferEntity e) {
        return OfferResponse.builder()
                .id(e.getId())
                .listingId(e.getListingId())
                .userId(e.getUserId())
                .agentId(e.getAgentId())
                .offerPrice(e.getOfferPrice())
                .expiresAt(e.getExpiresAt())
                .status(e.getStatus())
                .message(e.getMessage())
                .startRentAt(e.getStartRentAt())
                .endRentAt(e.getEndRentAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
