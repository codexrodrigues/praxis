package com.example.praxis.humanresources.mapper;

import com.example.praxis.humanresources.dto.EventoFolhaDTO;
import com.example.praxis.humanresources.entity.EventoFolha;
import com.example.praxis.humanresources.entity.FolhaPagamento;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventoFolhaMapper {

    public EventoFolha toEntity(EventoFolhaDTO dto) {
        if (dto == null) {
            return null;
        }
        EventoFolha entity = new EventoFolha();
        entity.setId(dto.getId());
        if (dto.getFolhaPagamentoId() != null) {
            FolhaPagamento fp = new FolhaPagamento();
            fp.setId(dto.getFolhaPagamentoId());
            entity.setFolhaPagamento(fp);
        }
        entity.setDescricao(dto.getDescricao());
        entity.setTipo(dto.getTipo());
        entity.setValor(dto.getValor());
        return entity;
    }

    public EventoFolhaDTO toDto(EventoFolha entity) {
        if (entity == null) {
            return null;
        }
        EventoFolhaDTO dto = new EventoFolhaDTO();
        dto.setId(entity.getId());
        if (entity.getFolhaPagamento() != null) {
            dto.setFolhaPagamentoId(entity.getFolhaPagamento().getId());
        }
        dto.setDescricao(entity.getDescricao());
        dto.setTipo(entity.getTipo());
        dto.setValor(entity.getValor());
        return dto;
    }

    public List<EventoFolhaDTO> toDtoList(List<EventoFolha> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EventoFolha> toEntityList(List<EventoFolhaDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream().map(this::toEntity).collect(Collectors.toList());
    }
}

