package realestate.webrealestatesaleservice.service;

import org.springframework.stereotype.Service;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;

import java.util.List;

@Service
public interface SalesService {
    SalesTransactionResponse createTransaction(SalesTransactionRequest request);
    SalesTransactionResponse getTransactionById(String id);
    List<SalesTransactionResponse> getTransactionsByBuyer(String buyerId);
    List<SalesTransactionResponse> getTransactionsByAgent(String agentId);
    SalesTransactionResponse updateTransactionStatus(String id, String status);
}
