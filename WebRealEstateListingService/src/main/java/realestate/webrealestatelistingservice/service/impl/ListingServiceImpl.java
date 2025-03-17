package realestate.webrealestatelistingservice.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import realestate.webrealestatelistingservice.dto.paging.PageDto;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.request.ListingSearchRequest;
import realestate.webrealestatelistingservice.dto.request.ListingStatusUpdateRequest;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.entity.ListingEntity;
import realestate.webrealestatelistingservice.exception.NotFoundException;
import realestate.webrealestatelistingservice.mapper.ListingMapper;
import realestate.webrealestatelistingservice.repository.ListingRepository;
import realestate.webrealestatelistingservice.repository.specification.ListingSpecification;
import realestate.webrealestatelistingservice.service.ListingService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class ListingServiceImpl implements ListingService {

    ListingRepository listingRepository;
    ListingMapper listingMapper;

    @Override
    public ListingResponse createListing(ListingRequest listingRequest) {
        ListingEntity listingEntity = listingMapper.convertToListingEntity(listingRequest);
        listingEntity = listingRepository.save(listingEntity);
        return listingMapper.convertToListingResponse(listingEntity);
    }

    @Override
    public ListingResponse updateListing(String idListing,ListingRequest listingRequest) {
        ListingEntity listingEntity = listingRepository.findById(idListing).orElseThrow(() -> new NotFoundException("Not found Listing with id :" + idListing));
        listingRepository.save( listingMapper.updateListingEntity(listingEntity, listingRequest));
        return listingMapper.convertToListingResponse(listingEntity);
    }

    @Override
    public void deleteListing(String listingId) {
        listingRepository.deleteById(listingId);
    }

    @Override
    public ListingResponse getListingById(String idListing) {
        return listingRepository.findById(idListing).map(listingMapper::convertToListingResponse).orElseThrow(() -> new NotFoundException("Not found Listing with id :" + idListing));
    }

    @Override
    public List<ListingResponse> getListings() {
        return listingRepository.findAll().stream().map(listingMapper::convertToListingResponse).collect(Collectors.toList());
    }

    @Override
    public List<ListingResponse> getListingsByOwnerId(String ownerId) {
        return listingRepository.findByOwnerId(ownerId).stream().map(listingMapper::convertToListingResponse).collect(Collectors.toList());
    }

    @Override
    public PageDto<ListingResponse> searchListings(ListingSearchRequest searchRequest) {
        // Xây dựng Specification từ các tiêu chí tìm kiếm
        Specification<ListingEntity> spec = ListingSpecification.builder()
                .withKeyword(searchRequest.getKeyword())
                .withCity(searchRequest.getCity())
                .withAddress(searchRequest.getAddress())
                .withMinArea(searchRequest.getMinArea())
                .withMaxArea(searchRequest.getMaxArea())
                .withMinPrice(searchRequest.getMinPrice())
                .withMaxPrice(searchRequest.getMaxPrice())
                .withType(searchRequest.getType())
                .withStatus(searchRequest.getStatus())
                .build();

        // Tạo Pageable (trừ 1 cho page vì Pageable bắt đầu từ 0)
        Pageable pageable = PageRequest.of(searchRequest.getPage() - 1, searchRequest.getSize(), Sort.by("createdAt").descending());

        // Truy vấn với Specification và Pageable
        Page<ListingEntity> pageResult = listingRepository.findAll(spec, pageable);

        // Chuyển đổi entity thành DTO
        List<ListingResponse> items = pageResult.getContent()
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());

        // Đóng gói kết quả vào PageDto và trả về
        return PageDto.<ListingResponse>builder()
                .items(items)
                .page(searchRequest.getPage())
                .size(searchRequest.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    public ListingResponse updateListingStatus(String listingId, ListingStatusUpdateRequest request) {
        ListingEntity entity = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));
        entity.setStatus(request.getStatus());
        ListingEntity savedEntity = listingRepository.save(entity);
        return listingMapper.convertToListingResponse(savedEntity);
    }


}
