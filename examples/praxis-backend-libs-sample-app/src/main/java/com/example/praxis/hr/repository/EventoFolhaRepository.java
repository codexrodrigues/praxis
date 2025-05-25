package com.example.praxis.hr.repository;

import com.example.praxis.hr.entity.EventoFolha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoFolhaRepository extends JpaRepository<EventoFolha, Long> {
}
