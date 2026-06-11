package com.dispatchflow.repository;

import com.dispatchflow.entity.Load;
import com.dispatchflow.enums.LoadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadRepository extends JpaRepository<Load, Long> {

    Page<Load> findByDriverId(Long driverId, Pageable pageable);

    Page<Load> findByStatus(LoadStatus status, Pageable pageable);

    Page<Load> findByDriverIdAndStatus(Long driverId, LoadStatus status, Pageable pageable);
}
