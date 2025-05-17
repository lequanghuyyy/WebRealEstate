package realestate.securityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.securityservice.constant.Role;
import realestate.securityservice.entity.RoleEntity;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Set<RoleEntity> findAllByRoleNameIn(List<String> roleNames);
    Optional<RoleEntity> findByRoleName(Role roleName);
}
