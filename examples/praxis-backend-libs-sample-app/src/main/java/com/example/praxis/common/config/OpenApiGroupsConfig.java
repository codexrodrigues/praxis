package com.example.praxis.common.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
/**
 * Registers the OpenAPI groups for the sample application. The
 * {@code ApiDocsController} can automatically detect the correct group
 * for a request based on these definitions.
 */
public class OpenApiGroupsConfig {

    @Bean
    public GroupedOpenApi configureUsersDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.USERS_GROUP)
                .pathsToMatch(ApiRouteDefinitions.USERS_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrCargosDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_CARGOS_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_CARGOS_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrDepartamentosDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_DEPARTAMENTOS_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_DEPARTAMENTOS_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrFuncionariosDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_FUNCIONARIOS_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_FUNCIONARIOS_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrFolhasPagamentoDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_FOLHAS_PAGAMENTO_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrEventosFolhaDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_EVENTOS_FOLHA_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_EVENTOS_FOLHA_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrFeriasAfastamentosDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_FERIAS_AFASTAMENTOS_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureHrDependentesDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.HR_DEPENDENTES_GROUP)
                .pathsToMatch(ApiRouteDefinitions.HR_DEPENDENTES_PATH + "/**")
                .build();
    }

    @Bean
    public GroupedOpenApi configureUiWrappersTestDocumentation() {
        return GroupedOpenApi.builder()
                .group(ApiRouteDefinitions.UI_WRAPPERS_TEST_GROUP)
                .pathsToMatch(ApiRouteDefinitions.UI_WRAPPERS_TEST_PATH + "/**")
                .build();
    }
}
