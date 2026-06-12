package com.dispatchflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoadAnalysisRequest {

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.01", message = "Rate must be greater than zero")
    private BigDecimal rate;

    @NotNull(message = "Miles is required")
    @Min(value = 1, message = "Miles must be at least 1")
    private Integer miles;

    @Min(value = 0, message = "Deadhead miles must be zero or greater")
    private Integer deadheadMiles;
}
