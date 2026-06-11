package com.dispatchflow.dto.response;

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
public class CarrierResponse {

    private Long id;
    private String name;
    private String mcNumber;
    private String dotNumber;
    private String phone;
    private String email;
    private Instant createdAt;
    private Instant updatedAt;
}
