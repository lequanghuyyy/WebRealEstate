package realestate.webrealestaterentservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.webrealestaterentservice.constant.RentalStatus;
import realestate.webrealestaterentservice.dto.request.RentalTransactionRequest;
import realestate.webrealestaterentservice.dto.response.RentalTransactionResponse;
import realestate.webrealestaterentservice.entity.RentalTransactionEntity;

@Component
public class RentalTransactionMapper {
    private final ModelMapper modelMapper;
    @Autowired
    public RentalTransactionMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    public RentalTransactionEntity convertToTransactionEntity(RentalTransactionRequest rentalTransactionRequest) {
        RentalTransactionEntity rentalTransactionEntity = modelMapper.map(rentalTransactionRequest, RentalTransactionEntity.class);
        rentalTransactionEntity.setStatus(RentalStatus.valueOf(rentalTransactionRequest.getStatus()));
        return modelMapper.map(rentalTransactionRequest, RentalTransactionEntity.class);
    }
    public RentalTransactionResponse convertToTransactionResponse(RentalTransactionEntity rentalTransactionEntity) {
        RentalTransactionResponse rentalTransactionResponse = modelMapper.map(rentalTransactionEntity, RentalTransactionResponse.class);
        rentalTransactionResponse.setStatus(rentalTransactionEntity.getStatus().toString());
        return modelMapper.map(rentalTransactionEntity, RentalTransactionResponse.class);
    }
}
