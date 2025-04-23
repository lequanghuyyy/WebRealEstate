package spring.userexperienceservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RecentlyViewedResponse {
    private String id;
    private String userId;
    private String listingId;
    private LocalDateTime viewedAt;
}
