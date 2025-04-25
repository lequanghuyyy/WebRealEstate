package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.RecommendationResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.service.RecommendationService;

import java.util.List;

@RestController
@RequestMapping("api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<List<RecommendationResponse>>> getRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "3") int limit) {
        return ResponseFactory.ok(recommendationService.getRecommendations(userId, limit));
    }
}
