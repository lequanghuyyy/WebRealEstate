package realestate.webrealestatepaymentservice.dto.response;

import lombok.Data;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private String id;
    private String transactionId;
    private String agentId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime paymentDate;
    private BigDecimal commissionFee;
    private String notes;
    private LocalDateTime createdAt;
    private TransactionStyle transactionStyle;
}
