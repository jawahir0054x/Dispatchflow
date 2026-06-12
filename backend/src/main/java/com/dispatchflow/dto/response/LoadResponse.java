package com.dispatchflow.dto.response;

import com.dispatchflow.enums.LoadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadResponse {

    private Long id;
    private String loadNumber;
    private String referenceNumber;
    private String brokerName;
    private String pickupCity;
    private String deliveryCity;
    private String commodity;
    private BigDecimal rate;
    private Integer miles;
    private Integer deadheadMiles;
    private LocalDate pickupDate;
    private LocalDate deliveryDate;
    private LoadStatus status;
    private Long driverId;
    private String driverName;
    private String carrierName;
    private BigDecimal ratePerMile;
    private BigDecimal deadheadPercentage;
    private BigDecimal estimatedProfit;
    private Instant createdAt;
    private Instant updatedAt;
}
