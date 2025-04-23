package spring.userexperienceservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.userexperienceservice.entity.RecentlyViewedEntity;

import java.util.List;

public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewedEntity, String> {
    List<RecentlyViewedEntity> findByUserIdOrderByViewedAtDesc(String userId);
}
