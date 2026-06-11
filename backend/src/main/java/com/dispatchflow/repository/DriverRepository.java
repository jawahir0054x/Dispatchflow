package com.dispatchflow.repository;

import com.dispatchflow.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Page<Driver> findByCarrierId(Long carrierId, Pageable pageable);

    boolean existsByTruckNumberAndCarrierId(String truckNumber, Long carrierId);

    boolean existsByTruckNumberAndCarrierIdAndIdNot(String truckNumber, Long carrierId, Long id);
}
