package realestate.webrealestatesaleservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.webrealestatesaleservice.constant.TransactionStatus;
import realestate.webrealestatesaleservice.constant.TransactionType;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;
import realestate.webrealestatesaleservice.entity.SalesTransactionEntity;

@Component
public class SalesTransactionMapper {
    private final ModelMapper modelMapper;

    @Autowired
    public SalesTransactionMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public SalesTransactionEntity convertToSalesTransactionEntity(SalesTransactionRequest request) {
        SalesTransactionEntity salesTransactionEntity = modelMapper.map(request, SalesTransactionEntity.class);
        salesTransactionEntity.setTransactionStatus(TransactionStatus.valueOf(request.getTransactionStatus()));
        return salesTransactionEntity;
    }

    public SalesTransactionResponse convertToSalesTransactionResponse(SalesTransactionEntity entity) {
        SalesTransactionResponse salesTransactionResponse = modelMapper.map(entity, SalesTransactionResponse.class);
        salesTransactionResponse.setTransactionStatus(String.valueOf(entity.getTransactionStatus()));
        return modelMapper.map(entity, SalesTransactionResponse.class);
    }

    public SalesTransactionEntity updateEntity(SalesTransactionEntity existingEntity, SalesTransactionRequest request) {
        if (request.getListingId() != null) {
            existingEntity.setListingId(request.getListingId());
        }
        if (request.getBuyerId() != null) {
            existingEntity.setBuyerId(request.getBuyerId());
        }
        if (request.getAgentId() != null) {
            existingEntity.setAgentId(request.getAgentId());
        }
        if (request.getAmount() != null) {
            existingEntity.setAmount(request.getAmount());
        }
        if (request.getCommissionFee() != null) {
            existingEntity.setCommissionFee(request.getCommissionFee());
        }
        if (request.getTransactionType() != null) {
            existingEntity.setTransactionType(TransactionType.valueOf(request.getTransactionType()));
        }
        return existingEntity;
    }
}
