package realestate.webrealestaterentservice.service;

import org.springframework.stereotype.Service;
import realestate.webrealestaterentservice.constant.RentalStatus;
import realestate.webrealestaterentservice.dto.paging.PageDto;
import realestate.webrealestaterentservice.dto.request.PageRentalTransactionRequest;
import realestate.webrealestaterentservice.dto.request.RentalStatusUpdateRequest;
import realestate.webrealestaterentservice.dto.request.RentalTransactionRequest;
import realestate.webrealestaterentservice.dto.response.RentalTransactionResponse;

import java.util.List;

@Service
public interface RentalService {
    RentalTransactionResponse createRentalTransaction(RentalTransactionRequest request);
    RentalTransactionResponse getRentalTransactionById(String id);
    List<RentalTransactionResponse> getRentalTransactionsByRenter(String renterId);
    List<RentalTransactionResponse> getRentalTransactionsByAgent(String agentId);
    List<RentalTransactionResponse> getRentalTransactionsByListing(String listingId);
    RentalTransactionResponse updateRentalTransactionStatus(String id, RentalStatus request);
    void cancelRentalTransaction(String id);
    Integer count();
    PageDto<RentalTransactionResponse> getPagedRentalTransactions(int page, int size);
}
