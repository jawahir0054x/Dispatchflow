package com.dispatchflow.dto.response;

import com.dispatchflow.enums.LoadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadResponse {

    private Long id;
    private String brokerName;
    private String pickupCity;
    private String deliveryCity;
    private BigDecimal rate;
    private Integer miles;
    private LoadStatus status;
    private Long driverId;
    private String driverName;
    private Instant createdAt;
    private Instant updatedAt;
}
