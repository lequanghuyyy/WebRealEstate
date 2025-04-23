package realestate.webrealestatelistingservice.repository.specification;

import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.ObjectUtils;
import realestate.webrealestatelistingservice.constant.ListingPropertyType;
import realestate.webrealestatelistingservice.constant.ListingStatus;
import realestate.webrealestatelistingservice.constant.ListingType;
import realestate.webrealestatelistingservice.entity.ListingEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ListingSpecification {

    private static final String FIELD_TITLE = "title";
    private static final String FIELD_DESCRIPTION = "description";
    private static final String FIELD_ADDRESS = "address";
    private static final String FIELD_CITY = "city";
    private static final String FIELD_PRICE = "price";
    private static final String FIELD_AREA = "area";
    private static final String FIELD_TYPE = "type";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_PROPERTY_TYPE = "propertyType";

    private final List<Specification<ListingEntity>> specifications = new ArrayList<>();

    public static ListingSpecification builder() {
        return new ListingSpecification();
    }

    // Tìm kiếm theo từ khóa trong title và description
    public ListingSpecification withKeyword(final String keyword) {
        if (!ObjectUtils.isEmpty(keyword)) {
            specifications.add((root, query, cb) ->
                    cb.or(
                            cb.like(cb.upper(root.get(FIELD_TITLE)), like(keyword)),
                            cb.like(cb.upper(root.get(FIELD_DESCRIPTION)), like(keyword))
                    )
            );
        }
        return this;
    }

    // Lọc theo thành phố
    public ListingSpecification withCity(final String city) {
        if (!ObjectUtils.isEmpty(city)) {
            specifications.add((root, query, cb) ->
                    cb.equal(cb.upper(root.get(FIELD_CITY)), city.toUpperCase())
            );
        }
        return this;
    }

    // Lọc theo địa chỉ
    public ListingSpecification withAddress(final String address) {
        if (!ObjectUtils.isEmpty(address)) {
            specifications.add((root, query, cb) ->
                    cb.like(cb.upper(root.get(FIELD_ADDRESS)), like(address))
            );
        }
        return this;
    }

    // Lọc theo diện tích tối thiểu
    public ListingSpecification withMinArea(final BigDecimal minArea) {
        if (minArea != null) {
            specifications.add((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get(FIELD_AREA), minArea)
            );
        }
        return this;
    }

    // Lọc theo diện tích tối đa
    public ListingSpecification withMaxArea(final BigDecimal maxArea) {
        if (maxArea != null) {
            specifications.add((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get(FIELD_AREA), maxArea)
            );
        }
        return this;
    }

    // Lọc theo giá tối thiểu
    public ListingSpecification withMinPrice(final BigDecimal minPrice) {
        if (minPrice != null) {
            specifications.add((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get(FIELD_PRICE), minPrice)
            );
        }
        return this;
    }

    // Lọc theo giá tối đa
    public ListingSpecification withMaxPrice(final BigDecimal maxPrice) {
        if (maxPrice != null) {
            specifications.add((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get(FIELD_PRICE), maxPrice)
            );
        }
        return this;
    }

    // Lọc theo loại Listing
    public ListingSpecification withType(final ListingType type) {
        if (type != null) {
            specifications.add((root, query, cb) ->
                    cb.equal(root.get(FIELD_TYPE), type)
            );
        }
        return this;
    }

    // Lọc theo trạng thái Listing
    public ListingSpecification withStatus(final ListingStatus status) {
        if (status != null) {
            specifications.add((root, query, cb) ->
                    cb.equal(root.get(FIELD_STATUS), status)
            );
        }
        return this;
    }
    public ListingSpecification withPropertyType(final ListingPropertyType propertyType) {
        if (propertyType != null) {
            specifications.add((root, query, cb) ->
                    cb.equal(root.get(FIELD_PROPERTY_TYPE), propertyType)
            );
        }
        return this;
    }

    private static String like(final String value) {
        return "%" + value.toUpperCase() + "%";
    }

    // Kết hợp tất cả các điều kiện đã thêm vào thành một Specification duy nhất
    public Specification<ListingEntity> build() {
        return (root, query, cb) -> cb.and(specifications.stream()
                .filter(Objects::nonNull)
                .map(s -> s.toPredicate(root, query, cb))
                .toArray(Predicate[]::new));
    }
}

