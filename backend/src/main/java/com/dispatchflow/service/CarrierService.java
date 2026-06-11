package com.dispatchflow.service;

import com.dispatchflow.dto.request.CarrierRequest;
import com.dispatchflow.dto.response.CarrierResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.entity.Carrier;
import com.dispatchflow.exception.DuplicateResourceException;
import com.dispatchflow.exception.ResourceNotFoundException;
import com.dispatchflow.repository.CarrierRepository;
import com.dispatchflow.util.PageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarrierService {

    private final CarrierRepository carrierRepository;

    @Transactional(readOnly = true)
    public PageResponse<CarrierResponse> getAllCarriers(Pageable pageable) {
        return PageMapper.toPageResponse(carrierRepository.findAll(pageable), this::toResponse);
    }

    @Transactional(readOnly = true)
    public CarrierResponse getCarrierById(Long id) {
        Carrier carrier = findCarrierOrThrow(id);
        return toResponse(carrier);
    }

    @Transactional
    public CarrierResponse createCarrier(CarrierRequest request) {
        validateUniqueFields(request.getMcNumber(), request.getDotNumber(), null);

        Carrier carrier = Carrier.builder()
                .name(request.getName().trim())
                .mcNumber(normalizeIdentifier(request.getMcNumber()))
                .dotNumber(normalizeIdentifier(request.getDotNumber()))
                .phone(request.getPhone().trim())
                .email(request.getEmail().toLowerCase().trim())
                .build();

        return toResponse(carrierRepository.save(carrier));
    }

    @Transactional
    public CarrierResponse updateCarrier(Long id, CarrierRequest request) {
        Carrier carrier = findCarrierOrThrow(id);
        validateUniqueFields(request.getMcNumber(), request.getDotNumber(), id);

        carrier.setName(request.getName().trim());
        carrier.setMcNumber(normalizeIdentifier(request.getMcNumber()));
        carrier.setDotNumber(normalizeIdentifier(request.getDotNumber()));
        carrier.setPhone(request.getPhone().trim());
        carrier.setEmail(request.getEmail().toLowerCase().trim());

        return toResponse(carrierRepository.save(carrier));
    }

    @Transactional
    public void deleteCarrier(Long id) {
        Carrier carrier = findCarrierOrThrow(id);
        carrierRepository.delete(carrier);
    }

    private Carrier findCarrierOrThrow(Long id) {
        return carrierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrier not found with id: " + id));
    }

    private void validateUniqueFields(String mcNumber, String dotNumber, Long excludeId) {
        String normalizedMc = normalizeIdentifier(mcNumber);
        String normalizedDot = normalizeIdentifier(dotNumber);

        boolean mcExists = excludeId == null
                ? carrierRepository.existsByMcNumber(normalizedMc)
                : carrierRepository.existsByMcNumberAndIdNot(normalizedMc, excludeId);

        if (mcExists) {
            throw new DuplicateResourceException("MC number is already registered: " + normalizedMc);
        }

        boolean dotExists = excludeId == null
                ? carrierRepository.existsByDotNumber(normalizedDot)
                : carrierRepository.existsByDotNumberAndIdNot(normalizedDot, excludeId);

        if (dotExists) {
            throw new DuplicateResourceException("DOT number is already registered: " + normalizedDot);
        }
    }

    private String normalizeIdentifier(String value) {
        return value.trim().toUpperCase();
    }

    private CarrierResponse toResponse(Carrier carrier) {
        return CarrierResponse.builder()
                .id(carrier.getId())
                .name(carrier.getName())
                .mcNumber(carrier.getMcNumber())
                .dotNumber(carrier.getDotNumber())
                .phone(carrier.getPhone())
                .email(carrier.getEmail())
                .createdAt(carrier.getCreatedAt())
                .updatedAt(carrier.getUpdatedAt())
                .build();
    }
}
