package realestate.securityservice.service;


import org.springframework.stereotype.Service;
import realestate.securityservice.constant.Role;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.request.UserUpdateRequest;
import realestate.securityservice.dto.respone.UserResponse;

import java.util.List;
import java.util.Set;

@Service
public interface UserService {
    UserResponse createUser(UserCreationRequest userCreationRequest);
    UserResponse getUserById(String id);
    UserResponse updateUserForUser(UserUpdateRequest userUpdateRequest);
    UserResponse updateUserForAdmin(String userid, UserUpdateRequest userUpdateRequest);
    void deleteUser(String id);
    List<UserResponse> getAllUsers();
    int countUsers();
    int countUsersByRole(Set<Role> roles);
    void uploadProfilePicture(String userId, String fileName);
}
