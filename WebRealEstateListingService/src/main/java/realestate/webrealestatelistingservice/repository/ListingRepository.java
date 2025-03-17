package realestate.webrealestatelistingservice.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import realestate.webrealestatelistingservice.entity.ListingEntity;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<ListingEntity,String>, JpaSpecificationExecutor<ListingEntity> {
    List<ListingEntity> findByOwnerId(String ownerId);
}
