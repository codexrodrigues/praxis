package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.Cargo;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends BaseCrudRepository<Cargo, Long> {
    // Repository methods
}
