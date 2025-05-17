package realestate.webrealestaterentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import realestate.webrealestaterentservice.dto.ListingDto;
import realestate.webrealestaterentservice.dto.response.BaseResponse;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ListingClient {

    private final RestTemplate restTemplate;

    public ListingDto getListingById(String listingId) {
        String url = "http://localhost:8080/api/v1/listings/findById/" + listingId;

        ParameterizedTypeReference<BaseResponse<ListingDto>> responseType =
                new ParameterizedTypeReference<BaseResponse<ListingDto>>() {};

        ResponseEntity<BaseResponse<ListingDto>> responseEntity =
                restTemplate.exchange(url, HttpMethod.GET, null, responseType);

        ListingDto dto = Objects.requireNonNull(responseEntity.getBody()).getData();

        if (dto == null) {
            throw new RuntimeException("Listing not found");
        }

        System.out.println("📌 ListingDTO: " + dto);
        return dto;
    }
}
