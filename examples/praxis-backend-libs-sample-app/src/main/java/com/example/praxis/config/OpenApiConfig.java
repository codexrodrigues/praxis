package com.example.praxis.config;

import io.swagger.v3.oas.models.media.NumberSchema;
import io.swagger.v3.oas.models.media.Schema;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

/**
 * OpenAPI configuration to ensure BigDecimal fields are mapped to "number" type
 * instead of "string" in the OpenAPI specification.
 */
@Configuration
public class OpenApiConfig {

    @PostConstruct
    public void customizeOpenApi() {
        // Configure BigDecimal to be mapped as number type with decimal format
        SpringDocUtils.getConfig().replaceWithSchema(BigDecimal.class, 
            new NumberSchema()
                .type("number")
                .format("decimal"));
    }
}