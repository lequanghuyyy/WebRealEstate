package realestate.webrealestatesaleservice.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;
import realestate.webrealestatesaleservice.entity.SalesTransactionEntity;
import realestate.webrealestatesaleservice.exception.NotFoundException;
import realestate.webrealestatesaleservice.mapper.SalesTransactionMapper;
import realestate.webrealestatesaleservice.repository.SalesTransactionRepository;
import realestate.webrealestatesaleservice.service.SalesService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class SalesServiceImpl implements SalesService {

    SalesTransactionRepository salesTransactionRepository;
    SalesTransactionMapper salesTransactionMapper;

    @Override
    public SalesTransactionResponse createTransaction(SalesTransactionRequest request) {
        SalesTransactionEntity salesTransactionEntity = salesTransactionMapper.convertToSalesTransactionEntity(request);
        return salesTransactionMapper.convertToSalesTransactionResponse(salesTransactionRepository.save(salesTransactionEntity));
    }

    @Override
    public SalesTransactionResponse getTransactionById(String id) {
        return salesTransactionRepository.findById(id).map(salesTransactionMapper::convertToSalesTransactionResponse).orElseThrow(() -> new NotFoundException("SalesTransaction not found with id " + id));
    }

    @Override
    public List<SalesTransactionResponse> getTransactionsByBuyer(String buyerId) {
        return salesTransactionRepository.findByBuyerId(buyerId).stream().map(salesTransactionMapper::convertToSalesTransactionResponse).collect(Collectors.toList());
    }

    @Override
    public List<SalesTransactionResponse> getTransactionsByAgent(String agentId) {
        return salesTransactionRepository.findByAgentId(agentId).stream().map(salesTransactionMapper::convertToSalesTransactionResponse).collect(Collectors.toList());
    }

    @Override
    public SalesTransactionResponse updateTransactionStatus(String id, String status) {
//        SalesTransactionEntity salesTransactionEntity = salesTransactionRepository.findById(id)
//                .orElseThrow(() -> new NotFoundException("SalesTransaction not found with id " + id));
//        salesTransactionRepository.save(salesTransactionMapper.updateEntity());
        return null;
    }
}
