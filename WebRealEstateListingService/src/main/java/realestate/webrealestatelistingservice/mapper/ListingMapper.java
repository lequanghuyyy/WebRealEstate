package realestate.webrealestatelistingservice.mapper;


import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import realestate.webrealestatelistingservice.dto.request.ListingRequest;
import realestate.webrealestatelistingservice.dto.response.ListingResponse;
import realestate.webrealestatelistingservice.entity.ListingEntity;

@Component
public class ListingMapper {
    private final ModelMapper modelMapper;

    @Autowired
    public ListingMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    public ListingEntity convertToListingEntity(ListingRequest listingRequest) {
        return modelMapper.map(listingRequest, ListingEntity.class);
    }
    public ListingResponse convertToListingResponse(ListingEntity listingEntity) {
        return modelMapper.map(listingEntity, ListingResponse.class);
    }

    public ListingEntity updateListingEntity(ListingEntity existingEntity, ListingRequest request) {
        if (request.getTitle() != null) {
            existingEntity.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            existingEntity.setDescription(request.getDescription());
        }
        if (request.getAddress() != null){
            existingEntity.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            existingEntity.setCity(request.getCity());
        }
        if (request.getPrice() != null) {
            existingEntity.setPrice(request.getPrice());
        }
        if (request.getArea() != null) {
            existingEntity.setArea(request.getArea());
        }
        if (request.getBedrooms() != null) {
            existingEntity.setBedrooms(request.getBedrooms());
        }
        if (request.getBathrooms() != null) {
            existingEntity.setBathrooms(request.getBathrooms());
        }
        if (request.getType() != null) {
            existingEntity.setType(request.getType());
        }
        if (request.getStatus() != null) {
            existingEntity.setStatus(request.getStatus());
        }
        return existingEntity;
    }


}
