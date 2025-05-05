package spring.userexperienceservice.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SavedSearchResponse {
    private String id;
    private String userId;
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private int bedrooms;
    private String type;
    private LocalDateTime createdAt;
}
