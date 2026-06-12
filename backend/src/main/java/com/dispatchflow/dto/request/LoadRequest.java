package com.dispatchflow.dto.request;

import com.dispatchflow.enums.LoadStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadRequest {

    private Long driverId;

    @Size(max = 50, message = "Reference number must not exceed 50 characters")
    private String referenceNumber;

    @NotBlank(message = "Broker name is required")
    @Size(max = 255, message = "Broker name must not exceed 255 characters")
    private String brokerName;

    @NotBlank(message = "Pickup city is required")
    @Size(max = 100, message = "Pickup city must not exceed 100 characters")
    private String pickupCity;

    @NotBlank(message = "Delivery city is required")
    @Size(max = 100, message = "Delivery city must not exceed 100 characters")
    private String deliveryCity;

    @NotBlank(message = "Commodity is required")
    @Size(max = 255, message = "Commodity must not exceed 255 characters")
    private String commodity;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.01", message = "Rate must be greater than zero")
    private BigDecimal rate;

    @NotNull(message = "Miles is required")
    @Min(value = 1, message = "Miles must be at least 1")
    private Integer miles;

    @Min(value = 0, message = "Deadhead miles must be zero or greater")
    private Integer deadheadMiles;

    @NotNull(message = "Pickup date is required")
    private LocalDate pickupDate;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    @NotNull(message = "Status is required")
    private LoadStatus status;
}
