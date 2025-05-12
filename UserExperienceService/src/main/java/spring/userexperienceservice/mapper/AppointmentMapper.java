package spring.userexperienceservice.mapper;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import spring.userexperienceservice.dto.request.AppointmentRequest;
import spring.userexperienceservice.dto.response.AppointmentResponse;
import spring.userexperienceservice.entity.AppointmentEntity;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AppointmentMapper {
    private final ModelMapper modelMapper;

    public AppointmentEntity toEntity(AppointmentRequest request) {
        return modelMapper.map(request, AppointmentEntity.class);
    }

    public AppointmentResponse toResponse(AppointmentEntity entity) {
        return modelMapper.map(entity, AppointmentResponse.class);
    }
}
