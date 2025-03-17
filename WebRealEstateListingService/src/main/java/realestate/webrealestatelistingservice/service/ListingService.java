package realestate.webrealestatelistingservice.service;

import org.springframework.stereotype.Service;
import realestate.webrealestatelistingservice.dto.paging.PageDto;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.request.ListingSearchRequest;
import realestate.webrealestatelistingservice.dto.request.ListingStatusUpdateRequest;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;

import java.util.List;

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

}
