package realestate.securityservice.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.request.UserUpdateRequest;
import realestate.securityservice.dto.respone.BaseResponse;
import realestate.securityservice.dto.respone.ResponseFactory;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.service.CloudinaryService;
import realestate.securityservice.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CloudinaryService cloudinaryService;


    @PostMapping("/auth/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody UserCreationRequest userCreationRequest) {
        return ResponseEntity.ok(userService.createUser(userCreationRequest));
    }

    @GetMapping("")
    public ResponseEntity<BaseResponse<List<UserResponse>>> getUser() {
        return ResponseFactory.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<UserResponse>> getUserById(@PathVariable String userId) {
        return ResponseFactory.ok(userService.getUserById(userId));
    }

    @PutMapping("/update")
    public ResponseEntity<BaseResponse<UserResponse>> updateUserForUser(
            @Valid @RequestBody UserUpdateRequest updateRequest) {
        return ResponseFactory.ok(userService.updateUserForUser(updateRequest));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{userId}")
    public ResponseEntity<BaseResponse<UserResponse>> updateUserForAdmin(
            @PathVariable String userId,
            @Valid @RequestBody UserUpdateRequest updateRequest) {
        return ResponseFactory.ok(userService.updateUserForAdmin(userId, updateRequest));
    }
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<BaseResponse<String>> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseFactory.ok("User deleted successfully");
    }

    @PostMapping("/{userId}/avatar")
    public ResponseEntity<BaseResponse<Void>> uploadAvatar(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "user_avatars");
        String imageUrl = uploadResult.get("url");
        userService.uploadProfilePicture(userId, imageUrl);
        return ResponseFactory.ok(null);
    }



}
