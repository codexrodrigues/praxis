package com.example.praxis.humanresources.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.humanresources.dto.FolhaPagamentoDTO;
import com.example.praxis.humanresources.dto.FolhaPagamentoFilterDTO;
import com.example.praxis.humanresources.entity.FolhaPagamento;
import com.example.praxis.humanresources.mapper.FolhaPagamentoMapper;
import com.example.praxis.humanresources.service.FolhaPagamentoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.controller.base.AbstractCrudController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_PATH)
@Tag(name = ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_TAG, description = "Operations related to HR Folhas de Pagamento")
public class FolhaPagamentoController extends AbstractCrudController<FolhaPagamento, FolhaPagamentoDTO, Long, FolhaPagamentoFilterDTO> {

    @Autowired
    private FolhaPagamentoService folhaPagamentoService;

    @Autowired
    private FolhaPagamentoMapper folhaPagamentoMapper;

    @Override
    protected FolhaPagamentoService getService() {
        return folhaPagamentoService;
    }

    @Override
    protected FolhaPagamentoDTO toDto(FolhaPagamento entity) {
        return folhaPagamentoMapper.toDto(entity);
    }

    @Override
    protected FolhaPagamento toEntity(FolhaPagamentoDTO dto) {
        return folhaPagamentoMapper.toEntity(dto);
    }

    @Override
    protected Long getEntityId(FolhaPagamento entity) {
        return entity.getId();
    }

    @Override
    protected Long getDtoId(FolhaPagamentoDTO dto) {
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_PATH;
    }
}

