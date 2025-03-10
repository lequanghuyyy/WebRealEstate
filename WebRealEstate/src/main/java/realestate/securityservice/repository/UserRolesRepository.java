package realestate.securityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import realestate.securityservice.entity.UserRolesEntity;

public interface UserRolesRepository extends JpaRepository<UserRolesEntity,String> {
}
