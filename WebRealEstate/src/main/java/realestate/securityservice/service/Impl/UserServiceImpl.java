package realestate.securityservice.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.service.UserService;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    @Override
    public UserResponse createUser(String username, String password) {
        return null;
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return null;
    }

    @Override
    public UserResponse updateUser(String username, String password) {
        return null;
    }

    @Override
    public void deleteUser(String username) {

    }

    @Override
    public List<UserResponse> getAllUsers() {
        return List.of();
    }

    @Override
    public boolean isUserExist(String username) {
        return false;
    }
}
