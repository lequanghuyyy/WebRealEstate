package spring.userexperienceservice.service;

import spring.userexperienceservice.dto.request.RecentlyViewedRequest;
import spring.userexperienceservice.dto.response.RecentlyViewedResponse;

import java.util.List;

public interface RecentlyViewedService {
    void recordView(RecentlyViewedRequest request);
    List<RecentlyViewedResponse> getRecentlyViewed(String userId, int limit);
}
