package realestate.webrealestaterentservice.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RentalTransactionResponse {
    private String id;
    private String listingId;
    private String renterId;
    private String agentId;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}
