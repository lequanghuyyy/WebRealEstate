package spring.webrealestateofferservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfferAcceptedEvent implements Serializable {
    private String offerId;
    private String userId;
    private String listingId;
    private String transactionStyle; // SALE / RENTAL

    private LocalDate startRentAt;

    private LocalDate endRentAt;


}
