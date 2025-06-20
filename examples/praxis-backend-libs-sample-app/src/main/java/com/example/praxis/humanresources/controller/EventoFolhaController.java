package com.example.praxis.humanresources.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.humanresources.dto.EventoFolhaDTO;
import com.example.praxis.humanresources.dto.EventoFolhaFilterDTO;
import com.example.praxis.humanresources.entity.EventoFolha;
import com.example.praxis.humanresources.mapper.EventoFolhaMapper;
import com.example.praxis.humanresources.service.EventoFolhaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_EVENTOS_FOLHA_PATH)
@Tag(name = ApiRouteDefinitions.HR_EVENTOS_FOLHA_TAG, description = "Operations related to HR Eventos de Folha")
public class EventoFolhaController extends AbstractCrudController<EventoFolha, EventoFolhaDTO, EventoFolhaFilterDTO, Long> {

    @Autowired
    private EventoFolhaService eventoFolhaService;

    @Autowired
    private EventoFolhaMapper eventoFolhaMapper;

    @Override
    protected EventoFolhaService getService() {
        return eventoFolhaService;
    }

    @Override
    protected EventoFolhaDTO toDto(EventoFolha entity) {
        return eventoFolhaMapper.toDto(entity);
    }

    @Override
    protected EventoFolha toEntity(EventoFolhaDTO dto) {
        return eventoFolhaMapper.toEntity(dto);
    }

    @Override
    protected Long getEntityId(EventoFolha entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(EventoFolhaDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_EVENTOS_FOLHA_PATH;
    }
}

