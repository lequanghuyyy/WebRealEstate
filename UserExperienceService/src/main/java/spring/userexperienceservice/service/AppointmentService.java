package spring.userexperienceservice.service;

import org.springframework.stereotype.Service;
import spring.userexperienceservice.constant.AppointmentStatus;
import spring.userexperienceservice.dto.request.AppointmentRequest;
import spring.userexperienceservice.dto.response.AppointmentResponse;

import java.util.Date;
import java.util.List;

@Service
public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request);
    List<AppointmentResponse> getAllAppointments();
    List<AppointmentResponse> getAppointmentsByBrId(String brId);
    List<AppointmentResponse> getAppointmentsByAgentId(String agentId);
    List<AppointmentResponse> getAppointmentsByBrIdAndStatus(String brId, AppointmentStatus status);
    List<AppointmentResponse> getAppointmentsByAgentIdAndStatus(String agentId, AppointmentStatus status);
    AppointmentResponse updateAppointment(String id, AppointmentRequest request);
    AppointmentResponse updateAppointmentStatus(String id, AppointmentStatus status);
    void deleteAppointment(String id);
}
