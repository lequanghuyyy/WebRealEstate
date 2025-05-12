package realestate.webrealestatepaymentservice.dto.request;

import lombok.Data;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod; // Ví dụ: "CREDIT_CARD"
    private BigDecimal commissionFee;
    private String notes;
    private TransactionStyle transactionStyle;
    private String agentId;
}
