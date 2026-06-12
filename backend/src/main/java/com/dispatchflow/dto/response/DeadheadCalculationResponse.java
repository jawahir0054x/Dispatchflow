package com.dispatchflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadheadCalculationResponse {

    private String currentLocation;
    private String pickupLocation;
    private String resolvedCurrentLocation;
    private String resolvedPickupLocation;
    private int deadheadMiles;
}
