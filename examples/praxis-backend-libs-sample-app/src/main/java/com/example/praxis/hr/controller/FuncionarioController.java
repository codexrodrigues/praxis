package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.EnderecoDTO;
import com.example.praxis.hr.dto.FuncionarioDTO;
import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.entity.Endereco;
import com.example.praxis.hr.entity.Funcionario;
import com.example.praxis.hr.repository.CargoRepository;
import com.example.praxis.hr.repository.DepartamentoRepository;
import com.example.praxis.hr.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private CargoRepository cargoRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    // DTO to Entity Converters
    private Endereco toEntity(EnderecoDTO dto) {
        if (dto == null) return null;
        Endereco entity = new Endereco();
        entity.setLogradouro(dto.getLogradouro());
        entity.setNumero(dto.getNumero());
        entity.setComplemento(dto.getComplemento());
        entity.setBairro(dto.getBairro());
        entity.setCidade(dto.getCidade());
        entity.setEstado(dto.getEstado());
        entity.setCep(dto.getCep());
        return entity;
    }

    private Funcionario toEntity(FuncionarioDTO dto) {
        Funcionario entity = new Funcionario();
        entity.setNomeCompleto(dto.getNomeCompleto());
        entity.setCpf(dto.getCpf());
        entity.setDataNascimento(dto.getDataNascimento());
        entity.setEmail(dto.getEmail());
        entity.setTelefone(dto.getTelefone());
        entity.setSalario(dto.getSalario());
        entity.setDataAdmissao(dto.getDataAdmissao());
        entity.setAtivo(dto.isAtivo());
        entity.setEndereco(toEntity(dto.getEndereco()));

        if (dto.getCargoId() != null) {
            cargoRepository.findById(dto.getCargoId()).ifPresent(entity::setCargo);
        }
        if (dto.getDepartamentoId() != null) {
            departamentoRepository.findById(dto.getDepartamentoId()).ifPresent(entity::setDepartamento);
        }
        return entity;
    }

    // Entity to DTO Converters
    private EnderecoDTO toDTO(Endereco entity) {
        if (entity == null) return null;
        EnderecoDTO dto = new EnderecoDTO();
        dto.setLogradouro(entity.getLogradouro());
        dto.setNumero(entity.getNumero());
        dto.setComplemento(entity.getComplemento());
        dto.setBairro(entity.getBairro());
        dto.setCidade(entity.getCidade());
        dto.setEstado(entity.getEstado());
        dto.setCep(entity.getCep());
        return dto;
    }

    private FuncionarioDTO toDTO(Funcionario entity) {
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setNomeCompleto(entity.getNomeCompleto());
        dto.setCpf(entity.getCpf());
        dto.setDataNascimento(entity.getDataNascimento());
        dto.setEmail(entity.getEmail());
        dto.setTelefone(entity.getTelefone());
        if (entity.getCargo() != null) {
            dto.setCargoId(entity.getCargo().getId());
        }
        if (entity.getDepartamento() != null) {
            dto.setDepartamentoId(entity.getDepartamento().getId());
        }
        dto.setSalario(entity.getSalario());
        dto.setDataAdmissao(entity.getDataAdmissao());
        dto.setEndereco(toDTO(entity.getEndereco()));
        dto.setAtivo(entity.isAtivo());
        return dto;
    }

    @PostMapping
    public ResponseEntity<FuncionarioDTO> createFuncionario(@RequestBody FuncionarioDTO funcionarioDTO) {
        Funcionario funcionario = toEntity(funcionarioDTO);
        Funcionario savedFuncionario = funcionarioRepository.save(funcionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedFuncionario));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioDTO>> getAllFuncionarios() {
        List<FuncionarioDTO> funcionarios = funcionarioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioDTO> getFuncionarioById(@PathVariable Long id) {
        Optional<Funcionario> funcionarioOptional = funcionarioRepository.findById(id);
        return funcionarioOptional.map(funcionario -> ResponseEntity.ok(toDTO(funcionario)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioDTO> updateFuncionario(@PathVariable Long id, @RequestBody FuncionarioDTO funcionarioDTO) {
        Optional<Funcionario> funcionarioOptional = funcionarioRepository.findById(id);
        if (!funcionarioOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Funcionario existingFuncionario = funcionarioOptional.get();
        existingFuncionario.setNomeCompleto(funcionarioDTO.getNomeCompleto());
        existingFuncionario.setCpf(funcionarioDTO.getCpf());
        existingFuncionario.setDataNascimento(funcionarioDTO.getDataNascimento());
        existingFuncionario.setEmail(funcionarioDTO.getEmail());
        existingFuncionario.setTelefone(funcionarioDTO.getTelefone());
        existingFuncionario.setSalario(funcionarioDTO.getSalario());
        existingFuncionario.setDataAdmissao(funcionarioDTO.getDataAdmissao());
        existingFuncionario.setAtivo(funcionarioDTO.isAtivo());
        existingFuncionario.setEndereco(toEntity(funcionarioDTO.getEndereco()));

        if (funcionarioDTO.getCargoId() != null) {
            cargoRepository.findById(funcionarioDTO.getCargoId()).ifPresent(existingFuncionario::setCargo);
        } else {
            existingFuncionario.setCargo(null);
        }
        if (funcionarioDTO.getDepartamentoId() != null) {
            departamentoRepository.findById(funcionarioDTO.getDepartamentoId()).ifPresent(existingFuncionario::setDepartamento);
        } else {
            existingFuncionario.setDepartamento(null);
        }

        Funcionario updatedFuncionario = funcionarioRepository.save(existingFuncionario);
        return ResponseEntity.ok(toDTO(updatedFuncionario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuncionario(@PathVariable Long id) {
        if (!funcionarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        funcionarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
