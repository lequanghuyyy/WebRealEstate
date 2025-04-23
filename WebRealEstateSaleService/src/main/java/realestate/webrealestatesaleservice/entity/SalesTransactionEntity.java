package realestate.webrealestatesaleservice.entity;

import jakarta.persistence.*;
import lombok.*;
import realestate.webrealestatesaleservice.constant.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sale_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liên kết đến Listing (ID của bất động sản)
    @Column(nullable = false)
    private String listingId;

    // ID người mua
    @Column(nullable = false)
    private String buyerId;

    // ID môi giới
    @Column(nullable = true)
    private String agentId;

    // Giá trị giao dịch
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Trạng thái giao dịch: PENDING, COMPLETED, CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionStatus transactionStatus;

    // Thời điểm giao dịch được hoàn thành (nếu thành công)
    private LocalDateTime completedAt;

    // Thời gian tạo và cập nhật bản ghi
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
}
