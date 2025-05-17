package spring.webrealestateofferservice.dto.response;

import jakarta.persistence.Column;
import lombok.*;
import spring.webrealestateofferservice.constant.OfferStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferResponse {
    private String id;
    private String listingId;
    private String userId;
    private String agentId;
    private BigDecimal offerPrice;
    private LocalDateTime expiresAt;
    private OfferStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private LocalDate startRentAt;

    private LocalDate endRentAt;
}
