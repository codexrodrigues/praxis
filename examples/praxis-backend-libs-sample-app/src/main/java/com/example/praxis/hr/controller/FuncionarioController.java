package com.example.praxis.hr.controller;

import com.example.praxis.hr.dto.FuncionarioDTO;
import com.example.praxis.hr.entity.Funcionario;
import com.example.praxis.hr.mapper.FuncionarioMapper;
import com.example.praxis.hr.service.FuncionarioService;
import org.praxisplatform.meta.ui.web.controller.AbstractPraxisCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/hr/funcionarios")
public class FuncionarioController extends AbstractPraxisCrudController<Funcionario, FuncionarioDTO, Long> {

    @Autowired
    private FuncionarioService funcionarioService;

    @Autowired
    private FuncionarioMapper funcionarioMapper;

    @Override
    protected Funcionario toEntity(FuncionarioDTO dto) {
        return funcionarioMapper.toEntity(dto);
    }

    @Override
    protected FuncionarioDTO toDto(Funcionario entity) {
        return funcionarioMapper.toDto(entity);
    }

    @Override
    protected FuncionarioService getService() {
        return funcionarioService;
    }

    @Override
    protected Class<? extends AbstractPraxisCrudController<Funcionario, FuncionarioDTO, Long>> getControllerClass() {
        return FuncionarioController.class;
    }

    @Override
    protected Long getEntityId(Funcionario entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(FuncionarioDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return "/api/hr/funcionarios";
    }

    // Old CRUD methods are removed as their functionality is provided by AbstractPraxisCrudController
}
