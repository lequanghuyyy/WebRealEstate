package spring.userexperienceservice.dto.response;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SavedSearchResponse {
    private String id;
    private String userId;
    private String keyword;
    private String city;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minArea;
    private BigDecimal maxArea;
    private String type;
    private LocalDateTime createdAt;
}
