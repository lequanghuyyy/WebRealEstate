package spring.userexperienceservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import spring.userexperienceservice.constant.AppointmentStatus;

import java.sql.Time;
import java.time.LocalTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {
    private String id;
    private String brId;
    private String agentId;
    private String listingId;
    private AppointmentStatus status;
    private Date day;
    private LocalTime time;
    private String brNote;
    private String agentNote;
}
