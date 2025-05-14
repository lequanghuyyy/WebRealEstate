//package realestate.webrealestatelistingservice.service;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//@Service
//public class GeocodingService {
//    @Value("${nominatim.url:https://nominatim.openstreetmap.org/search}")
//    private String url;
//
//    @Value("${nominatim.userAgent:MyApp/1.0 (contact@yourdomain.com)}")
//    private String userAgent;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public Optional<Position> geocode(String address) {
//        String uri = UriComponentsBuilder.fromHttpUrl(url)
//                .queryParam("q", address)
//                .queryParam("format", "json")
//                .build().encode().toUriString();  // ensure UTF-8 :contentReference[oaicite:4]{index=4}
//        HttpHeaders headers = new HttpHeaders();
//        headers.set(HttpHeaders.USER_AGENT, userAgent);
//        HttpEntity<Void> req = new HttpEntity<>(headers);
//        ResponseEntity<Position[]> resp = restTemplate.exchange(uri, HttpMethod.GET, req, Position[].class);
//        if (resp.getBody() != null && resp.getBody().length > 0) {
//            return Optional.of(resp.getBody()[0]);  // lấy kết quả đầu tiên :contentReference[oaicite:5]{index=5}
//        }
//        return Optional.empty();
//    }
//}
//
