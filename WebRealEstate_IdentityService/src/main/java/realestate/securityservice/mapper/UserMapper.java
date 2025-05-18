package realestate.securityservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.securityservice.constant.Role;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.RoleEntity;
import realestate.securityservice.entity.UserEntity;
import realestate.securityservice.repository.RoleRepository;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;


    @Autowired
    public UserMapper(ModelMapper modelMapper, RoleRepository roleRepository) {
        this.modelMapper = modelMapper;
        this.roleRepository = roleRepository;
    }


    public UserResponse convertToUserResponse(UserEntity userEntity) {
        UserResponse userResponse = modelMapper.map(userEntity, UserResponse.class);
        userResponse.setId(userEntity.getId());
        userResponse.setStatus(userEntity.getStatus());
        userResponse.setRoles(userEntity.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList()));
        return userResponse;
    }
    public UserEntity convertToUserEntity(UserCreationRequest userCreationRequest) {
        UserEntity userEntity = modelMapper.map(userCreationRequest, UserEntity.class);

        Set<RoleEntity> roles = userCreationRequest.getRoles().stream()
                .map(role -> roleRepository.findByRoleName(Role.valueOf(role))
                        .orElseThrow(() -> new RuntimeException("Role not found: " + role)))
                .collect(Collectors.toSet());

        userEntity.setRoles(roles);
        return userEntity;
    }
}
