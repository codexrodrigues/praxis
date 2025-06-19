package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.DepartamentoFilterDTO;
import com.example.praxis.humanresources.entity.Departamento;
import com.example.praxis.humanresources.entity.Funcionario;
import com.example.praxis.humanresources.repository.DepartamentoRepository;
import com.example.praxis.humanresources.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.praxisplatform.uischema.service.base.BaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartamentoService implements BaseCrudService<Departamento, Long, DepartamentoFilterDTO> {

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository; // Needed to resolve responsavelId

    @Override
    public BaseCrudRepository<Departamento, Long> getRepository() {
        return departamentoRepository;
    }

    @Override
    public GenericSpecificationsBuilder<Departamento> getSpecificationsBuilder() {
        return new GenericSpecificationsBuilder<>();
    }

    @Override
    public Class<Departamento> getEntityClass() {
        return Departamento.class;
    }

    private void resolveRelations(Departamento departamento) {
        if (departamento.getResponsavel() != null && departamento.getResponsavel().getId() != null) {
            Funcionario responsavel = funcionarioRepository.findById(departamento.getResponsavel().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Funcionário responsável não encontrado com ID: " + departamento.getResponsavel().getId()));
            departamento.setResponsavel(responsavel);
        } else {
            departamento.setResponsavel(null); // Explicitly set to null if ID is not provided
        }
    }

    @Override
    @Transactional
    public Departamento save(Departamento departamento) {
        resolveRelations(departamento);
        return departamentoRepository.save(departamento);
    }

    @Override
    @Transactional
    public Departamento mergeUpdate(Departamento existing, Departamento payload) {
        existing.setNome(payload.getNome());
        existing.setCodigo(payload.getCodigo());

        // Set responsavel from payload for relation resolution
        existing.setResponsavel(payload.getResponsavel());
        resolveRelations(existing); // Resolve relations on the existing entity

        return existing; // The save will be called by the default update method in BaseCrudService
    }
}
