package com.example.praxis.humanresources.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.humanresources.dto.DependenteDTO;
import com.example.praxis.humanresources.dto.DependenteFilterDTO;
import com.example.praxis.humanresources.entity.Dependente;
import com.example.praxis.humanresources.mapper.DependenteMapper;
import com.example.praxis.humanresources.service.DependenteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_DEPENDENTES_PATH)
@Tag(name = ApiRouteDefinitions.HR_DEPENDENTES_TAG, description = "Operations related to HR Dependentes")
public class DependenteController extends AbstractCrudController<Dependente, DependenteDTO, Long, DependenteFilterDTO> {

    @Autowired
    private DependenteService dependenteService;

    @Autowired
    private DependenteMapper dependenteMapper;

    @Override
    protected DependenteService getService() {
        return dependenteService;
    }

    @Override
    protected DependenteDTO toDto(Dependente entity) {
        return dependenteMapper.toDto(entity);
    }

    @Override
    protected Dependente toEntity(DependenteDTO dto) {
        return dependenteMapper.toEntity(dto);
    }

    @Override
    protected Long getEntityId(Dependente entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(DependenteDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_DEPENDENTES_PATH;
    }
}
