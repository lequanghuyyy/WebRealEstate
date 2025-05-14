package realestate.webrealestatelistingservice.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public Map<String, String> uploadImage(MultipartFile file, String folder, int width, int height) {
        try {
            Map<String, Object> options = new HashMap<>();
            if (folder != null) {
                options.put("folder", folder);
            }

            // Tối ưu hóa ảnh nếu có kích thước
            if (width > 0 && height > 0) {
                Map<String, Object> transformation = new HashMap<>();
                transformation.put("width", width);
                transformation.put("height", height);
                transformation.put("crop", "limit");
                options.put("transformation", transformation);
            }

            options.put("resource_type", "auto");
            options.put("quality", "auto");

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

            Map<String, String> result = new HashMap<>();
            result.put("url", uploadResult.get("url").toString());
            result.put("publicId", uploadResult.get("public_id").toString());

            return result;
        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }


    public boolean deleteImage(String publicId) {
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            throw new RuntimeException("Delete failed: " + e.getMessage());
        }
    }
}
