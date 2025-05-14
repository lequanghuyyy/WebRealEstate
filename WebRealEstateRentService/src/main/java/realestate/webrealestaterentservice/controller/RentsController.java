package realestate.webrealestaterentservice.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestaterentservice.constant.RentalStatus;
import realestate.webrealestaterentservice.dto.paging.PageDto;
import realestate.webrealestaterentservice.dto.request.PageRentalTransactionRequest;
import realestate.webrealestaterentservice.dto.request.RentalStatusUpdateRequest;
import realestate.webrealestaterentservice.dto.request.RentalTransactionRequest;
import realestate.webrealestaterentservice.dto.response.BaseResponse;
import realestate.webrealestaterentservice.dto.response.RentalTransactionResponse;
import realestate.webrealestaterentservice.dto.response.ResponseFactory;
import realestate.webrealestaterentservice.service.RentalService;


import java.util.List;

@RestController
@RequestMapping("api/v1/rentals")
@RequiredArgsConstructor
public class RentsController {

    private final RentalService rentalService;

    @PostMapping("/create")
    public ResponseEntity<BaseResponse<RentalTransactionResponse>> createTransaction(@Valid @RequestBody RentalTransactionRequest request) {
        RentalTransactionResponse response = rentalService.createRentalTransaction(request);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/find/{transactionId}")
    public ResponseEntity<BaseResponse<RentalTransactionResponse>> getTransactionById(@PathVariable("transactionId") String transactionId) {
        RentalTransactionResponse response = rentalService.getRentalTransactionById(transactionId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/find/{page}/{size}")
    public ResponseEntity<BaseResponse<PageDto<RentalTransactionResponse>>> getAllTransactions(@PathVariable int page,
                                                                                               @PathVariable int size) {
        PageDto<RentalTransactionResponse> response = rentalService.getPagedRentalTransactions(page,size);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/renter/{renterId}")
    public ResponseEntity<BaseResponse<List<RentalTransactionResponse>>> getTransactionsByBuyer(@PathVariable("renterId") String renterId) {
        List<RentalTransactionResponse> response = rentalService.getRentalTransactionsByRenter(renterId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<BaseResponse<List<RentalTransactionResponse>>> getTransactionsByAgent(@PathVariable("agentId") String agentId) {
        List<RentalTransactionResponse> response = rentalService.getRentalTransactionsByAgent(agentId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<BaseResponse<List<RentalTransactionResponse>>> getTransactionsByListing(@PathVariable("listingId") String listingId) {
        List<RentalTransactionResponse> response = rentalService.getRentalTransactionsByListing(listingId);
        return ResponseFactory.ok(response);
    }

    @PutMapping("/updateStatus/{transactionId}")
    public ResponseEntity<BaseResponse<RentalTransactionResponse>> updateTransactionStatus(
            @PathVariable("transactionId") String transactionId,
            @RequestBody RentalStatusUpdateRequest statusUpdateRequest) {
        RentalStatus rentalStatus = RentalStatus.valueOf(statusUpdateRequest.getStatus().toUpperCase());
        RentalTransactionResponse response = rentalService.updateRentalTransactionStatus(transactionId, rentalStatus);
        return ResponseFactory.ok(response);
    }
    @GetMapping("/count")
    public ResponseEntity<BaseResponse<Integer>> countRentalTransactions() {
        return ResponseFactory.ok(rentalService.count());
    }
}
