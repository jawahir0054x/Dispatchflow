package com.dispatchflow.dto.response;

import com.dispatchflow.enums.TrailerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {

    private Long id;
    private String name;
    private String phone;
    private String truckNumber;
    private TrailerType trailerType;
    private String currentLocation;
    private Long carrierId;
    private String carrierName;
    private Instant createdAt;
    private Instant updatedAt;
}
