package spring.userexperienceservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank(message = "Listing ID cannot be blank")
    private String listingId;

    @NotBlank(message = "Buyer/Renter ID cannot be blank")
    private String brId;

    private String title;

    private String contentReview;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be no more than 5")
    private Integer rate;
}