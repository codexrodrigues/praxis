package com.example.praxis.humanresources.service;

import com.example.praxis.humanresources.dto.DependenteDTO;
import com.example.praxis.humanresources.dto.DependenteFilterDTO;
import com.example.praxis.humanresources.entity.Dependente;
import com.example.praxis.humanresources.entity.Funcionario;
import com.example.praxis.humanresources.repository.DependenteRepository;
import com.example.praxis.humanresources.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.service.base.AbstractBaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DependenteService extends AbstractBaseCrudService<Dependente, DependenteDTO, Long, DependenteFilterDTO> {

    private final DependenteRepository dependenteRepository;
    private final FuncionarioRepository funcionarioRepository;

    @Autowired
    public DependenteService(DependenteRepository dependenteRepository,
                             FuncionarioRepository funcionarioRepository) {
        super(dependenteRepository, Dependente.class);
        this.dependenteRepository = dependenteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    private void resolveRelations(Dependente dependente) {
        if (dependente.getFuncionario() != null && dependente.getFuncionario().getId() != null) {
            Funcionario funcionario = funcionarioRepository.findById(dependente.getFuncionario().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Funcionario nao encontrado com ID: " + dependente.getFuncionario().getId()));
            dependente.setFuncionario(funcionario);
        } else {
            dependente.setFuncionario(null);
        }
    }

    @Override
    @Transactional
    public Dependente save(Dependente dependente) {
        resolveRelations(dependente);
        return dependenteRepository.save(dependente);
    }

    @Override
    @Transactional
    public Dependente mergeUpdate(Dependente existing, Dependente payload) {
        existing.setNomeCompleto(payload.getNomeCompleto());
        existing.setDataNascimento(payload.getDataNascimento());
        existing.setParentesco(payload.getParentesco());
        existing.setFuncionario(payload.getFuncionario());
        resolveRelations(existing);
        return existing;
    }
}
