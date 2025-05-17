package realestate.securityservice.service;






import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import realestate.securityservice.entity.UserEntity;
import realestate.securityservice.exception.NotFoundException;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.sercurity.CustomUserDetails;


@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not exists by username"));

       return new CustomUserDetails(user);
    }

    public UserDetails loadUserById(String id) throws NotFoundException {
        UserEntity user = userRepository.findById(id)
                .orElseThrow( () -> new NotFoundException("User not found with id : " + id));

        return new CustomUserDetails(user);
    }

}
