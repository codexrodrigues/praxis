package org.praxisplatform.meta.ui.openapi.extension;

import io.swagger.v3.oas.models.media.Schema;
import org.praxisplatform.meta.ui.model.property.FieldConfigProperties;
import org.praxisplatform.meta.ui.model.property.FieldControlType;
import org.praxisplatform.meta.ui.model.property.FieldDataType;
import org.praxisplatform.meta.ui.model.property.SmartFieldControlType;
import org.praxisplatform.meta.ui.model.property.ValidationProperties;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

public class OpenApiSchemaResolver {

    private static final String X_UI_PREFIX = "x-";
    private final ObjectMapper objectMapper; // Can be used if needed in the future

    public OpenApiSchemaResolver(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void resolve(Schema<?> schema, Schema<?> parentDtoSchema, String propertyName) {
        // This is the main entry point, it will be implemented in a later step.
        // For now, it will call the private methods to process the schema.
        // This method is intended to be called for a top-level DTO schema.
        // For properties of a DTO, processSpecialFields will be called recursively.
        if (schema != null && "object".equals(schema.getType()) && schema.getProperties() != null) {
            for (Map.Entry<String, Schema> entry : (Iterable<Map.Entry<String, Schema>>) schema.getProperties().entrySet()) {
                processSpecialFields(entry.getValue(), schema, entry.getKey());
            }
        } else {
             // If the schema itself is not an object (e.g. a simple type at the root, or an array)
             // or if it's an object with no properties, we can still attempt to enrich it.
             // This case might be less common for resolve() but processSpecialFields handles it.
            processSpecialFields(schema, parentDtoSchema, propertyName);
        }
    }

    private void enrichSchemaPropertyWithXUi(Schema<?> propertySchema, String propertyName, Schema<?> parentDtoSchema) {
        if (propertySchema == null) {
            return;
        }
        // Ensure extensions map exists
        if (propertySchema.getExtensions() == null) {
            propertySchema.setExtensions(new java.util.HashMap<>());
        }

        processStandardAttributes(propertySchema, propertyName, parentDtoSchema);
        processValidations(propertySchema, propertyName, parentDtoSchema);
        processControlTypes(propertySchema, propertyName, parentDtoSchema);
    }

    private void processSpecialFields(Schema<?> propertySchema, Schema<?> parentDtoSchema, String propertyName) {
        if (propertySchema == null) {
            return;
        }
        enrichSchemaPropertyWithXUi(propertySchema, propertyName, parentDtoSchema);

        // Process nested schemas (objects and arrays)
        // For an object schema, recurse for its properties.
        if ("object".equals(propertySchema.getType()) && propertySchema.getProperties() != null) {
            for (Map.Entry<String, Schema> entry : (Iterable<Map.Entry<String, Schema>>) propertySchema.getProperties().entrySet()) {
                // Here, 'propertySchema' is the parent DTO for its properties.
                processSpecialFields(entry.getValue(), propertySchema, entry.getKey());
            }
        // For an array schema, recurse for its items.
        } else if ("array".equals(propertySchema.getType()) && propertySchema.getItems() != null) {
            // 'propertySchema' is the parent (array) schema for its items.
            // 'propertyName' for items is not directly applicable in the same way as for object properties,
            // but we pass null or an indicative name if needed. Here, null is fine
            // as item-specific naming/labeling is usually not derived from the array's property name.
            processSpecialFields(propertySchema.getItems(), propertySchema, null);
        }
    }

    private void processStandardAttributes(Schema<?> propertySchema, String propertyName, Schema<?> parentDtoSchema) {
        // Set name
        if (propertyName != null && !hasExtension(propertySchema, FieldConfigProperties.NAME)) {
            setExtension(propertySchema, FieldConfigProperties.NAME, propertyName);
        }

        // Set label from propertyName
        if (propertyName != null && !hasExtension(propertySchema, FieldConfigProperties.LABEL)) {
            String label = propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1)
                    .replaceAll("([A-Z])", " $1")
                    .trim();
            setExtension(propertySchema, FieldConfigProperties.LABEL, label);
        }

        // Process type and format
        // processTypeAndFormat is called internally if type is not already set by annotations
        // No, processTypeAndFormat should be called regardless of FieldConfigProperties.TYPE being present,
        // as it also sets CONTROL_TYPE for date/time etc.
        // The check for FieldConfigProperties.TYPE should be inside processTypeAndFormat if we want to avoid overwriting.
        // Let's adjust: processTypeAndFormat should always be called.
        // It internally uses setExtensionIfNotPresent.
        processTypeAndFormat(propertySchema.getType(), propertySchema.getFormat(), propertySchema);

        // Process readOnly
        if (Boolean.TRUE.equals(propertySchema.getReadOnly()) && !hasExtension(propertySchema, FieldConfigProperties.READ_ONLY)) {
            setExtension(propertySchema, FieldConfigProperties.READ_ONLY, true);
        }

        // Process example as defaultValue
        if (propertySchema.getExample() != null && !hasExtension(propertySchema, FieldConfigProperties.DEFAULT_VALUE)) {
            setExtension(propertySchema, FieldConfigProperties.DEFAULT_VALUE, propertySchema.getExample());
        }

        // Process enum as options
        if (propertySchema.getEnum() != null && !propertySchema.getEnum().isEmpty() && !hasExtension(propertySchema, FieldConfigProperties.OPTIONS)) {
            List<?> enumValues = propertySchema.getEnum();
            List<Map<String, Object>> options = new java.util.ArrayList<>();
            for (Object enumValue : enumValues) {
                Map<String, Object> option = new java.util.HashMap<>();
                option.put("value", enumValue);
                option.put("label", enumValue.toString()); // Ensure label is a string
                options.add(option);
            }
            setExtension(propertySchema, FieldConfigProperties.OPTIONS, options);

            // If enum is present, and control type is not already set, default to SELECT.
            // This might be overridden by processControlTypes later if a more specific smart type is found,
            // or if processTypeAndFormat sets a different default (e.g. for boolean).
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.SELECT);
        }

        // Process description as helpText
        if (propertySchema.getDescription() != null && !hasExtension(propertySchema, FieldConfigProperties.HELP_TEXT)) {
            setExtension(propertySchema, FieldConfigProperties.HELP_TEXT, propertySchema.getDescription());
        }

        // Process title as placeholder
        if (propertySchema.getTitle() != null && !hasExtension(propertySchema, FieldConfigProperties.PLACEHOLDER)) {
            setExtension(propertySchema, FieldConfigProperties.PLACEHOLDER, propertySchema.getTitle());
        }
    }

    private void processTypeAndFormat(String type, String format, Schema<?> propertySchema) {
        if (type == null) return; // Nothing to process if type is null

        switch (type) {
            case "string":
                if (format != null) {
                    switch (format) {
                        case "date":
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.DATE);
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_PICKER);
                            break;
                        case "date-time":
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.DATE); // Often represented as Date in UI
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_TIME_PICKER);
                            break;
                        case "email":
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.EMAIL);
                            // Default input, SmartFieldControlType might make it SMART_EMAIL if name matches
                            break;
                        case "password":
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.PASSWORD);
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.PASSWORD);
                            break;
                        case "uri":
                        case "url":
                        case "uri-reference":
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.URL);
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.URL_INPUT);
                            break;
                        case "binary":
                        case "byte": // byte format (base64 encoded string)
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.FILE); // Or TEXT if it's just base64
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.FILE_UPLOAD);
                            break;
                        case "json": // Custom format "json" for string type
                             setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.JSON);
                             // Default input, maybe TEXTAREA or a specific JSON editor if available
                             break;
                        default: // Other string formats (uuid, hostname, etc.)
                            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.TEXT);
                            break;
                    }
                } else { // No format for string
                    setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.TEXT);
                }
                break;
            case "integer": // Fallthrough
            case "number":
                setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.NUMBER);
                if (format != null && (format.equals("float") || format.equals("double"))) {
                    setExtensionIfNotPresent(propertySchema, FieldConfigProperties.NUMERIC_FORMAT, "n2"); // Example for decimal places
                }
                // Default input, processControlTypes might change to CURRENCY_INPUT if name matches "valor" etc.
                break;
            case "boolean":
                setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.BOOLEAN);
                setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.CHECKBOX);
                break;
            case "array":
                // Default control type for array is often MULTI_SELECT, especially if items have enums.
                // If items are complex objects, it might be a table or list view.
                // This is a generic default; specific item types might refine this.
                setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.MULTI_SELECT);
                // Note: FieldConfigProperties.TYPE for 'array' itself is not typically set by this system,
                // as it's implicitly 'array'. The type of its items is what matters more for FieldDataType.
                break;
            case "object":
                // Default control type for object.
                setExtensionIfNotPresent(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.EXPANSION_PANEL);
                // Similar to 'array', FieldConfigProperties.TYPE for 'object' is not typically set.
                break;
        }
    }

    private void processValidations(Schema<?> propertySchema, String propertyName, Schema<?> parentDtoSchema) {
        // Process required
        if (parentDtoSchema != null && parentDtoSchema.getRequired() != null && propertyName != null) {
            boolean isRequired = parentDtoSchema.getRequired().contains(propertyName);
            if (isRequired && !hasExtension(propertySchema, ValidationProperties.REQUIRED)) {
                setExtension(propertySchema, ValidationProperties.REQUIRED, true);
                setExtensionIfNotPresent(propertySchema, ValidationProperties.REQUIRED_MESSAGE, "Campo obrigatório");
            }
        }

        // minLength
        if (propertySchema.getMinLength() != null && !hasExtension(propertySchema, ValidationProperties.MIN_LENGTH)) {
            setExtension(propertySchema, ValidationProperties.MIN_LENGTH, propertySchema.getMinLength());
            setExtensionIfNotPresent(propertySchema, ValidationProperties.MIN_LENGTH_MESSAGE, "Tamanho mínimo: " + propertySchema.getMinLength());
        }

        // maxLength
        if (propertySchema.getMaxLength() != null && !hasExtension(propertySchema, ValidationProperties.MAX_LENGTH)) {
            setExtension(propertySchema, ValidationProperties.MAX_LENGTH, propertySchema.getMaxLength());
            setExtensionIfNotPresent(propertySchema, ValidationProperties.MAX_LENGTH_MESSAGE, "Tamanho máximo: " + propertySchema.getMaxLength());
        }

        // minimum
        if (propertySchema.getMinimum() != null && !hasExtension(propertySchema, ValidationProperties.MIN)) {
            setExtension(propertySchema, ValidationProperties.MIN, propertySchema.getMinimum());
            // Set or update range message
            String maxVal = propertySchema.getMaximum() != null ? propertySchema.getMaximum().toString() : null;
            updateRangeMessage(propertySchema, propertySchema.getMinimum().toString(), maxVal);
        }

        // maximum
        if (propertySchema.getMaximum() != null && !hasExtension(propertySchema, ValidationProperties.MAX)) {
            setExtension(propertySchema, ValidationProperties.MAX, propertySchema.getMaximum());
            // Set or update range message
            String minVal = propertySchema.getMinimum() != null ? propertySchema.getMinimum().toString() : null;
            if (!hasExtension(propertySchema, ValidationProperties.MIN)) { // If min wasn't set, range message not updated yet
                 updateRangeMessage(propertySchema, minVal, propertySchema.getMaximum().toString());
            }
        }


        // pattern
        if (propertySchema.getPattern() != null && !hasExtension(propertySchema, ValidationProperties.PATTERN)) {
            setExtension(propertySchema, ValidationProperties.PATTERN, propertySchema.getPattern());
            setExtensionIfNotPresent(propertySchema, ValidationProperties.PATTERN_MESSAGE, "Formato inválido");
        }

        // Allowed file types for binary format
        if ("binary".equals(propertySchema.getFormat()) && !hasExtension(propertySchema, ValidationProperties.ALLOWED_FILE_TYPES)) {
            Object contentMediaType = Optional.ofNullable(propertySchema.getExtensions())
                                           .map(ext -> ext.get("contentMediaType")) // Check for a custom 'contentMediaType' extension
                                           .orElse(null);
            if (contentMediaType != null) {
                setExtension(propertySchema, ValidationProperties.ALLOWED_FILE_TYPES, contentMediaType.toString());
            } else {
                setExtension(propertySchema, ValidationProperties.ALLOWED_FILE_TYPES, "*/*"); // Default if not specified
            }
        }

        // Max file size for binary format (using maxLength as per original controller logic for x-ui)
        // Note: OpenAPI 'maxLength' on a string schema with format 'binary' usually refers to the length of the base64 encoded string.
        // This might not directly translate to file size in bytes in a way users expect.
        // However, we are replicating the existing logic.
        if ("string".equals(propertySchema.getType()) && "binary".equals(propertySchema.getFormat()) &&
            propertySchema.getMaxLength() != null && !hasExtension(propertySchema, ValidationProperties.MAX_FILE_SIZE)) {
            // Assuming maxLength here is intended to be the max file size in bytes.
            // This is a direct translation of the previous logic; might need re-evaluation for semantic correctness.
            setExtension(propertySchema, ValidationProperties.MAX_FILE_SIZE, propertySchema.getMaxLength().longValue());
        }
    }

    private void updateRangeMessage(Schema<?> propertySchema, String min, String max) {
        String message;
        if (min != null && max != null) {
            message = "Valor deve estar entre " + min + " e " + max;
        } else if (min != null) {
            message = "Valor deve ser no mínimo " + min;
        } else if (max != null) {
            message = "Valor deve ser no máximo " + max;
        } else {
            return; // No min or max, no message to set
        }
        setExtensionIfNotPresent(propertySchema, ValidationProperties.RANGE_MESSAGE, message);
    }

    private void processControlTypes(Schema<?> propertySchema, String propertyName, Schema<?> parentDtoSchema) {
        // If control type is already set (e.g., by processTypeAndFormat or annotations), respect it.
        if (propertyName == null || hasExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE)) {
            return;
        }

        String normalizedFieldName = propertyName.toLowerCase();

        // Attempt to set a smart control type. If set, it will take precedence.
        // The setExtension method inside these smart type checks should ideally be setExtensionIfNotPresent,
        // or this entire block should only execute if no control type is set.
        // Current logic: it will overwrite if a smart type matches. This is acceptable if smart types are more specific.

        if (normalizedFieldName.contains("cep") || normalizedFieldName.contains("zipcode")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CEP);
        } else if (normalizedFieldName.contains("cidade") || normalizedFieldName.contains("city")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CIDADE);
        } else if (normalizedFieldName.contains("estado") || normalizedFieldName.contains("uf")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_ESTADO);
        } else if (normalizedFieldName.contains("setor")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_SETOR);
        } else if (normalizedFieldName.equals("cpf") || normalizedFieldName.endsWith("cpf")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CPF);
        } else if (normalizedFieldName.equals("cnpj") || normalizedFieldName.endsWith("cnpj")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CNPJ);
        } else if (normalizedFieldName.contains("banco")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_BANCO);
        } else if (normalizedFieldName.contains("telefone") || normalizedFieldName.contains("fone") ||
                   normalizedFieldName.contains("celular") || normalizedFieldName.contains("phone")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_TELEFONE);
        } else if (normalizedFieldName.contains("pis") || normalizedFieldName.contains("pasep")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PIS);
        } else if (normalizedFieldName.contains("matricula")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_MATRICULA);
        } else if (normalizedFieldName.contains("placa")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PLACA_VEICULO);
        } else if (normalizedFieldName.contains("funcionario") || normalizedFieldName.contains("employee")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_FUNCIONARIO);
        } else if (normalizedFieldName.contains("cliente") || normalizedFieldName.contains("customer")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CLIENTE);
        } else if (normalizedFieldName.contains("produto") || normalizedFieldName.contains("product")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PRODUTO);
        } else if (normalizedFieldName.contains("projeto") || normalizedFieldName.contains("project")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PROJETO);
        } else if (normalizedFieldName.contains("fornecedor") || normalizedFieldName.contains("supplier")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_FORNECEDOR);
        } else if (normalizedFieldName.contains("departamento") || normalizedFieldName.contains("department")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_DEPARTAMENTO);
        } else if (normalizedFieldName.contains("contacorrente") ||
                   (normalizedFieldName.contains("conta") && normalizedFieldName.contains("corrente"))) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CONTA_CORRENTE);
        } else if (normalizedFieldName.contains("contrato") || normalizedFieldName.contains("contract")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CONTRATO);
        } else if (normalizedFieldName.contains("descricao") || normalizedFieldName.contains("observacao") ||
                   normalizedFieldName.contains("description") || normalizedFieldName.contains("comment")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.TEXTAREA);
        } else if (normalizedFieldName.contains("valor") || normalizedFieldName.contains("preco") ||
                   normalizedFieldName.contains("price") || normalizedFieldName.contains("amount")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.CURRENCY_INPUT);
        } else if (normalizedFieldName.contains("url") || normalizedFieldName.contains("link") ||
                   normalizedFieldName.contains("website") || normalizedFieldName.contains("site")) {
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.URL); // Ensure type is URL
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.URL_INPUT);
        } else if (normalizedFieldName.contains("cor") || normalizedFieldName.contains("color")) {
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.COLOR_PICKER);
        } else if (normalizedFieldName.contains("senha") || normalizedFieldName.contains("password")) {
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.PASSWORD); // Ensure type is PASSWORD
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.PASSWORD);
        } else if (normalizedFieldName.contains("email")) {
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.EMAIL); // Ensure type is EMAIL
            // Default input, could be SMART_EMAIL if a specific smart control is desired and defined
        } else if (normalizedFieldName.contains("data") || normalizedFieldName.contains("date")) {
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.DATE); // Ensure type is DATE
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_PICKER);
        } else if (normalizedFieldName.contains("imagem") || normalizedFieldName.contains("foto") ||
                   normalizedFieldName.contains("image") || normalizedFieldName.contains("photo") ||
                   normalizedFieldName.contains("arquivo") || normalizedFieldName.contains("file") ) { // Combined image and file
            setExtensionIfNotPresent(propertySchema, FieldConfigProperties.TYPE, FieldDataType.FILE); // Ensure type is FILE
            setExtension(propertySchema, FieldConfigProperties.CONTROL_TYPE, FieldControlType.FILE_UPLOAD);
        }
        // If after all this, CONTROL_TYPE is still not set, processTypeAndFormat might have set a default
        // (e.g., CHECKBOX for boolean, DATE_PICKER for date).
        // If not, it will remain unset, and UI can decide on a very basic default input.
    }

    private boolean hasExtension(Schema<?> schema, String key) {
        return schema.getExtensions() != null && schema.getExtensions().containsKey(X_UI_PREFIX + key);
    }

    private void setExtension(Schema<?> schema, String key, Object value) {
        if (schema.getExtensions() == null) {
            schema.setExtensions(new java.util.HashMap<>());
        }
        schema.getExtensions().put(X_UI_PREFIX + key, value);
    }

    private void setExtensionIfNotPresent(Schema<?> schema, String key, Object value) {
        if (!hasExtension(schema, key)) {
            setExtension(schema, key, value);
        }
    }
}
