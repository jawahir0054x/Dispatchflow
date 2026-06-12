package com.dispatchflow.service;

import com.dispatchflow.entity.Load;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class LoadProfitabilityService {

    private final BigDecimal operatingCostPerMile;

    public LoadProfitabilityService(
            @Value("${app.loads.operating-cost-per-mile:1.75}") BigDecimal operatingCostPerMile) {
        this.operatingCostPerMile = operatingCostPerMile;
    }

    public BigDecimal calculateRatePerMile(Load load) {
        if (load.getMiles() == null || load.getMiles() <= 0) {
            return BigDecimal.ZERO;
        }
        return load.getRate()
                .divide(BigDecimal.valueOf(load.getMiles()), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateDeadheadPercentage(Load load) {
        int totalTripMiles = totalTripMiles(load);
        if (totalTripMiles <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(deadheadMiles(load))
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalTripMiles), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateEstimatedProfit(Load load) {
        BigDecimal operatingCost = BigDecimal.valueOf(totalTripMiles(load))
                .multiply(operatingCostPerMile);
        return load.getRate()
                .subtract(operatingCost)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateFleetEstimatedProfit(BigDecimal totalRevenue, long totalTripMiles) {
        if (totalRevenue == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal operatingCost = BigDecimal.valueOf(totalTripMiles).multiply(operatingCostPerMile);
        return totalRevenue.subtract(operatingCost).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateFleetDeadheadPercentage(long totalDeadheadMiles, long totalTripMiles) {
        if (totalTripMiles <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(totalDeadheadMiles)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalTripMiles), 2, RoundingMode.HALF_UP);
    }

    public int totalTripMiles(Load load) {
        return load.getMiles() + deadheadMiles(load);
    }

    public int deadheadMiles(Load load) {
        return load.getDeadheadMiles() != null ? load.getDeadheadMiles() : 0;
    }
}
