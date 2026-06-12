package com.dispatchflow.controller;

import com.dispatchflow.dto.request.DeadheadCalculationRequest;
import com.dispatchflow.dto.response.DeadheadCalculationResponse;
import com.dispatchflow.security.Authorities;
import com.dispatchflow.service.DeadheadCalculatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deadhead")
@RequiredArgsConstructor
public class DeadheadController {

    private final DeadheadCalculatorService deadheadCalculatorService;

    @PostMapping("/calculate")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<DeadheadCalculationResponse> calculateDeadhead(
            @Valid @RequestBody DeadheadCalculationRequest request) {
        return ResponseEntity.ok(deadheadCalculatorService.calculate(request));
    }
}
