package com.example.praxis.hr.service;

import com.example.praxis.hr.dto.FuncionarioFilterDTO;
import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.entity.Endereco;
import com.example.praxis.hr.entity.Funcionario;
import com.example.praxis.hr.repository.CargoRepository;
import com.example.praxis.hr.repository.DepartamentoRepository;
import com.example.praxis.hr.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.repository.base.BaseCrudRepository;
import org.praxisplatform.uischema.service.base.BaseCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioService implements BaseCrudService<Funcionario, Long, FuncionarioFilterDTO> {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private CargoRepository cargoRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Override
    public BaseCrudRepository<Funcionario, Long> getRepository() {
        return funcionarioRepository;
    }

    @Override
    public GenericSpecificationsBuilder<Funcionario> getSpecificationsBuilder() {
        return new GenericSpecificationsBuilder<>();
    }

    /**
     * @return
     */
    @Override
    public Class<Funcionario> getEntityClass() {
        return Funcionario.class; // Changed from null
    }

    @Override
    public Funcionario mergeUpdate(Funcionario existingFuncionario, Funcionario funcionarioFromPayload) {
        existingFuncionario.setNomeCompleto(funcionarioFromPayload.getNomeCompleto());
        existingFuncionario.setCpf(funcionarioFromPayload.getCpf());
        existingFuncionario.setDataNascimento(funcionarioFromPayload.getDataNascimento());
        existingFuncionario.setEmail(funcionarioFromPayload.getEmail());
        existingFuncionario.setTelefone(funcionarioFromPayload.getTelefone());
        existingFuncionario.setSalario(funcionarioFromPayload.getSalario());
        existingFuncionario.setDataAdmissao(funcionarioFromPayload.getDataAdmissao());
        existingFuncionario.setAtivo(funcionarioFromPayload.isAtivo());

        // Handle Endereco
        if (funcionarioFromPayload.getEndereco() != null) {
            if (existingFuncionario.getEndereco() == null) {
                existingFuncionario.setEndereco(new Endereco());
            }
            Endereco existingEndereco = existingFuncionario.getEndereco();
            Endereco payloadEndereco = funcionarioFromPayload.getEndereco();
            existingEndereco.setLogradouro(payloadEndereco.getLogradouro());
            existingEndereco.setNumero(payloadEndereco.getNumero());
            existingEndereco.setComplemento(payloadEndereco.getComplemento());
            existingEndereco.setBairro(payloadEndereco.getBairro());
            existingEndereco.setCidade(payloadEndereco.getCidade());
            existingEndereco.setEstado(payloadEndereco.getEstado());
            existingEndereco.setCep(payloadEndereco.getCep());
        } else {
            existingFuncionario.setEndereco(null);
        }

        // Handle Cargo: Use Cargo from payload, assuming it's fetched by ID in toEntity or needs to be managed by JPA
        if (funcionarioFromPayload.getCargo() != null && funcionarioFromPayload.getCargo().getId() != null) {
            Cargo cargo = cargoRepository.findById(funcionarioFromPayload.getCargo().getId())
                .orElseThrow(() -> new EntityNotFoundException("Cargo not found with ID: " + funcionarioFromPayload.getCargo().getId()));
            existingFuncionario.setCargo(cargo);
        } else {
            existingFuncionario.setCargo(null);
        }

        // Handle Departamento: Use Departamento from payload
        if (funcionarioFromPayload.getDepartamento() != null && funcionarioFromPayload.getDepartamento().getId() != null) {
            Departamento departamento = departamentoRepository.findById(funcionarioFromPayload.getDepartamento().getId())
                .orElseThrow(() -> new EntityNotFoundException("Departamento not found with ID: " + funcionarioFromPayload.getDepartamento().getId()));
            existingFuncionario.setDepartamento(departamento);
        } else {
            existingFuncionario.setDepartamento(null);
        }

        return existingFuncionario;
    }

    @Override
    public Funcionario save(Funcionario funcionario) {
        // Ensure Cargo is managed and fetched
        if (funcionario.getCargo() != null && funcionario.getCargo().getId() != null) {
            Cargo cargo = cargoRepository.findById(funcionario.getCargo().getId())
                .orElseThrow(() -> new EntityNotFoundException("Cargo not found with ID: " + funcionario.getCargo().getId()));
            funcionario.setCargo(cargo);
        } else if (funcionario.getCargo() != null && funcionario.getCargo().getId() == null) {
            // If Cargo is new and needs to be persisted first, or handle as an error
            // For simplicity, assuming Cargo must exist if provided.
            // Or, if it's a new Cargo, it should be saved separately or cascaded.
            // Given the DTO structure (CargoId), Cargo should always be looked up.
             funcionario.setCargo(null); // Or throw validation error
        }


        // Ensure Departamento is managed and fetched
        if (funcionario.getDepartamento() != null && funcionario.getDepartamento().getId() != null) {
            Departamento departamento = departamentoRepository.findById(funcionario.getDepartamento().getId())
                .orElseThrow(() -> new EntityNotFoundException("Departamento not found with ID: " + funcionario.getDepartamento().getId()));
            funcionario.setDepartamento(departamento);
        } else if (funcionario.getDepartamento() != null && funcionario.getDepartamento().getId() == null) {
            // Similar handling for Departamento as for Cargo
            funcionario.setDepartamento(null); // Or throw validation error
        }

        // Endereco is embedded, so it will be handled by cascading if configured, or direct save.

        return funcionarioRepository.save(funcionario);
    }
}
