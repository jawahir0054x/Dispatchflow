package com.dispatchflow.service;

import com.dispatchflow.dto.request.LoadRequest;
import com.dispatchflow.dto.response.LoadResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.entity.Driver;
import com.dispatchflow.entity.Load;
import com.dispatchflow.enums.LoadStatus;
import com.dispatchflow.exception.ResourceNotFoundException;
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
public class LoadService {

    private final LoadRepository loadRepository;
    private final DriverRepository driverRepository;

    @Transactional(readOnly = true)
    public PageResponse<LoadResponse> getAllLoads(Long driverId, LoadStatus status, Pageable pageable) {
        Page<Load> page;

        if (driverId != null && status != null) {
            page = loadRepository.findByDriverIdAndStatus(driverId, status, pageable);
        } else if (driverId != null) {
            page = loadRepository.findByDriverId(driverId, pageable);
        } else if (status != null) {
            page = loadRepository.findByStatus(status, pageable);
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
        Driver driver = findDriverOrThrow(request.getDriverId());

        Load load = Load.builder()
                .brokerName(request.getBrokerName().trim())
                .pickupCity(request.getPickupCity().trim())
                .deliveryCity(request.getDeliveryCity().trim())
                .rate(request.getRate())
                .miles(request.getMiles())
                .status(request.getStatus())
                .driver(driver)
                .build();

        return toResponse(loadRepository.save(load));
    }

    @Transactional
    public LoadResponse updateLoad(Long id, LoadRequest request) {
        Load load = findLoadOrThrow(id);
        Driver driver = findDriverOrThrow(request.getDriverId());

        load.setBrokerName(request.getBrokerName().trim());
        load.setPickupCity(request.getPickupCity().trim());
        load.setDeliveryCity(request.getDeliveryCity().trim());
        load.setRate(request.getRate());
        load.setMiles(request.getMiles());
        load.setStatus(request.getStatus());
        load.setDriver(driver);

        return toResponse(loadRepository.save(load));
    }

    @Transactional
    public void deleteLoad(Long id) {
        Load load = findLoadOrThrow(id);
        loadRepository.delete(load);
    }

    private Load findLoadOrThrow(Long id) {
        return loadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + id));
    }

    private Driver findDriverOrThrow(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));
    }

    private LoadResponse toResponse(Load load) {
        return LoadResponse.builder()
                .id(load.getId())
                .brokerName(load.getBrokerName())
                .pickupCity(load.getPickupCity())
                .deliveryCity(load.getDeliveryCity())
                .rate(load.getRate())
                .miles(load.getMiles())
                .status(load.getStatus())
                .driverId(load.getDriver().getId())
                .driverName(load.getDriver().getName())
                .createdAt(load.getCreatedAt())
                .updatedAt(load.getUpdatedAt())
                .build();
    }
}
