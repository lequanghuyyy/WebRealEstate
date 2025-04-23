package spring.userexperienceservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.userexperienceservice.entity.FavoriteListingEntity;

import java.util.List;
import java.util.Optional;

public interface FavoriteListingRepository extends JpaRepository<FavoriteListingEntity, String> {
    List<FavoriteListingEntity> findByUserId(String userId);
    Optional<FavoriteListingEntity> findByUserIdAndListingId(String userId, String listingId);
}
