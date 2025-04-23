package spring.userexperienceservice.dto.request;


import lombok.Data;

@Data
public class RecentlyViewedRequest {
    private String userId;
    private String listingId;
}
