package com.example.praxis.uischema.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.uischema.dto.UiSchemaTestDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller que expõe os metadados do {@link UiSchemaTestDTO} para testes dos wrappers de UI.
 */
@RestController
@RequestMapping(ApiRouteDefinitions.UI_WRAPPERS_TEST_PATH)
@Tag(name = ApiRouteDefinitions.UI_WRAPPERS_TEST_TAG,
        description = "Endpoint para testar renderização de componentes UI")
public class UiSchemaTestController {

    /**
     * Retorna uma instância vazia de {@link UiSchemaTestDTO} apenas para expor o schema via OpenAPI.
     *
     * @return DTO com os metadados configurados
     */
    @GetMapping
    public UiSchemaTestDTO getSchema() {
        return new UiSchemaTestDTO();
    }
}

