package com.example.praxis.humanresources.repository;

import com.example.praxis.humanresources.entity.Dependente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DependenteRepository extends JpaRepository<Dependente, Long> {
}
