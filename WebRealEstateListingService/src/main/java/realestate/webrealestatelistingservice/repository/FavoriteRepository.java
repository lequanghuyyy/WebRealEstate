package realestate.webrealestatelistingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.webrealestatelistingservice.entity.FavoriteEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteEntity, String> {

    // Lấy danh sách listing yêu thích của một user
    List<FavoriteEntity> findByUserId(String userId);

    // Kiểm tra xem user đã thích listing chưa
    Optional<FavoriteEntity> findByUserIdAndListingId(String userId, String listingId);

    // Xóa một mục yêu thích
    void deleteByUserIdAndListingId(String userId, String listingId);
}
