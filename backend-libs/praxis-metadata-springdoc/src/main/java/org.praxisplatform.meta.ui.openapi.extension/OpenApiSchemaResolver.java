package org.praxisplatform.meta.ui.openapi.extension;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import com.uifieldspec.extension.annotation.UISchema;
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
        UISchema annotation = SchemaResolverUtil.getAnnotation(UISchema.class, annotations);
        if (annotation != null) {
            property.setDescription(annotation.description());
            property.setExample(annotation.example());
            Map<String, Object> uiExtension = getUIExtensionMap(property);
            ExtensionProperty label = annotation.label();
            uiExtension.putIfAbsent(label.name(), label.value());
            if (annotation.metadata() != null) {
                setProperties(annotation.metadata(), uiExtension);
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
