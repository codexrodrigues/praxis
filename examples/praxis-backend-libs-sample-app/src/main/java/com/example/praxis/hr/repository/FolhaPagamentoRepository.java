package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.FolhaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolhaPagamentoRepository extends JpaRepository<FolhaPagamento, Long> {
}
