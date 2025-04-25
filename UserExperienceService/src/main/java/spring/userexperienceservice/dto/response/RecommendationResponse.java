package spring.userexperienceservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
public class RecommendationResponse {
    private Set<String> listingIds;  // Recently viewed or favorited listings
    private Set<String> cities;      // Cities user has searched for
    private String propertyType;     // SALE or RENT
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minArea;
    private BigDecimal maxArea;
    private Set<String> keywords;
}
