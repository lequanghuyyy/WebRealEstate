package spring.userexperienceservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.userexperienceservice.entity.ReviewEntity;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {
    List<ReviewEntity> findByBrId(String brId);
    List<ReviewEntity> findByListingId(String listingId);
    List<ReviewEntity> findByListingIdOrderByCreatedAtDesc(String listingId);
    List<ReviewEntity> findByBrIdAndListingId(String brId, String listingId);
}