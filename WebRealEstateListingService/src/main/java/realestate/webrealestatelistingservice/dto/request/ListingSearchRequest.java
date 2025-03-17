package realestate.webrealestatelistingservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;

import java.math.BigDecimal;

@Data
public class ListingSearchRequest {
    private String keyword;       // Tìm kiếm theo tiêu đề hoặc mô tả
    private String city;

    private String address;       // Tìm kiếm theo địa chỉ

    private ListingType type;
    private ListingStatus status;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private BigDecimal minArea;   // Diện tích tối thiểu
    private BigDecimal maxArea;   // Diện tích tối đa

    @Min(value = 1, message = "Page must be at least 1")
    @Max(value = 1000, message = "Page must be at most 100")
    private int page = 1;

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size must be at most 100")
    private int size = 10;


}
