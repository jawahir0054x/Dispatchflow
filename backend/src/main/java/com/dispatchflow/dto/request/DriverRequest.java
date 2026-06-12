package com.dispatchflow.dto.request;

import com.dispatchflow.enums.DriverStatus;
import com.dispatchflow.enums.TrailerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class DriverRequest {

    @NotNull(message = "Carrier ID is required")
    private Long carrierId;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @NotBlank(message = "Truck number is required")
    @Size(max = 50, message = "Truck number must not exceed 50 characters")
    private String truckNumber;

    @NotNull(message = "Trailer type is required")
    private TrailerType trailerType;

    @NotBlank(message = "Current location is required")
    @Size(max = 255, message = "Current location must not exceed 255 characters")
    private String currentLocation;

    @NotNull(message = "Status is required")
    private DriverStatus status;
}
