package realestate.webrealestatesaleservice.service;

import org.springframework.stereotype.Service;
import realestate.webrealestatesaleservice.constant.SaleStatus;
import realestate.webrealestatesaleservice.dto.paging.PageDto;
import realestate.webrealestatesaleservice.dto.request.PageSalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.StatusUpdateRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;

import java.util.List;

@Service
public interface SalesService {
    SalesTransactionResponse createTransaction(SalesTransactionRequest request);
    PageDto<SalesTransactionResponse> getAllTransactions(int page, int size);
    SalesTransactionResponse getTransactionById(String id);
    List<SalesTransactionResponse> getTransactionsByBuyer(String buyerId);
    List<SalesTransactionResponse> getTransactionsByAgent(String agentId);
    List<SalesTransactionResponse> getTransactionsByListing(String listingId);
    SalesTransactionResponse updateTransactionStatus(String id, SaleStatus status);
    Integer count();
}
