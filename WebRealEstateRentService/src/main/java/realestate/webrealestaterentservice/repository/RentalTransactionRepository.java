package realestate.webrealestaterentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.webrealestaterentservice.entity.RentalTransactionEntity;

import java.util.List;

@Repository
public interface RentalTransactionRepository extends JpaRepository<RentalTransactionEntity, String> {
    List<RentalTransactionEntity> findByRenterId(String renterId);
    List<RentalTransactionEntity> findByAgentId(String agentId);
    List<RentalTransactionEntity> findByListingId(String listingId);
}
