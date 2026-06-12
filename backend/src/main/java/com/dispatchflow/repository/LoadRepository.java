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

    Page<Load> findByStatus(LoadStatus status, Pageable pageable);

    Page<Load> findByDriverIdAndStatus(Long driverId, LoadStatus status, Pageable pageable);

    Page<Load> findByStatusIn(Collection<LoadStatus> statuses, Pageable pageable);

    long countByStatus(LoadStatus status);

    @Query("SELECT l.status, COUNT(l) FROM Load l GROUP BY l.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT COALESCE(SUM(l.rate), 0) FROM Load l WHERE l.status = :status")
    BigDecimal sumRateByStatus(@Param("status") LoadStatus status);

    @Query("SELECT COALESCE(SUM(l.rate), 0) FROM Load l WHERE l.status NOT IN ('CANCELLED')")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(l.miles), 0) FROM Load l WHERE l.status NOT IN ('CANCELLED')")
    long sumTotalMiles();

    @Query("SELECT COUNT(DISTINCT l.driver.id) FROM Load l WHERE l.status IN ('DISPATCHED', 'IN_TRANSIT')")
    long countActiveDrivers();

    @Query("SELECT COUNT(l) FROM Load l WHERE l.createdAt >= :since")
    long countLoadsSince(@Param("since") Instant since);
}
