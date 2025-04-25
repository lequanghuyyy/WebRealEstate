package spring.userexperienceservice.service;

import spring.userexperienceservice.dto.request.ReviewRequest;
import spring.userexperienceservice.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request);
    ReviewResponse updateReview(String id, ReviewRequest request);
    void deleteReview(String id);
    ReviewResponse getReviewById(String id);
    List<ReviewResponse> getReviewsByBrId(String brId);
    List<ReviewResponse> getReviewsByListingId(String listingId);
    ReviewResponse incrementLike(String id);
}