package com.dispatchflow.repository;

import com.dispatchflow.entity.Driver;
import com.dispatchflow.enums.DriverStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Page<Driver> findByCarrierId(Long carrierId, Pageable pageable);

    boolean existsByTruckNumberAndCarrierId(String truckNumber, Long carrierId);

    boolean existsByTruckNumberAndCarrierIdAndIdNot(String truckNumber, Long carrierId, Long id);

    boolean existsByCarrierId(Long carrierId);

    long countByStatus(DriverStatus status);

    @Query("""
            SELECT d FROM Driver d
            WHERE (:carrierId IS NULL OR d.carrier.id = :carrierId)
              AND (
                LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(d.phone) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(d.truckNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(d.currentLocation) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(d.carrier.name) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Driver> searchByTerm(@Param("search") String search, @Param("carrierId") Long carrierId, Pageable pageable);
}
