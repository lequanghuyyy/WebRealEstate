package spring.userexperienceservice.mapper;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import spring.userexperienceservice.dto.response.SavedSearchResponse;
import spring.userexperienceservice.entity.SavedSearchEntity;

@Component
@RequiredArgsConstructor
public class SavedSearchMapper {

    private final ModelMapper modelMapper;

    public SavedSearchResponse toResponse(SavedSearchEntity entity) {
        return modelMapper.map(entity, SavedSearchResponse.class);
    }
}
