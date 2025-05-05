package spring.userexperienceservice.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SavedSearchRequest {
    private String userId;
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private int bedrooms;
    private String type; // SALE or RENT
}
