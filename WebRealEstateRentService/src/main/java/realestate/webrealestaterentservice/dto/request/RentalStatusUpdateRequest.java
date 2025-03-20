package realestate.webrealestaterentservice.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import realestate.webrealestaterentservice.constant.RentalStatus;


@Getter
@Setter
public class RentalStatusUpdateRequest {
    private String status;
}
