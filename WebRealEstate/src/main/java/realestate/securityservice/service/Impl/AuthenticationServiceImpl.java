package realestate.securityservice.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import realestate.securityservice.dto.JwtDto;
import realestate.securityservice.dto.request.AuthenticationRequest;
import realestate.securityservice.dto.request.TokenRequest;
import realestate.securityservice.entity.InvalidatedToken;
import realestate.securityservice.exception.InvalidCredentialsException;
import realestate.securityservice.repository.InvalidatedTokenRepository;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.sercurity.CustomUserDetails;
import realestate.securityservice.sercurity.JwtAuthenticationFilter;
import realestate.securityservice.sercurity.JwtTokenProvider;
import realestate.securityservice.service.AuthenticationService;

import java.util.Date;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    AuthenticationManager authenticationManager;
    JwtTokenProvider jwtTokenProvider;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @Override
    public boolean authenticate(AuthenticationRequest authenticationRequest) {
        return false;
    }

    @Override
    public JwtDto login(AuthenticationRequest authenticationRequest) {
        try{
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(),authenticationRequest.getPassword()));

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            String token = jwtTokenProvider.generateToken(userDetails);
            Date expiryDate = jwtTokenProvider.extractExpiration(token);
            return JwtDto.builder().token(token).expiredIn(expiryDate).build();
        }
        catch (AuthenticationException e){
            throw new InvalidCredentialsException("Invalid Username or Password");
        }
    }

    @Override
    public void logout(TokenRequest tokenRequest) {
        String token = tokenRequest.getToken();
        if (token == null || token.trim().isEmpty()) {
            log.warn("Logout failed: No token provided");
            throw new InvalidCredentialsException("Invalid token");
        }
        if (jwtTokenProvider.isTokenExpired(token)) {
            log.warn("Logout failed: Token is expired");
            throw new InvalidCredentialsException("Token is expired");
        }
        String tokenId = jwtTokenProvider.extractId(token);
        if (tokenId == null) {
            log.warn("Logout failed: Invalid token structure");
            throw new InvalidCredentialsException("Invalid token");
        }
        if (invalidatedTokenRepository.existsById(tokenId)) {
            log.info("Token {} has already been invalidated", tokenId);
            return;
        }
        Date expiryDate = jwtTokenProvider.extractExpiration(token);
        InvalidatedToken invalidatedToken = new InvalidatedToken(tokenId, expiryDate);
        invalidatedTokenRepository.save(invalidatedToken);

        log.info("Logout successful: Token {} has been invalidated", tokenId);
    }


}
