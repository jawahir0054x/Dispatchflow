package com.dispatchflow.service;

import com.dispatchflow.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/tiff"
    );

    private final Path storageRoot;

    public DocumentStorageService(@Value("${app.documents.storage-path:uploads}") String storagePath) {
        this.storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Allowed: PDF, JPEG, PNG, GIF, WEBP, TIFF");
        }
    }

    public String store(MultipartFile file, Long loadId) throws IOException {
        validateFile(file);

        Path loadDir = storageRoot.resolve("loads").resolve(String.valueOf(loadId));
        Files.createDirectories(loadDir);

        String sanitized = sanitizeFilename(file.getOriginalFilename());
        String storedFilename = UUID.randomUUID() + "_" + sanitized;
        Path target = loadDir.resolve(storedFilename).normalize();

        if (!target.startsWith(loadDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return Paths.get("loads", String.valueOf(loadId), storedFilename).toString().replace('\\', '/');
    }

    public Resource loadAsResource(String storedPath) {
        try {
            Path file = storageRoot.resolve(storedPath).normalize();
            if (!file.startsWith(storageRoot)) {
                throw new ResourceNotFoundException("Document file not found");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Document file not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Document file not found");
        }
    }

    public void delete(String storedPath) throws IOException {
        Path file = storageRoot.resolve(storedPath).normalize();
        if (file.startsWith(storageRoot)) {
            Files.deleteIfExists(file);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "document";
        }
        String name = Paths.get(filename).getFileName().toString();
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
