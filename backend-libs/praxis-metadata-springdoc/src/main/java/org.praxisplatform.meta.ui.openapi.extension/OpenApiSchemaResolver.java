package org.praxisplatform.meta.ui.openapi.extension;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;
import io.swagger.v3.core.jackson.ModelResolver;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.models.media.Schema;
import org.springframework.context.annotation.Configuration;

import java.lang.annotation.Annotation;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class OpenApiSchemaResolver extends ModelResolver {
    public OpenApiSchemaResolver(ObjectMapper mapper) {
        super(mapper);
    }

    @Override
    protected void applyBeanValidatorAnnotations(Schema property, Annotation[] annotations, Schema parent, boolean applyNotNullAnnotations) {
        super.applyBeanValidatorAnnotations(property, annotations, parent, applyNotNullAnnotations);
        if (annotations != null) {
            resolveSchema(property, annotations);
            resolveExtension(property, annotations);
        }
    }

    private void resolveSchema(Schema<?> property, Annotation[] annotations) {
        UISchema uiSchemaAnnotation = SchemaResolverUtil.getAnnotation(UISchema.class, annotations);
        io.swagger.v3.oas.annotations.media.Schema schemaAnnotation = SchemaResolverUtil.getAnnotation(io.swagger.v3.oas.annotations.media.Schema.class, annotations);

        if (schemaAnnotation != null) {
            if (schemaAnnotation.description() != null && !schemaAnnotation.description().isEmpty()) {
                property.setDescription(schemaAnnotation.description());
            }
            if (schemaAnnotation.example() != null && !schemaAnnotation.example().isEmpty()) {
                property.setExample(schemaAnnotation.example());
            }
        }

        if (uiSchemaAnnotation != null) {
            Map<String, Object> uiExtension = getUIExtensionMap(property);
            ExtensionProperty label = uiSchemaAnnotation.label();
            uiExtension.putIfAbsent(label.name(), label.value());
            if (uiSchemaAnnotation.metadata() != null) {
                setProperties(uiSchemaAnnotation.metadata(), uiExtension);
            }
        }
    }

    private void resolveExtension(Schema<?> property, Annotation[] annotations) {
        PraxisUiProperties annotation = SchemaResolverUtil.getAnnotation(PraxisUiProperties.class, annotations);
        if (annotation != null && annotation.properties() != null) {
            Map<String, Object> uiExtension = getUIExtensionMap(property);
            setProperties(annotation, uiExtension);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getUIExtensionMap(Schema<?> property) {
        if (property.getExtensions() == null) {
            property.setExtensions(new HashMap<>());
        }
        return (Map<String, Object>) property.getExtensions()
                .computeIfAbsent(PraxisUiProperties.NAME, k -> new HashMap<>());
    }

    private void setProperties(PraxisUiProperties annotation, Map<String, Object> uiExtension) {
        Arrays.stream(annotation.properties())
                .forEach(extensionProperty ->
                        uiExtension.putIfAbsent(extensionProperty.name(), extensionProperty.value())
                );
    }
}
