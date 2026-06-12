package com.dispatchflow.service;

import com.dispatchflow.dto.request.DeadheadCalculationRequest;
import com.dispatchflow.dto.response.DeadheadCalculationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeadheadCalculatorService {

    private final GeocodingService geocodingService;
    private final RoutingService routingService;

    public DeadheadCalculationResponse calculate(DeadheadCalculationRequest request) {
        String currentLocation = request.getCurrentLocation().trim();
        String pickupLocation = request.getPickupLocation().trim();

        GeoCoordinates origin = geocodingService.geocode(currentLocation);
        pauseForGeocodingRateLimit();
        GeoCoordinates destination = geocodingService.geocode(pickupLocation);
        int deadheadMiles = routingService.drivingDistanceMiles(origin, destination);

        return DeadheadCalculationResponse.builder()
                .currentLocation(currentLocation)
                .pickupLocation(pickupLocation)
                .resolvedCurrentLocation(origin.getDisplayName())
                .resolvedPickupLocation(destination.getDisplayName())
                .deadheadMiles(deadheadMiles)
                .build();
    }

    private void pauseForGeocodingRateLimit() {
        try {
            Thread.sleep(1100);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
