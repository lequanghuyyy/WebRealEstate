package realestate.securityservice.dto.respone;

import lombok.*;
import lombok.experimental.FieldDefaults;
import realestate.securityservice.constant.UserStatus;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    String email;
    UserStatus status;
    List<String> roles;
}
