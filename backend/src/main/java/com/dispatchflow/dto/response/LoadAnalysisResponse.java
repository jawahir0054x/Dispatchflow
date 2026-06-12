package com.dispatchflow.dto.response;

import com.dispatchflow.enums.LoadGrade;
import com.dispatchflow.enums.LoadRecommendation;
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
public class LoadAnalysisResponse {

    private BigDecimal ratePerMile;
    private int profitabilityScore;
    private LoadGrade loadGrade;
    private LoadRecommendation recommendation;
}
