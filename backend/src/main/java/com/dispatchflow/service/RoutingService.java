package com.dispatchflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@Slf4j
public class RoutingService {

    private static final double METERS_TO_MILES = 0.000621371;
    private static final double ROAD_FACTOR = 1.25;
    private static final double EARTH_RADIUS_MILES = 3958.8;

    private final RestClient restClient;
    private final String routingUrl;

    public RoutingService(
            RestClient.Builder restClientBuilder,
            @Value("${app.deadhead.routing-url:https://router.project-osrm.org}") String routingUrl) {
        this.restClient = restClientBuilder.build();
        this.routingUrl = routingUrl;
    }

    public int drivingDistanceMiles(GeoCoordinates origin, GeoCoordinates destination) {
        try {
            String coordinatePath = String.format(
                    "%f,%f;%f,%f",
                    origin.getLongitude(),
                    origin.getLatitude(),
                    destination.getLongitude(),
                    destination.getLatitude());

            JsonNode response = restClient.get()
                    .uri(routingUrl + "/route/v1/driving/{coordinates}?overview=false", coordinatePath)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null
                    && "Ok".equals(response.path("code").asText())
                    && response.path("routes").isArray()
                    && !response.path("routes").isEmpty()) {
                double meters = response.path("routes").get(0).path("distance").asDouble();
                return toMiles(meters);
            }
        } catch (RestClientException ex) {
            log.warn("Routing request failed, falling back to estimate: {}", ex.getMessage());
        }

        return estimateRoadMiles(origin, destination);
    }

    private int estimateRoadMiles(GeoCoordinates origin, GeoCoordinates destination) {
        double straightLineMiles = haversineMiles(
                origin.getLatitude(),
                origin.getLongitude(),
                destination.getLatitude(),
                destination.getLongitude());
        return Math.max(0, (int) Math.round(straightLineMiles * ROAD_FACTOR));
    }

    private double haversineMiles(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_MILES * c;
    }

    private int toMiles(double meters) {
        return Math.max(0, (int) Math.round(meters * METERS_TO_MILES));
    }
}
