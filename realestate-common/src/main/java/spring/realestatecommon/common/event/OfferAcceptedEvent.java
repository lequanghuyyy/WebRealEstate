package spring.realestatecommon.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferAcceptedEvent implements Serializable {
    private String offerId;
    private String userId;
    private String listingId;
    private String transactionStyle; // SALE or RENT
    private String agentId;
    private LocalDate startRentAt;
    private LocalDate endRentAt;
    private BigDecimal offerPrice;
}
