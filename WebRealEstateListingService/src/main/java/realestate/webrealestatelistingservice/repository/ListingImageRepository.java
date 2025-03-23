package realestate.webrealestatelistingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import realestate.webrealestatelistingservice.entity.ListingImageEntity;

import java.util.List;

public interface ListingImageRepository extends JpaRepository<ListingImageEntity, String> {
    List<ListingImageEntity> findByListing_Id(String listingId);
}
