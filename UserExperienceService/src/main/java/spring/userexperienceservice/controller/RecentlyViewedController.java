package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.dto.request.RecentlyViewedRequest;
import spring.userexperienceservice.dto.response.RecentlyViewedResponse;
import spring.userexperienceservice.service.RecentlyViewedService;

import java.util.List;

@RestController
@RequestMapping("api/v1/ux/recently-viewed")
public class RecentlyViewedController {

    @Autowired
    private final RecentlyViewedService recentlyViewedService;

    public RecentlyViewedController(RecentlyViewedService recentlyViewedService) {
        this.recentlyViewedService = recentlyViewedService;
    }

    @PostMapping
    public ResponseEntity<Void> recordView(@RequestBody RecentlyViewedRequest request) {
        recentlyViewedService.recordView(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<RecentlyViewedResponse>> getRecentlyViewed(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recentlyViewedService.getRecentlyViewed(userId, limit));
    }
}
