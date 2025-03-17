package realestate.securityservice.service;

import org.springframework.stereotype.Service;
import realestate.securityservice.dto.JwtDto;
import realestate.securityservice.dto.request.AuthenticationRequest;
import realestate.securityservice.dto.request.TokenRequest;
import realestate.securityservice.dto.request.UserCreationRequest;
import realestate.securityservice.dto.respone.UserResponse;

@Service
public interface AuthenticationService {
    boolean authenticate(AuthenticationRequest authenticationRequest);
    JwtDto login(AuthenticationRequest authenticationRequest);
    void logout(TokenRequest tokenRequest);
}
