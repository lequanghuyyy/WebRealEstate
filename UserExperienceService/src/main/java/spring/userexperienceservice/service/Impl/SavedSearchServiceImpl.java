package spring.userexperienceservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.request.SavedSearchRequest;
import spring.userexperienceservice.dto.response.SavedSearchResponse;
import spring.userexperienceservice.entity.SavedSearchEntity;
import spring.userexperienceservice.mapper.SavedSearchMapper;
import spring.userexperienceservice.repository.SavedSearchRepository;
import spring.userexperienceservice.service.SavedSearchService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedSearchServiceImpl implements SavedSearchService {

    private final SavedSearchRepository repository;
    private final SavedSearchMapper mapper;

    @Override
    public SavedSearchResponse saveSearch(SavedSearchRequest request) {
        SavedSearchEntity entity = SavedSearchEntity.builder()
                .userId(request.getUserId())
                .keyword(request.getKeyword())
                .city(request.getCity())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .minArea(request.getMinArea())
                .maxArea(request.getMaxArea())
                .type(request.getType())
                .build();
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public List<SavedSearchResponse> getSavedSearches(String userId) {
        return repository.findByUserId(userId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public void deleteSavedSearch(String id) {
        repository.deleteById(id);
    }
}
