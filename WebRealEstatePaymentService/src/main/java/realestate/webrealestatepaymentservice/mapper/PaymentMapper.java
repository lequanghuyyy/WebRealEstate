package realestate.webrealestatepaymentservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.webrealestatepaymentservice.constant.PaymentMethod;
import realestate.webrealestatepaymentservice.constant.PaymentStatus;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;
import realestate.webrealestatepaymentservice.entity.PaymentEntity;

import java.math.BigDecimal;

@Component

public class PaymentMapper {
    private final ModelMapper modelMapper;
    @Autowired
    public PaymentMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    public PaymentEntity convertToEntity(PaymentRequest paymentRequest) {
        PaymentEntity paymentEntity = modelMapper.map(paymentRequest, PaymentEntity.class);
        paymentEntity.setPaymentMethod(PaymentMethod.valueOf(paymentRequest.getPaymentMethod()));
        paymentEntity.setCommissionFee(paymentEntity.getAmount().multiply(BigDecimal.valueOf(0.05)));
        return paymentEntity;
    }
    public PaymentResponse convertToResponse(PaymentEntity paymentEntity) {
        PaymentResponse paymentResponse = modelMapper.map(paymentEntity, PaymentResponse.class);
        paymentResponse.setPaymentMethod(paymentResponse.getPaymentMethod());
        paymentResponse.setPaymentStatus(paymentResponse.getPaymentStatus());
        return paymentResponse;
    }

}
