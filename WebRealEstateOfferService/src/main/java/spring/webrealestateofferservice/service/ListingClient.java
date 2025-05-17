package spring.webrealestateofferservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import spring.webrealestateofferservice.config.RabbitMQConfig;
import spring.webrealestateofferservice.constant.ListingType;
import spring.webrealestateofferservice.dto.ListingDto;
import spring.webrealestateofferservice.dto.response.BaseResponse;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListingClient {

    private final RabbitMQConfig restTemplate;

    public ListingType getTransactionStyle(String listingId) {
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
        return dto.getType(); // hoặc dto.getType() nếu field đó là "type"
    }
}
