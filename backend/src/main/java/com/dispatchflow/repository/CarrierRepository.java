package com.dispatchflow.repository;

import com.dispatchflow.entity.Carrier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrierRepository extends JpaRepository<Carrier, Long> {

    boolean existsByMcNumber(String mcNumber);

    boolean existsByDotNumber(String dotNumber);

    boolean existsByMcNumberAndIdNot(String mcNumber, Long id);

    boolean existsByDotNumberAndIdNot(String dotNumber, Long id);
}
