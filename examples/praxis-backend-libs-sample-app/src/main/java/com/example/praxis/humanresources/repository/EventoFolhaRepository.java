package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.EventoFolha;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoFolhaRepository extends BaseCrudRepository<EventoFolha, Long> {
}
