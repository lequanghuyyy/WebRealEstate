package realestate.webrealestatelistingservice.entity;

import lombok.*;
import jakarta.persistence.*;
import realestate.webrealestatelistingservice.constant.ListingPropertyType;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal area;

    private Integer bedrooms;
    private Integer bathrooms;

    private Integer yearBuilt;

    @Column(nullable = false)
    private Integer view = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ListingType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private ListingPropertyType propertyType;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListingImageEntity> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private ListingStatus status = ListingStatus.AVAILABLE;

    @Column(nullable = false, name = "owner_id")
    private String ownerId;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

