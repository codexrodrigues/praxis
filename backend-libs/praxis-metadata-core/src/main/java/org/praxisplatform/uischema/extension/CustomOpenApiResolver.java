package org.praxisplatform.uischema.extension;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.core.jackson.ModelResolver;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.models.media.Schema;
import org.praxisplatform.uischema.FieldConfigProperties;
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.ValidationProperties;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.numeric.NumberFormatStyle;
import org.praxisplatform.uischema.util.OpenApiUiUtils;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class CustomOpenApiResolver extends ModelResolver {

    // Cache para armazenar campos constantes das interfaces
    private static final Map<String, String> FIELD_PROPERTIES_MAP = new HashMap<>();
    private static final Map<String, String> VALIDATION_PROPERTIES_MAP = new HashMap<>();
    // Constante para o nome da extensão UI
    private static final String UI_EXTENSION_NAME = "x-ui";
    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(CustomOpenApiResolver.class);


    // Inicializar o cache estaticamente
    static {
        initializePropertiesMap(FieldConfigProperties.class, FIELD_PROPERTIES_MAP);
        initializePropertiesMap(ValidationProperties.class, VALIDATION_PROPERTIES_MAP);
    }

    public CustomOpenApiResolver(ObjectMapper mapper) {
        super(mapper);
    }


    @Override
    protected void applyBeanValidatorAnnotations(Schema property, Annotation[] annotations, Schema parent, boolean applyNotNullAnnotations) {
        super.applyBeanValidatorAnnotations(property, annotations, parent, applyNotNullAnnotations);

        if (annotations != null && ResolverUtils.getAnnotation(UISchema.class, annotations) != null) {
            // Primeiro processa as anotações UISchema e UIExtension (código existente)
            resolveSchema(property, annotations);
            resolveExtension(property, annotations);

            // Processa anotações padrão do OpenAPI e Jakarta Validation
            processStandardAnnotations(property, annotations);

            // Centralized validation message population
            OpenApiUiUtils.populateDefaultValidationMessages(getUIExtensionMap(property));
        }
    }

    private void resolveSchema(Schema<?> property, Annotation[] annotations) {
        UISchema annotation = ResolverUtils.getAnnotation(UISchema.class, annotations);
        if (annotation != null) {
            Map<String, Object> uiExtension = getUIExtensionMap(property);

            // Processar campos dinâmicamente usando reflexão
            processAnnotationDynamically(annotation, uiExtension);

            // Adicionar metadata personalizada, que tem precedência
            if (annotation.extraProperties() != null && annotation.extraProperties().length > 0) {
                for (ExtensionProperty p : annotation.extraProperties()) {
                    uiExtension.putIfAbsent(p.name(), p.value());
                }
            }

        }
    }

    private void processAnnotationDynamically(UISchema annotation, Map<String, Object> uiExtension) {
        Method[] methods = UISchema.class.getDeclaredMethods();

        for (Method method : methods) {
            String methodName = method.getName();

            // Pular métodos que não são propriedades ou metadata (que é tratado separadamente)
            if (methodName.equals("metadata") || methodName.equals("description") ||
                    methodName.equals("hashCode") || methodName.equals("toString") ||
                    methodName.equals("equals")) {
                continue;
            }

            try {
                Object value = method.invoke(annotation);

                // Determinar o nome da propriedade na extensão
                String extensionPropertyName = getExtensionPropertyName(methodName);

                // Processar valor baseado no tipo
                if (value instanceof Boolean) {
                    Boolean boolValue = (Boolean) value;
                    // Verificar valor booleano padrão diferente (por exemplo, false para "editable")
                    if (methodName.equals("editable") || methodName.equals("sortable")) {
                        if (!boolValue) uiExtension.putIfAbsent(extensionPropertyName, "false");
                    } else {
                        if (boolValue) uiExtension.putIfAbsent(extensionPropertyName, "true");
                    }
                } else if (value instanceof Integer) {
                    Integer intValue = (Integer) value;
                    if (intValue != 0) uiExtension.putIfAbsent(extensionPropertyName, intValue.toString());
                } else if (value instanceof String) {
                    String strValue = (String) value;
                    if (!strValue.isEmpty()) uiExtension.putIfAbsent(extensionPropertyName, strValue);
                }
            } catch (Exception e) {
                // Log error if needed
            }
        }
    }

    private String getExtensionPropertyName(String methodName) {
        // Primeiro verificar se o método corresponde a uma propriedade em FieldConfigProperties
        for (Map.Entry<String, String> entry : FIELD_PROPERTIES_MAP.entrySet()) {
            String constName = entry.getKey();
            String propertyValue = entry.getValue();

            // Converter de camelCase para CONSTANT_CASE para comparação aproximada
            String camelCasePropertyName = toCamelCase(constName);

            if (methodName.equalsIgnoreCase(camelCasePropertyName)) {
                return propertyValue;
            }
        }

        // Em seguida, verificar ValidationProperties
        for (Map.Entry<String, String> entry : VALIDATION_PROPERTIES_MAP.entrySet()) {
            String constName = entry.getKey();
            String propertyValue = entry.getValue();

            // Converter de camelCase para CONSTANT_CASE para comparação aproximada
            String camelCasePropertyName = toCamelCase(constName);

            if (methodName.equalsIgnoreCase(camelCasePropertyName)) {
                return propertyValue;
            }
        }

        // Se não encontrado, usar o próprio nome do método
        return methodName;
    }

    private static String toCamelCase(String constCase) {
        if (constCase == null || constCase.isEmpty()) {
            return constCase;
        }

        String[] parts = constCase.toLowerCase().split("_");
        StringBuilder camelCase = new StringBuilder(parts[0]);

        for (int i = 1; i < parts.length; i++) {
            if (parts[i].length() > 0) {
                camelCase.append(Character.toUpperCase(parts[i].charAt(0)))
                        .append(parts[i].substring(1));
            }
        }

        return camelCase.toString();
    }

    /**
     * Inicializa dinamicamente o mapa de propriedades a partir de uma interface de constantes
     */
    private static void initializePropertiesMap(Class<?> interfaceClass, Map<String, String> propertiesMap) {
        try {
            Field[] fields = interfaceClass.getDeclaredFields();
            for (Field field : fields) {
                if (field.getType() == String.class && java.lang.reflect.Modifier.isStatic(field.getModifiers())) {
                    String constName = field.getName();
                    String constValue = (String) field.get(null);
                    propertiesMap.put(constName, constValue);
                }
            }
        } catch (Exception e) {
            // Log error if needed
        }
    }

    private void resolveExtension(Schema<?> property, Annotation[] annotations) {
        UISchema annotation = ResolverUtils.getAnnotation(UISchema.class, annotations);
        if (annotation != null && annotation.extraProperties() != null) {
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
                .computeIfAbsent(UI_EXTENSION_NAME, k -> new HashMap<>());
    }

    private void setProperties(UISchema annotation, Map<String, Object> uiExtension) {
        Arrays.stream(annotation.extraProperties())
                .forEach(extensionProperty ->
                        uiExtension.putIfAbsent(extensionProperty.name(), extensionProperty.value())
                );
    }

    /**
     * Processa anotações do Jakarta Validation e Schema OpenAPI, configurando
     * o x-ui automaticamente quando não definido explicitamente.
     */
    private void processStandardAnnotations(Schema<?> property, Annotation[] annotations) {
        Map<String, Object> uiExtension = getUIExtensionMap(property);
        String fieldName = null;

        // 1. Processar propriedades do Schema OpenAPI
        if (property != null) {
            // Tentar obter o nome do campo a partir do contexto
            try {
                // O nome do campo geralmente está disponível no contexto onde o schema é construído
                fieldName = property.getName();
            } catch (Exception e) {
                // Ignora erro se não conseguir obter o nome do campo
            }

            // Utilizar métodos centralizados de OpenApiUiUtils
            OpenApiUiUtils.populateUiName(uiExtension, fieldName); // Though not strictly used before, good for consistency
            OpenApiUiUtils.populateUiLabel(uiExtension, property.getTitle(), fieldName);
            OpenApiUiUtils.populateUiPlaceholder(uiExtension, property.getTitle());
            OpenApiUiUtils.populateUiHelpText(uiExtension, property.getDescription());
            OpenApiUiUtils.populateUiDefaultValue(uiExtension, property.getExample()); // Already uses util, ensures it uses updated one
            OpenApiUiUtils.populateUiReadOnly(uiExtension, property.getReadOnly()); // Already uses util, ensures it uses updated one

            // ControlType baseado no tipo e formato
            if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
                String openApiType = property.getType();
                String openApiFormat = property.getFormat();
                boolean hasEnum = property.getEnum() != null && !property.getEnum().isEmpty();
                Integer maxLengthSchema = property.getMaxLength();
                boolean isArrayType = "array".equals(openApiType);
                String itemType = null;
                String itemFormat = null;
                boolean isArrayItemsHaveEnum = false;

                if (isArrayType && property.getItems() != null) {
                    Schema<?> itemsSchema = property.getItems();
                    itemType = itemsSchema.getType();
                    itemFormat = itemsSchema.getFormat();
                    if (itemsSchema.getEnum() != null && !itemsSchema.getEnum().isEmpty()) {
                        isArrayItemsHaveEnum = true;
                    }
                }

                // fieldName foi obtido anteriormente no método
                String controlType = OpenApiUiUtils.determineEffectiveControlType(
                        openApiType, openApiFormat, hasEnum, maxLengthSchema,
                        isArrayType, itemType, itemFormat, isArrayItemsHaveEnum,
                        fieldName // fieldName was obtained earlier in the method
                );

                if (controlType != null) {
                    uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), controlType);
                }
            }
            // Adicionar NUMERIC_FORMAT se o formato for "percent"
            // This specific logic might remain if not covered by a general numeric format population
            if ("number".equals(property.getType()) && "percent".equals(property.getFormat())) {
                if (!uiExtension.containsKey(FieldConfigProperties.NUMERIC_FORMAT.getValue())) {
                    uiExtension.put(FieldConfigProperties.NUMERIC_FORMAT.getValue(), NumberFormatStyle.PERCENT.getValue());
                }
            }

            OpenApiUiUtils.populateUiMinimum(uiExtension, property.getMinimum(), null);
            OpenApiUiUtils.populateUiMaximum(uiExtension, property.getMaximum(), null);
            OpenApiUiUtils.populateUiMinimum(uiExtension, property.getMinimum(), null); // Pass null for message
            OpenApiUiUtils.populateUiMaximum(uiExtension, property.getMaximum(), null); // Pass null for message
            OpenApiUiUtils.populateUiMinLength(uiExtension, property.getMinLength(), null); // Pass null for message
            OpenApiUiUtils.populateUiMaxLength(uiExtension, property.getMaxLength(), null); // Pass null for message
            OpenApiUiUtils.populateUiPattern(uiExtension, property.getPattern(), null); // Pass null for message
            // Ensure 'this.mapper' (ObjectMapper from ModelResolver) is passed to the updated method
            OpenApiUiUtils.populateUiOptionsFromEnum(uiExtension, property.getEnum(), this._mapper);
            OpenApiUiUtils.populateUiRequired(uiExtension, property.getRequired() != null && !property.getRequired().isEmpty());
        }

        // 2. Processar anotações Jakarta Validation
        for (Annotation annotation : annotations) {
            String annotationType = annotation.annotationType().getSimpleName();

            switch (annotationType) {
                // Validações de obrigatoriedade
                case "NotNull":
                case "NotEmpty":
                case "NotBlank":
                    // Use the utility method. Message will be handled by processValidationMessages if not set by another source.
                    OpenApiUiUtils.populateUiRequired(uiExtension, true);
                    break;

                // Validações de tamanho
                case "Size":
                    processSizeAnnotation(annotation, uiExtension);
                    break;

                // Validações numéricas
                case "Min":
                    processMinAnnotation(annotation, uiExtension);
                    break;

                case "Max":
                    processMaxAnnotation(annotation, uiExtension);
                    break;

                case "DecimalMin":
                    processDecimalMinAnnotation(annotation, uiExtension);
                    break;

                case "DecimalMax":
                    processDecimalMaxAnnotation(annotation, uiExtension);
                    break;

                // Validações de padrão
                case "Pattern":
                    processPatternAnnotation(annotation, uiExtension);
                    break;

                // Validações de email
                case "Email":
                    if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
                        // Assuming FieldControlType.EMAIL_INPUT is now available
                        uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), FieldControlType.EMAIL_INPUT.getValue());
                    }
                    break;

                // Validações booleanas
                case "AssertTrue":
                case "AssertFalse":
                    if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
                        uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), FieldControlType.CHECKBOX.getValue());
                    }
                    break;

                // Validações de data
                case "Past":
                case "PastOrPresent":
                case "Future":
                case "FutureOrPresent":
                    processTemporal(annotation, annotationType, uiExtension);
                    break;

                // Validações numéricas adicionais
                case "Positive":
                case "PositiveOrZero":
                    processPositiveAnnotation(annotationType, uiExtension); // This method itself sets CONTROL_TYPE to "numeric"
                    break;

                case "Negative":
                case "NegativeOrZero":
                    processNegativeAnnotation(annotationType, uiExtension);
                    break;

                case "Digits":
                    processDigitsAnnotation(annotation, uiExtension);
                    break;

                default:
                    // Outras anotações não processadas
                    break;
            }
        }
    }

    // The determineControlType method is removed as its functionality is replaced by determineEffectiveControlType.

    /**
     * Processa a anotação @Size para definir minLength e maxLength
     */
    private void processSizeAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method minMethod = annotation.annotationType().getMethod("min");
            Integer min = (Integer) minMethod.invoke(annotation);

            Method maxMethod = annotation.annotationType().getMethod("max");
            Integer max = (Integer) maxMethod.invoke(annotation);

            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation); // Generic message for @Size

            // populateUiMinLength and populateUiMaxLength will handle the Integer.MAX_VALUE check for max
            // Pass the generic @Size message; specific min/max messages will be generated by processValidationMessages if needed and if this message is not set
            OpenApiUiUtils.populateUiMinLength(uiExtension, (min > 0 ? min : null), !message.startsWith("{") ? message : null);
            OpenApiUiUtils.populateUiMaxLength(uiExtension, (max < Integer.MAX_VALUE ? max : null), !message.startsWith("{") ? message : null);

        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa a anotação @Min para definir min
     */
    private void processMinAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method valueMethod = annotation.annotationType().getMethod("value");
            Long value = (Long) valueMethod.invoke(annotation);
            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation);

            OpenApiUiUtils.populateUiMinimum(uiExtension, value, !message.startsWith("{") ? message : null);
        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa a anotação @Max para definir max
     */
    private void processMaxAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method valueMethod = annotation.annotationType().getMethod("value");
            Long value = (Long) valueMethod.invoke(annotation);
            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation);

            OpenApiUiUtils.populateUiMaximum(uiExtension, value, !message.startsWith("{") ? message : null);
        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa a anotação @DecimalMin
     */
    private void processDecimalMinAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method valueMethod = annotation.annotationType().getMethod("value");
            String stringValue = (String) valueMethod.invoke(annotation);
            java.math.BigDecimal value = new java.math.BigDecimal(stringValue);
            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation);

            OpenApiUiUtils.populateUiMinimum(uiExtension, value, !message.startsWith("{") ? message : null);
        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa a anotação @DecimalMax
     */
    private void processDecimalMaxAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method valueMethod = annotation.annotationType().getMethod("value");
            String stringValue = (String) valueMethod.invoke(annotation);
            java.math.BigDecimal value = new java.math.BigDecimal(stringValue);
            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation);

            OpenApiUiUtils.populateUiMaximum(uiExtension, value, !message.startsWith("{") ? message : null);
        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa a anotação @Pattern
     */
    private void processPatternAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method regexpMethod = annotation.annotationType().getMethod("regexp");
            String patternValue = (String) regexpMethod.invoke(annotation);
            Method messageMethod = annotation.annotationType().getMethod("message");
            String message = (String) messageMethod.invoke(annotation);

            OpenApiUiUtils.populateUiPattern(uiExtension, patternValue, !message.startsWith("{") ? message : null);
        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

    /**
     * Processa anotações temporais (Past, Future, etc)
     */
    private void processTemporal(Annotation annotation, String annotationType, Map<String, Object> uiExtension) {
        if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
            uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), FieldControlType.DATE_PICKER.getValue());
        }

        // Configura validações adicionais com base no tipo de anotação
        switch (annotationType) {
            case "Past":
                if (!uiExtension.containsKey(ValidationProperties.MAX.getValue())) {
                    uiExtension.put(ValidationProperties.MAX.getValue(), "today");
                }
                break;
            case "Future":
                if (!uiExtension.containsKey(ValidationProperties.MIN.getValue())) {
                    uiExtension.put(ValidationProperties.MIN.getValue(), "tomorrow");
                }
                break;
            case "PastOrPresent":
                if (!uiExtension.containsKey(ValidationProperties.MAX.getValue())) {
                    uiExtension.put(ValidationProperties.MAX.getValue(), "today");
                }
                break;
            case "FutureOrPresent":
                if (!uiExtension.containsKey(ValidationProperties.MIN.getValue())) {
                    uiExtension.put(ValidationProperties.MIN.getValue(), "today");
                }
                break;
        }
    }

    /**
     * Processa anotações de positividade (@Positive, @PositiveOrZero)
     */
    private void processPositiveAnnotation(String annotationType, Map<String, Object> uiExtension) {
        if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
            uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), FieldControlType.NUMERIC_TEXT_BOX.getValue());
        }

        if (!uiExtension.containsKey(ValidationProperties.MIN.getValue())) {
            String minValue = "PositiveOrZero".equals(annotationType) ? "0" : "0.000001";
            uiExtension.put(ValidationProperties.MIN.getValue(), minValue);

            if (!uiExtension.containsKey(FieldConfigProperties.NUMERIC_MIN.getValue())) {
                uiExtension.put(FieldConfigProperties.NUMERIC_MIN.getValue(), minValue);
            }
        }
    }

    /**
     * Processa anotações de negatividade (@Negative, @NegativeOrZero)
     */
    private void processNegativeAnnotation(String annotationType, Map<String, Object> uiExtension) {
        if (!uiExtension.containsKey(FieldConfigProperties.CONTROL_TYPE.getValue())) {
            uiExtension.put(FieldConfigProperties.CONTROL_TYPE.getValue(), FieldControlType.NUMERIC_TEXT_BOX.getValue());
        }

        if (!uiExtension.containsKey(ValidationProperties.MAX.getValue())) {
            String maxValue = "NegativeOrZero".equals(annotationType) ? "0" : "-0.000001";
            uiExtension.put(ValidationProperties.MAX.getValue(), maxValue);

            if (!uiExtension.containsKey(FieldConfigProperties.NUMERIC_MAX.getValue())) {
                uiExtension.put(FieldConfigProperties.NUMERIC_MAX.getValue(), maxValue);
            }
        }
    }

    /**
     * Processa a anotação @Digits
     */
    private void processDigitsAnnotation(Annotation annotation, Map<String, Object> uiExtension) {
        try {
            Method integerMethod = annotation.annotationType().getMethod("integer");
            int integerDigits = (int) integerMethod.invoke(annotation);

            Method fractionMethod = annotation.annotationType().getMethod("fraction");
            int fractionDigits = (int) fractionMethod.invoke(annotation);

            // Configura formato numérico baseado nos dígitos inteiros e fracionários
            if (!uiExtension.containsKey(FieldConfigProperties.NUMERIC_FORMAT.getValue())) {
                StringBuilder format = new StringBuilder();
                format.append("#");

                if (integerDigits > 1) {
                    format.append(",".repeat(integerDigits - 1));
                }

                if (fractionDigits > 0) {
                    format.append(".");
                    format.append("#".repeat(fractionDigits));
                }

                uiExtension.put(FieldConfigProperties.NUMERIC_FORMAT.getValue(), format.toString());
            }

            // Configura step para garantir precisão adequada
            if (!uiExtension.containsKey(FieldConfigProperties.NUMERIC_STEP.getValue())) {
                double step = Math.pow(10, -fractionDigits);
                uiExtension.put(FieldConfigProperties.NUMERIC_STEP.getValue(), String.valueOf(step));
            }

        } catch (Exception e) {
            // Ignorar erros de reflexão
        }
    }

}
