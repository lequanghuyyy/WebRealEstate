package spring.userexperienceservice.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.userexperienceservice.constant.AppointmentStatus;
import spring.userexperienceservice.dto.request.AppointmentRequest;
import spring.userexperienceservice.dto.response.AppointmentResponse;
import spring.userexperienceservice.entity.AppointmentEntity;
import spring.userexperienceservice.mapper.AppointmentMapper;
import spring.userexperienceservice.repository.AppointmentRepository;
import spring.userexperienceservice.service.AppointmentService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    @Autowired
    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentMapper = appointmentMapper;
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        AppointmentEntity entity = appointmentMapper.toEntity(request);
        if (entity.getStatus() == null) {
            entity.setStatus(AppointmentStatus.PENDING);
        }
        return appointmentMapper.toResponse(appointmentRepository.save(entity));
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<AppointmentResponse> getAppointmentsByBrId(String brId) {
        return appointmentRepository.findByBrId(brId).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByAgentId(String agentId) {
        return appointmentRepository.findByAgentId(agentId).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByBrIdAndStatus(String brId, AppointmentStatus status) {
        return appointmentRepository.findByBrIdAndStatus(brId, status).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByAgentIdAndStatus(String agentId, AppointmentStatus status) {
        return appointmentRepository.findByAgentIdAndStatus(agentId, status).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse updateAppointment(String id, AppointmentRequest request) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }

        AppointmentEntity entity = appointmentMapper.toEntity(request);
        entity.setId(id);
        return appointmentMapper.toResponse(appointmentRepository.save(entity));
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(String id, AppointmentStatus status) {
        AppointmentEntity entity = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        entity.setStatus(status);
        return appointmentMapper.toResponse(appointmentRepository.save(entity));
    }

    @Override
    public void deleteAppointment(String id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
}
