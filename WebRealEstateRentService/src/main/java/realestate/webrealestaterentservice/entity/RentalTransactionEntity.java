package realestate.webrealestaterentservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import realestate.webrealestaterentservice.constant.RentalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liên kết đến Listing (ID từ Listing Service)
    @Column(nullable = false, unique = true)
    private String listingId;

    // ID của người thuê
    @Column(nullable = false)
    private String renterId;

    // ID của môi giới
    @Column(nullable = true)
    private String agentId;

    // Giá thuê hàng tháng
    @Column(nullable = false, precision = 12, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false, message = "Monthly rent must be positive")
        private BigDecimal monthlyRent;

    // Tiền đặt cọc
    @Column(precision = 12, scale = 2)
    @DecimalMin(value = "0.0", inclusive = true, message = "Deposit must not be negative")
    private BigDecimal deposit;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Trạng thái giao dịch thuê: PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RentalStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    @AssertTrue(message = "Start date must be before end date")
    public boolean isStartDateBeforeEndDate() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return startDate.isBefore(endDate);
    }
}
