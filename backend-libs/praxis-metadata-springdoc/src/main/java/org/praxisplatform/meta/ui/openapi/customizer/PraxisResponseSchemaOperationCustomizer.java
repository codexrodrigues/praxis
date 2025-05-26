package org.praxisplatform.meta.ui.openapi.customizer;

import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.RequestBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.core.ResolvableType;
import org.springframework.data.domain.Page;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.praxisplatform.meta.ui.model.generic.RestApiResponse; // Assuming this is the correct FQN

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Customizer to link operations to their main DTO schemas via x-ui extensions.
 * This customizer will be responsible for identifying the primary response DTO
 * of an operation and adding an extension to the operation that points to this DTO's schema.
 */
public class PraxisResponseSchemaOperationCustomizer implements OperationCustomizer {

    private static final Logger log = LoggerFactory.getLogger(PraxisResponseSchemaOperationCustomizer.class);
    private static final String REF_PREFIX = "#/components/schemas/";
    private static final List<String> DTO_PACKAGES_KEYWORDS = Arrays.asList(".dto.", ".model.");
    private static final String DTO_SUFFIX = "Dto";

    // Define constants locally as OperationProperties.java was not found
    private static final String X_UI_PREFIX = "x-ui";
    private static final String RESPONSE_SCHEMA_PROPERTY = "responseSchema";


    @Override
    public Operation customize(Operation operation, HandlerMethod handlerMethod) {
        if (operation == null) {
            return null;
        }
        log.debug("Attempting to find DTO for operation: {}", operation.getOperationId());

        String dtoSchemaName = determineDtoSchemaName(operation, handlerMethod);

        if (StringUtils.hasText(dtoSchemaName)) {
            log.info("Identified DTO name '{}' for operation '{}'", dtoSchemaName, operation.getOperationId());

            Map<String, Object> extensions = operation.getExtensions();
            Map<String, Object> xUiMap = null;

            if (extensions != null && extensions.containsKey(X_UI_PREFIX) && extensions.get(X_UI_PREFIX) instanceof Map) {
                xUiMap = (Map<String, Object>) extensions.get(X_UI_PREFIX);
                if (xUiMap.containsKey(RESPONSE_SCHEMA_PROPERTY)) {
                    log.info("{}.{} already defined for operation {}. Skipping automatic assignment.",
                            X_UI_PREFIX, RESPONSE_SCHEMA_PROPERTY, operation.getOperationId());
                    return operation; 
                }
            }

            // If we reach here, it means x-ui.responseSchema is not manually defined
            if (extensions == null) {
                extensions = new java.util.LinkedHashMap<>(); // Use LinkedHashMap to maintain order if ever relevant
                operation.setExtensions(extensions);
            }
            if (xUiMap == null) { 
                // This covers:
                // 1. extensions was null initially.
                // 2. extensions was not null, but X_UI_PREFIX was not present.
                // 3. extensions was not null, X_UI_PREFIX was present, but its value was not a Map.
                xUiMap = new java.util.LinkedHashMap<>();
                extensions.put(X_UI_PREFIX, xUiMap);
            } else if (!(extensions.get(X_UI_PREFIX) instanceof Map)) {
                // Case where X_UI_PREFIX exists but is not a map, overwrite it.
                log.warn("Extension {} for operation {} was not a Map. Overwriting with new x-ui map.", X_UI_PREFIX, operation.getOperationId());
                xUiMap = new java.util.LinkedHashMap<>();
                extensions.put(X_UI_PREFIX, xUiMap);
            }


            xUiMap.put(RESPONSE_SCHEMA_PROPERTY, dtoSchemaName);
            log.info("Added {}.{}: {} to operation {}", X_UI_PREFIX, RESPONSE_SCHEMA_PROPERTY, dtoSchemaName, operation.getOperationId());

        } else {
            log.debug("No DTO schema identified for operation '{}'", operation.getOperationId());
        }
        return operation;
    }

    private String determineDtoSchemaName(Operation operation, HandlerMethod handlerMethod) {
        // 1. Try RequestBody
        if (operation.getRequestBody() != null) {
            RequestBody requestBody = operation.getRequestBody();
            if (requestBody.getContent() != null) {
                for (Map.Entry<String, MediaType> entry : requestBody.getContent().entrySet()) {
                    Schema<?> schema = entry.getValue().getSchema();
                    if (schema != null && StringUtils.hasText(schema.get$ref())) {
                        String schemaName = extractSchemaNameFromRef(schema.get$ref());
                        if (isLikelyDto(schemaName, null)) { // Class object not available here
                            log.debug("Found DTO by RequestBody: {}", schemaName);
                            return schemaName;
                        }
                    }
                }
            }
        }

        // 2. Try Return Type
        ResolvableType returnType = ResolvableType.forMethodReturnType(handlerMethod.getMethod());
        Class<?> unwrappedReturnType = unwrapReturnType(returnType);

        if (unwrappedReturnType != null && !isPrimitiveOrJavaLang(unwrappedReturnType)) {
            if (isLikelyDto(unwrappedReturnType.getSimpleName(), unwrappedReturnType)) {
                log.debug("Found DTO by return type: {}", unwrappedReturnType.getSimpleName());
                return unwrappedReturnType.getSimpleName();
            }
        }
        
        // 3. Fallback: Check operation responses (this should be the primary for "Response DTO")
        if (operation.getResponses() != null) {
            // Prioritize successful responses (e.g., "200", "201")
            List<String> successCodes = Arrays.asList("200", "201");
            for (String code : successCodes) {
                io.swagger.v3.oas.models.responses.ApiResponse apiResponse = operation.getResponses().get(code);
                if (apiResponse != null) {
                    String schemaName = getSchemaFromResponseContent(apiResponse.getContent());
                    if (schemaName != null && isLikelyDto(schemaName, null)) {
                        log.debug("Found DTO by Operation Response (code {}): {}", code, schemaName);
                        return schemaName;
                    }
                }
            }
            // If not found in success codes, check all other responses
            for (Map.Entry<String, io.swagger.v3.oas.models.responses.ApiResponse> responseEntry : operation.getResponses().entrySet()) {
                if (!successCodes.contains(responseEntry.getKey())) {
                    String schemaName = getSchemaFromResponseContent(responseEntry.getValue().getContent());
                    if (schemaName != null && isLikelyDto(schemaName, null)) {
                        log.debug("Found DTO by Operation Response (code {}): {}", responseEntry.getKey(), schemaName);
                        return schemaName;
                    }
                }
            }
        }


        return null;
    }
    
    private String getSchemaFromResponseContent(Content content) {
        if (content != null) {
            for (MediaType mediaType : content.values()) {
                Schema<?> schema = mediaType.getSchema();
                if (schema != null) {
                    if (StringUtils.hasText(schema.get$ref())) {
                        return extractSchemaNameFromRef(schema.get$ref());
                    } else if ("array".equals(schema.getType()) && schema.getItems() != null && StringUtils.hasText(schema.getItems().get$ref())) {
                        return extractSchemaNameFromRef(schema.getItems().get$ref());
                    }
                }
            }
        }
        return null;
    }


    private Class<?> unwrapReturnType(ResolvableType resolvableType) {
        Class<?> resolvedClass = resolvableType.resolve();

        if (resolvedClass == null) {
            return null;
        }

        // ResponseEntity<T>
        if (ResponseEntity.class.isAssignableFrom(resolvedClass)) {
            return unwrapReturnType(resolvableType.getGeneric(0));
        }
        // RestApiResponse<T> (Praxis specific)
        if (RestApiResponse.class.isAssignableFrom(resolvedClass)) {
            return unwrapReturnType(resolvableType.getGeneric(0));
        }
        // Page<T>
        if (Page.class.isAssignableFrom(resolvedClass)) {
            return unwrapReturnType(resolvableType.getGeneric(0));
        }
        // List<T> or Collection<T>
        if (List.class.isAssignableFrom(resolvedClass) || Collection.class.isAssignableFrom(resolvedClass)) {
             // Check if it's a collection of EntityModel, common in Spring Data REST exports
            if (EntityModel.class.isAssignableFrom(resolvableType.getGeneric(0).resolve())) {
                 return unwrapReturnType(resolvableType.getGeneric(0).getGeneric(0)); // Unwrap T from EntityModel<T>
            }
            return unwrapReturnType(resolvableType.getGeneric(0));
        }
        // EntityModel<T>
        if (EntityModel.class.isAssignableFrom(resolvedClass)) {
            return unwrapReturnType(resolvableType.getGeneric(0));
        }
        // If no specific wrapper matched, return the resolved class itself.
        return resolvedClass;
    }

    private String extractSchemaNameFromRef(String ref) {
        if (StringUtils.hasText(ref) && ref.startsWith(REF_PREFIX)) {
            return ref.substring(REF_PREFIX.length());
        }
        return null;
    }

    private boolean isPrimitiveOrJavaLang(Class<?> clazz) {
        return clazz.isPrimitive() || clazz.getPackage() == null || "java.lang".equals(clazz.getPackage().getName()) || "java.util".equals(clazz.getPackage().getName());
    }

    private boolean isLikelyDto(String name, Class<?> clazz) {
        if (name == null) return false;

        // Heuristic 1: Name ends with "Dto"
        if (name.endsWith(DTO_SUFFIX)) {
            return true;
        }

        // Heuristic 2: Package name (if class info is available)
        if (clazz != null && clazz.getPackage() != null) {
            String packageName = clazz.getPackage().getName();
            if (DTO_PACKAGES_KEYWORDS.stream().anyMatch(packageName::contains)) {
                return true;
            }
        }
        // Add more heuristics if needed, e.g. specific annotations on the DTO class
        return false;
    }
}
