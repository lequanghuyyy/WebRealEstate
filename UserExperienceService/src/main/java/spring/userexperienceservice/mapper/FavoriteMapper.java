package spring.userexperienceservice.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import spring.userexperienceservice.dto.response.FavoriteResponse;
import spring.userexperienceservice.entity.FavoriteListingEntity;

@Component
public class FavoriteMapper {
    private final ModelMapper modelMapper;
    @Autowired
    public FavoriteMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public FavoriteResponse toResponse(FavoriteListingEntity entity) {
        return modelMapper.map(entity, FavoriteResponse.class);
    }
}
