package com.dispatchflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class DeadheadCalculationRequest {

    @NotBlank(message = "Current truck location is required")
    @Size(max = 255, message = "Current truck location must not exceed 255 characters")
    private String currentLocation;

    @NotBlank(message = "Pickup location is required")
    @Size(max = 255, message = "Pickup location must not exceed 255 characters")
    private String pickupLocation;
}
