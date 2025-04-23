package spring.userexperienceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recently_viewed_listings", indexes = {
        @Index(name = "idx_user_listing", columnList = "user_id, listing_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentlyViewedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "listing_id", nullable = false)
    private String listingId;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt = LocalDateTime.now();
}
