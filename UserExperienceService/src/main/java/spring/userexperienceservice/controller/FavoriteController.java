package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.request.FavoriteRequest;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.FavoriteResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("api/v1/ux/favorites")
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
    public ResponseEntity<BaseResponse<Page<FavoriteResponse>>> getFavorites(
            @PathVariable String userId,
            @RequestParam(name = "page", defaultValue = "0") int page) {

        Page<FavoriteResponse> favoritesPage = favoriteService.getFavoritesByUser(userId, page);
        return ResponseFactory.ok(favoritesPage);
    }
}
