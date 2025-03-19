package realestate.webrealestatesaleservice.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesTransactionRequest {
    private String listingId;
    private String buyerId;
    private String agentId;
    private BigDecimal amount;
    private String notes;
    private BigDecimal commissionFee; // Có thể là giá trị tính sẵn hoặc null nếu không áp dụng
    private String transactionType; // "SALE" hoặc "RENT"
    private String transactionStatus;
}
