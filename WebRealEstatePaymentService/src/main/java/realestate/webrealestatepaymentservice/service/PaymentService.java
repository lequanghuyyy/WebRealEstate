package realestate.webrealestatepaymentservice.service;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.constant.PaymentStatus;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;

import java.math.BigDecimal;

@Service
public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse getPaymentByTransactionId(String transactionId);
    Page<PaymentResponse> getAllPayments(String agentId,int page);
    BigDecimal calculateCommissionFee();
    BigDecimal calculateCommissionFee(TransactionStyle transactionStyle);
    Page<PaymentResponse> getAllPayments(int page);
    PaymentResponse updateStatus(String paymentId, PaymentStatus status);
}
