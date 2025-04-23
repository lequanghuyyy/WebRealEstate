package realestate.webrealestatelistingservice.dto.response;

import lombok.*;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingResponseCustom {
    private String id;
    private String title;
    private String address;
    private String city;
    private String image;
    private BigDecimal price;
    private BigDecimal area;
    private Integer bedrooms;
    private Integer bathrooms;
    private ListingType type;
    private ListingStatus status;
    private String ownerId;
}
