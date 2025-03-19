package realestate.webrealestatesaleservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestatesaleservice.constant.TransactionStatus;
import realestate.webrealestatesaleservice.dto.paging.PageDto;
import realestate.webrealestatesaleservice.dto.request.PageSalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.StatusUpdateRequest;
import realestate.webrealestatesaleservice.dto.response.BaseResponse;
import realestate.webrealestatesaleservice.dto.response.ResponseFactory;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;
import realestate.webrealestatesaleservice.service.SalesService;

import java.util.List;

@RestController
@RequestMapping("api/v1/sale")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @PostMapping("/create")
    public ResponseEntity<BaseResponse<SalesTransactionResponse>> createTransaction(@RequestBody SalesTransactionRequest request) {
        SalesTransactionResponse response = salesService.createTransaction(request);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/find/{transactionId}")
    public ResponseEntity<BaseResponse<SalesTransactionResponse>> getTransactionById(@PathVariable("transactionId") String transactionId) {
        SalesTransactionResponse response = salesService.getTransactionById(transactionId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/find")
    public ResponseEntity<BaseResponse<PageDto<SalesTransactionResponse>>> getAllTransactions(@RequestBody PageSalesTransactionRequest pageSalesTransactionRequest) {
        return ResponseFactory.ok(salesService.getAllTransactions(pageSalesTransactionRequest));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<BaseResponse<List<SalesTransactionResponse>>> getTransactionsByBuyer(@PathVariable("buyerId") String buyerId) {
        List<SalesTransactionResponse> response = salesService.getTransactionsByBuyer(buyerId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<BaseResponse<List<SalesTransactionResponse>>> getTransactionsByAgent(@PathVariable("agentId") String agentId) {
        List<SalesTransactionResponse> response = salesService.getTransactionsByAgent(agentId);
        return ResponseFactory.ok(response);
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<BaseResponse<List<SalesTransactionResponse>>> getTransactionsByListing(@PathVariable("listingId") String listingId) {
        List<SalesTransactionResponse> response = salesService.getTransactionsByListing(listingId);
        return ResponseFactory.ok(response);
    }

    @PutMapping("/updateStatus/{transactionId}")
    public ResponseEntity<BaseResponse<SalesTransactionResponse>> updateTransactionStatus(
            @PathVariable("transactionId") String transactionId,
            @RequestBody StatusUpdateRequest status) {

        TransactionStatus transactionStatus = TransactionStatus.valueOf(status.getStatus().toUpperCase());
        SalesTransactionResponse response = salesService.updateTransactionStatus(transactionId, transactionStatus);
        return ResponseFactory.ok(response);
    }
}

