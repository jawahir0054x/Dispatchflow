package com.dispatchflow.repository;

import com.dispatchflow.entity.LoadDocument;
import com.dispatchflow.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoadDocumentRepository extends JpaRepository<LoadDocument, Long> {

    List<LoadDocument> findByLoadIdOrderByCreatedAtDesc(Long loadId);

    List<LoadDocument> findByLoadIdAndDocumentTypeOrderByCreatedAtDesc(Long loadId, DocumentType documentType);
}
