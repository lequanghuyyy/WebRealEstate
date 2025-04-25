package realestate.webrealestatelistingservice.service.impl;

import com.cloudinary.Cloudinary;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import realestate.webrealestatelistingservice.constant.ListingType;
import realestate.webrealestatelistingservice.dto.paging.PageDto;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.request.ListingSearchRequest;
import realestate.webrealestatelistingservice.dto.request.ListingStatusUpdateRequest;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.dto.response.ListingResponseCustom;
import realestate.webrealestatelistingservice.entity.ListingEntity;
import realestate.webrealestatelistingservice.exception.NotFoundException;
import realestate.webrealestatelistingservice.mapper.ListingMapper;
import realestate.webrealestatelistingservice.repository.ListingRepository;
import realestate.webrealestatelistingservice.repository.specification.ListingSpecification;
import realestate.webrealestatelistingservice.service.ListingService;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class ListingServiceImpl implements ListingService {

    ListingRepository listingRepository;
    ListingMapper listingMapper;
    Cloudinary cloudinary;

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
                .withPropertyType(searchRequest.getPropertyType())
                .withBedrooms(searchRequest.getBedrooms())
                .withBathrooms(searchRequest.getBathrooms())
                .build();

        // Tạo Pageable (trừ 1 cho page vì Pageable bắt đầu từ 0)
        Pageable pageable = PageRequest.of(searchRequest.getPage() - 1, searchRequest.getSize(), Sort.by("createdAt").descending());

        // Truy vấn với Specification và Pageable
        Page<ListingEntity> pageResult = listingRepository.findAll(spec, pageable);
        List<ListingResponse> items = pageResult.getContent()
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());
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

    @Override
    public List<ListingResponseCustom> getCustomListings() {
        List<ListingEntity> listings = listingRepository.findAll();
        return listings.stream()
                .map(listingMapper::convertToListingResponseCustom)
                .collect(Collectors.toList());
    }

    @Override
    public PageDto<ListingResponseCustom> getCustomListingsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ListingEntity> pageResult = listingRepository.findAll(pageable);

        List<ListingResponseCustom> items = pageResult.getContent()
                .stream()
                .map(listingMapper::convertToListingResponseCustom)
                .collect(Collectors.toList());

        return PageDto.<ListingResponseCustom>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    public List<ListingResponse> getListingsBySaleType() {
        return listingRepository.findByType(ListingType.SALE)
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ListingResponse> getListingsByRentType() {
        return listingRepository.findByType(ListingType.RENT)
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageDto<ListingResponse> getListingsBySaleTypePaged(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ListingEntity> pageResult = listingRepository.findByType(ListingType.SALE, pageable);

        List<ListingResponse> items = pageResult.getContent()
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());

        return PageDto.<ListingResponse>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    public PageDto<ListingResponse> getListingsByRentTypePaged(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ListingEntity> pageResult = listingRepository.findByType(ListingType.RENT, pageable);

        List<ListingResponse> items = pageResult.getContent()
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());

        return PageDto.<ListingResponse>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

}
