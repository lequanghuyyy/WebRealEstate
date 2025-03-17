package realestate.webrealestatelistingservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import realestate.webrealestatelistingservice.constant.ListingStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingStatusUpdateRequest {
    private ListingStatus status;
}
