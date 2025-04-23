package spring.userexperienceservice.dto.request;

import lombok.Data;

@Data
public class FavoriteRequest {
    private String userId;
    private String listingId;
}
