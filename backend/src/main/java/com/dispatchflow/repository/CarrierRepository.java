package com.dispatchflow.repository;

import com.dispatchflow.entity.Carrier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrierRepository extends JpaRepository<Carrier, Long> {

    boolean existsByMcNumber(String mcNumber);

    boolean existsByDotNumber(String dotNumber);

    boolean existsByMcNumberAndIdNot(String mcNumber, Long id);

    boolean existsByDotNumberAndIdNot(String dotNumber, Long id);

    @Query("""
            SELECT c FROM Carrier c
            WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.mcNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.dotNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<Carrier> searchByTerm(@Param("search") String search, Pageable pageable);
}
