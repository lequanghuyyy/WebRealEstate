package spring.userexperienceservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.request.RecentlyViewedRequest;
import spring.userexperienceservice.dto.response.RecentlyViewedResponse;
import spring.userexperienceservice.entity.RecentlyViewedEntity;
import spring.userexperienceservice.mapper.RecentlyViewedMapper;
import spring.userexperienceservice.repository.RecentlyViewedRepository;
import spring.userexperienceservice.service.RecentlyViewedService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecentlyViewedServiceImpl implements RecentlyViewedService {

    private final RecentlyViewedRepository repository;
    private final RecentlyViewedMapper mapper;

    @Override
    public void recordView(RecentlyViewedRequest request) {
        RecentlyViewedEntity entity = RecentlyViewedEntity.builder()
                .userId(request.getUserId())
                .listingId(request.getListingId())
                .build();
        repository.save(entity);
    }

    @Override
    public List<RecentlyViewedResponse> getRecentlyViewed(String userId, int limit) {
        return repository.findByUserIdOrderByViewedAtDesc(userId).stream()
                .limit(limit)
                .map(mapper::toResponse)
                .toList();
    }
}
