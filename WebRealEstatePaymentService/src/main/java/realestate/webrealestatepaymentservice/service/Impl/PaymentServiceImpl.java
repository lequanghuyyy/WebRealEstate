package realestate.webrealestatepaymentservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.constant.PaymentMethod;
import realestate.webrealestatepaymentservice.constant.PaymentStatus;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;
import realestate.webrealestatepaymentservice.entity.PaymentEntity;
import realestate.webrealestatepaymentservice.exception.NotFoundException;
import realestate.webrealestatepaymentservice.mapper.PaymentMapper;
import realestate.webrealestatepaymentservice.repository.PaymentRepository;
import realestate.webrealestatepaymentservice.service.PaymentService;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        PaymentEntity paymentEntity = paymentMapper.convertToEntity(request);
        paymentEntity.setPaymentStatus(PaymentStatus.PENDING);
        paymentEntity.setPaymentMethod((PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())));
        PaymentEntity savedEntity = paymentRepository.save(paymentEntity);
        return paymentMapper.convertToResponse(savedEntity);
    }

    @Override
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        PaymentEntity paymentEntity = paymentRepository.findByTransactionId(transactionId).orElseThrow(() -> new NotFoundException("Payment not found with id: " + transactionId));
        return paymentMapper.convertToResponse(paymentEntity);
    }
}
