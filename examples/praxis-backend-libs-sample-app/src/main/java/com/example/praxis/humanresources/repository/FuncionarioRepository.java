package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.Funcionario;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends BaseCrudRepository<Funcionario, Long> {
}
