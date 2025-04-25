package spring.userexperienceservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private String id;
    private String listingId;
    private String brId;
    private String contentReview;
    private Integer rate;
    private Integer countLike;
    private LocalDateTime createdAt;
}