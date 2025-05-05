package spring.userexperienceservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.request.ReviewRequest;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.dto.response.ReviewResponse;
import spring.userexperienceservice.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ux/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<BaseResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseFactory.ok(reviewService.createReview(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<ReviewResponse>> updateReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseFactory.ok(reviewService.updateReview(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseFactory.ok(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<ReviewResponse>> getReviewById(@PathVariable String id) {
        return ResponseFactory.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/br/{brId}")
    public ResponseEntity<BaseResponse<List<ReviewResponse>>> getReviewsByBrId(@PathVariable String brId) {
        return ResponseFactory.ok(reviewService.getReviewsByBrId(brId));
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<BaseResponse<List<ReviewResponse>>> getReviewsByListingId(@PathVariable String listingId) {
        return ResponseFactory.ok(reviewService.getReviewsByListingId(listingId));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<BaseResponse<ReviewResponse>> incrementLike(@PathVariable String id) {
        return ResponseFactory.ok(reviewService.incrementLike(id));
    }
}