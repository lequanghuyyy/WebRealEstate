package realestate.webrealestatelistingservice.mapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.webrealestatelistingservice.dto.response.ListingImageResponse;
import realestate.webrealestatelistingservice.entity.ListingImageEntity;


@Component
public class ListingImageMapper {

    private final ModelMapper modelMapper;

    @Autowired
    public ListingImageMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public ListingImageResponse convertToResponse(ListingImageEntity image) {
        ListingImageResponse response = modelMapper.map(image, ListingImageResponse.class);
        response.setListingId(image.getListing().getId());
        return response;
    }
}