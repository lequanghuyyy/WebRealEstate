package spring.webrealestateofferservice.entity;


import jakarta.persistence.*;
import lombok.*;
import spring.webrealestateofferservice.constant.OfferStatus;

import javax.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liên kết đến Listing (có thể dùng String listingId hoặc @ManyToOne nếu import ListingEntity)
    @Column(name = "listing_id", nullable = false)
    private String listingId;

    // ID của người mua hoặc người thuê
    @Column(name = "user_id", nullable = false)
    private String userId;

    // (Tùy chọn) Agent được gán để xử lý offer này
    @Column(name = "agent_id")
    private String agentId;

    // Giá đề nghị
    @Column(name = "offer_price", nullable = false, precision = 12, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false, message = "Offer price must be positive")
    private BigDecimal offerPrice;

    // Thời hạn hiệu lực của offer
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Trạng thái: PENDING (mới gửi), ACCEPTED, REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private OfferStatus status = OfferStatus.PENDING;

    // Ghi chú thêm (nếu có)
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "start_rent_at")
    private LocalDate startRentAt;

    @Column(name = "end_rent_at")
    private LocalDate endRentAt;

    // Thời gian tạo/cập nhật
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
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
}

