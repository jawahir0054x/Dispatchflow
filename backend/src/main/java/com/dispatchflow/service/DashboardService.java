package com.dispatchflow.service;

import com.dispatchflow.dto.response.DashboardStatsResponse;
import com.dispatchflow.dto.response.LoadResponse;
import com.dispatchflow.enums.LoadStatus;
import com.dispatchflow.enums.Role;
import com.dispatchflow.repository.CarrierRepository;
import com.dispatchflow.repository.DriverRepository;
import com.dispatchflow.repository.LoadRepository;
import com.dispatchflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<LoadStatus> PIPELINE_STATUSES = List.of(
            LoadStatus.PENDING,
            LoadStatus.DISPATCHED,
            LoadStatus.IN_TRANSIT
    );

    private static final List<LoadStatus> ACTIVE_STATUSES = List.of(
            LoadStatus.DISPATCHED,
            LoadStatus.IN_TRANSIT
    );

    private final LoadRepository loadRepository;
    private final DriverRepository driverRepository;
    private final CarrierRepository carrierRepository;
    private final UserRepository userRepository;
    private final LoadService loadService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(Authentication authentication) {
        long totalDrivers = driverRepository.count();
        long activeDrivers = loadRepository.countActiveDrivers();
        long idleDrivers = Math.max(0, totalDrivers - activeDrivers);

        Map<LoadStatus, Long> loadsByStatus = new EnumMap<>(LoadStatus.class);
        for (LoadStatus status : LoadStatus.values()) {
            loadsByStatus.put(status, 0L);
        }
        for (Object[] row : loadRepository.countGroupByStatus()) {
            loadsByStatus.put((LoadStatus) row[0], (Long) row[1]);
        }

        long totalLoads = loadsByStatus.values().stream().mapToLong(Long::longValue).sum();
        BigDecimal deliveredRevenue = loadRepository.sumRateByStatus(LoadStatus.DELIVERED);
        BigDecimal pipelineRevenue = PIPELINE_STATUSES.stream()
                .map(loadRepository::sumRateByStatus)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRevenue = loadRepository.sumTotalRevenue();
        long totalMiles = loadRepository.sumTotalMiles();

        BigDecimal avgRatePerMile = totalMiles > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalMiles), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long loadsThisWeek = loadRepository.countLoadsSince(weekAgo);

        List<LoadResponse> recentLoads = loadRepository
                .findAll(PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(loadService::toResponse)
                .getContent();

        List<LoadResponse> activeLoads = loadRepository
                .findByStatusIn(ACTIVE_STATUSES, PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "updatedAt")))
                .map(loadService::toResponse)
                .getContent();

        DashboardStatsResponse.DashboardStatsResponseBuilder builder = DashboardStatsResponse.builder()
                .totalCarriers(carrierRepository.count())
                .totalDrivers(totalDrivers)
                .totalLoads(totalLoads)
                .activeDrivers(activeDrivers)
                .idleDrivers(idleDrivers)
                .loadsThisWeek(loadsThisWeek)
                .loadsByStatus(loadsByStatus)
                .totalRevenue(totalRevenue)
                .deliveredRevenue(deliveredRevenue)
                .pipelineRevenue(pipelineRevenue)
                .avgRatePerMile(avgRatePerMile)
                .totalMiles(totalMiles)
                .recentLoads(recentLoads)
                .activeLoads(activeLoads);

        if (isAdmin(authentication)) {
            builder.totalUsers(userRepository.count());
        }

        return builder.build();
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_" + Role.ADMIN.name()));
    }
}
