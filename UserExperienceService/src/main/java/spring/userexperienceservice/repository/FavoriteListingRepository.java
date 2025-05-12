package spring.userexperienceservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import spring.userexperienceservice.entity.FavoriteListingEntity;

import java.util.List;
import java.util.Optional;

public interface FavoriteListingRepository extends JpaRepository<FavoriteListingEntity, String> {
    Page<FavoriteListingEntity> findByUserId(String userId, Pageable pageable);
    Optional<FavoriteListingEntity> findByUserIdAndListingId(String userId, String listingId);
}
