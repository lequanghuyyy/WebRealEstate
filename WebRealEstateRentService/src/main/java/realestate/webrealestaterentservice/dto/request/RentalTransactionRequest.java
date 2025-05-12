package realestate.webrealestaterentservice.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data

public class RentalTransactionRequest {
    private String listingId;
    private String renterId;
    private String agentId;
    private String status;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private LocalDate startDate;
    private LocalDate endDate;
}
