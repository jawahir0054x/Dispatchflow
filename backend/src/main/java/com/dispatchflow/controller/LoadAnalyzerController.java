package com.dispatchflow.controller;

import com.dispatchflow.dto.request.LoadAnalysisRequest;
import com.dispatchflow.dto.response.LoadAnalysisResponse;
import com.dispatchflow.security.Authorities;
import com.dispatchflow.service.LoadAnalyzerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loads")
@RequiredArgsConstructor
public class LoadAnalyzerController {

    private final LoadAnalyzerService loadAnalyzerService;

    @PostMapping("/analyze")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<LoadAnalysisResponse> analyzeLoad(
            @Valid @RequestBody LoadAnalysisRequest request) {
        return ResponseEntity.ok(loadAnalyzerService.analyze(request));
    }
}
