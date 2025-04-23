package spring.userexperienceservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.userexperienceservice.entity.SavedSearchEntity;

import java.util.List;

public interface SavedSearchRepository extends JpaRepository<SavedSearchEntity, String> {
    List<SavedSearchEntity> findByUserId(String userId);
}
