package realestate.webrealestatesaleservice.dto.paging;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PageDto<T> {
    private List<T> items;
    private long totalElements;
    private long totalPages;
    private int page;
    private int size;
}
