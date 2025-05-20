package org.praxisplatform.meta.ui.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.uifieldspec.controller.docs.OpenApiSchemaController;
import com.uifieldspec.extension.OpenApiSchemaResolver;
import org.praxisplatform.meta.ui.filter.spec.GenericSpecificationsBuilder;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@AutoConfiguration
public class PraxisAutoConfiguration {
    @Bean(name = "uiFieldSpecConfigurationRestTemplate")
    @ConditionalOnMissingBean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean(name = "uiFieldSpecConfigurationObjectMapper")
    @ConditionalOnMissingBean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    @Bean
    public OpenApiSchemaResolver modelResolver(ObjectMapper mapper) {
        return new OpenApiSchemaResolver(mapper);
    }

    @Bean(name = "uiFieldSpecConfigurationGenericSpecificationsBuilder")
    public <E> GenericSpecificationsBuilder<E> genericSpecificationsBuilder() {
        return new GenericSpecificationsBuilder<>();
    }

    @Bean
    public OpenApiSchemaController apiDocsController() {
        return new OpenApiSchemaController();
    }
}
