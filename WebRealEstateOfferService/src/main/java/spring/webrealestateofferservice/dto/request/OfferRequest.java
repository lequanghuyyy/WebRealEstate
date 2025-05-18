package spring.webrealestateofferservice.dto.request;

import jakarta.persistence.Column;
import lombok.*;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferRequest {
    @NotBlank
    private String listingId;

    @NotBlank
    private String userId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal offerPrice;

    private String agentId;

    private LocalDate startRentAt;

    private LocalDate endRentAt;

    @NotNull
    private LocalDateTime expiresAt;

    private String message;
}
