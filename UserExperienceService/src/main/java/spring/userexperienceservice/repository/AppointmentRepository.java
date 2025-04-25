package spring.userexperienceservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.userexperienceservice.constant.AppointmentStatus;
import spring.userexperienceservice.entity.AppointmentEntity;

import java.util.Date;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, String> {
    List<AppointmentEntity> findByBrId(String brId);
    List<AppointmentEntity> findByAgentId(String agentId);
    List<AppointmentEntity> findByBrIdAndStatus(String brId, AppointmentStatus status);
    List<AppointmentEntity> findByAgentIdAndStatus(String agentId, AppointmentStatus status);
}
