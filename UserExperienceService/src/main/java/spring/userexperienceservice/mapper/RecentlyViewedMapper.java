package spring.userexperienceservice.mapper;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import spring.userexperienceservice.dto.response.RecentlyViewedResponse;
import spring.userexperienceservice.entity.RecentlyViewedEntity;

@Component
@RequiredArgsConstructor
public class RecentlyViewedMapper {

    private final ModelMapper modelMapper;

    public RecentlyViewedResponse toResponse(RecentlyViewedEntity entity) {
        return modelMapper.map(entity, RecentlyViewedResponse.class);
    }
}
