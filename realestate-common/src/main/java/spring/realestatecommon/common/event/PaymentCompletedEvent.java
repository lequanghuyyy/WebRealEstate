package spring.realestatecommon.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentCompletedEvent implements Serializable {
    private String listingId;
    private String transactionId; // ID của giao dịch
    private String transactionType; // "SALE" hoặc "RENT"
    private String status;
}
