package realestate.webrealestaterentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusEvent implements Serializable {
    private String transactionId;
    private String transactionStyle; // SALE or RENT
    private String status; // COMPLETED or FAILED
}

