package realestate.webrealestatelistingservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;
import realestate.webrealestatelistingservice.entity.ListingEntity;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<ListingEntity,String>, JpaSpecificationExecutor<ListingEntity> {
    List<ListingEntity> findByOwnerId(String ownerId);
    List<ListingEntity> findByType(ListingType type);
    Page<ListingEntity> findByType(ListingType type, Pageable pageable);
    List<ListingEntity> findTop5ByOrderByViewDesc();
    Page<ListingEntity> findByStatusNotIn(List<ListingStatus> statuses, Pageable pageable);
}
