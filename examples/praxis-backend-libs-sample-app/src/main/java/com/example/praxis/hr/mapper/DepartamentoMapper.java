package com.example.praxis.hr.mapper;

import com.example.praxis.hr.dto.DepartamentoDTO;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.entity.Funcionario;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
import java.util.List;

@Component
public class DepartamentoMapper {

    public Departamento toEntity(DepartamentoDTO dto) {
        if (dto == null) {
            return null;
        }
        Departamento entity = new Departamento();
        entity.setId(dto.getId()); // ID is mapped for updates
        entity.setNome(dto.getNome());
        entity.setCodigo(dto.getCodigo());
        if (dto.getResponsavelId() != null) {
            Funcionario responsavel = new Funcionario();
            responsavel.setId(dto.getResponsavelId());
            entity.setResponsavel(responsavel); // Service layer will resolve this to a managed entity
        } else {
            entity.setResponsavel(null);
        }
        return entity;
    }

    public DepartamentoDTO toDto(Departamento entity) {
        if (entity == null) {
            return null;
        }
        DepartamentoDTO dto = new DepartamentoDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setCodigo(entity.getCodigo());
        if (entity.getResponsavel() != null) {
            dto.setResponsavelId(entity.getResponsavel().getId());
        }
        return dto;
    }

    public List<DepartamentoDTO> toDtoList(List<Departamento> entityList) {
        if (entityList == null) {
            return null;
        }
        return entityList.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Departamento> toEntityList(List<DepartamentoDTO> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
