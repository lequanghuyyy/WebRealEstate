package realestate.webrealestatepaymentservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import realestate.webrealestatepaymentservice.constant.PaymentMethod;
import realestate.webrealestatepaymentservice.constant.PaymentStatus;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;
import realestate.webrealestatepaymentservice.entity.PaymentEntity;
import realestate.webrealestatepaymentservice.exception.NotFoundException;
import realestate.webrealestatepaymentservice.mapper.PaymentMapper;
import realestate.webrealestatepaymentservice.repository.PaymentRepository;
import realestate.webrealestatepaymentservice.service.PaymentEventPublisher;
import realestate.webrealestatepaymentservice.service.PaymentService;
import spring.realestatecommon.common.event.PaymentCompletedEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentEventPublisher eventPublisher;


    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        PaymentEntity paymentEntity = paymentMapper.convertToEntity(request);
        paymentEntity.setPaymentStatus(PaymentStatus.COMPLETED);
        paymentEntity.setPaymentMethod((PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())));
        PaymentEntity savedEntity = paymentRepository.save(paymentEntity);
        
        // Publish payment completed event to update transaction status
        PaymentCompletedEvent event = new PaymentCompletedEvent();
        event.setTransactionType(paymentEntity.getTransactionStyle().name());
        event.setStatus("COMPLETED");
        event.setTransactionId(paymentEntity.getTransactionId()); // Using transactionId as the ID for the listener
        eventPublisher.publishPaymentCompleted(event);

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
    public BigDecimal calculateCommissionFee(TransactionStyle transactionStyle) {
        List<PaymentEntity> paymentEntities = paymentRepository.findByTransactionStyle(transactionStyle);
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

    @Override
    public PaymentResponse updateStatus(String paymentId, PaymentStatus status) {
        PaymentEntity paymentEntity = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + paymentId));
        paymentEntity.setPaymentStatus(status);
        if (status == PaymentStatus.COMPLETED) {
            paymentEntity.setPaymentDate(LocalDateTime.now());
            
            // Publish payment completed event to update transaction status
            if (paymentEntity.getTransactionId() != null) {
                PaymentCompletedEvent event = new PaymentCompletedEvent();
                event.setTransactionType(paymentEntity.getTransactionStyle().name());
                event.setStatus("COMPLETED");
                event.setListingId(paymentEntity.getTransactionId());
                eventPublisher.publishPaymentCompleted(event);
            }
        }
        paymentEntity.setUpdatedAt(LocalDateTime.now());
        PaymentEntity updatedPaymentEntity = paymentRepository.save(paymentEntity);
        return paymentMapper.convertToResponse(updatedPaymentEntity);
    }
}
