package com.dispatchflow.controller;

import com.dispatchflow.dto.request.CarrierRequest;
import com.dispatchflow.dto.response.CarrierResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.security.Authorities;
import com.dispatchflow.service.CarrierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carriers")
@RequiredArgsConstructor
public class CarrierController {

    private final CarrierService carrierService;

    @GetMapping
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<PageResponse<CarrierResponse>> getAllCarriers(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(carrierService.getAllCarriers(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<CarrierResponse> getCarrierById(@PathVariable Long id) {
        return ResponseEntity.ok(carrierService.getCarrierById(id));
    }

    @PostMapping
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<CarrierResponse> createCarrier(@Valid @RequestBody CarrierRequest request) {
        CarrierResponse response = carrierService.createCarrier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<CarrierResponse> updateCarrier(
            @PathVariable Long id,
            @Valid @RequestBody CarrierRequest request) {
        return ResponseEntity.ok(carrierService.updateCarrier(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN)
    public ResponseEntity<Void> deleteCarrier(@PathVariable Long id) {
        carrierService.deleteCarrier(id);
        return ResponseEntity.noContent().build();
    }
}
