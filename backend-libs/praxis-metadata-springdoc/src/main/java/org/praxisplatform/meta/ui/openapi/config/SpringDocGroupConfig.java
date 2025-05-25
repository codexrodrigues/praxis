package org.praxisplatform.meta.ui.openapi.config;

import org.praxisplatform.meta.ui.openapi.constants.ApiEndpoints;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocGroupConfig {

    @Bean
    public GroupedOpenApi hrApi() {
        return GroupedOpenApi.builder()
                .group(ApiEndpoints.HR_GROUP)
                .pathsToMatch(ApiEndpoints.HR_PATH_PATTERN)
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group(ApiEndpoints.USER_GROUP)
                .pathsToMatch(ApiEndpoints.USER_PATH_PATTERN)
                .build();
    }

    // Add more @Bean methods here for other groups as needed
}
