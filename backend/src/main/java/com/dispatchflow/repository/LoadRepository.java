package com.dispatchflow.repository;

import com.dispatchflow.entity.Load;
import com.dispatchflow.enums.LoadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface LoadRepository extends JpaRepository<Load, Long> {

    Page<Load> findByDriverId(Long driverId, Pageable pageable);

    boolean existsByDriverId(Long driverId);

    Page<Load> findByStatus(LoadStatus status, Pageable pageable);

    Page<Load> findByDriverIdAndStatus(Long driverId, LoadStatus status, Pageable pageable);

    Page<Load> findByStatusIn(Collection<LoadStatus> statuses, Pageable pageable);

    long countByStatus(LoadStatus status);

    @Query("SELECT l.status, COUNT(l) FROM Load l GROUP BY l.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT COALESCE(SUM(l.rate), 0) FROM Load l WHERE l.status = :status")
    BigDecimal sumRateByStatus(@Param("status") LoadStatus status);

    @Query("SELECT COALESCE(SUM(l.rate), 0) FROM Load l WHERE l.status <> 'AVAILABLE'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(l.miles), 0) FROM Load l WHERE l.status <> 'AVAILABLE'")
    long sumTotalMiles();

    @Query("SELECT COALESCE(SUM(l.deadheadMiles), 0) FROM Load l WHERE l.status <> 'AVAILABLE'")
    long sumDeadheadMiles();

    @Query("SELECT COALESCE(SUM(l.miles + l.deadheadMiles), 0) FROM Load l WHERE l.status <> 'AVAILABLE'")
    long sumTotalTripMiles();

    @Query("SELECT COALESCE(SUM(l.rate), 0) FROM Load l WHERE l.status IN ('DELIVERED', 'PAID')")
    BigDecimal sumDeliveredRevenue();

    @Query("SELECT COUNT(l) FROM Load l WHERE l.status IN ('DISPATCHED', 'IN_TRANSIT')")
    long countActiveLoads();

    @Query("SELECT COUNT(l) FROM Load l WHERE l.createdAt >= :since")
    long countLoadsSince(@Param("since") Instant since);

    @Query("""
            SELECT l FROM Load l
            LEFT JOIN l.driver d
            LEFT JOIN d.carrier c
            WHERE (:driverId IS NULL OR d.id = :driverId)
              AND (:status IS NULL OR l.status = :status)
              AND (:broker IS NULL OR LOWER(l.brokerName) LIKE LOWER(CONCAT('%', :broker, '%')))
              AND (:driver IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :driver, '%')))
            """)
    Page<Load> filterLoads(
            @Param("driverId") Long driverId,
            @Param("status") LoadStatus status,
            @Param("broker") String broker,
            @Param("driver") String driver,
            Pageable pageable);

    @Query("""
            SELECT l FROM Load l
            LEFT JOIN l.driver d
            LEFT JOIN d.carrier c
            WHERE (:driverId IS NULL OR d.id = :driverId)
              AND (:status IS NULL OR l.status = :status)
              AND (
                LOWER(l.brokerName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(l.pickupCity) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(l.deliveryCity) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(l.commodity) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(l.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Load> searchLoads(
            @Param("search") String search,
            @Param("driverId") Long driverId,
            @Param("status") LoadStatus status,
            Pageable pageable);
}
