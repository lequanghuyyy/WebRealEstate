package spring.userexperienceservice.dto.response;

import lombok.Builder;
import lombok.Data;
import spring.userexperienceservice.constant.AppointmentStatus;

import java.sql.Time;
import java.util.Date;

@Data
@Builder
public class AppointmentResponse {
    private String id;
    private String brId;
    private String agentId;
    private String listingId;
    private AppointmentStatus status;
    private Date day;
    private Time time;
    private String brNote;
    private String agentNote;
}
