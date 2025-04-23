package realestate.webrealestatelistingservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.entity.FavoriteEntity;
import realestate.webrealestatelistingservice.entity.ListingEntity;
import realestate.webrealestatelistingservice.exception.NotFoundException;
import realestate.webrealestatelistingservice.mapper.ListingMapper;
import realestate.webrealestatelistingservice.repository.FavoriteRepository;
import realestate.webrealestatelistingservice.repository.ListingRepository;
import realestate.webrealestatelistingservice.service.FavoriteService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;

    @Override
    public void addToFavorites(String userId, String listingId) {
        if (favoriteRepository.findByUserIdAndListingId(userId, listingId).isPresent()) {
            removeFromFavorites(userId, listingId);
        }

        FavoriteEntity favorite = FavoriteEntity.builder()
                .userId(userId)
                .listingId(listingId)
                .build();

        favoriteRepository.save(favorite);
    }

    @Override
    public void removeFromFavorites(String userId, String listingId) {
        if (favoriteRepository.findByUserIdAndListingId(userId, listingId).isEmpty()) {
            throw new NotFoundException("Listing không có trong danh sách yêu thích.");
        }
        favoriteRepository.deleteByUserIdAndListingId(userId, listingId);
    }

    @Override
    public List<ListingResponse> getFavoriteListings(String userId) {
        List<FavoriteEntity> favorites = favoriteRepository.findByUserId(userId);

        return favorites.stream()
                .map(favorite -> {
                    ListingEntity listing = listingRepository.findById(favorite.getListingId())
                            .orElseThrow(() -> new NotFoundException("Listing không tồn tại"));
                    return listingMapper.convertToListingResponse(listing);
                })
                .collect(Collectors.toList());
    }
}
