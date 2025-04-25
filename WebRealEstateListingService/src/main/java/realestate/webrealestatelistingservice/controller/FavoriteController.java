package realestate.webrealestatelistingservice.controller;

import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestatelistingservice.dto.response.BaseResponse;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.dto.response.ResponseFactory;
import realestate.webrealestatelistingservice.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;


    @PostMapping("/add")
    public ResponseEntity<BaseResponse<String>> addToFavorites(
            @RequestParam String userId,
            @RequestParam String listingId) {
        favoriteService.addToFavorites(userId, listingId);
        return ResponseFactory.ok("Successfully added to Favorites");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<BaseResponse<String>> removeFromFavorites(
            @RequestParam String userId,
            @RequestParam String listingId) {
        favoriteService.removeFromFavorites(userId, listingId);
        return ResponseFactory.ok("Successfully removed from Favorites");
    }

    @GetMapping("/list/{userId}")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> getFavoriteListings(
            @PathVariable String userId) {
        return ResponseFactory.ok(favoriteService.getFavoriteListings(userId));
    }
}
