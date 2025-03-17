package realestate.webrealestatesaleservice.entity;

import jakarta.persistence.*;
import lombok.*;
import realestate.webrealestatesaleservice.constant.TransactionStatus;
import realestate.webrealestatesaleservice.constant.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
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
    @Column(nullable = false)
    private String agentId;

    // Giá trị giao dịch
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Hoa hồng của môi giới hoặc công ty (nếu có)
    @Column(precision = 12, scale = 2)
    private BigDecimal commissionFee;

    // Trạng thái giao dịch: PENDING, COMPLETED, CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionStatus status;

    // Loại giao dịch: SALE hoặc RENT
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType transactionType;

    // Ngày giao dịch thực hiện (điểm mốc khi giao dịch diễn ra)
    private LocalDateTime transactionDate;

    // Thời điểm giao dịch được hoàn thành (nếu thành công)
    private LocalDateTime completedAt;

    // Ghi chú hoặc mô tả thêm về giao dịch
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Thời gian tạo và cập nhật bản ghi
    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        // Thiết lập transactionDate nếu chưa có
        if (transactionDate == null) {
            transactionDate = createdAt;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
