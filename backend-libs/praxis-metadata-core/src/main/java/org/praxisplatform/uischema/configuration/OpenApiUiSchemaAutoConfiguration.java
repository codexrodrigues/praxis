package org.praxisplatform.uischema.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.praxisplatform.uischema.controller.docs.ApiDocsController;
import org.praxisplatform.uischema.extension.CustomOpenApiResolver;
import org.praxisplatform.uischema.filter.specification.GenericSpecificationsBuilder;
import org.praxisplatform.uischema.util.OpenApiGroupResolver;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springdoc.core.models.GroupedOpenApi;

@AutoConfiguration
public class OpenApiUiSchemaAutoConfiguration {
    @Bean(name = "openApiUiSchemaRestTemplate")
    @ConditionalOnMissingBean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean(name = "openApiUiSchemaObjectMapper")
    @ConditionalOnMissingBean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    @Bean
    public CustomOpenApiResolver modelResolver(ObjectMapper mapper) {
        return new CustomOpenApiResolver(mapper);
    }

    @Bean(name = "openApiUiSchemaSpecificationsBuilder")
    public <E> GenericSpecificationsBuilder<E> genericSpecificationsBuilder() {
        return new GenericSpecificationsBuilder<>();
    }

    @Bean
    public OpenApiGroupResolver openApiGroupResolver(List<GroupedOpenApi> groupedOpenApis) {
        return new OpenApiGroupResolver(groupedOpenApis);
    }

    @Bean
    public ApiDocsController apiDocsController() {
        return new ApiDocsController();
    }
}
