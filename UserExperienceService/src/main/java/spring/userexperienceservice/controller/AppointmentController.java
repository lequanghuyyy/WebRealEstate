package spring.userexperienceservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.userexperienceservice.constant.AppointmentStatus;
import spring.userexperienceservice.dto.request.AppointmentRequest;
import spring.userexperienceservice.dto.response.AppointmentResponse;
import spring.userexperienceservice.dto.response.BaseResponse;
import spring.userexperienceservice.dto.response.ResponseFactory;
import spring.userexperienceservice.service.AppointmentService;

import java.util.List;

@RestController
@RequestMapping("api/v1/ux/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<BaseResponse<AppointmentResponse>> createAppointment(@RequestBody AppointmentRequest request) {
        return ResponseFactory.ok(appointmentService.createAppointment(request));
    }

    @GetMapping
    public ResponseEntity<BaseResponse<List<AppointmentResponse>>> getAllAppointments() {
        return ResponseFactory.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/br/{brId}")
    public ResponseEntity<BaseResponse<List<AppointmentResponse>>> getAppointmentsByBrId(@PathVariable String brId) {
        return ResponseFactory.ok(appointmentService.getAppointmentsByBrId(brId));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<BaseResponse<List<AppointmentResponse>>> getAppointmentsByAgentId(@PathVariable String agentId) {
        return ResponseFactory.ok(appointmentService.getAppointmentsByAgentId(agentId));
    }

    @GetMapping("/br/{brId}/status/{status}")
    public ResponseEntity<BaseResponse<List<AppointmentResponse>>> getAppointmentsByBrIdAndStatus(
            @PathVariable String brId, @PathVariable AppointmentStatus status) {
        return ResponseFactory.ok(appointmentService.getAppointmentsByBrIdAndStatus(brId, status));
    }

    @GetMapping("/agent/{agentId}/status/{status}")
    public ResponseEntity<BaseResponse<List<AppointmentResponse>>> getAppointmentsByAgentIdAndStatus(
            @PathVariable String agentId, @PathVariable AppointmentStatus status) {
        return ResponseFactory.ok(appointmentService.getAppointmentsByAgentIdAndStatus(agentId, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<AppointmentResponse>> updateAppointment(
            @PathVariable String id, @RequestBody AppointmentRequest request) {
        return ResponseFactory.ok(appointmentService.updateAppointment(id, request));
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<BaseResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable String id, @PathVariable AppointmentStatus status) {
        return ResponseFactory.ok(appointmentService.updateAppointmentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteAppointment(@PathVariable String id) {
        appointmentService.deleteAppointment(id);
        return ResponseFactory.ok(null);
    }
}
