package com.example.praxis.humanresources.mapper;

import com.example.praxis.humanresources.dto.DependenteDTO;
import com.example.praxis.humanresources.entity.Dependente;
import com.example.praxis.humanresources.entity.Funcionario;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DependenteMapper {

    public Dependente toEntity(DependenteDTO dto) {
        if (dto == null) {
            return null;
        }
        Dependente entity = new Dependente();
        entity.setId(dto.getId());
        entity.setNomeCompleto(dto.getNomeCompleto());
        entity.setDataNascimento(dto.getDataNascimento());
        entity.setParentesco(dto.getParentesco());
        if (dto.getFuncionarioId() != null) {
            Funcionario funcionario = new Funcionario();
            funcionario.setId(dto.getFuncionarioId());
            entity.setFuncionario(funcionario);
        } else {
            entity.setFuncionario(null);
        }
        return entity;
    }

    public DependenteDTO toDto(Dependente entity) {
        if (entity == null) {
            return null;
        }
        DependenteDTO dto = new DependenteDTO();
        dto.setId(entity.getId());
        dto.setNomeCompleto(entity.getNomeCompleto());
        dto.setDataNascimento(entity.getDataNascimento());
        dto.setParentesco(entity.getParentesco());
        if (entity.getFuncionario() != null) {
            dto.setFuncionarioId(entity.getFuncionario().getId());
        }
        return dto;
    }

    public List<DependenteDTO> toDtoList(List<Dependente> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<Dependente> toEntityList(List<DependenteDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
