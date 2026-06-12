package com.dispatchflow.service;

import com.dispatchflow.dto.request.LoadRequest;
import com.dispatchflow.dto.response.LoadResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.entity.Driver;
import com.dispatchflow.entity.Load;
import com.dispatchflow.enums.LoadStatus;
import com.dispatchflow.exception.ForbiddenException;
import com.dispatchflow.exception.ResourceNotFoundException;
import com.dispatchflow.repository.DriverRepository;
import com.dispatchflow.repository.LoadRepository;
import com.dispatchflow.util.PageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LoadService {

    private static final Set<LoadStatus> DRIVER_REQUIRED_STATUSES = Set.of(
            LoadStatus.BOOKED,
            LoadStatus.DISPATCHED,
            LoadStatus.IN_TRANSIT,
            LoadStatus.DELIVERED,
            LoadStatus.PAID
    );

    private static final Map<LoadStatus, Set<LoadStatus>> ALLOWED_TRANSITIONS = Map.of(
            LoadStatus.AVAILABLE, Set.of(LoadStatus.BOOKED),
            LoadStatus.BOOKED, Set.of(LoadStatus.DISPATCHED),
            LoadStatus.DISPATCHED, Set.of(LoadStatus.IN_TRANSIT),
            LoadStatus.IN_TRANSIT, Set.of(LoadStatus.DELIVERED),
            LoadStatus.DELIVERED, Set.of(LoadStatus.PAID),
            LoadStatus.PAID, Set.of()
    );

    private final LoadRepository loadRepository;
    private final DriverRepository driverRepository;
    private final LoadProfitabilityService profitabilityService;

    @Transactional(readOnly = true)
    public PageResponse<LoadResponse> getAllLoads(
            Long driverId,
            LoadStatus status,
            String search,
            String broker,
            String driverName,
            Pageable pageable) {
        Page<Load> page;

        if (!isBlank(search)) {
            page = loadRepository.searchLoads(search.trim(), driverId, status, pageable);
        } else if (driverId != null || status != null || !isBlank(broker) || !isBlank(driverName)) {
            page = loadRepository.filterLoads(
                    driverId,
                    status,
                    isBlank(broker) ? null : broker.trim(),
                    isBlank(driverName) ? null : driverName.trim(),
                    pageable);
        } else {
            page = loadRepository.findAll(pageable);
        }

        return PageMapper.toPageResponse(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public LoadResponse getLoadById(Long id) {
        Load load = findLoadOrThrow(id);
        return toResponse(load);
    }

    @Transactional
    public LoadResponse createLoad(LoadRequest request) {
        Driver driver = resolveDriver(request.getDriverId());
        validateDriverForStatus(request.getStatus(), driver);

        Load load = Load.builder()
                .referenceNumber(normalizeReference(request.getReferenceNumber()))
                .brokerName(request.getBrokerName().trim())
                .pickupCity(request.getPickupCity().trim())
                .deliveryCity(request.getDeliveryCity().trim())
                .commodity(request.getCommodity().trim())
                .rate(request.getRate())
                .miles(request.getMiles())
                .deadheadMiles(normalizeDeadheadMiles(request.getDeadheadMiles()))
                .pickupDate(request.getPickupDate())
                .deliveryDate(request.getDeliveryDate())
                .status(request.getStatus())
                .driver(driver)
                .build();

        return toResponse(loadRepository.save(load));
    }

    @Transactional
    public LoadResponse updateLoad(Long id, LoadRequest request) {
        Load load = findLoadOrThrow(id);
        Driver driver = resolveDriver(request.getDriverId());
        validateDriverForStatus(request.getStatus(), driver);

        load.setReferenceNumber(normalizeReference(request.getReferenceNumber()));
        load.setBrokerName(request.getBrokerName().trim());
        load.setPickupCity(request.getPickupCity().trim());
        load.setDeliveryCity(request.getDeliveryCity().trim());
        load.setCommodity(request.getCommodity().trim());
        load.setRate(request.getRate());
        load.setMiles(request.getMiles());
        load.setDeadheadMiles(normalizeDeadheadMiles(request.getDeadheadMiles()));
        load.setPickupDate(request.getPickupDate());
        load.setDeliveryDate(request.getDeliveryDate());
        load.setStatus(request.getStatus());
        load.setDriver(driver);

        return toResponse(loadRepository.save(load));
    }

    @Transactional
    public LoadResponse updateLoadStatus(Long id, LoadStatus newStatus) {
        Load load = findLoadOrThrow(id);
        LoadStatus currentStatus = load.getStatus();

        if (currentStatus == newStatus) {
            return toResponse(load);
        }

        Set<LoadStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new ForbiddenException(
                    "Cannot transition load from " + currentStatus + " to " + newStatus);
        }

        validateDriverForStatus(newStatus, load.getDriver());

        load.setStatus(newStatus);
        return toResponse(loadRepository.save(load));
    }

    @Transactional
    public void deleteLoad(Long id) {
        Load load = findLoadOrThrow(id);
        loadRepository.delete(load);
    }

    public LoadResponse toResponse(Load load) {
        LoadResponse.LoadResponseBuilder builder = LoadResponse.builder()
                .id(load.getId())
                .loadNumber(formatLoadNumber(load.getId()))
                .referenceNumber(load.getReferenceNumber())
                .brokerName(load.getBrokerName())
                .pickupCity(load.getPickupCity())
                .deliveryCity(load.getDeliveryCity())
                .commodity(load.getCommodity())
                .rate(load.getRate())
                .miles(load.getMiles())
                .deadheadMiles(profitabilityService.deadheadMiles(load))
                .pickupDate(load.getPickupDate())
                .deliveryDate(load.getDeliveryDate())
                .ratePerMile(profitabilityService.calculateRatePerMile(load))
                .deadheadPercentage(profitabilityService.calculateDeadheadPercentage(load))
                .estimatedProfit(profitabilityService.calculateEstimatedProfit(load))
                .status(load.getStatus())
                .createdAt(load.getCreatedAt())
                .updatedAt(load.getUpdatedAt());

        if (load.getDriver() != null) {
            builder
                    .driverId(load.getDriver().getId())
                    .driverName(load.getDriver().getName())
                    .carrierName(load.getDriver().getCarrier().getName());
        }

        return builder.build();
    }

    private String formatLoadNumber(Long id) {
        return String.format("DF-%06d", id);
    }

    private String normalizeReference(String referenceNumber) {
        if (referenceNumber == null || referenceNumber.isBlank()) {
            return null;
        }
        return referenceNumber.trim();
    }

    private Driver resolveDriver(Long driverId) {
        if (driverId == null) {
            return null;
        }
        return findDriverOrThrow(driverId);
    }

    private void validateDriverForStatus(LoadStatus status, Driver driver) {
        if (DRIVER_REQUIRED_STATUSES.contains(status) && driver == null) {
            throw new ForbiddenException("Assigned driver is required for status: " + status);
        }
    }

    private Load findLoadOrThrow(Long id) {
        return loadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + id));
    }

    private Driver findDriverOrThrow(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private int normalizeDeadheadMiles(Integer deadheadMiles) {
        return deadheadMiles != null ? deadheadMiles : 0;
    }
}
