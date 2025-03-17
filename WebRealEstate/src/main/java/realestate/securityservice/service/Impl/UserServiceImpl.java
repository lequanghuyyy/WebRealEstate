package realestate.securityservice.service.Impl;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.request.UserUpdateRequest;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.PasswordEntity;
import realestate.securityservice.entity.RoleEntity;
import realestate.securityservice.entity.UserEntity;
import realestate.securityservice.exception.AlreadyExistsException;
import realestate.securityservice.exception.NotFoundException;
import realestate.securityservice.mapper.UserMapper;
import realestate.securityservice.repository.PasswordRepository;
import realestate.securityservice.repository.RoleRepository;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.sercurity.CustomUserDetails;
import realestate.securityservice.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "BUYER", "AGENT", "RENTER");
    private final PasswordRepository passwordRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper, RoleRepository roleRepository, PasswordRepository passwordRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordRepository = passwordRepository;
    }

    @Transactional
    public UserResponse createUser(UserCreationRequest userCreationRequest) {
        if (userRepository.existsByUsername(userCreationRequest.getUsername())) {
            throw new AlreadyExistsException("User", "username", userCreationRequest.getUsername());
        }

        if (userCreationRequest.getUsername() == null || userCreationRequest.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is Null");
        }
        for (String role : userCreationRequest.getRoles()) {
            if (!ALLOWED_ROLES.contains(role)) {
                throw new IllegalArgumentException("Invalid role: " + role);
            }
        }
        return getUserResponse(userCreationRequest, passwordEncoder, userRepository,roleRepository);
    }


    @Override
    public UserResponse getUserById(String userId) {
        return userRepository.findById(userId).map(userMapper::convertToUserResponse).orElseThrow(() -> new NotFoundException("User","UserId",userId));
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(userMapper::convertToUserResponse).orElseThrow(() -> new NotFoundException("User","UserName",username));
    }

    @Override
    public UserResponse updateUserForUser(UserUpdateRequest userUpdateRequest) {
        String idCurrent = getIdUserCurrent();
        UserEntity userEntity = userRepository.findById(idCurrent).orElseThrow(() -> new NotFoundException("User","UserId",idCurrent));
        userEntity.setFirstName(userUpdateRequest.getFirstName());
        userEntity.setLastName(userUpdateRequest.getLastName());
        updateUser(userUpdateRequest,userEntity);
        return userMapper.convertToUserResponse(userRepository.save(userEntity));
    }

    @Override
    public UserResponse updateUserForAdmin(String userId,UserUpdateRequest updateRequest) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User","UserId",userId));
        userEntity.setFirstName(updateRequest.getFirstName());
        userEntity.setLastName(updateRequest.getLastName());
        updateUser(updateRequest,userEntity);
        return userMapper.convertToUserResponse(userRepository.save(userEntity));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void deleteUser(String userId) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User","UserId",userId));
        userRepository.delete(userEntity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public String getIdUserCurrent(){
        CustomUserDetails principal = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }


    public void updateUser(UserUpdateRequest userUpdateRequest,UserEntity userEntity) {
        if (userUpdateRequest.getFirstName() != null) {
            userEntity.setFirstName(userUpdateRequest.getFirstName());
        }
        if (userUpdateRequest.getLastName() != null) {
            userEntity.setLastName(userUpdateRequest.getLastName());
        }
        if (userUpdateRequest.getPassword() != null) {
            userEntity.setPassword(passwordEncoder.encode(userUpdateRequest.getPassword()));
        }
    }

    UserResponse getUserResponse(UserCreationRequest userCreationRequest,
                                 PasswordEncoder passwordEncoder,
                                 UserRepository userRepository, RoleRepository roleRepository) {

        UserEntity userEntity = userMapper.convertToUserEntity(userCreationRequest);
        userEntity.setPassword(passwordEncoder.encode(userCreationRequest.getPassword()));
        userEntity.setRoles(roleRepository.findAllByRoleNameIn(userCreationRequest.getRoles()));
        UserEntity savedUser = userRepository.save(userEntity);

        //
        savePassword(savedUser,userCreationRequest);
        //

        return userMapper.convertToUserResponse(savedUser);
    }
    void savePassword(UserEntity userEntity,UserCreationRequest userCreationRequest) {
        PasswordEntity passwordEntity = new PasswordEntity();
        passwordEntity.setId(userEntity.getId());
        passwordEntity.setPassword(userCreationRequest.getPassword());
        passwordRepository.save(passwordEntity);
    }

}
