package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.RecommendationResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.service.RecommendationService;

import java.util.List;

@RestController
@RequestMapping("api/v1/ux/recommendations")

public class RecommendationController {

    @Autowired
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<List<RecommendationResponse>>> getRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseFactory.ok(recommendationService.getRecommendations(userId, limit));
    }
}
