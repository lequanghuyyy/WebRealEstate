package realestate.webrealestatelistingservice.dto.request;

import lombok.*;
import realestate.webrealestatelistingservice.constant.ListingPropertyType;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingRequest {

    private String title;
    private String description;
    private String address;
    private String city;
    private BigDecimal price;
    private BigDecimal area;
    private Integer bedrooms;
    private Integer bathrooms;
    private ListingType type;
    private ListingStatus status;
    private String ownerId;
    private ListingPropertyType propertyType;
}
