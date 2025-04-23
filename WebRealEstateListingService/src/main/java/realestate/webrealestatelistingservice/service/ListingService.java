package realestate.webrealestatelistingservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import realestate.webrealestatelistingservice.dto.paging.PageDto;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.request.ListingSearchRequest;
import realestate.webrealestatelistingservice.dto.request.ListingStatusUpdateRequest;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.dto.response.ListingResponseCustom;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public interface ListingService {
    ListingResponse createListing(ListingRequest listingRequest);
    ListingResponse updateListing(String idListing, ListingRequest listingRequest);
    void deleteListing(String listingId);
    ListingResponse getListingById(String listingId);
    List<ListingResponse> getListings();
    List<ListingResponse> getListingsByOwnerId(String ownerId);
    PageDto<ListingResponse> searchListings(ListingSearchRequest searchRequest);
    ListingResponse updateListingStatus(String listingId, ListingStatusUpdateRequest request);
    List<ListingResponseCustom> getCustomListings();
    PageDto<ListingResponseCustom> getCustomListingsPaged(int page, int size);

}
