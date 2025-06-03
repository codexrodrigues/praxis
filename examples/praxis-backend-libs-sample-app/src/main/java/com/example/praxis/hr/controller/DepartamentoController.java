package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.DepartamentoDTO;
import com.example.praxis.hr.entity.Departamento;
import com.example.praxis.hr.mapper.DepartamentoMapper;
import com.example.praxis.hr.service.DepartamentoService;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/departamentos")
public class DepartamentoController extends AbstractCrudController<Departamento, DepartamentoDTO, Long> {

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
    protected Class<? extends AbstractCrudController<Departamento, DepartamentoDTO, Long>> getControllerClass() {
        return DepartamentoController.class;
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
        return "/api/hr/departamentos";
    }
}
