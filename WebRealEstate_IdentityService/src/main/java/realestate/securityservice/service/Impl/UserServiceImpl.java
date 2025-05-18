package realestate.securityservice.service.Impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import realestate.securityservice.constant.Role;
import realestate.securityservice.constant.UserStatus;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.request.UserUpdateRequest;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.PasswordEntity;
import realestate.securityservice.entity.UserEntity;
import realestate.securityservice.exception.AlreadyExistsException;
import realestate.securityservice.exception.NotFoundException;
import realestate.securityservice.mapper.UserMapper;
import realestate.securityservice.repository.PasswordRepository;
import realestate.securityservice.repository.RoleRepository;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.sercurity.CustomUserDetails;
import realestate.securityservice.service.CloudinaryService;
import realestate.securityservice.service.UserService;

import java.util.List;
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
    private final CloudinaryService cloudinaryService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper, RoleRepository roleRepository, PasswordRepository passwordRepository, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordRepository = passwordRepository;
        this.cloudinaryService = cloudinaryService;
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

        UserEntity userEntity = userMapper.convertToUserEntity(userCreationRequest);
        userEntity.setPassword(passwordEncoder.encode(userCreationRequest.getPassword()));

        if (userCreationRequest.getRoles().contains("AGENT")) {
            userEntity.setStatus(UserStatus.PENDING_APPROVAL);
        } else {
            userEntity.setStatus(UserStatus.ACTIVE);
        }

        UserEntity savedUser = userRepository.save(userEntity);
        savePassword(savedUser, userCreationRequest);

        return userMapper.convertToUserResponse(savedUser);
    }


    @Override
    public UserResponse getUserById(String userId) {
        return userRepository.findById(userId).map(userMapper::convertToUserResponse).orElseThrow(() -> new NotFoundException("User","UserId",userId));
    }

    @Override
    public UserResponse updateUserForUser(UserUpdateRequest userUpdateRequest) {
        String idCurrent = getIdUserCurrent();
        UserEntity userEntity = userRepository.findById(idCurrent).orElseThrow(() -> new NotFoundException("User","UserId",idCurrent));
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

    @Override
    public void deleteUser(String userId) {
        String idCurrent = getIdUserCurrent();
        UserEntity userEntityA = userRepository.findById(idCurrent).orElseThrow(() -> new NotFoundException("User","UserId",idCurrent));

        boolean isAdmin = userEntityA.getRoles().stream()
                .anyMatch(role -> role.getRoleName() == Role.ADMIN);

        if (!isAdmin) {
            throw new RuntimeException("No permission to delete user");
        }

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

    @Override
    public int countUsers() {
        return userRepository.findAll().size() - 1;
    }

    @Override
    public int countUsersByRole(Set<Role> roles) {
        return userRepository.countUserEntityByRoles(roles);
    }

    @Override
    public void uploadProfilePicture(String userId, String imageUrl) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", "UserId", userId));
        userEntity.setAvatarImg(imageUrl);
        userRepository.save(userEntity);
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
        if (userUpdateRequest.getBio() != null) {
            userEntity.setBio(userUpdateRequest.getBio());
        }
    }



    UserResponse getUserResponse(UserCreationRequest userCreationRequest,
                                 PasswordEncoder passwordEncoder,
                                 UserRepository userRepository, RoleRepository roleRepository) {

        UserEntity userEntity = userMapper.convertToUserEntity(userCreationRequest);
        userEntity.setPassword(passwordEncoder.encode(userCreationRequest.getPassword()));
        userEntity.setRoles(roleRepository.findAllByRoleNameIn(userCreationRequest.getRoles()));
        UserEntity savedUser = userRepository.save(userEntity);
        savePassword(savedUser,userCreationRequest);
        return userMapper.convertToUserResponse(savedUser);
    }
    void savePassword(UserEntity userEntity,UserCreationRequest userCreationRequest) {
        PasswordEntity passwordEntity = new PasswordEntity();
        passwordEntity.setId(userEntity.getId());
        passwordEntity.setPassword(userCreationRequest.getPassword());
        passwordRepository.save(passwordEntity);
    }

}
