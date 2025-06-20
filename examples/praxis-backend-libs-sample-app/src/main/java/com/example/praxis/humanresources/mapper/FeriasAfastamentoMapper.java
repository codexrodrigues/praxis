package com.example.praxis.humanresources.mapper;

import com.example.praxis.humanresources.dto.FeriasAfastamentoDTO;
import com.example.praxis.humanresources.entity.FeriasAfastamento;
import com.example.praxis.humanresources.entity.Funcionario;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FeriasAfastamentoMapper {

    public FeriasAfastamento toEntity(FeriasAfastamentoDTO dto) {
        if (dto == null) {
            return null;
        }
        FeriasAfastamento entity = new FeriasAfastamento();
        entity.setId(dto.getId());
        if (dto.getFuncionarioId() != null) {
            Funcionario f = new Funcionario();
            f.setId(dto.getFuncionarioId());
            entity.setFuncionario(f);
        }
        entity.setTipo(dto.getTipo());
        entity.setDataInicio(dto.getDataInicio());
        entity.setDataFim(dto.getDataFim());
        entity.setObservacoes(dto.getObservacoes());
        return entity;
    }

    public FeriasAfastamentoDTO toDto(FeriasAfastamento entity) {
        if (entity == null) {
            return null;
        }
        FeriasAfastamentoDTO dto = new FeriasAfastamentoDTO();
        dto.setId(entity.getId());
        if (entity.getFuncionario() != null) {
            dto.setFuncionarioId(entity.getFuncionario().getId());
        }
        dto.setTipo(entity.getTipo());
        dto.setDataInicio(entity.getDataInicio());
        dto.setDataFim(entity.getDataFim());
        dto.setObservacoes(entity.getObservacoes());
        return dto;
    }

    public List<FeriasAfastamentoDTO> toDtoList(List<FeriasAfastamento> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<FeriasAfastamento> toEntityList(List<FeriasAfastamentoDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}

