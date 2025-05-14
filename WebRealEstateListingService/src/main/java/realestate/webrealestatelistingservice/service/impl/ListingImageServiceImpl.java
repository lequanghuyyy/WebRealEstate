package realestate.webrealestatelistingservice.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import realestate.webrealestatelistingservice.dto.response.ListingImageResponse;
import realestate.webrealestatelistingservice.entity.ListingEntity;
import realestate.webrealestatelistingservice.entity.ListingImageEntity;
import realestate.webrealestatelistingservice.exception.NotFoundException;
import realestate.webrealestatelistingservice.mapper.ListingImageMapper;
import realestate.webrealestatelistingservice.repository.ListingImageRepository;
import realestate.webrealestatelistingservice.repository.ListingRepository;
import realestate.webrealestatelistingservice.service.CloudinaryService;
import realestate.webrealestatelistingservice.service.ListingImageService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ListingImageServiceImpl implements ListingImageService {
    ListingRepository listingRepository;
    CloudinaryService cloudinaryService;
    ListingImageRepository listingImageRepository;
    ListingImageMapper listingImageMapper;

    @Override
    public String uploadImage(String listingId, MultipartFile file) throws IOException {
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));

        Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "listings/" + listingId, 0, 0);
        String imageUrl = uploadResult.get("url");

        ListingImageEntity listingImageEntity = ListingImageEntity.builder()
                .listing(listing)
                .imageUrl(imageUrl)
                .publicId(uploadResult.get("publicId"))
                .build();

        listingImageRepository.save(listingImageEntity);

        // Kiểm tra nếu listing chưa có mainUrl thì cập nhật
        if (listing.getMainURL() == null || listing.getMainURL().isEmpty()) {
            listing.setMainURL(imageUrl);
            listingRepository.save(listing);
        }

        return imageUrl;
    }

    @Override
    public List<String> uploadMultipleImages(String listingId, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }

        List<String> imageUrls = new ArrayList<>();
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));

        boolean needUpdateMainUrl = listing.getMainURL() == null || listing.getMainURL().isEmpty();
        String firstImageUrl = null;

        for (MultipartFile file : files) {
            Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "listings/" + listingId, 0, 0);
            String imageUrl = uploadResult.get("url");
            imageUrls.add(imageUrl);

            // Lưu URL của ảnh đầu tiên
            if (firstImageUrl == null) {
                firstImageUrl = imageUrl;
            }

            ListingImageEntity listingImageEntity = ListingImageEntity.builder()
                    .listing(listing)
                    .imageUrl(imageUrl)
                    .publicId(uploadResult.get("publicId"))
                    .build();
            listingImageRepository.save(listingImageEntity);
        }

        // Cập nhật mainUrl nếu cần thiết và có ít nhất một ảnh được upload
        if (needUpdateMainUrl && firstImageUrl != null) {
            listing.setMainURL(firstImageUrl);
            listingRepository.save(listing);
        }

        return imageUrls;
    }

    @Override
    public List<ListingImageResponse> getImagesByListing(String listingId) {
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));

        List<ListingImageEntity> images = listingImageRepository.findByListing_Id(listing.getId());
        return images.stream()
                .map(listingImageMapper::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteImage(String imageId) {
        ListingImageEntity image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found with id: " + imageId));

        // Nếu ảnh đang là mainUrl của listing, cần cập nhật mainUrl sang ảnh khác
        ListingEntity listing = image.getListing();
        if (listing.getMainURL() != null && listing.getMainURL().equals(image.getImageUrl())) {
            // Tìm ảnh khác của listing này
            List<ListingImageEntity> otherImages = listingImageRepository.findByListing_Id(listing.getId());
            otherImages.remove(image); // Loại bỏ ảnh hiện tại

            if (!otherImages.isEmpty()) {
                // Nếu còn ảnh khác, đặt ảnh đầu tiên làm mainUrl
                listing.setMainURL(otherImages.get(0).getImageUrl());
            } else {
                // Nếu không còn ảnh nào, đặt mainUrl về null
                listing.setMainURL(null);
            }
            listingRepository.save(listing);
        }

        // Xóa ảnh từ Cloudinary nếu có publicId
        if (image.getPublicId() != null && !image.getPublicId().isEmpty()) {
            try {
                cloudinaryService.deleteImage(image.getPublicId());
            } catch (Exception e) {
                // Log lỗi nhưng vẫn tiếp tục xóa bản ghi trong DB
                System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }

        listingImageRepository.delete(image);
    }

    @Override
    public String replaceImage(String imageId, MultipartFile file) {
        ListingImageEntity image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found with id: " + imageId));

        // Xóa ảnh cũ từ Cloudinary
        if (image.getPublicId() != null && !image.getPublicId().isEmpty()) {
            try {
                cloudinaryService.deleteImage(image.getPublicId());
            } catch (Exception e) {
                System.err.println("Failed to delete old image from Cloudinary: " + e.getMessage());
            }
        }

        // Upload ảnh mới
        ListingEntity listing = image.getListing();
        Map<String, String> uploadResult = cloudinaryService.uploadImage(
                file, "listings/" + listing.getId(), 0, 0);

        String newImageUrl = uploadResult.get("url");
        String newPublicId = uploadResult.get("publicId");

        // Cập nhật thông tin ảnh
        image.setImageUrl(newImageUrl);
        image.setPublicId(newPublicId);
        listingImageRepository.save(image);

        // Nếu ảnh này là mainUrl, cập nhật mainUrl của listing
        if (listing.getMainURL() != null && listing.getMainURL().equals(image.getImageUrl())) {
            listing.setMainURL(newImageUrl);
            listingRepository.save(listing);
        }

        return newImageUrl;
    }

    public void setMainImage(String listingId, String imageId) {
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));

        ListingImageEntity image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found with id: " + imageId));

        // Đảm bảo ảnh thuộc về listing này
        if (!image.getListing().getId().equals(listing.getId())) {
            throw new RuntimeException("Image does not belong to the specified listing");
        }

        // Cập nhật mainUrl
        listing.setMainURL(image.getImageUrl());
        listingRepository.save(listing);
    }
}
