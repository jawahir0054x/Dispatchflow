package com.dispatchflow.controller;

import com.dispatchflow.dto.request.LoadRequest;
import com.dispatchflow.dto.request.LoadStatusUpdateRequest;
import com.dispatchflow.dto.response.LoadResponse;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.enums.LoadStatus;
import com.dispatchflow.security.Authorities;
import com.dispatchflow.service.LoadService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loads")
@RequiredArgsConstructor
public class LoadController {

    private final LoadService loadService;

    @GetMapping
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<PageResponse<LoadResponse>> getAllLoads(
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) LoadStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String broker,
            @RequestParam(required = false) String driver,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(loadService.getAllLoads(driverId, status, search, broker, driver, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<LoadResponse> getLoadById(@PathVariable Long id) {
        return ResponseEntity.ok(loadService.getLoadById(id));
    }

    @PostMapping
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<LoadResponse> createLoad(@Valid @RequestBody LoadRequest request) {
        LoadResponse response = loadService.createLoad(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<LoadResponse> updateLoad(
            @PathVariable Long id,
            @Valid @RequestBody LoadRequest request) {
        return ResponseEntity.ok(loadService.updateLoad(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<LoadResponse> updateLoadStatus(
            @PathVariable Long id,
            @Valid @RequestBody LoadStatusUpdateRequest request) {
        return ResponseEntity.ok(loadService.updateLoadStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<Void> deleteLoad(@PathVariable Long id) {
        loadService.deleteLoad(id);
        return ResponseEntity.noContent().build();
    }
}
