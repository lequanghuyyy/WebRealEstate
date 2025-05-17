package spring.webrealestateofferservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import spring.webrealestateofferservice.constant.ListingType;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingDto implements Serializable {
    private String id;
    private ListingType type;
}
