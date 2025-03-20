package realestate.webrealestatepaymentservice.service;

import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;

@Service
public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByTransactionId(String transactionId);
}
