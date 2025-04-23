package realestate.webrealestatesaleservice.dto.response;


import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalesTransactionResponse {
    private String id;
    private String listingId;
    private String buyerId;
    private String agentId;
    private BigDecimal amount;
    private String transactionStatus;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
