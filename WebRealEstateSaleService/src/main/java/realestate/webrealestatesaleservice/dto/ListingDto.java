package realestate.webrealestatesaleservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingDto{
    private String id;
    private String agentId;
    private String type;
    private BigDecimal price;       // cho SALE
    private BigDecimal monthlyRent;  // cho RENT
    private BigDecimal deposit;      // cho RENT
}
