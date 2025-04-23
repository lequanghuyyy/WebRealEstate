package realestate.webrealestatelistingservice.service;

import realestate.webrealestatelistingservice.dto.response.ListingResponse;

import java.util.List;

public interface FavoriteService {
    void addToFavorites(String userId, String listingId);
    void removeFromFavorites(String userId, String listingId);
    List<ListingResponse> getFavoriteListings(String userId);
}
