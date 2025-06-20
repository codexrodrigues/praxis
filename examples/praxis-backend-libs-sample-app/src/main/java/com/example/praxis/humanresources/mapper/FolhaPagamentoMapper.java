package com.example.praxis.humanresources.mapper;

import com.example.praxis.humanresources.dto.FolhaPagamentoDTO;
import com.example.praxis.humanresources.entity.FolhaPagamento;
import com.example.praxis.humanresources.entity.Funcionario;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FolhaPagamentoMapper {

    public FolhaPagamento toEntity(FolhaPagamentoDTO dto) {
        if (dto == null) {
            return null;
        }
        FolhaPagamento entity = new FolhaPagamento();
        entity.setId(dto.getId());
        if (dto.getFuncionarioId() != null) {
            Funcionario f = new Funcionario();
            f.setId(dto.getFuncionarioId());
            entity.setFuncionario(f);
        }
        entity.setAno(dto.getAno());
        entity.setMes(dto.getMes());
        entity.setSalarioBruto(dto.getSalarioBruto());
        entity.setTotalDescontos(dto.getTotalDescontos());
        entity.setSalarioLiquido(dto.getSalarioLiquido());
        entity.setDataPagamento(dto.getDataPagamento());
        return entity;
    }

    public FolhaPagamentoDTO toDto(FolhaPagamento entity) {
        if (entity == null) {
            return null;
        }
        FolhaPagamentoDTO dto = new FolhaPagamentoDTO();
        dto.setId(entity.getId());
        if (entity.getFuncionario() != null) {
            dto.setFuncionarioId(entity.getFuncionario().getId());
        }
        dto.setAno(entity.getAno());
        dto.setMes(entity.getMes());
        dto.setSalarioBruto(entity.getSalarioBruto());
        dto.setTotalDescontos(entity.getTotalDescontos());
        dto.setSalarioLiquido(entity.getSalarioLiquido());
        dto.setDataPagamento(entity.getDataPagamento());
        return dto;
    }

    public List<FolhaPagamentoDTO> toDtoList(List<FolhaPagamento> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<FolhaPagamento> toEntityList(List<FolhaPagamentoDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}

