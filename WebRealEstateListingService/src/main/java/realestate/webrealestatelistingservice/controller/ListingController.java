package realestate.webrealestatelistingservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
@RequestMapping("api/v1/listing")
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

    @GetMapping("/find")
    public ResponseEntity<BaseResponse<List<ListingResponse>>> find() {
        return ResponseFactory.ok(listingService.getListings());
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

}
