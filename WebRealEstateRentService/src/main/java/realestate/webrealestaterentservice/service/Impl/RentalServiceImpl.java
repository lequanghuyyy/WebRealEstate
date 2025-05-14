package realestate.webrealestaterentservice.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import realestate.webrealestaterentservice.constant.RentalStatus;
import realestate.webrealestaterentservice.dto.paging.PageDto;
import realestate.webrealestaterentservice.dto.request.PageRentalTransactionRequest;
import realestate.webrealestaterentservice.dto.request.RentalStatusUpdateRequest;
import realestate.webrealestaterentservice.dto.request.RentalTransactionRequest;
import realestate.webrealestaterentservice.dto.response.RentalTransactionResponse;
import realestate.webrealestaterentservice.entity.RentalTransactionEntity;
import realestate.webrealestaterentservice.exception.InvalidRequestException;
import realestate.webrealestaterentservice.exception.NotFoundException;
import realestate.webrealestaterentservice.mapper.RentalTransactionMapper;
import realestate.webrealestaterentservice.repository.RentalTransactionRepository;
import realestate.webrealestaterentservice.service.RentalService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private final RentalTransactionRepository rentalTransactionRepository;
    private final RentalTransactionMapper rentalTransactionMapper;

    @Override
    public RentalTransactionResponse createRentalTransaction(RentalTransactionRequest request) {
        // Kiểm tra các giá trị đầu vào theo nghiệp vụ
        if (request.getMonthlyRent() == null || request.getMonthlyRent().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRequestException("Monthly rent must be positive");
        }
        if (request.getDeposit() == null || request.getDeposit().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidRequestException("Deposit must not be negative");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new InvalidRequestException("Start date and End date must be provided");
        }
        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new InvalidRequestException("Start date must be before end date");
        }
        // Nếu status không được truyền từ client, bạn có thể đặt mặc định là PENDING
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("PENDING");
        }

        // Chuyển đổi DTO sang entity
        RentalTransactionEntity rentalTransactionEntity = rentalTransactionMapper.convertToTransactionEntity(request);
        // Lưu entity vào cơ sở dữ liệu
        RentalTransactionEntity newRentalEntity = rentalTransactionRepository.save(rentalTransactionEntity);
        RentalTransactionResponse rentalTransactionResponse = rentalTransactionMapper.convertToTransactionResponse(newRentalEntity);
        rentalTransactionResponse.setId(newRentalEntity.getId());
        return rentalTransactionResponse;
    }

    @Override
    public RentalTransactionResponse getRentalTransactionById(String id) {
        RentalTransactionEntity transaction = rentalTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rental transaction not found with id: " + id));
        return rentalTransactionMapper.convertToTransactionResponse(transaction);
    }

    @Override
    public List<RentalTransactionResponse> getRentalTransactionsByRenter(String renterId) {
        List<RentalTransactionEntity> transactions = rentalTransactionRepository.findByRenterId(renterId);
        return transactions.stream()
                .map(rentalTransactionMapper::convertToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RentalTransactionResponse> getRentalTransactionsByAgent(String agentId) {
        List<RentalTransactionEntity> transactions = rentalTransactionRepository.findByAgentId(agentId);
        return transactions.stream()
                .map(rentalTransactionMapper::convertToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RentalTransactionResponse> getRentalTransactionsByListing(String listingId) {
        List<RentalTransactionEntity> transactions = rentalTransactionRepository.findByListingId(listingId);
        return transactions.stream()
                .map(rentalTransactionMapper::convertToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RentalTransactionResponse updateRentalTransactionStatus(String id, RentalStatus status) {
        RentalTransactionEntity transaction = rentalTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rental transaction not found with id: " + id));
        transaction.setStatus(status);
        transaction.setUpdatedAt(LocalDateTime.now());
        RentalTransactionEntity updated = rentalTransactionRepository.save(transaction);
        return rentalTransactionMapper.convertToTransactionResponse(updated);
    }

    @Override
    public void cancelRentalTransaction(String id) {
        RentalTransactionEntity transaction = rentalTransactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Rental transaction not found with id: " + id));
        if (transaction.getStatus() == RentalStatus.COMPLETED) {
            throw new InvalidRequestException("Cannot cancel a completed rental transaction.");
        }
        transaction.setStatus(RentalStatus.CANCELLED);
        transaction.setUpdatedAt(LocalDateTime.now());
        rentalTransactionRepository.save(transaction);
    }

    @Override
    public Integer count() {
        return rentalTransactionRepository.findAll().size();
    }

    @Override
    public PageDto<RentalTransactionResponse> getPagedRentalTransactions(int page, int size) {
        PageRentalTransactionRequest request = new PageRentalTransactionRequest();
        request.setPage(page);
        request.setSize(size);
        Pageable pageable = PageRequest.of(request.getPage() - 1, request.getSize(), Sort.by("createdAt").descending());
        Page<RentalTransactionEntity> transactionsPage = rentalTransactionRepository.findAll(pageable);

        List<RentalTransactionResponse> responses = transactionsPage.getContent()
                .stream()
                .map(rentalTransactionMapper::convertToTransactionResponse)
                .collect(Collectors.toList());

        return PageDto.<RentalTransactionResponse>builder()
                .items(responses)
                .page(request.getPage())
                .size(request.getSize())
                .totalElements(transactionsPage.getTotalElements())
                .totalPages(transactionsPage.getTotalPages())
                .build();
    }
}
