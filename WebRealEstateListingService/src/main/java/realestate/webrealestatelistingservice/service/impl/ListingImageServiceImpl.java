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
import java.util.List;
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
        String imageUrl = cloudinaryService.uploadImage(file);
        ListingImageEntity listingImageEntity = ListingImageEntity.builder()
                        .listing(listing)
                                .imageUrl(imageUrl).build();


        listingImageRepository.save(listingImageEntity);
        return imageUrl;
    }

    @Override
    public List<ListingImageResponse> getImagesByListing(String listingId) {
        List<ListingImageEntity> images = listingImageRepository.findByListing_Id(listingId);
        return images.stream()
                .map(listingImageMapper::convertToResponse)
                .collect(Collectors.toList());
    }


    @Override
    public List<String> uploadMultipleImages(String listingId, MultipartFile[] files) {
        List<String> imageUrls = new ArrayList<>();
        // Tìm ListingEntity theo listingId
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found with id: " + listingId));

        // Lặp qua từng file, upload và lưu thông tin ảnh
        for (MultipartFile file : files) {
            String imageUrl = cloudinaryService.uploadImage(file);
            imageUrls.add(imageUrl);

            ListingImageEntity listingImageEntity = ListingImageEntity.builder()
                    .listing(listing)
                    .imageUrl(imageUrl).build();
            listingImageRepository.save(listingImageEntity);
        }
        return imageUrls;
    }

    @Override
    public void deleteImage(String imageId) {
        if (!listingImageRepository.existsById(imageId)) {
            throw new NotFoundException("Image not found with id: " + imageId);
        }
        listingImageRepository.deleteById(imageId);
    }
}
