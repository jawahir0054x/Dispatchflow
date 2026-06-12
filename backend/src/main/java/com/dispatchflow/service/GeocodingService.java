package com.dispatchflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@Slf4j
public class GeocodingService {

    private static final String USER_AGENT = "DispatchFlow-AI/1.0 (dispatch-deadhead-calculator)";

    private final RestClient restClient;
    private final String geocodingUrl;

    public GeocodingService(
            RestClient.Builder restClientBuilder,
            @Value("${app.deadhead.geocoding-url:https://nominatim.openstreetmap.org}") String geocodingUrl) {
        this.restClient = restClientBuilder.build();
        this.geocodingUrl = geocodingUrl;
    }

    public GeoCoordinates geocode(String location) {
        URI uri = UriComponentsBuilder.fromUriString(geocodingUrl + "/search")
                .queryParam("q", location.trim())
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .queryParam("countrycodes", "us")
                .build()
                .encode()
                .toUri();

        try {
            JsonNode results = restClient.get()
                    .uri(uri)
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "application/json")
                    .retrieve()
                    .body(JsonNode.class);

            if (results == null || !results.isArray() || results.isEmpty()) {
                throw new IllegalArgumentException("Could not find location: " + location.trim());
            }

            JsonNode match = results.get(0);
            return new GeoCoordinates(
                    match.get("lat").asDouble(),
                    match.get("lon").asDouble(),
                    match.path("display_name").asText(location.trim()));
        } catch (RestClientException ex) {
            log.warn("Geocoding request failed for '{}': {}", location, ex.getMessage());
            throw new IllegalArgumentException("Unable to geocode location: " + location.trim());
        }
    }
}
