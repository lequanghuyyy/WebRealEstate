package spring.userexperienceservice.entity;
import jakarta.persistence.*;
import lombok.Data;
import spring.userexperienceservice.constant.AppointmentStatus;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "appointment")
@Data
public class AppointmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "br_id")
    private String brId;

    @Column(name = "agent_id")
    private String agentId;

    @Column(name = "listing_id")
    private String listingId;

    @Column(name = "status")
    private AppointmentStatus status;

    @Column(name = "day", nullable = false)
    private Date day;

    @Column(name = "time")
    private LocalTime time;

    @Column(name = "br_note")
    private String brNote;

    @Column(name = "agent_note")
    private String agentNote;

}
