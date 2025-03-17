package realestate.securityservice.service;


import org.springframework.stereotype.Service;
import realestate.securityservice.dto.JwtDto;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.request.UserUpdateRequest;
import realestate.securityservice.dto.respone.UserResponse;

import java.util.List;

@Service
public interface UserService {
    UserResponse createUser(UserCreationRequest userCreationRequest);
    UserResponse getUserById(String id);
    UserResponse getUserByUsername(String username);
    UserResponse updateUserForUser(UserUpdateRequest userUpdateRequest);
    UserResponse updateUserForAdmin(String userid, UserUpdateRequest userUpdateRequest);
    void deleteUser(String id);
    List<UserResponse> getAllUsers();


}
