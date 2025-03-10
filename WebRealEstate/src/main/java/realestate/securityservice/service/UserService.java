package realestate.securityservice.service;


import org.springframework.stereotype.Service;
import realestate.securityservice.dto.respone.UserResponse;

import java.util.List;

@Service
public interface UserService {
    UserResponse createUser(String username, String password);
    UserResponse getUserByUsername(String username);
    UserResponse updateUser(String username, String password);
    void deleteUser(String username);
    List<UserResponse> getAllUsers();
    boolean isUserExist(String username);

}
