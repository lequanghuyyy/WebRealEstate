package realestate.securityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.securityservice.entity.PasswordEntity;

@Repository
public interface PasswordRepository extends JpaRepository<PasswordEntity, String> {
}
