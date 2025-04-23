package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.request.FavoriteRequest;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.FavoriteResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<BaseResponse<FavoriteResponse>> addFavorite(@RequestBody FavoriteRequest request) {
        return ResponseFactory.ok(favoriteService.addFavorite(request));
    }

    @DeleteMapping("/{userId}/{listingId}")
    public ResponseEntity<BaseResponse<Void>> removeFavorite(@PathVariable String userId, @PathVariable String listingId) {
        favoriteService.removeFavorite(userId, listingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<List<FavoriteResponse>>> getFavorites(@PathVariable String userId) {
        return ResponseFactory.ok(favoriteService.getFavoritesByUser(userId));
    }
}
