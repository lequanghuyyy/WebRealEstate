package realestate.webrealestatelistingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching  // Kích hoạt cơ chế cache abstraction của Spring :contentReference[oaicite:0]{index=0}
public class WebRealEstateListingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebRealEstateListingServiceApplication.class, args);
    }

}
