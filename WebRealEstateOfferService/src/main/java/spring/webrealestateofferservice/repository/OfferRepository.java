package spring.webrealestateofferservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import spring.webrealestateofferservice.constant.OfferStatus;
import spring.webrealestateofferservice.entity.OfferEntity;

import java.util.List;

public interface OfferRepository extends JpaRepository<OfferEntity, String> {
    Page<OfferEntity> findByListingIdAndStatus(String listingId, OfferStatus status, Pageable pageable);
    List<OfferEntity> findByListingIdAndStatus(String listingId, OfferStatus status);
    Page<OfferEntity> findOfferEntityByUserId(String userId, Pageable pageable);
    Page<OfferEntity> findOfferEntityByAgentId(String agentId, Pageable pageable);
}
