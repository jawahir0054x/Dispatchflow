package com.dispatchflow.service;

import com.dispatchflow.dto.request.LoadAnalysisRequest;
import com.dispatchflow.dto.response.LoadAnalysisResponse;
import com.dispatchflow.enums.LoadGrade;
import com.dispatchflow.enums.LoadRecommendation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class LoadAnalyzerService {

    private final BigDecimal operatingCostPerMile;

    public LoadAnalyzerService(
            @Value("${app.loads.operating-cost-per-mile:1.75}") BigDecimal operatingCostPerMile) {
        this.operatingCostPerMile = operatingCostPerMile;
    }

    public LoadAnalysisResponse analyze(LoadAnalysisRequest request) {
        int loadedMiles = request.getMiles();
        int deadheadMiles = request.getDeadheadMiles() != null ? request.getDeadheadMiles() : 0;
        int totalTripMiles = loadedMiles + deadheadMiles;
        BigDecimal rate = request.getRate();

        BigDecimal ratePerMile = rate.divide(BigDecimal.valueOf(loadedMiles), 2, RoundingMode.HALF_UP);
        BigDecimal deadheadPercentage = totalTripMiles > 0
                ? BigDecimal.valueOf(deadheadMiles)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalTripMiles), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal estimatedProfit = rate.subtract(
                BigDecimal.valueOf(totalTripMiles).multiply(operatingCostPerMile));

        int rpmScore = scoreRatePerMile(ratePerMile);
        int deadheadScore = scoreDeadheadPercentage(deadheadPercentage);
        int profitScore = scoreProfit(estimatedProfit, rate);

        int profitabilityScore = weightedScore(rpmScore, deadheadScore, profitScore);
        LoadGrade loadGrade = toGrade(profitabilityScore);
        LoadRecommendation recommendation = toRecommendation(profitabilityScore, estimatedProfit);

        return LoadAnalysisResponse.builder()
                .ratePerMile(ratePerMile)
                .profitabilityScore(profitabilityScore)
                .loadGrade(loadGrade)
                .recommendation(recommendation)
                .build();
    }

    private int weightedScore(int rpmScore, int deadheadScore, int profitScore) {
        return (rpmScore * 40 + deadheadScore * 30 + profitScore * 30) / 100;
    }

    private int scoreRatePerMile(BigDecimal ratePerMile) {
        double rpm = ratePerMile.doubleValue();
        if (rpm >= 2.50) {
            return 100;
        }
        if (rpm >= 2.00) {
            return 85;
        }
        if (rpm >= 1.75) {
            return 70;
        }
        if (rpm >= 1.50) {
            return 55;
        }
        if (rpm >= 1.25) {
            return 40;
        }
        return 20;
    }

    private int scoreDeadheadPercentage(BigDecimal deadheadPercentage) {
        double pct = deadheadPercentage.doubleValue();
        if (pct <= 10) {
            return 100;
        }
        if (pct <= 20) {
            return 85;
        }
        if (pct <= 30) {
            return 65;
        }
        if (pct <= 40) {
            return 45;
        }
        return 25;
    }

    private int scoreProfit(BigDecimal estimatedProfit, BigDecimal rate) {
        if (estimatedProfit.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (rate.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        BigDecimal margin = estimatedProfit
                .multiply(BigDecimal.valueOf(100))
                .divide(rate, 2, RoundingMode.HALF_UP);
        double marginPct = margin.doubleValue();
        if (marginPct >= 40) {
            return 100;
        }
        if (marginPct >= 25) {
            return 80;
        }
        if (marginPct >= 15) {
            return 60;
        }
        if (marginPct >= 5) {
            return 40;
        }
        return 20;
    }

    private LoadGrade toGrade(int score) {
        if (score >= 90) {
            return LoadGrade.A;
        }
        if (score >= 80) {
            return LoadGrade.B;
        }
        if (score >= 70) {
            return LoadGrade.C;
        }
        if (score >= 60) {
            return LoadGrade.D;
        }
        return LoadGrade.F;
    }

    private LoadRecommendation toRecommendation(int score, BigDecimal estimatedProfit) {
        if (estimatedProfit.compareTo(BigDecimal.ZERO) <= 0 || score < 50) {
            return LoadRecommendation.AVOID_LOAD;
        }
        if (score >= 75) {
            return LoadRecommendation.GOOD_LOAD;
        }
        return LoadRecommendation.AVERAGE_LOAD;
    }
}
