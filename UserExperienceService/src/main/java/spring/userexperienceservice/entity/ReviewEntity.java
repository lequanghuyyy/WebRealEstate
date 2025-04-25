package spring.userexperienceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "listing_id", nullable = false)
    private String listingId;

    @Column(name = "br_id", nullable = false)
    private String brId;

    @Column(name = "content_review", columnDefinition = "TEXT")
    private String contentReview;

    @Column(nullable = false)
    private Integer rate;

    @Column(name = "count_like")
    private Integer countLike = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}