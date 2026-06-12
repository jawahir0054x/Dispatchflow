package com.dispatchflow.dto.response;

import com.dispatchflow.enums.LoadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalCarriers;
    private long totalDrivers;
    private long totalLoads;
    private Long totalUsers;
    private long activeDrivers;
    private long idleDrivers;
    private long loadsThisWeek;
    private Map<LoadStatus, Long> loadsByStatus;
    private BigDecimal totalRevenue;
    private BigDecimal deliveredRevenue;
    private BigDecimal pipelineRevenue;
    private BigDecimal avgRatePerMile;
    private long totalMiles;
    private List<LoadResponse> recentLoads;
    private List<LoadResponse> activeLoads;
}
