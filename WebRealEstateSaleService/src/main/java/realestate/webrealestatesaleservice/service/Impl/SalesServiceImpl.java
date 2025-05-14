package realestate.webrealestatesaleservice.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import realestate.webrealestatesaleservice.constant.TransactionStatus;
import realestate.webrealestatesaleservice.dto.paging.PageDto;
import realestate.webrealestatesaleservice.dto.request.PageSalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.SalesTransactionRequest;
import realestate.webrealestatesaleservice.dto.request.StatusUpdateRequest;
import realestate.webrealestatesaleservice.dto.response.SalesTransactionResponse;
import realestate.webrealestatesaleservice.entity.SalesTransactionEntity;
import realestate.webrealestatesaleservice.exception.NotFoundException;
import realestate.webrealestatesaleservice.mapper.SalesTransactionMapper;
import realestate.webrealestatesaleservice.repository.SalesTransactionRepository;
import realestate.webrealestatesaleservice.service.SalesService;

import java.time.LocalDateTime;
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
    public PageDto<SalesTransactionResponse> getAllTransactions(int page, int size) {
        PageSalesTransactionRequest pageSalesTransactionRequest = new PageSalesTransactionRequest();
        pageSalesTransactionRequest.setPage(page);
        pageSalesTransactionRequest.setSize(size);
        Pageable pageable = PageRequest.of(pageSalesTransactionRequest.getPage() - 1, pageSalesTransactionRequest.getSize(), Sort.by("createdAt").descending());
        Page<SalesTransactionEntity> pageResult = salesTransactionRepository.findAll(pageable);
        List<SalesTransactionResponse>list=pageResult.getContent().stream().map(salesTransactionMapper::convertToSalesTransactionResponse).toList();
        return PageDto.<SalesTransactionResponse>builder()
                .items(list)
                .page(pageSalesTransactionRequest.getPage())
                .size(pageSalesTransactionRequest.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
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
    public List<SalesTransactionResponse> getTransactionsByListing(String listingId) {
        return salesTransactionRepository.findByListingId(listingId).stream().map(salesTransactionMapper::convertToSalesTransactionResponse).collect(Collectors.toList());
    }

    @Override
    public SalesTransactionResponse updateTransactionStatus(String id, TransactionStatus status) {
        SalesTransactionEntity salesTransactionEntity = salesTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SalesTransaction not found with id " + id));
        salesTransactionEntity.setTransactionStatus(status);
        LocalDateTime time = LocalDateTime.now();
        salesTransactionEntity.setUpdatedAt(time);
        if (status == TransactionStatus.COMPLETED) {
            salesTransactionEntity.setCompletedAt(time);
        }
        SalesTransactionEntity updatedSalesTransactionEntity = salesTransactionRepository.save(salesTransactionEntity);
        return salesTransactionMapper.convertToSalesTransactionResponse(updatedSalesTransactionEntity);
    }

    @Override
    public Integer count() {
        return salesTransactionRepository.findAll().size();
    }
}
