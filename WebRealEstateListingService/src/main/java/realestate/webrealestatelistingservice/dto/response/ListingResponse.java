package realestate.webrealestatelistingservice.dto.response;

import lombok.*;
import realestate.webrealestatelistingservice.constant.ListingPropertyType;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingResponse {
    private String id;
    private String title;
    private String description;
    private String address;
    private String city;
    private String image;
    private BigDecimal price;
    private BigDecimal area;
    private Integer view;
    private Integer yearBuilt;
    private Integer bedrooms;
    private Integer bathrooms;
    private ListingType type;
    private ListingStatus status;
    private String ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ListingPropertyType propertyType;
    private String mainURL;
}

