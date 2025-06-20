package com.example.praxis.humanresources.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.humanresources.dto.FeriasAfastamentoDTO;
import com.example.praxis.humanresources.dto.FeriasAfastamentoFilterDTO;
import com.example.praxis.humanresources.entity.FeriasAfastamento;
import com.example.praxis.humanresources.mapper.FeriasAfastamentoMapper;
import com.example.praxis.humanresources.service.FeriasAfastamentoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_PATH)
@Tag(name = ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_TAG, description = "Operations related to HR Ferias/Afastamentos")
public class FeriasAfastamentoController extends AbstractCrudController<FeriasAfastamento, FeriasAfastamentoDTO, Long, FeriasAfastamentoFilterDTO> {

    @Autowired
    private FeriasAfastamentoService feriasAfastamentoService;

    @Autowired
    private FeriasAfastamentoMapper feriasAfastamentoMapper;

    @Override
    protected FeriasAfastamentoService getService() {
        return feriasAfastamentoService;
    }

    @Override
    protected FeriasAfastamentoDTO toDto(FeriasAfastamento entity) {
        return feriasAfastamentoMapper.toDto(entity);
    }

    @Override
    protected FeriasAfastamento toEntity(FeriasAfastamentoDTO dto) {
        return feriasAfastamentoMapper.toEntity(dto);
    }

    @Override
    protected Long getEntityId(FeriasAfastamento entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(FeriasAfastamentoDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_PATH;
    }
}

