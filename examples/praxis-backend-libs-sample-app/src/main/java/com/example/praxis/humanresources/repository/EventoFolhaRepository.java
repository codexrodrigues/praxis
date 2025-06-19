package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.EventoFolha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoFolhaRepository extends JpaRepository<EventoFolha, Long> {
}
