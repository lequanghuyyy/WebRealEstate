package realestate.webrealestatesaleservice.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesTransactionRequest {
    private String listingId;
    private String buyerId;
    private String agentId;
    private BigDecimal amount;
    private String transactionStatus;
}
