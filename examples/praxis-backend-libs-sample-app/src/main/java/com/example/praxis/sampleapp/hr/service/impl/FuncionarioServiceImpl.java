package com.example.praxis.sampleapp.hr.service.impl;

import com.example.praxis.sampleapp.hr.model.Funcionario;
import com.example.praxis.sampleapp.hr.repository.FuncionarioRepository;
import com.example.praxis.sampleapp.hr.service.FuncionarioService;
import org.praxisplatform.meta.ui.filter.dto.GenericFilterDTO;
import org.praxisplatform.meta.ui.data.exception.ResourceNotFoundException; // Assuming this exists
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
// import java.util.Optional; // No longer returning Optional for findById

@Service
public class FuncionarioServiceImpl implements FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;

    public FuncionarioServiceImpl(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    @Override
    public Funcionario findById(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado com ID: " + id));
    }

    @Override
    public List<Funcionario> findAll() {
        return funcionarioRepository.findAll();
    }

    @Override
    public Page<Funcionario> findAll(Pageable pageable) {
        return funcionarioRepository.findAll(pageable);
    }
    
    @Override
    public Funcionario save(Funcionario entity) {
        // In a real app, if Cargo/Departamento are part of Funcionario and fetched by ID by mapper,
        // ensure they are managed entities before saving. For now, direct save.
        return funcionarioRepository.save(entity);
    }

    @Override
    public Funcionario update(Long id, Funcionario entity) {
        if (!funcionarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Funcionário não encontrado com ID: " + id + " para atualização.");
        }
        entity.setId(id); // Ensure ID is set for update
        return funcionarioRepository.save(entity);
    }

    @Override
    public void deleteById(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Funcionário não encontrado com ID: " + id + " para exclusão.");
        }
        funcionarioRepository.deleteById(id);
    }

    @Override
    public Page<Funcionario> filter(GenericFilterDTO filter, Pageable pageable) {
        // Basic implementation: Ignores filter criteria and returns all.
        // TODO: Implement dynamic specification-based filtering using filter object
        // For now, this fulfills the PraxisCrudService contract.
        return funcionarioRepository.findAll(pageable);
    }
}
