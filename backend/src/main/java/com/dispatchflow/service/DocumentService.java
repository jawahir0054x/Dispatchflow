package com.dispatchflow.service;

import com.dispatchflow.dto.response.DocumentResponse;
import com.dispatchflow.entity.Load;
import com.dispatchflow.entity.LoadDocument;
import com.dispatchflow.enums.DocumentType;
import com.dispatchflow.exception.ResourceNotFoundException;
import com.dispatchflow.repository.LoadDocumentRepository;
import com.dispatchflow.repository.LoadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final LoadDocumentRepository documentRepository;
    private final LoadRepository loadRepository;
    private final DocumentStorageService storageService;
    private final LoadService loadService;

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByLoad(Long loadId, DocumentType documentType) {
        findLoadOrThrow(loadId);

        List<LoadDocument> documents = documentType == null
                ? documentRepository.findByLoadIdOrderByCreatedAtDesc(loadId)
                : documentRepository.findByLoadIdAndDocumentTypeOrderByCreatedAtDesc(loadId, documentType);

        return documents.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id) {
        return toResponse(findDocumentOrThrow(id));
    }

    @Transactional
    public DocumentResponse uploadDocument(Long loadId, DocumentType documentType, MultipartFile file) {
        Load load = findLoadOrThrow(loadId);

        try {
            String storedPath = storageService.store(file, loadId);

            LoadDocument document = LoadDocument.builder()
                    .load(load)
                    .documentType(documentType)
                    .originalFilename(file.getOriginalFilename())
                    .storedPath(storedPath)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();

            return toResponse(documentRepository.save(document));
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to store uploaded file");
        }
    }

    @Transactional(readOnly = true)
    public Resource getDocumentResource(Long id) {
        LoadDocument document = findDocumentOrThrow(id);
        return storageService.loadAsResource(document.getStoredPath());
    }

    @Transactional(readOnly = true)
    public LoadDocument findDocumentOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    @Transactional
    public void deleteDocument(Long id) {
        LoadDocument document = findDocumentOrThrow(id);
        try {
            storageService.delete(document.getStoredPath());
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to delete document file");
        }
        documentRepository.delete(document);
    }

    public DocumentResponse toResponse(LoadDocument document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .loadId(document.getLoad().getId())
                .loadNumber(loadService.toResponse(document.getLoad()).getLoadNumber())
                .documentType(document.getDocumentType())
                .originalFilename(document.getOriginalFilename())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    private Load findLoadOrThrow(Long loadId) {
        return loadRepository.findById(loadId)
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + loadId));
    }
}
