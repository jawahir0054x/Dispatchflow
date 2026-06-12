package com.dispatchflow.service;

import com.dispatchflow.dto.request.DriverRequest;
import com.dispatchflow.dto.response.DriverResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.entity.Carrier;
import com.dispatchflow.entity.Driver;
import com.dispatchflow.exception.DuplicateResourceException;
import com.dispatchflow.exception.ForbiddenException;
import com.dispatchflow.exception.ResourceNotFoundException;
import com.dispatchflow.repository.CarrierRepository;
import com.dispatchflow.repository.DriverRepository;
import com.dispatchflow.repository.LoadRepository;
import com.dispatchflow.util.PageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final CarrierRepository carrierRepository;
    private final LoadRepository loadRepository;

    @Transactional(readOnly = true)
    public PageResponse<DriverResponse> getAllDrivers(Long carrierId, String search, Pageable pageable) {
        Page<Driver> page;

        if (!isBlank(search)) {
            page = driverRepository.searchByTerm(search.trim(), carrierId, pageable);
        } else if (carrierId != null) {
            page = driverRepository.findByCarrierId(carrierId, pageable);
        } else {
            page = driverRepository.findAll(pageable);
        }

        return PageMapper.toPageResponse(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = findDriverOrThrow(id);
        return toResponse(driver);
    }

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        Carrier carrier = findCarrierOrThrow(request.getCarrierId());
        validateUniqueTruckNumber(request.getTruckNumber(), carrier.getId(), null);

        Driver driver = Driver.builder()
                .name(request.getName().trim())
                .phone(request.getPhone().trim())
                .truckNumber(normalizeTruckNumber(request.getTruckNumber()))
                .trailerType(request.getTrailerType())
                .currentLocation(request.getCurrentLocation().trim())
                .status(request.getStatus())
                .carrier(carrier)
                .build();

        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = findDriverOrThrow(id);
        Carrier carrier = findCarrierOrThrow(request.getCarrierId());
        validateUniqueTruckNumber(request.getTruckNumber(), carrier.getId(), id);

        driver.setName(request.getName().trim());
        driver.setPhone(request.getPhone().trim());
        driver.setTruckNumber(normalizeTruckNumber(request.getTruckNumber()));
        driver.setTrailerType(request.getTrailerType());
        driver.setCurrentLocation(request.getCurrentLocation().trim());
        driver.setStatus(request.getStatus());
        driver.setCarrier(carrier);

        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public void deleteDriver(Long id) {
        Driver driver = findDriverOrThrow(id);
        if (loadRepository.existsByDriverId(id)) {
            throw new ForbiddenException("Cannot delete driver with assigned loads");
        }
        driverRepository.delete(driver);
    }

    private Driver findDriverOrThrow(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    private Carrier findCarrierOrThrow(Long carrierId) {
        return carrierRepository.findById(carrierId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrier not found with id: " + carrierId));
    }

    private void validateUniqueTruckNumber(String truckNumber, Long carrierId, Long excludeId) {
        String normalized = normalizeTruckNumber(truckNumber);

        boolean exists = excludeId == null
                ? driverRepository.existsByTruckNumberAndCarrierId(normalized, carrierId)
                : driverRepository.existsByTruckNumberAndCarrierIdAndIdNot(normalized, carrierId, excludeId);

        if (exists) {
            throw new DuplicateResourceException(
                    "Truck number is already assigned to this carrier: " + normalized
            );
        }
    }

    private String normalizeTruckNumber(String truckNumber) {
        return truckNumber.trim().toUpperCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .truckNumber(driver.getTruckNumber())
                .trailerType(driver.getTrailerType())
                .currentLocation(driver.getCurrentLocation())
                .status(driver.getStatus())
                .carrierId(driver.getCarrier().getId())
                .carrierName(driver.getCarrier().getName())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
