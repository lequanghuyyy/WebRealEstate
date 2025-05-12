package spring.userexperienceservice.service;

import org.springframework.data.domain.Page;
import spring.userexperienceservice.dto.request.ReviewRequest;
import spring.userexperienceservice.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request);
    ReviewResponse updateReview(String id, ReviewRequest request);
    void deleteReview(String id);
    ReviewResponse getReviewById(String id);
    Page<ReviewResponse> getReviewsByBrId(String brId, int page);
    List<ReviewResponse> getReviewsByListingId(String listingId);
    ReviewResponse incrementLike(String id);
}