package realestate.webrealestatelistingservice.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ListingImageResponse {
    private String id;
    private String listingId;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
