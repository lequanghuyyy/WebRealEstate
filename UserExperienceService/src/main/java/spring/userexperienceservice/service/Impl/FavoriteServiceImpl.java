package spring.userexperienceservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.request.FavoriteRequest;
import spring.userexperienceservice.dto.response.FavoriteResponse;
import spring.userexperienceservice.entity.FavoriteListingEntity;
import spring.userexperienceservice.mapper.FavoriteMapper;
import spring.userexperienceservice.repository.FavoriteListingRepository;
import spring.userexperienceservice.service.FavoriteService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteListingRepository repository;
    private final FavoriteMapper mapper;
    private static final int PAGE_SIZE = 3;


    @Override
    public FavoriteResponse addFavorite(FavoriteRequest request) {
        return repository.findByUserIdAndListingId(request.getUserId(), request.getListingId())
                .map(mapper::toResponse)
                .orElseGet(() -> {
                    FavoriteListingEntity entity = FavoriteListingEntity.builder()
                            .userId(request.getUserId())
                            .listingId(request.getListingId())
                            .build();
                    return mapper.toResponse(repository.save(entity));
                });
    }

    @Override
    public void removeFavorite(String userId, String listingId) {
        repository.findByUserIdAndListingId(userId, listingId)
                .ifPresent(repository::delete);
    }

    @Override
    public Page<FavoriteResponse> getFavoritesByUser(String userId, int page) {
        Pageable pageable = PageRequest.of(page, PAGE_SIZE, Sort.by("createdAt").descending());
        Page<FavoriteListingEntity> entityPage = repository.findByUserId(userId, pageable);
        return entityPage.map(mapper::toResponse);
    }
}
