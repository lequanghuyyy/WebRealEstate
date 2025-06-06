package spring.userexperienceservice.service.Impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.request.ReviewRequest;
import spring.userexperienceservice.dto.response.ReviewResponse;
import spring.userexperienceservice.entity.ReviewEntity;
import spring.userexperienceservice.exception.ResourceNotFoundException;
import spring.userexperienceservice.repository.ReviewRepository;
import spring.userexperienceservice.service.ReviewService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private static final int PAGE_SIZE = 5;
    @Override
    public ReviewResponse createReview(ReviewRequest request) {
        List<ReviewEntity> existingReviews = reviewRepository.findByBrIdAndListingId(
                request.getBrId(), request.getListingId());

        if (!existingReviews.isEmpty()) {
            throw new IllegalStateException("You have already reviewed this property");
        }

        ReviewEntity review = ReviewEntity.builder()
                .listingId(request.getListingId())
                .brId(request.getBrId())
                .title(request.getTitle())
                .contentReview(request.getContentReview())
                .rate(request.getRate())
                .countLike(0)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse updateReview(String id, ReviewRequest request) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        // Verify the review belongs to the user making the request
        if (!review.getBrId().equals(request.getBrId())) {
            throw new IllegalStateException("You can only update your own reviews");
        }

        // Update only allowed fields (not countLike)
        review.setContentReview(request.getContentReview());
        review.setRate(request.getRate());

        return mapToResponse(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(String id) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }

    @Override
    public ReviewResponse getReviewById(String id) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        return mapToResponse(review);
    }

    @Override
    public Page<ReviewResponse> getReviewsByBrId(String brId,int page) {
        Pageable pageable = PageRequest.of(page, PAGE_SIZE, Sort.by("createdAt").descending());
        Page<ReviewEntity> reviewEntities = reviewRepository.findByBrId(brId,pageable);
        return reviewEntities.map(this::mapToResponse);
    }

    @Override
    public List<ReviewResponse> getReviewsByListingId(String listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponse incrementLike(String id) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        review.setCountLike(review.getCountLike() + 1);
        return mapToResponse(reviewRepository.save(review));
    }

    private ReviewResponse mapToResponse(ReviewEntity entity) {
        return ReviewResponse.builder()
                .id(entity.getId())
                .listingId(entity.getListingId())
                .brId(entity.getBrId())
                .contentReview(entity.getContentReview())
                .rate(entity.getRate())
                .countLike(entity.getCountLike())
                .createdAt(entity.getCreatedAt())
                .title(entity.getTitle())
                .build();
    }
}