package realestate.webrealestatelistingservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import realestate.webrealestatelistingservice.dto.response.BaseResponse;
import realestate.webrealestatelistingservice.dto.response.ListingImageResponse;
import realestate.webrealestatelistingservice.dto.response.ResponseFactory;
import realestate.webrealestatelistingservice.service.ListingImageService;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/listings")
public class ListingImageController {
    private final ListingImageService listingImageService;

    @PostMapping("/{listingId}/images/upload")
    public ResponseEntity<BaseResponse<String>> uploadImage(@PathVariable String listingId, @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = listingImageService.uploadImage(listingId, file);
        return ResponseFactory.ok(imageUrl);
    }

    @GetMapping("/{listingId}/images")
    public ResponseEntity<BaseResponse<List<ListingImageResponse>>> getImagesByListing(@PathVariable String listingId) {
        List<ListingImageResponse> images = listingImageService.getImagesByListing(listingId);
        return ResponseFactory.ok(images);
    }
    @PutMapping("/{listingId}/images/{imageId}/setAsMain")
    public ResponseEntity<BaseResponse<Void>> setMainImage(
            @PathVariable String listingId,
            @PathVariable String imageId) {
        listingImageService.setMainImage(listingId, imageId);
        return ResponseFactory.ok(null);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<BaseResponse<Void>> deleteImage(@PathVariable String imageId) {
        listingImageService.deleteImage(imageId);
        return ResponseFactory.ok(null);
    }

    @PostMapping("/{listingId}/images/uploadMultiple")
    public ResponseEntity<BaseResponse<List<String>>> uploadMultipleImages(
            @PathVariable String listingId,
            @RequestParam("files") MultipartFile[] files) {
        List<String> imageUrls = listingImageService.uploadMultipleImages(listingId, files);
        return ResponseFactory.ok(imageUrls);
    }
    @PutMapping("/images/{imageId}")
    public ResponseEntity<BaseResponse<String>> replaceImage(
            @PathVariable String imageId,
            @RequestParam("file") MultipartFile file) {

        String imageUrl = listingImageService.replaceImage(imageId, file);
        return ResponseFactory.ok(imageUrl);
    }
}
