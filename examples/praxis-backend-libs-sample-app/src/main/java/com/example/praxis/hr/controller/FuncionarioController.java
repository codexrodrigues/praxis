package com.example.praxis.hr.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
    import com.example.praxis.hr.dto.FuncionarioDTO;
    import com.example.praxis.hr.dto.FuncionarioFilterDTO;
    import com.example.praxis.hr.entity.Funcionario;
    import com.example.praxis.hr.mapper.FuncionarioMapper;
    import com.example.praxis.hr.service.FuncionarioService;
    import io.swagger.v3.oas.annotations.tags.Tag;
    import org.praxisplatform.uischema.controller.base.AbstractCrudController;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping(ApiRouteDefinitions.HR_FUNCIONARIOS_PATH)
    @Tag(name = ApiRouteDefinitions.HR_FUNCIONARIOS_TAG, description = "Operations related to HR Funcionarios")
    public class FuncionarioController extends AbstractCrudController<Funcionario, FuncionarioDTO, FuncionarioFilterDTO, Long> {

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
        protected Long getEntityId(Funcionario entity) {
            return entity.getId();
        }

        @Override
        protected Long getDtoId(FuncionarioDTO dto) {
            return dto.getId();
        }

        @Override
        protected String getBasePath() {
            return ApiRouteDefinitions.HR_FUNCIONARIOS_PATH;
        }
    }
