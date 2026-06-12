package com.dispatchflow.dto.response;

import com.dispatchflow.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;
    private Long loadId;
    private String loadNumber;
    private DocumentType documentType;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private Instant createdAt;
    private Instant updatedAt;
}
