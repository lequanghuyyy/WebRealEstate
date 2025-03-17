package realestate.securityservice.dto.respone;

import lombok.Data;

@Data
public class BaseResponse<T> {
    private String status;
    private String description;
    private T data;
}
