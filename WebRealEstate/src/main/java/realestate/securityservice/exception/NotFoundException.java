package realestate.securityservice.exception;

public class NotFoundException extends RuntimeException{
    public NotFoundException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s not found with %s : '%s'",resourceName, fieldName, fieldValue));
    }
}
