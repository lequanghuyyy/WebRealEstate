package realestate.webrealestatepaymentservice.dto.response;


import org.springframework.http.ResponseEntity;

public class ResponseFactory {
    private ResponseFactory() {}

    public static <T> ResponseEntity<BaseResponse<T>> ok(T data) {
        BaseResponse<T> response = new BaseResponse<>();
        response.setData(data);
        response.setStatus("100");
        response.setDescription("success");
        return ResponseEntity.ok(response);
    }

}
    