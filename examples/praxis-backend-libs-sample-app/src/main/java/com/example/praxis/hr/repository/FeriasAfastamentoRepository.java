package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.FeriasAfastamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeriasAfastamentoRepository extends JpaRepository<FeriasAfastamento, Long> {
}
