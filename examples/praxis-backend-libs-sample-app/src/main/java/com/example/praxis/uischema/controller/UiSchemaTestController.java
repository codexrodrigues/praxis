package com.example.praxis.uischema.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.uischema.dto.UiSchemaTestDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

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

    /**
     * Redireciona para o endpoint global de schemas filtrados.
     *
     * @return resposta 302 com a localização do schema
     */
    @GetMapping("/schemas")
    public ResponseEntity<Void> redirectToSchema() {
        var location = UriComponentsBuilder.fromPath("/schemas/filtered")
                .queryParam("path", ApiRouteDefinitions.UI_WRAPPERS_TEST_PATH)
                .queryParam("operation", "get")
                .queryParam("schemaType", "response")
                .build()
                .toUri();
        return ResponseEntity.status(HttpStatus.FOUND).location(location).build();
    }
}
