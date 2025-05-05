package realestate.securityservice.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.securityservice.dto.JwtDto;
import realestate.securityservice.dto.request.AuthenticationRequest;

import realestate.securityservice.dto.request.TokenRequest;
import realestate.securityservice.dto.respone.BaseResponse;
import realestate.securityservice.dto.respone.ResponseFactory;
import realestate.securityservice.service.AuthenticationService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/v1/users/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<JwtDto>> login(@Valid @RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseFactory.ok(authenticationService.login(authenticationRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(@Valid @RequestBody TokenRequest tokenRequest) {
       authenticationService.logout(tokenRequest);
        return ResponseFactory.ok(null);
    }

}
