package spring.webrealestateofferservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import spring.webrealestateofferservice.dto.request.OfferRequest;
import spring.webrealestateofferservice.dto.response.BaseResponse;
import spring.webrealestateofferservice.dto.response.OfferResponse;
import spring.webrealestateofferservice.dto.response.ResponseFactory;
import spring.webrealestateofferservice.service.OfferService;

import javax.validation.Valid;

@RestController
@RequestMapping("api/v1/offers")
@RequiredArgsConstructor
@Validated
public class OfferController {

    private final OfferService offerService;

    @PostMapping
    public ResponseEntity<BaseResponse<OfferResponse>> createOffer(
            @Valid @RequestBody OfferRequest request) {
        return ResponseFactory.ok(offerService.createOffer(request));
    }

    @GetMapping("/listing/{listingId}/{page}")
    public ResponseEntity<BaseResponse<Page<OfferResponse>>> getOffersByListing(
            @PathVariable String listingId,
            @PathVariable int page) {
        return ResponseFactory.ok(offerService.getOffersByListing(listingId, page));
    }

    @PatchMapping("/{offerId}/accept")
    public ResponseEntity<BaseResponse<OfferResponse>> acceptOffer(
            @PathVariable String offerId) {
        return ResponseFactory.ok(offerService.acceptOffer(offerId));
    }

    @PatchMapping("/{offerId}/reject")
    public ResponseEntity<BaseResponse<OfferResponse>> rejectOffer(
            @PathVariable String offerId) {
        return ResponseFactory.ok(offerService.rejectOffer(offerId));
    }

    @GetMapping("/{page}")
    public ResponseEntity<BaseResponse<Page<OfferResponse>>> getAllOffers(
            @PathVariable int page) {
        return ResponseFactory.ok(offerService.getAllOffers(page));
    }
    @GetMapping("/{userId}/{page}")
    public ResponseEntity<BaseResponse<Page<OfferResponse>>> getOffersByUser(
            @PathVariable String userId,
            @PathVariable int page) {
        return ResponseFactory.ok(offerService.getOfferByUserId(userId, page));
    }
    @DeleteMapping("/{offerId}")
    public ResponseEntity<BaseResponse<Void>> deleteOffer(
            @PathVariable String offerId) {
        offerService.deleteOffer(offerId);
        return ResponseFactory.ok(null);
    }
}