package spring.userexperienceservice.service;

import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.response.RecommendationResponse;

import java.util.List;

@Service
public interface RecommendationService {
    List<RecommendationResponse> getRecommendations(String userId, int limit);

}
