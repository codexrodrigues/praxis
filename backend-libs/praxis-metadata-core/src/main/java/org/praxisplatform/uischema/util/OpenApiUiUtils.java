package org.praxisplatform.uischema.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.praxisplatform.uischema.FieldConfigProperties;
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.FieldDataType;
import org.praxisplatform.uischema.ValidationProperties;

import java.util.List;
import java.util.Map;

public class OpenApiUiUtils {

    private OpenApiUiUtils() {
        // Private constructor to prevent instantiation
    }

    public static String formatFieldNameAsLabel(String fieldName) {
        if (fieldName == null || fieldName.isEmpty()) {
            return "";
        }
        String label = fieldName.replace('_', ' ');
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < label.length(); i++) {
            char c = label.charAt(i);
            if (i > 0 && Character.isUpperCase(c) && !Character.isWhitespace(label.charAt(i - 1))) {
                result.append(' ');
            }
            if (i == 0 || Character.isWhitespace(label.charAt(Math.max(0, i - 1)))) {
                result.append(Character.toUpperCase(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    /**
     * Determines a basic UI control type based on OpenAPI schema type, format, and other properties.
     *
     * @param openApiType The type from the OpenAPI schema (e.g., "string", "number").
     * @param openApiFormat The format from the OpenAPI schema (e.g., "date", "email").
     * @param hasEnum Whether the schema property has an enum defined (for non-array types).
     * @param maxLength The maxLength attribute of a string schema property.
     * @param isArrayType Indicates if the schema property is of type "array".
     * @param isArrayItemsHaveEnum Whether the items of an array schema have an enum defined.
     * @return The string value of a suitable {@link org.praxisplatform.uischema.FieldControlType}, or null if no specific type is determined.
     */
    public static String determineBasicControlType(
            String openApiType,
            String openApiFormat,
            boolean hasEnum,
            Integer maxLength,
            boolean isArrayType,
            boolean isArrayItemsHaveEnum) {

        if (openApiType == null) {
            return null;
        }

        switch (openApiType) {
            case "string":
                if (hasEnum) {
                    return FieldControlType.SELECT.getValue();
                }
                if (openApiFormat != null) {
                    switch (openApiFormat) {
                        case "date":
                            return FieldControlType.DATE_PICKER.getValue();
                        case "date-time":
                            return FieldControlType.DATE_TIME_PICKER.getValue();
                        case "time":
                            return FieldControlType.TIME_PICKER.getValue();
                        case "email":
                            return FieldControlType.EMAIL_INPUT.getValue(); // Was FieldDataType.EMAIL, but maps to EMAIL_INPUT
                        case "password":
                            return FieldControlType.PASSWORD.getValue();
                        case "binary": // Typically for file uploads
                        case "byte":
                            return FieldControlType.FILE_UPLOAD.getValue();
                        case "uri":
                        case "url":
                        case "uri-reference": // Added from ApiDocsController
                            return FieldControlType.URL_INPUT.getValue();
                        case "color":
                            return FieldControlType.COLOR_PICKER.getValue();
                        case "phone":
                            return FieldControlType.PHONE.getValue();
                        // case "json": // ApiDocsController maps this to FieldDataType.JSON, not a specific control type here.
                        // Let specific handlers decide for json.
                        default:
                            // Fall through to general string handling
                            break;
                    }
                }
                // General string handling (after specific formats)
                if (maxLength != null && maxLength > 100) {
                    return FieldControlType.TEXTAREA.getValue();
                }
                return FieldControlType.INPUT.getValue(); // Default for string

            case "number":
            case "integer":
                if (hasEnum) { // Though less common for numbers, if enum is present, SELECT might be applicable
                    return FieldControlType.SELECT.getValue();
                }
                // Specific formats for numbers can override default
                if (openApiFormat != null) {
                    if ("currency".equals(openApiFormat)) { // From CustomOpenApiResolver
                        return FieldControlType.CURRENCY_INPUT.getValue();
                    }
                    // "percent" format from CustomOpenApiResolver leads to NUMERIC_TEXT_BOX, which is the default.
                }
                return FieldControlType.NUMERIC_TEXT_BOX.getValue(); // Default for number/integer

            case "boolean":
                if (hasEnum) { // If boolean has enum (e.g. "Sim", "Não")
                     return FieldControlType.SELECT.getValue();
                }
                return FieldControlType.CHECKBOX.getValue();

            case "array":
                if (isArrayItemsHaveEnum) {
                    return FieldControlType.MULTI_SELECT.getValue();
                }
                // Default for array if items don't have enum or specific handling
                return FieldControlType.ARRAY_INPUT.getValue(); // From CustomOpenApiResolver

            case "object":
                // Objects might be represented in various ways, EXPANSION_PANEL is one option.
                // Or could be handled by custom components based on schema.
                return FieldControlType.EXPANSION_PANEL.getValue(); // From CustomOpenApiResolver

            default:
                return null; // Or a very generic default if appropriate
        }
    }

    public static void populateUiGroup(Map<String, Object> xUiMap, String group) {
        if (group != null && !group.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.GROUP.getValue())) {
            xUiMap.put(FieldConfigProperties.GROUP.getValue(), group);
        }
    }

    public static void populateUiOrder(Map<String, Object> xUiMap, int order) {
        if (order != 0 && !xUiMap.containsKey(FieldConfigProperties.ORDER.getValue())) {
            xUiMap.put(FieldConfigProperties.ORDER.getValue(), String.valueOf(order));
        }
    }

    public static void populateUiWidth(Map<String, Object> xUiMap, String width) {
        if (width != null && !width.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.WIDTH.getValue())) {
            xUiMap.put(FieldConfigProperties.WIDTH.getValue(), width);
        }
    }

    public static void populateUiIcon(Map<String, Object> xUiMap, String icon) {
        if (icon != null && !icon.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.ICON.getValue())) {
            xUiMap.put(FieldConfigProperties.ICON.getValue(), icon);
        }
    }

    public static void populateUiDisabled(Map<String, Object> xUiMap, boolean disabled) {
        if (disabled && !xUiMap.containsKey(FieldConfigProperties.DISABLED.getValue())) {
            xUiMap.put(FieldConfigProperties.DISABLED.getValue(), Boolean.TRUE);
        }
    }

    public static void populateUiHidden(Map<String, Object> xUiMap, boolean hidden) {
        if (hidden && !xUiMap.containsKey(FieldConfigProperties.HIDDEN.getValue())) {
            xUiMap.put(FieldConfigProperties.HIDDEN.getValue(), Boolean.TRUE);
        }
    }

    public static void populateUiEditable(Map<String, Object> xUiMap, boolean editable) {
        if (!editable && !xUiMap.containsKey(FieldConfigProperties.EDITABLE.getValue())) {
            xUiMap.put(FieldConfigProperties.EDITABLE.getValue(), Boolean.FALSE);
        }
    }

    public static void populateUiSortable(Map<String, Object> xUiMap, boolean sortable) {
        if (!sortable && !xUiMap.containsKey(FieldConfigProperties.SORTABLE.getValue())) {
            xUiMap.put(FieldConfigProperties.SORTABLE.getValue(), Boolean.FALSE);
        }
    }

    public static void populateUiFilterable(Map<String, Object> xUiMap, boolean filterable) {
        if (filterable && !xUiMap.containsKey(FieldConfigProperties.FILTERABLE.getValue())) {
            xUiMap.put(FieldConfigProperties.FILTERABLE.getValue(), Boolean.TRUE);
        }
    }

    public static void populateUiHelpText(Map<String, Object> xUiMap, String description) {
        if (description != null && !description.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.HELP_TEXT.getValue())) {
            xUiMap.put(FieldConfigProperties.HELP_TEXT.getValue(), description);
        }
    }

    public static void populateUiDefaultValue(Map<String, Object> xUiMap, Object example) {
        if (example != null && !xUiMap.containsKey(FieldConfigProperties.DEFAULT_VALUE.getValue())) {
            // Preserve the original type of the example object
            xUiMap.put(FieldConfigProperties.DEFAULT_VALUE.getValue(), example);
        }
    }

    public static void populateUiReadOnly(Map<String, Object> xUiMap, Boolean readOnly) {
        if (Boolean.TRUE.equals(readOnly) && !xUiMap.containsKey(FieldConfigProperties.READ_ONLY.getValue())) {
            xUiMap.put(FieldConfigProperties.READ_ONLY.getValue(), Boolean.TRUE); // Storing as boolean true
        }
    }

    public static void populateUiOptionsFromEnum(Map<String, Object> xUiMap, List<?> enumValues, ObjectMapper objectMapper) {
        if (enumValues != null && !enumValues.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.OPTIONS.getValue())) {
            ArrayNode optionsNode = objectMapper.createArrayNode();
            for (Object enumValue : enumValues) {
                ObjectNode optionNode = objectMapper.createObjectNode();
                // Assuming enumValue can be reasonably converted to string for value and label
                // For more complex objects, specific handling for value/label might be needed.
                if (enumValue instanceof String) {
                    optionNode.put("value", (String) enumValue);
                    optionNode.put("label", (String) enumValue);
                } else if (enumValue instanceof Number) {
                    optionNode.putPOJO("value", enumValue); // Store numbers as numbers
                    optionNode.put("label", enumValue.toString());
                } else if (enumValue instanceof Boolean) {
                    optionNode.putPOJO("value", enumValue); // Store booleans as booleans
                    optionNode.put("label", enumValue.toString());
                }
                else {
                    // Default to string representation if type is not directly handled
                    // Consider if specific .toString() or a getter is more appropriate for other types
                    String stringValue = enumValue.toString();
                    optionNode.put("value", stringValue);
                    optionNode.put("label", stringValue);
                }
                optionsNode.add(optionNode);
            }
            xUiMap.put(FieldConfigProperties.OPTIONS.getValue(), optionsNode);
        }
    }

    public static void populateUiMinLength(Map<String, Object> xUiMap, Integer minLength, String message) {
        if (minLength != null && minLength > 0 && !xUiMap.containsKey(ValidationProperties.MIN_LENGTH.getValue())) {
            xUiMap.put(ValidationProperties.MIN_LENGTH.getValue(), minLength.toString());
        }
        if (message != null && !message.isEmpty() && !xUiMap.containsKey(ValidationProperties.MIN_LENGTH_MESSAGE.getValue())) {
            xUiMap.put(ValidationProperties.MIN_LENGTH_MESSAGE.getValue(), message);
        }
    }

    public static void populateUiMaxLength(Map<String, Object> xUiMap, Integer maxLength, String message) {
        if (maxLength != null && !xUiMap.containsKey(ValidationProperties.MAX_LENGTH.getValue())) {
            xUiMap.put(ValidationProperties.MAX_LENGTH.getValue(), maxLength.toString());
        }
        if (message != null && !message.isEmpty() && !xUiMap.containsKey(ValidationProperties.MAX_LENGTH_MESSAGE.getValue())) {
            xUiMap.put(ValidationProperties.MAX_LENGTH_MESSAGE.getValue(), message);
        }
    }

    public static void populateUiMinimum(Map<String, Object> xUiMap, Number minimum, String message) {
        if (minimum != null) {
            if (!xUiMap.containsKey(ValidationProperties.MIN.getValue())) {
                 xUiMap.put(ValidationProperties.MIN.getValue(), minimum.toString());
            }
            // For numeric inputs, FieldConfigProperties.NUMERIC_MIN is also used
            if (!xUiMap.containsKey(FieldConfigProperties.NUMERIC_MIN.getValue())) {
                 xUiMap.put(FieldConfigProperties.NUMERIC_MIN.getValue(), minimum.toString());
            }
        }
        if (message != null && !message.isEmpty() && !xUiMap.containsKey(ValidationProperties.RANGE_MESSAGE.getValue())) {
            xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(), message);
        }
    }

    public static void populateUiMaximum(Map<String, Object> xUiMap, Number maximum, String message) {
        if (maximum != null) {
            if (!xUiMap.containsKey(ValidationProperties.MAX.getValue())) {
                xUiMap.put(ValidationProperties.MAX.getValue(), maximum.toString());
            }
            // For numeric inputs, FieldConfigProperties.NUMERIC_MAX is also used
            if (!xUiMap.containsKey(FieldConfigProperties.NUMERIC_MAX.getValue())) {
                xUiMap.put(FieldConfigProperties.NUMERIC_MAX.getValue(), maximum.toString());
            }
        }
        // Note: This might overwrite a message set by populateUiMinimum if both are called with messages.
        // Caller should be aware or have specific logic if combined messages are needed.
        if (message != null && !message.isEmpty() && !xUiMap.containsKey(ValidationProperties.RANGE_MESSAGE.getValue())) {
            xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(), message);
        }
    }

    public static void populateUiPattern(Map<String, Object> xUiMap, String pattern, String message) {
        if (pattern != null && !pattern.isEmpty() && !xUiMap.containsKey(ValidationProperties.PATTERN.getValue())) {
            xUiMap.put(ValidationProperties.PATTERN.getValue(), pattern);
        }
        if (message != null && !message.isEmpty() && !xUiMap.containsKey(ValidationProperties.PATTERN_MESSAGE.getValue())) {
            xUiMap.put(ValidationProperties.PATTERN_MESSAGE.getValue(), message);
        }
    }

    public static void populateUiRequired(Map<String, Object> xUiMap, Boolean required) {
        if (Boolean.TRUE.equals(required) && !xUiMap.containsKey(ValidationProperties.REQUIRED.getValue())) {
            xUiMap.put(ValidationProperties.REQUIRED.getValue(), Boolean.TRUE); // Storing as boolean true
        }
    }

    public static void populateUiAllowedFileTypes(Map<String, Object> xUiMap, String contentMediaType) {
        if (!xUiMap.containsKey(ValidationProperties.ALLOWED_FILE_TYPES.getValue())) {
            if (contentMediaType != null && !contentMediaType.isEmpty()) {
                xUiMap.put(ValidationProperties.ALLOWED_FILE_TYPES.getValue(), contentMediaType);
            } else {
                xUiMap.put(ValidationProperties.ALLOWED_FILE_TYPES.getValue(), "*/*");
            }
        }
    }

    public static void populateUiMaxFileSize(Map<String, Object> xUiMap, Long maxFileSize) {
        if (maxFileSize != null && !xUiMap.containsKey(ValidationProperties.MAX_FILE_SIZE.getValue())) {
            // Storing as Long, consistent with how it might be used/parsed later.
            // Previous direct puts in controllers might have used asLong() or similar.
            xUiMap.put(ValidationProperties.MAX_FILE_SIZE.getValue(), maxFileSize);
        }
    }

    public static void populateUiPlaceholder(Map<String, Object> xUiMap, String titleOrPlaceholder) {
        if (titleOrPlaceholder != null && !titleOrPlaceholder.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.PLACEHOLDER.getValue())) {
            xUiMap.put(FieldConfigProperties.PLACEHOLDER.getValue(), titleOrPlaceholder);
        }
    }

    public static void populateUiName(Map<String, Object> xUiMap, String fieldName) {
        if (fieldName != null && !fieldName.isEmpty() && !xUiMap.containsKey(FieldConfigProperties.NAME.getValue())) {
            xUiMap.put(FieldConfigProperties.NAME.getValue(), fieldName);
        }
    }

    public static void populateUiLabel(Map<String, Object> xUiMap, String labelText, String fieldName) {
        if (!xUiMap.containsKey(FieldConfigProperties.LABEL.getValue())) {
            if (labelText != null && !labelText.isEmpty()) {
                xUiMap.put(FieldConfigProperties.LABEL.getValue(), labelText);
            } else if (fieldName != null && !fieldName.isEmpty()) {
                xUiMap.put(FieldConfigProperties.LABEL.getValue(), formatFieldNameAsLabel(fieldName));
            }
        }
    }

    /**
     * Formats the size of the file for a more user-friendly display
     */
    public static String formatFileSize(Object size) {
        try {
            long sizeInBytes = Long.parseLong(String.valueOf(size));
            if (sizeInBytes < 1024) {
                return sizeInBytes + " bytes";
            } else if (sizeInBytes < 1024 * 1024) {
                return String.format("%.2f KB", sizeInBytes / 1024.0);
            } else if (sizeInBytes < 1024 * 1024 * 1024) {
                return String.format("%.2f MB", sizeInBytes / (1024.0 * 1024.0));
            } else {
                return String.format("%.2f GB", sizeInBytes / (1024.0 * 1024.0 * 1024.0));
            }
        } catch (NumberFormatException e) {
            return String.valueOf(size) + " bytes";
        }
    }

    /**
     * Formats the list of allowed file types into a more user-friendly string
     */
    public static String formatAllowedTypes(String allowedTypes) {
        if (allowedTypes == null || allowedTypes.isEmpty()) {
            return "*/*";
        }

        // If it's already a formatted list, return as is
        if (allowedTypes.contains(",")) {
            return allowedTypes;
        }

        // Handle common mimetypes for more user-friendly display
        switch (allowedTypes) {
            case "application/pdf":
                return "PDF";
            case "image/jpeg":
                return "JPEG, JPG";
            case "image/png":
                return "PNG";
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "XLSX (Excel)";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "DOCX (Word)";
            case "application/zip":
                return "ZIP";
            case "image/*":
                return "Any image type";
            case "application/json":
                return "JSON";
            case "text/plain":
                return "TXT";
            case "text/csv":
                return "CSV";
            default:
                return allowedTypes;
        }
    }

    public static String determineFieldDataType(String openApiType, String openApiFormat) {
        if (openApiType == null) {
            return null; // Or a default type if applicable
        }

        switch (openApiType) {
            case "string":
                if (openApiFormat != null) {
                    switch (openApiFormat) {
                        case "date":
                        case "date-time": // Both map to FieldDataType.DATE
                            return FieldDataType.DATE.getValue();
                        case "email":
                            return FieldDataType.EMAIL.getValue();
                        case "password":
                            return FieldDataType.PASSWORD.getValue();
                        case "uri":
                        case "url":
                        case "uri-reference": // From ApiDocsController
                            return FieldDataType.URL.getValue();
                        case "binary":
                        case "byte": // Typically for file uploads
                            return FieldDataType.FILE.getValue();
                        case "json": // As defined in ApiDocsController's processTypeAndFormat
                            return FieldDataType.JSON.getValue();
                        default:
                            return FieldDataType.TEXT.getValue();
                    }
                } else {
                    return FieldDataType.TEXT.getValue();
                }
            case "integer":
            case "number":
                return FieldDataType.NUMBER.getValue();
            case "boolean":
                return FieldDataType.BOOLEAN.getValue();
            case "array":
            case "object":
                // ApiDocsController does not set a specific FieldDataType for array/object.
                // They are often handled by specific control types (MULTI_SELECT, EXPANSION_PANEL)
                // or custom components. Returning null means no specific FieldDataType is assigned here.
                return null;
            default:
                return null; // Or a default type if applicable
        }
    }

    public static void populateUiDataType(Map<String, Object> xUiMap, String openApiType, String openApiFormat) {
        String dataType = determineFieldDataType(openApiType, openApiFormat);
        if (dataType != null && !xUiMap.containsKey(FieldConfigProperties.TYPE.getValue())) {
            xUiMap.put(FieldConfigProperties.TYPE.getValue(), dataType);
        }
    }

    public static String determineSmartControlTypeByFieldName(String fieldName) {
        if (fieldName == null || fieldName.isEmpty()) {
            return null;
        }
        String normalizedFieldName = fieldName.toLowerCase();

        if (normalizedFieldName.contains("descricao") || normalizedFieldName.contains("observacao") ||
                normalizedFieldName.contains("description") || normalizedFieldName.contains("comment")) {
            return FieldControlType.TEXTAREA.getValue();
        } else if (normalizedFieldName.contains("valor") || normalizedFieldName.contains("preco") ||
                normalizedFieldName.contains("price") || normalizedFieldName.contains("amount") ||
                normalizedFieldName.contains("salario") || normalizedFieldName.contains("salary")) {
            return FieldControlType.CURRENCY_INPUT.getValue();
        } else if (normalizedFieldName.contains("url") || normalizedFieldName.contains("link") ||
                normalizedFieldName.contains("website") || normalizedFieldName.contains("site")) {
            // Note: This also implies FieldDataType.URL, which should be handled by populateUiDataType
            return FieldControlType.URL_INPUT.getValue();
        } else if (normalizedFieldName.contains("cor") || normalizedFieldName.contains("color")) {
            return FieldControlType.COLOR_PICKER.getValue();
        } else if (normalizedFieldName.contains("senha") || normalizedFieldName.contains("password")) {
            // Note: This also implies FieldDataType.PASSWORD
            return FieldControlType.PASSWORD.getValue();
        } else if (normalizedFieldName.contains("email")) {
            // Note: This also implies FieldDataType.EMAIL
            return FieldControlType.EMAIL_INPUT.getValue(); // Smart control might be just EMAIL_INPUT or a specific smart email
        } else if (normalizedFieldName.contains("data") || normalizedFieldName.contains("date")) {
            // Note: This also implies FieldDataType.DATE
            return FieldControlType.DATE_PICKER.getValue();
        } else if (normalizedFieldName.contains("imagem") || normalizedFieldName.contains("foto") ||
                normalizedFieldName.contains("image") || normalizedFieldName.contains("photo")) {
            // Note: This also implies FieldDataType.FILE
            return FieldControlType.FILE_UPLOAD.getValue();
        } else if (normalizedFieldName.contains("arquivo") || normalizedFieldName.contains("file")) {
            // Note: This also implies FieldDataType.FILE
            return FieldControlType.FILE_UPLOAD.getValue();
        }
        return null; // No specific smart control type found by name
    }

    public static String determineArrayItemFilterControlType(String fieldName, String itemType, String itemFormat) {
        if (fieldName != null && fieldName.toLowerCase().endsWith("filtro")) {
            if ("string".equals(itemType)) {
                if ("date".equals(itemFormat)) {
                    return FieldControlType.DATE_RANGE.getValue();
                } else if ("date-time".equals(itemFormat)) {
                    return FieldControlType.DATE_TIME_RANGE.getValue();
                }
            }
        }
        return null;
    }

public static String determineEffectiveControlType(
        String openApiType, String openApiFormat, boolean hasEnum, Integer maxLengthSchema,
        boolean isArrayType, String itemType, String itemFormat, boolean isArrayItemsHaveEnum,
        String fieldName
) {
    String controlType = null;

    // 1. Basic determination
    controlType = determineBasicControlType(openApiType, openApiFormat, hasEnum, maxLengthSchema, isArrayType, isArrayItemsHaveEnum);

    // 2. Array filter override (only if it's an array and a filter control type is found)
    // Ensure itemType and itemFormat are passed to determineArrayItemFilterControlType
    if (isArrayType) {
        String arrayFilterControlType = determineArrayItemFilterControlType(fieldName, itemType, itemFormat);
        if (arrayFilterControlType != null) {
            controlType = arrayFilterControlType;
        }
    }

    // 3. Smart control type override (based on field name, can be a smart type or a more specific basic type)
    String smartControlType = determineSmartControlTypeByFieldName(fieldName);
    if (smartControlType != null) {
        controlType = smartControlType;
    }

    return controlType;
}

    public static void populateUiControlType(Map<String, Object> xUiMap, String controlType) {
        if (controlType != null && !xUiMap.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
            xUiMap.put(FieldConfigProperties.CONTROL_TYPE.getValue(), controlType);
        }
    }

    /**
     * Gets the field label from the UI map for use in validation messages.
     * @param xUiMap The UI map.
     * @return The label or a default string "O campo".
     */
    public static String getFieldLabel(Map<String, Object> xUiMap) {
        Object labelObj = xUiMap.get(FieldConfigProperties.LABEL.getValue());
        if (labelObj instanceof String) {
            String label = (String) labelObj;
            if (label != null && !label.trim().isEmpty()) {
                return label;
            }
        }
        return "O campo"; // Default label
    }

    /**
     * Populates default validation messages in the UI map if they are not already set.
     * @param xUiMap The UI map.
     */
    public static void populateDefaultValidationMessages(Map<String, Object> xUiMap) {
        // Required message
        if (Boolean.TRUE.equals(xUiMap.get(ValidationProperties.REQUIRED.getValue())) &&
            !xUiMap.containsKey(ValidationProperties.REQUIRED_MESSAGE.getValue())) {
            String fieldLabel = getFieldLabel(xUiMap);
            xUiMap.put(ValidationProperties.REQUIRED_MESSAGE.getValue(), fieldLabel + " é obrigatório");
        }

        // Min length message
        if (xUiMap.containsKey(ValidationProperties.MIN_LENGTH.getValue()) &&
            !xUiMap.containsKey(ValidationProperties.MIN_LENGTH_MESSAGE.getValue())) {
            String fieldLabel = getFieldLabel(xUiMap);
            String minLength = String.valueOf(xUiMap.get(ValidationProperties.MIN_LENGTH.getValue()));
            xUiMap.put(ValidationProperties.MIN_LENGTH_MESSAGE.getValue(),
                       fieldLabel + " deve ter no mínimo " + minLength + " caracteres");
        }

        // Max length message
        if (xUiMap.containsKey(ValidationProperties.MAX_LENGTH.getValue()) &&
            !xUiMap.containsKey(ValidationProperties.MAX_LENGTH_MESSAGE.getValue())) {
            String fieldLabel = getFieldLabel(xUiMap);
            String maxLength = String.valueOf(xUiMap.get(ValidationProperties.MAX_LENGTH.getValue()));
            xUiMap.put(ValidationProperties.MAX_LENGTH_MESSAGE.getValue(),
                       fieldLabel + " deve ter no máximo " + maxLength + " caracteres");
        }

        // Range message (min/max)
        // This logic tries to create a combined message if both min and max are present,
        // or individual messages if only one is present.
        // It assumes that if a RANGE_MESSAGE is already there, it's been set intentionally (e.g., by annotation).
        if (!xUiMap.containsKey(ValidationProperties.RANGE_MESSAGE.getValue())) {
            String fieldLabel = getFieldLabel(xUiMap);
            boolean hasMin = xUiMap.containsKey(ValidationProperties.MIN.getValue());
            boolean hasMax = xUiMap.containsKey(ValidationProperties.MAX.getValue());
            String minVal = hasMin ? String.valueOf(xUiMap.get(ValidationProperties.MIN.getValue())) : null;
            String maxVal = hasMax ? String.valueOf(xUiMap.get(ValidationProperties.MAX.getValue())) : null;

            if (hasMin && hasMax) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve estar entre " + minVal + " e " + maxVal);
            } else if (hasMin) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve ser maior ou igual a " + minVal);
            } else if (hasMax) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve ser menor ou igual a " + maxVal);
            }
        }

        // Pattern message
        if (xUiMap.containsKey(ValidationProperties.PATTERN.getValue()) &&
            !xUiMap.containsKey(ValidationProperties.PATTERN_MESSAGE.getValue())) {
            String fieldLabel = getFieldLabel(xUiMap);
            xUiMap.put(ValidationProperties.PATTERN_MESSAGE.getValue(),
                       "Formato inválido para " + fieldLabel);
        }

        // Max file size message (uses MAX_LENGTH_MESSAGE key from original resolver logic for this specific message)
        // This is a bit of an oddity from the original code, where MAX_LENGTH_MESSAGE was used for file size.
        // We keep it for now to match behavior but ideally, MAX_FILE_SIZE_MESSAGE would be distinct.
        if (xUiMap.containsKey(ValidationProperties.MAX_FILE_SIZE.getValue()) &&
            !xUiMap.containsKey(ValidationProperties.MAX_LENGTH_MESSAGE.getValue())) { // Checking MAX_LENGTH_MESSAGE
            // We also need to ensure this applies only if it's a file type,
            // but this method doesn't have direct access to schema.format.
            // The caller (CustomOpenApiResolver) would have set MAX_FILE_SIZE only for binary types.
            String fieldLabel = getFieldLabel(xUiMap);
            String maxSize = formatFileSize(xUiMap.get(ValidationProperties.MAX_FILE_SIZE.getValue()));
            xUiMap.put(ValidationProperties.MAX_LENGTH_MESSAGE.getValue(), // Using MAX_LENGTH_MESSAGE
                       "O tamanho máximo do arquivo para " + fieldLabel + " é " + maxSize);
        }

        // Allowed file types message
        if (xUiMap.containsKey(ValidationProperties.ALLOWED_FILE_TYPES.getValue()) &&
            !xUiMap.containsKey(ValidationProperties.FILE_TYPE_MESSAGE.getValue())) {
            // Similar to above, this assumes ALLOWED_FILE_TYPES is set meaningfully by the caller.
            String fieldLabel = getFieldLabel(xUiMap);
            String allowedTypes = String.valueOf(xUiMap.get(ValidationProperties.ALLOWED_FILE_TYPES.getValue()));
            if (!"*/*".equals(allowedTypes) && !"".equals(allowedTypes)) { // Added empty check
                 xUiMap.put(ValidationProperties.FILE_TYPE_MESSAGE.getValue(), "Tipos de arquivo permitidos para " +
                           fieldLabel + ": " + formatAllowedTypes(allowedTypes));
            }
        }
         // --- numericMin/numericMax (UI config) ---
        // This part was in CustomOpenApiResolver's processValidationMessages for x-ui specific numeric range.
        // Replicating it here if those specific x-ui config props (NUMERIC_MIN/MAX) are present and no general RANGE_MESSAGE is set.
        if (!xUiMap.containsKey(ValidationProperties.RANGE_MESSAGE.getValue())) { // Check again if general range message was set above
            String fieldLabel = getFieldLabel(xUiMap);
            boolean hasNumericMin = xUiMap.containsKey(FieldConfigProperties.NUMERIC_MIN.getValue());
            boolean hasNumericMax = xUiMap.containsKey(FieldConfigProperties.NUMERIC_MAX.getValue());
            String numericMinVal = hasNumericMin ? String.valueOf(xUiMap.get(FieldConfigProperties.NUMERIC_MIN.getValue())) : null;
            String numericMaxVal = hasNumericMax ? String.valueOf(xUiMap.get(FieldConfigProperties.NUMERIC_MAX.getValue())) : null;

            if (hasNumericMin && hasNumericMax) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve estar entre " + numericMinVal + " e " + numericMaxVal);
            } else if (hasNumericMin) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve ser maior ou igual a " + numericMinVal);
            } else if (hasNumericMax) {
                xUiMap.put(ValidationProperties.RANGE_MESSAGE.getValue(),
                           fieldLabel + " deve ser menor ou igual a " + numericMaxVal);
            }
        }
    }
}
