package com.example.praxis.hr.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.hr.dto.DepartamentoDTO;
import com.example.praxis.hr.dto.DepartamentoFilterDTO;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.mapper.DepartamentoMapper;
import com.example.praxis.hr.service.DepartamentoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_DEPARTAMENTOS_PATH)
@Tag(name = ApiRouteDefinitions.HR_DEPARTAMENTOS_TAG, description = "Operations related to HR Departamentos")
public class DepartamentoController extends AbstractCrudController<Departamento, com.example.praxis.hr.dto.DepartamentoDTO, com.example.praxis.hr.dto.DepartamentoFilterDTO, Long> {

    @Autowired
    private DepartamentoService departamentoService;

    @Autowired
    private DepartamentoMapper departamentoMapper;

    @Override
    protected DepartamentoService getService() {
        return departamentoService;
    }

    @Override
    protected DepartamentoDTO toDto(Departamento entity) {
        return departamentoMapper.toDto(entity);
    }

    @Override
    protected Departamento toEntity(DepartamentoDTO dto) {
        // The mapper creates an entity with responsavel_id set if present.
        // The DepartamentoService's save/update methods will handle fetching the actual Funcionario entity.
        return departamentoMapper.toEntity(dto);
    }


    @Override
    protected Long getEntityId(Departamento entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(DepartamentoDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_DEPARTAMENTOS_PATH;
    }
}
