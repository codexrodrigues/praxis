package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.Dependente;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DependenteRepository extends BaseCrudRepository<Dependente, Long> {
}
