package spring.userexperienceservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FavoriteResponse {
    private String id;
    private String userId;
    private String listingId;
    private LocalDateTime createdAt;
}
