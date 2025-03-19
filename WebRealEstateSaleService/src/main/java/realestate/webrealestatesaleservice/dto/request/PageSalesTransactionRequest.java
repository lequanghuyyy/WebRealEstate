package realestate.webrealestatesaleservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PageSalesTransactionRequest {
    @Min(value = 1, message = "Page must be at least 1")
    @Max(value = 1000, message = "Page must be at most 100")
    private int page = 1;

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size must be at most 100")
    private int size = 10;
}
