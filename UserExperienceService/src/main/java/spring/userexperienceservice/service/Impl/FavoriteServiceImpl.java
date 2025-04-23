package spring.userexperienceservice.service.Impl;

import lombok.RequiredArgsConstructor;
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
    public List<FavoriteResponse> getFavoritesByUser(String userId) {
        return repository.findByUserId(userId).stream()
                .map(mapper::toResponse)
                .toList();
    }
}
