package realestate.webrealestatelistingservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestatelistingservice.constant.ListingType;
import realestate.webrealestatelistingservice.dto.paging.PageDto;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.request.ListingSearchRequest;
import realestate.webrealestatelistingservice.dto.request.ListingStatusUpdateRequest;
import realestate.webrealestatelistingservice.dto.response.BaseResponse;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.dto.response.ResponseFactory;
import realestate.webrealestatelistingservice.service.ListingService;

import java.util.List;

@RestController
@RequestMapping("api/v1/listings")
public class ListingController {
    private final ListingService listingService;
    @Autowired
    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping("/create")
    public ResponseEntity<BaseResponse<ListingResponse>> create(@RequestBody ListingRequest listingRequest) {
        return ResponseFactory.ok(listingService.createListing(listingRequest));
    }

    @GetMapping("/findById/{listingId}")
    public ResponseEntity<BaseResponse<ListingResponse>> findById(@PathVariable("listingId") String listingId) {
        return ResponseFactory.ok(listingService.getListingById(listingId));
    }

    @GetMapping("/findByOwnerId/{listingOwnerId}")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> findByOwnerId(@PathVariable("listingOwnerId") String listingOwnerId) {
        return ResponseFactory.ok(listingService.getListingsByOwnerId(listingOwnerId));
    }

    @PutMapping("/update/{listingId}")
    public ResponseEntity<BaseResponse<ListingResponse>> update(@PathVariable("listingId") String listingId, @RequestBody ListingRequest listingRequest) {
        return ResponseFactory.ok(listingService.updateListing(listingId, listingRequest));
    }

    @PutMapping("/updateStatus/{listingId}")
    public ResponseEntity<BaseResponse<ListingResponse>> updateStatus(
            @PathVariable("listingId") String listingId,
            @RequestBody ListingStatusUpdateRequest request) {
        ListingResponse response = listingService.updateListingStatus(listingId, request);
        return ResponseFactory.ok(response);
    }

    @DeleteMapping("/delete/{listingId}")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable("listingId") String listingId) {
        listingService.deleteListing(listingId);
        return ResponseFactory.ok(null);
    }

    @PostMapping("/search")
    public ResponseEntity<BaseResponse<PageDto<ListingResponse>>> search(@RequestBody ListingSearchRequest searchRequest) {
        PageDto<ListingResponse> pageResult = listingService.searchListings(searchRequest);
        return ResponseFactory.ok(pageResult);
    }

    @GetMapping("")
    public ResponseEntity<BaseResponse<PageDto<ListingResponse>>> getListingsPaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseFactory.ok(listingService.getListingsPaged(page, size));
    }

    @GetMapping("/byViews")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> getListingsBy5ViewMost() {
        return ResponseFactory.ok(listingService.getTop5MostViewedListings());
    }

    @GetMapping("/sale")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> getListingsBySaleType() {
        return ResponseFactory.ok(listingService.getListingsBySaleType());
    }

    @GetMapping("/rent")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> getListingsByRentType() {
        return ResponseFactory.ok(listingService.getListingsByRentType());
    }

    @GetMapping("/sale/paged")
    public ResponseEntity<BaseResponse<PageDto<ListingResponse>>> getListingsBySaleTypePaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseFactory.ok(listingService.getListingsBySaleTypePaged(page, size));
    }

    @GetMapping("/rent/paged")
    public ResponseEntity<BaseResponse<PageDto<ListingResponse>>> getListingsByRentTypePaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseFactory.ok(listingService.getListingsByRentTypePaged(page, size));
    }
    @GetMapping("/count")
    public ResponseEntity<BaseResponse<Integer>> getTotalListingsCount() {
        return ResponseFactory.ok(listingService.getTotalListingsCount());
    }
    @GetMapping("/countByType/{type}")
    public ResponseEntity<BaseResponse<Integer>> getTotalListingsCountByType(@PathVariable ListingType type) {
        return ResponseFactory.ok(listingService.getTotalListingsCountByType(type));
    }

}
