package spring.userexperienceservice.service;

import org.springframework.stereotype.Service;
import spring.userexperienceservice.dto.request.FavoriteRequest;
import spring.userexperienceservice.dto.response.FavoriteResponse;

import java.util.List;

@Service
public interface FavoriteService {
    FavoriteResponse addFavorite(FavoriteRequest request);
    void removeFavorite(String userId, String listingId);
    List<FavoriteResponse> getFavoritesByUser(String userId);
}
