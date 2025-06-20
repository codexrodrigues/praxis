package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.FolhaPagamento;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolhaPagamentoRepository extends BaseCrudRepository<FolhaPagamento, Long> {
}
