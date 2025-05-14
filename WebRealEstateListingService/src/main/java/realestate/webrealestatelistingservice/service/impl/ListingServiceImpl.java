package realestate.webrealestatelistingservice.service.impl;

import com.cloudinary.Cloudinary;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;
import realestate.webrealestatelistingservice.dto.Position;
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
import realestate.webrealestatelistingservice.service.GeocodingService;
import realestate.webrealestatelistingservice.service.ListingService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class ListingServiceImpl implements ListingService {

    ListingRepository listingRepository;
    ListingMapper listingMapper;
    Cloudinary cloudinary;
    GeocodingService geocodingService;

    @Override
    public ListingResponse createListing(ListingRequest listingRequest) {
        ListingEntity listingEntity = listingMapper.convertToListingEntity(listingRequest);
        if (listingEntity.getStatus() == null) {
            listingEntity.setStatus(ListingStatus.AVAILABLE);
        }
        Optional<Position> posOpt = geocodingService.geocode(listingRequest.getAddress());
        if (posOpt.isEmpty()) {
            throw new RuntimeException("Địa chỉ không hợp lệ");
        }
        Position pos = posOpt.get();
        listingEntity.setLatitude(BigDecimal.valueOf(pos.getLat()));
        listingEntity.setLongitude(BigDecimal.valueOf(pos.getLon()));

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
        ListingEntity listingEntity = listingRepository.findById(idListing).orElseThrow(() -> new NotFoundException("Not found Listing with id :" + idListing));
        listingEntity.setView(listingEntity.getView() + 1);
        listingRepository.save(listingEntity);
        return listingMapper.convertToListingResponse(listingEntity);
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
        Pageable pageable = PageRequest.of(searchRequest.getPage() - 1, searchRequest.getSize(), Sort.by("createdAt").descending());
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
    public PageDto<ListingResponse> getListingsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ListingEntity> pageResult = listingRepository.findAll(pageable);
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

    @Override
    public List<ListingResponse> getTop5MostViewedListings() {
        return listingRepository.findTop5ByOrderByViewDesc()
                .stream()
                .map(listingMapper::convertToListingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalListingsCount() {
        return listingRepository.findAll().size();
    }

    @Override
    public int getTotalListingsCountByType(ListingType type) {
        return listingRepository.findByType(type).size();
    }
}
