package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.CargoDTO;
import com.example.praxis.hr.entity.Cargo;
import com.example.praxis.hr.repository.CargoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/cargos")
public class CargoController {

    @Autowired
    private CargoRepository cargoRepository;

    // DTO to Entity
    private Cargo toEntity(CargoDTO dto) {
        Cargo entity = new Cargo();
        // ID is typically not set from DTO for create, but needed for update
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setNome(dto.getNome());
        entity.setNivel(dto.getNivel());
        entity.setDescricao(dto.getDescricao());
        entity.setSalarioMinimo(dto.getSalarioMinimo());
        entity.setSalarioMaximo(dto.getSalarioMaximo());
        return entity;
    }

    // Entity to DTO
    private CargoDTO toDTO(Cargo entity) {
        CargoDTO dto = new CargoDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setNivel(entity.getNivel());
        dto.setDescricao(entity.getDescricao());
        dto.setSalarioMinimo(entity.getSalarioMinimo());
        dto.setSalarioMaximo(entity.getSalarioMaximo());
        return dto;
    }

    @PostMapping
    public ResponseEntity<CargoDTO> createCargo(@RequestBody CargoDTO cargoDTO) {
        Cargo cargo = toEntity(cargoDTO);
        // Ensure ID is not set for new entities to allow auto-generation
        cargo.setId(null); 
        Cargo savedCargo = cargoRepository.save(cargo);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedCargo));
    }

    @GetMapping
    public ResponseEntity<List<CargoDTO>> getAllCargos() {
        List<CargoDTO> cargos = cargoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cargos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CargoDTO> getCargoById(@PathVariable Long id) {
        Optional<Cargo> cargoOptional = cargoRepository.findById(id);
        return cargoOptional.map(cargo -> ResponseEntity.ok(toDTO(cargo)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CargoDTO> updateCargo(@PathVariable Long id, @RequestBody CargoDTO cargoDTO) {
        Optional<Cargo> cargoOptional = cargoRepository.findById(id);
        if (!cargoOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Cargo existingCargo = cargoOptional.get();
        existingCargo.setNome(cargoDTO.getNome());
        existingCargo.setNivel(cargoDTO.getNivel());
        existingCargo.setDescricao(cargoDTO.getDescricao());
        existingCargo.setSalarioMinimo(cargoDTO.getSalarioMinimo());
        existingCargo.setSalarioMaximo(cargoDTO.getSalarioMaximo());
        
        Cargo updatedCargo = cargoRepository.save(existingCargo);
        return ResponseEntity.ok(toDTO(updatedCargo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCargo(@PathVariable Long id) {
        if (!cargoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cargoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
