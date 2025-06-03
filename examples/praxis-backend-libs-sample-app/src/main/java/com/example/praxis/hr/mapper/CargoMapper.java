package com.example.praxis.hr.mapper;

import com.example.praxis.hr.dto.CargoDTO;
import com.example.praxis.hr.entity.Cargo;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
import java.util.List;

@Component
public class CargoMapper {

    public Cargo toEntity(CargoDTO dto) {
        if (dto == null) {
            return null;
        }
        Cargo entity = new Cargo();
        entity.setId(dto.getId()); // ID is mapped for updates
        entity.setNome(dto.getNome());
        entity.setNivel(dto.getNivel());
        entity.setDescricao(dto.getDescricao());
        entity.setSalarioMinimo(dto.getSalarioMinimo());
        entity.setSalarioMaximo(dto.getSalarioMaximo());
        return entity;
    }

    public CargoDTO toDto(Cargo entity) {
        if (entity == null) {
            return null;
        }
        CargoDTO dto = new CargoDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setNivel(entity.getNivel());
        dto.setDescricao(entity.getDescricao());
        dto.setSalarioMinimo(entity.getSalarioMinimo());
        dto.setSalarioMaximo(entity.getSalarioMaximo());
        return dto;
    }

    public List<CargoDTO> toDtoList(List<Cargo> entityList) {
        if (entityList == null) {
            return null;
        }
        return entityList.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Cargo> toEntityList(List<CargoDTO> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
