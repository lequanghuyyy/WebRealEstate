package realestate.webrealestatepaymentservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public Page<PaymentResponse> getAllPayments(String agentId,int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<PaymentEntity> paymentEntities = paymentRepository.findByAgentId(agentId,pageable);
        return paymentEntities.map(paymentMapper::convertToResponse);
    }

    @Override
    public BigDecimal calculateCommissionFee() {
        List<PaymentEntity> paymentEntities = paymentRepository.findAll();
        BigDecimal totalCommissionFee = BigDecimal.ZERO;
        for (PaymentEntity paymentEntity : paymentEntities) {
            totalCommissionFee = totalCommissionFee.add(paymentEntity.getCommissionFee());
        }
        return totalCommissionFee;
    }

    @Override
    public Page<PaymentResponse> getAllPayments(int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        Page<PaymentEntity> paymentEntities = paymentRepository.findAll(pageable);
        return paymentEntities.map(paymentMapper::convertToResponse);
    }
}
