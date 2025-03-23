package realestate.webrealestatepaymentservice.exception;


import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, Object> objectBody = new LinkedHashMap<>();
        objectBody.put("Current Timestamp", new Date());
        List<String> exceptionalErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(x -> x.getField() + ":" + x.getDefaultMessage())
                .toList();
        objectBody.put("Errors", exceptionalErrors);
        return ResponseEntity.badRequest().body(objectBody);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        if (ex.getMessage().contains("No enum constant")) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", new Date());
            body.put("status", HttpStatus.BAD_REQUEST.value());
            body.put("error", "Invalid Enum Value");
            body.put("details", "Giá trị không hợp lệ cho một enum. Hãy kiểm tra lại giá trị hợp lệ.");
            return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        }
        return handleUnwantedException(ex);
    }


    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException invalidFormatEx) {
            if (invalidFormatEx.getTargetType().isEnum()) {
                String fieldName = invalidFormatEx.getPath().get(0).getFieldName();
                String allowedValues = Arrays.toString(invalidFormatEx.getTargetType().getEnumConstants());
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("timestamp", new Date());
                body.put("status", HttpStatus.BAD_REQUEST.value());
                body.put("error", "Invalid Enum Value");
                body.put("details", String.format("Giá trị không hợp lệ cho trường '%s'. Các giá trị hợp lệ là: %s", fieldName, allowedValues));
                return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
            }
        }
        return super.handleHttpMessageNotReadable(ex, headers, status, request);
    }

//    @ExceptionHandler(InvalidRequestException.class)
//    public ResponseEntity<Object> handleInvalidRequestException(InvalidRequestException ex) {
//        Map<String, Object> error = new LinkedHashMap<>();
//        error.put("timestamp", new Date());
//        error.put("status", HttpStatus.BAD_REQUEST.value());
//        error.put("error", "Invalid Request");
//        error.put("details", ex.getMessage());
//        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
//    }


    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Object> handleNotFoundException(NotFoundException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", new Date());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("details", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }



    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnwantedException(Exception e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", new Date());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "system error");
        body.put("details", e.getMessage());
        return new ResponseEntity<>(body,HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
