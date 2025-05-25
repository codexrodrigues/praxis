package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.DepartamentoDTO;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.entity.Funcionario;
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
@RequestMapping("/api/hr/departamentos")
public class DepartamentoController {

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // DTO to Entity
    private Departamento toEntity(DepartamentoDTO dto) {
        Departamento entity = new Departamento();
        // ID is typically not set from DTO for create, but needed for update
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setNome(dto.getNome());
        entity.setCodigo(dto.getCodigo());
        if (dto.getResponsavelId() != null) {
            funcionarioRepository.findById(dto.getResponsavelId()).ifPresent(entity::setResponsavel);
        }
        return entity;
    }

    // Entity to DTO
    private DepartamentoDTO toDTO(Departamento entity) {
        DepartamentoDTO dto = new DepartamentoDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setCodigo(entity.getCodigo());
        if (entity.getResponsavel() != null) {
            dto.setResponsavelId(entity.getResponsavel().getId());
        }
        return dto;
    }

    @PostMapping
    public ResponseEntity<DepartamentoDTO> createDepartamento(@RequestBody DepartamentoDTO departamentoDTO) {
        Departamento departamento = toEntity(departamentoDTO);
        // Ensure ID is not set for new entities to allow auto-generation
        departamento.setId(null);
        Departamento savedDepartamento = departamentoRepository.save(departamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedDepartamento));
    }

    @GetMapping
    public ResponseEntity<List<DepartamentoDTO>> getAllDepartamentos() {
        List<DepartamentoDTO> departamentos = departamentoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(departamentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoDTO> getDepartamentoById(@PathVariable Long id) {
        Optional<Departamento> departamentoOptional = departamentoRepository.findById(id);
        return departamentoOptional.map(departamento -> ResponseEntity.ok(toDTO(departamento)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartamentoDTO> updateDepartamento(@PathVariable Long id, @RequestBody DepartamentoDTO departamentoDTO) {
        Optional<Departamento> departamentoOptional = departamentoRepository.findById(id);
        if (!departamentoOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Departamento existingDepartamento = departamentoOptional.get();
        existingDepartamento.setNome(departamentoDTO.getNome());
        existingDepartamento.setCodigo(departamentoDTO.getCodigo());
        if (departamentoDTO.getResponsavelId() != null) {
            funcionarioRepository.findById(departamentoDTO.getResponsavelId()).ifPresent(existingDepartamento::setResponsavel);
        } else {
            existingDepartamento.setResponsavel(null);
        }
        
        Departamento updatedDepartamento = departamentoRepository.save(existingDepartamento);
        return ResponseEntity.ok(toDTO(updatedDepartamento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartamento(@PathVariable Long id) {
        if (!departamentoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        departamentoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
