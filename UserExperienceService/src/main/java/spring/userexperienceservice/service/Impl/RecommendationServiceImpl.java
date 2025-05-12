package spring.userexperienceservice.service.Impl;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.response.RecommendationResponse;
import spring.userexperienceservice.entity.FavoriteListingEntity;
import spring.userexperienceservice.entity.RecentlyViewedEntity;
import spring.userexperienceservice.entity.SavedSearchEntity;
import spring.userexperienceservice.repository.FavoriteListingRepository;
import spring.userexperienceservice.repository.RecentlyViewedRepository;
import spring.userexperienceservice.repository.SavedSearchRepository;
import spring.userexperienceservice.service.RecommendationService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {
    private final SavedSearchRepository savedSearchRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;
    private final FavoriteListingRepository favoriteListingRepository;
    @Override
    public List<RecommendationResponse> getRecommendations(String userId, int limit) {
        List<RecommendationResponse> recommendations = new ArrayList<>();
        Optional<RecommendationResponse> savedSearchRecommendation = getRecommendationsFromSavedSearches(userId);
        savedSearchRecommendation.ifPresent(recommendations::add);
        Optional<RecommendationResponse> recentlyViewedRecommendation = getRecommendationsFromRecentlyViewed(userId);
        recentlyViewedRecommendation.ifPresent(recommendations::add);
//        Optional<RecommendationResponse> favoritesRecommendation = getRecommendationsFromFavorites(userId);
//        favoritesRecommendation.ifPresent(recommendations::add);
        return recommendations.stream().limit(limit).collect(Collectors.toList());
    }

    private Optional<RecommendationResponse> getRecommendationsFromSavedSearches(String userId) {
        List<SavedSearchEntity> savedSearches = savedSearchRepository.findByUserId(userId);
        if (savedSearches.isEmpty()) {
            return Optional.empty();
        }
        SavedSearchEntity latestSearch = savedSearches.stream()
                .max(Comparator.comparing(SavedSearchEntity::getCreatedAt))
                .orElse(null);
        Set<String> cities = savedSearches.stream()
                .map(SavedSearchEntity::getCity)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> keywords = savedSearches.stream()
                .map(SavedSearchEntity::getKeyword)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return Optional.of(RecommendationResponse.builder()
                .cities(cities)
                .propertyType(latestSearch.getType())
                .minPrice(latestSearch.getMinPrice())
                .maxPrice(latestSearch.getMaxPrice())
                .keywords(keywords)
                .build());
    }

    private Optional<RecommendationResponse> getRecommendationsFromRecentlyViewed(String userId) {
        List<RecentlyViewedEntity> recentlyViewed = recentlyViewedRepository
                .findByUserIdOrderByViewedAtDesc(userId);

        if (recentlyViewed.isEmpty()) {
            return Optional.empty();
        }
        Set<String> recentListingIds = recentlyViewed.stream()
                .limit(5)
                .map(RecentlyViewedEntity::getListingId)
                .collect(Collectors.toSet());

        return Optional.of(RecommendationResponse.builder()
                .listingIds(recentListingIds)
                .build());
    }

//    private Optional<RecommendationResponse> getRecommendationsFromFavorites(String userId) {
//        List<FavoriteListingEntity> favorites = favoriteListingRepository.findByUserId(userId,3);
//        if (favorites.isEmpty()) {
//            return Optional.empty();
//        }
//        Set<String> favoriteListingIds = favorites.stream()
//                .map(FavoriteListingEntity::getListingId)
//                .collect(Collectors.toSet());
//
//        return Optional.of(RecommendationResponse.builder()
//                .listingIds(favoriteListingIds)
//                .build());
//    }
}
