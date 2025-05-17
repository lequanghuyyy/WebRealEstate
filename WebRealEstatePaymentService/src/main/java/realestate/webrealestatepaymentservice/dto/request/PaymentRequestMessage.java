package realestate.webrealestatepaymentservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestMessage implements Serializable {
    private String transactionId;
    private BigDecimal amount;
    private String userId;
    private String agentId;
    private TransactionStyle transactionStyle;
}

