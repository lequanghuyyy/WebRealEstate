package realestate.webrealestatesaleservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String type;
//    private TransactionStyle transactionStyle;
}

