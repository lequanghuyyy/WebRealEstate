package realestate.securityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import realestate.securityservice.constant.Role;
import realestate.securityservice.constant.UserStatus;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.RoleEntity;
import realestate.securityservice.entity.UserEntity;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    boolean existsByUsername(String username);
    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findByStatus(UserStatus status);
    @Query("SELECT COUNT(u) FROM UserEntity u JOIN u.roles r WHERE r.roleName IN :roles")
    int countUserEntityByRoles(@Param("roles") Set<Role> roles);
}
