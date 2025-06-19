package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.FeriasAfastamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeriasAfastamentoRepository extends JpaRepository<FeriasAfastamento, Long> {
}
