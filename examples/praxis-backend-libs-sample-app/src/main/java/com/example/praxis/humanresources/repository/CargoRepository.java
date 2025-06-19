package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.Cargo;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends BaseCrudRepository<Cargo, Long> {
    // Repository methods
}
