package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.Funcionario;
import org.praxisplatform.meta.ui.data.repository.PraxisCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends PraxisCrudRepository<Funcionario, Long> {
}
