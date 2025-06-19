package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.Departamento;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartamentoRepository extends BaseCrudRepository<Departamento, Long> {
    // Repository methods
}
