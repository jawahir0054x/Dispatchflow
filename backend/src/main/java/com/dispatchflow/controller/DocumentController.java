package com.dispatchflow.controller;

import com.dispatchflow.dto.response.DocumentResponse;
import com.dispatchflow.enums.DocumentType;
import com.dispatchflow.security.Authorities;
import com.dispatchflow.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @RequestParam Long loadId,
            @RequestParam(required = false) DocumentType documentType) {
        return ResponseEntity.ok(documentService.getDocumentsByLoad(loadId, documentType));
    }

    @GetMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam Long loadId,
            @RequestParam DocumentType documentType,
            @RequestPart("file") MultipartFile file) {
        DocumentResponse response = documentService.uploadDocument(loadId, documentType, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        return buildFileResponse(id, "attachment");
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<Resource> previewDocument(@PathVariable Long id) {
        return buildFileResponse(id, "inline");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(Authorities.HAS_ADMIN_OR_DISPATCHER)
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<Resource> buildFileResponse(Long id, String dispositionType) {
        DocumentResponse metadata = documentService.getDocumentById(id);
        Resource resource = documentService.getDocumentResource(id);
        String encodedFilename = URLEncoder.encode(metadata.getOriginalFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        dispositionType + "; filename=\"" + metadata.getOriginalFilename()
                                + "\"; filename*=UTF-8''" + encodedFilename)
                .body(resource);
    }
}
