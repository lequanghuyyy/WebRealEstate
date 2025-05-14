package realestate.webrealestatelistingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Position {
    @JsonProperty("lat")
    private double lat;
    @JsonProperty("lon")
    private double lon;
    // getters/setters
}

