package com.example.praxis.sampleapp.hr.repository;

import com.example.praxis.sampleapp.hr.model.Funcionario;
import org.praxisplatform.meta.ui.data.repository.PraxisCrudRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long>, PraxisCrudRepository<Funcionario, Long> {
}
