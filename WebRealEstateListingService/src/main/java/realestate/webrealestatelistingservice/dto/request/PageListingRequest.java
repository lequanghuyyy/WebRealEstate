package realestate.webrealestatelistingservice.dto.request;

import lombok.Data;

@Data
public class PageListingRequest {
    private int page;
    private int size;
}
