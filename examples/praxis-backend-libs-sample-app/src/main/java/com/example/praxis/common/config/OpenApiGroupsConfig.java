package com.example.praxis.common.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
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
}
