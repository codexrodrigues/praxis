package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.Funcionario;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends BaseCrudRepository<Funcionario, Long> {
}
