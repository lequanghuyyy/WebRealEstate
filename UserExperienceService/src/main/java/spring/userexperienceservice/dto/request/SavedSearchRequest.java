package spring.userexperienceservice.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SavedSearchRequest {
    private String userId;
    private String keyword;
    private String city;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minArea;
    private BigDecimal maxArea;
    private String type; // SALE or RENT
}
