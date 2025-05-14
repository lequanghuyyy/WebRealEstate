package realestate.webrealestatelistingservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import realestate.webrealestatelistingservice.dto.response.ListingImageResponse;

import java.io.IOException;
import java.util.List;

@Service
public interface ListingImageService {
    String uploadImage(String listingId, MultipartFile file) throws IOException;
    List<ListingImageResponse> getImagesByListing(String listingId);
    List<String> uploadMultipleImages(String listingId, MultipartFile[] files);
    void deleteImage(String imageId);
    String replaceImage(String imageId, MultipartFile file);
    void setMainImage(String listingId, String imageId);
}
