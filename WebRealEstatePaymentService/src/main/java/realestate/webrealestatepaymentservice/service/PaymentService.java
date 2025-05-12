package realestate.webrealestatepaymentservice.service;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;

import java.math.BigDecimal;

@Service
public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByTransactionId(String transactionId);
    Page<PaymentResponse> getAllPayments(String agentId,int page);
    BigDecimal calculateCommissionFee();
    Page<PaymentResponse> getAllPayments(int page);
}
