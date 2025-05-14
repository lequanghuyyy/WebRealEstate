package realestate.webrealestatelistingservice.service;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import realestate.webrealestatelistingservice.dto.Position;

@Service
public class GeocodingService {
    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final RestTemplate restTemplate;
    private final String nominatimUrl;
    private final String userAgent;

    public GeocodingService(RestTemplateBuilder builder,
                            @Value("${nominatim.url}") String nominatimUrl,
                            @Value("${nominatim.userAgent}") String userAgent) {
        this.restTemplate = builder
                .build();
        this.nominatimUrl = nominatimUrl;
        this.userAgent = userAgent;
    }

    @Cacheable("geocode")
    public Optional<Position> geocode(String address) {
        // 1. Build URI
        URI uri = UriComponentsBuilder
                .fromHttpUrl(nominatimUrl)
                .queryParam("q", address)
                .queryParam("format", "json")
                .encode()
                .build()
                .toUri();

        log.info("→ Nominatim request: {}", uri);

        // 2. Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, userAgent);

        try {
            // 3. Call API
            ResponseEntity<Position[]> resp = restTemplate.exchange(
                    uri, HttpMethod.GET, new HttpEntity<>(headers), Position[].class);

            Position[] bodies = resp.getBody();
            log.info("← Nominatim response: status={}, results={}",
                    resp.getStatusCode(), bodies == null ? 0 : bodies.length);

            if (bodies != null && bodies.length > 0) {
                return Optional.of(bodies[0]);
            } else {
                return Optional.empty();
            }
        } catch (RestClientException ex) {
            log.error("Error calling Nominatim for address '{}'", address, ex);
            return Optional.empty();
        }
    }
}

