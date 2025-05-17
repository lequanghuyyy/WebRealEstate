package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.request.SavedSearchRequest;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.dto.response.SavedSearchResponse;
import spring.userexperienceservice.service.SavedSearchService;

import java.util.List;

@RestController
@RequestMapping("api/v1/ux/saved-searches")

public class SavedSearchController {

    @Autowired
    private final SavedSearchService savedSearchService;

    public SavedSearchController(SavedSearchService savedSearchService) {
        this.savedSearchService = savedSearchService;
    }

    @PostMapping("")
    public ResponseEntity<BaseResponse<SavedSearchResponse>> saveSearch(@RequestBody SavedSearchRequest request) {
        return ResponseFactory.ok(savedSearchService.saveSearch(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<List<SavedSearchResponse>>> getSavedSearches(@PathVariable String userId) {
        return ResponseFactory.ok(savedSearchService.getSavedSearches(userId));
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<BaseResponse<Void>> deleteSavedSearch(@PathVariable String id) {
            savedSearchService.deleteSavedSearch(id);
            return ResponseFactory.ok(null);
        }
}
