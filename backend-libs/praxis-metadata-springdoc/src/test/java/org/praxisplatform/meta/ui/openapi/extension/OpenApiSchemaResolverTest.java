package org.praxisplatform.meta.ui.openapi.extension;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.models.media.Schema;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.praxisplatform.meta.ui.model.property.FieldConfigProperties;
import org.praxisplatform.meta.ui.model.property.FieldControlType;
import org.praxisplatform.meta.ui.model.property.FieldDataType;
import org.praxisplatform.meta.ui.model.property.SmartFieldControlType;
import org.praxisplatform.meta.ui.model.property.ValidationProperties;


import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OpenApiSchemaResolverTest {

    @Mock
    private ObjectMapper mockObjectMapper;

    private OpenApiSchemaResolver schemaResolver;

    private static final String X_UI_PREFIX = "x-";

    @BeforeEach
    void setUp() {
        schemaResolver = new OpenApiSchemaResolver(mockObjectMapper);
    }

    private Schema<?> createPropertySchema() {
        return new Schema<>();
    }

    private Schema<?> createParentSchema() {
        return new Schema<>();
    }

    @Test
    void whenLabelAlreadyExists_resolve_doesNotOverwriteLabel() {
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Object> extensions = new HashMap<>();
        extensions.put(X_UI_PREFIX + FieldConfigProperties.LABEL, "Manual Label");
        propertySchema.setExtensions(extensions);

        schemaResolver.resolve(propertySchema, null, "testProperty");

        assertEquals("Manual Label", getExtension(propertySchema, FieldConfigProperties.LABEL));
        // Also check that name is still inferred
        assertEquals("testProperty", getExtension(propertySchema, FieldConfigProperties.NAME));
    }

    @Test
    void whenControlTypeAlreadyExists_resolve_doesNotOverwriteByFormatInference() {
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("date-time"); // This would normally infer DATE_TIME_PICKER

        Map<String, Object> extensions = new HashMap<>();
        extensions.put(X_UI_PREFIX + FieldConfigProperties.CONTROL_TYPE, "CUSTOM_CONTROL");
        propertySchema.setExtensions(extensions);
        
        // We need to call enrichSchemaPropertyWithXUi directly as resolve is for top-level DTOs
        // and calls processSpecialFields which then calls enrich.
        // For a single property test, calling enrich directly is more straightforward.
        // However, the task is to test the public resolve method's effects.
        // Let's create a dummy parent and call resolve on it.
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("testDateTimeProperty", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null); // parentDtoSchema and propertyName are null for root call

        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("testDateTimeProperty");
        assertEquals("CUSTOM_CONTROL", getExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
        assertEquals(FieldDataType.DATE, getExtension(resolvedPropertySchema, FieldConfigProperties.TYPE)); // Type should still be inferred
    }
    
    @Test
    void whenNameAndLabelAreMissing_resolve_infersNameAndLabelFromPropertyName() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Schema> properties = new HashMap<>();
        properties.put("myProperty", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("myProperty");
        assertEquals("myProperty", getExtension(resolvedPropertySchema, FieldConfigProperties.NAME));
        assertEquals("My Property", getExtension(resolvedPropertySchema, FieldConfigProperties.LABEL));
    }

    // Helper to get an x-ui extension value
    @SuppressWarnings("unchecked")
    private <T> T getXUiExtension(Schema<?> schema, String key) {
        if (schema == null || schema.getExtensions() == null) {
            return null;
        }
        Map<String, Object> extensions = schema.getExtensions();
        // The resolver stores x-ui properties with "x-" prefix directly in the extensions map
        // e.g., "x-ui-label", not nested under an "x-ui" map.
        Object value = extensions.get(X_UI_PREFIX + key);
        try {
            return (T) value;
        } catch (ClassCastException e) {
            fail("Extension " + X_UI_PREFIX + key + " has unexpected type. Value: " + value, e);
            return null;
        }
    }
    
    @Test
    void whenTypeIsStringAndFormatIsEmail_resolve_infersEmailType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("email");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("emailField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("emailField");
        assertEquals(FieldDataType.EMAIL, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        // No specific control type is set by default for email format, unless name also suggests (tested elsewhere)
    }

    @Test
    void whenTypeIsStringAndFormatIsPassword_resolve_infersPasswordTypeAndPasswordControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("password");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("passwordField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("passwordField");
        assertEquals(FieldDataType.PASSWORD, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.PASSWORD, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }
    
    @Test
    void whenTypeIsStringAndFormatIsBinary_resolve_infersFileTypeAndFileUploadControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string"); // OpenAPI 3.0 uses string for binary data
        propertySchema.setFormat("binary");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("fileField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("fileField");
        assertEquals(FieldDataType.FILE, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.FILE_UPLOAD, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenTypeIsInteger_resolve_infersNumberType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("integer");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("ageField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("ageField");
        assertEquals(FieldDataType.NUMBER, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
    }
    
    @Test
    void whenTypeIsNumberAndFormatIsFloatOrDouble_resolve_infersNumberTypeAndNumericFormat() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchemaFloat = createPropertySchema();
        propertySchemaFloat.setType("number");
        propertySchemaFloat.setFormat("float");
        Schema<?> propertySchemaDouble = createPropertySchema();
        propertySchemaDouble.setType("number");
        propertySchemaDouble.setFormat("double");
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("floatField", propertySchemaFloat);
        properties.put("doubleField", propertySchemaDouble);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedFloatField = parentSchema.getProperties().get("floatField");
        assertEquals(FieldDataType.NUMBER, getXUiExtension(resolvedFloatField, FieldConfigProperties.TYPE));
        assertEquals("n2", getXUiExtension(resolvedFloatField, FieldConfigProperties.NUMERIC_FORMAT));
        
        Schema<?> resolvedDoubleField = parentSchema.getProperties().get("doubleField");
        assertEquals(FieldDataType.NUMBER, getXUiExtension(resolvedDoubleField, FieldConfigProperties.TYPE));
        assertEquals("n2", getXUiExtension(resolvedDoubleField, FieldConfigProperties.NUMERIC_FORMAT));
    }

    @Test
    void whenTypeIsBoolean_resolve_infersBooleanTypeAndCheckboxControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("boolean");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("isActiveField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("isActiveField");
        assertEquals(FieldDataType.BOOLEAN, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.CHECKBOX, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenTypeIsArray_resolve_infersMultiSelectControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("array");
        // Typically, items would also be defined, but this tests the array type itself.
        propertySchema.setItems(new Schema<>().type("string")); 
        Map<String, Schema> properties = new HashMap<>();
        properties.put("tagsField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("tagsField");
        assertEquals(FieldControlType.MULTI_SELECT, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenTypeIsObject_resolve_infersExpansionPanelControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("object");
        // Nested properties would go into propertySchema.setProperties(...)
        Map<String, Schema> properties = new HashMap<>();
        properties.put("nestedObjectField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("nestedObjectField");
        assertEquals(FieldControlType.EXPANSION_PANEL, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }
    
    @Test
    void whenSchemaIsReadOnly_resolve_infersReadOnlyTrue() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setReadOnly(true);
        Map<String, Schema> properties = new HashMap<>();
        properties.put("readOnlyField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("readOnlyField");
        assertEquals(true, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.READ_ONLY));
    }

    @Test
    void whenSchemaHasExample_resolve_infersDefaultValue() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setExample("Example Value");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("exampleField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("exampleField");
        assertEquals("Example Value", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.DEFAULT_VALUE));
    }
    
    @Test
    @SuppressWarnings("unchecked")
    void whenSchemaHasEnum_resolve_infersOptionsAndSelectControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setEnum(Arrays.asList("OPTION1", "OPTION2", "OPTION3"));
        Map<String, Schema> properties = new HashMap<>();
        properties.put("enumField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("enumField");
        List<Map<String, Object>> options = getXUiExtension(resolvedPropertySchema, FieldConfigProperties.OPTIONS);
        assertNotNull(options);
        assertEquals(3, options.size());
        assertEquals("OPTION1", options.get(0).get("value"));
        assertEquals("OPTION1", options.get(0).get("label"));
        assertEquals("OPTION2", options.get(1).get("value"));
        assertEquals("OPTION2", options.get(1).get("label"));
        assertEquals("OPTION3", options.get(2).get("value"));
        assertEquals("OPTION3", options.get(2).get("label"));
        
        assertEquals(FieldControlType.SELECT, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenSchemaHasDescription_resolve_infersHelpText() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setDescription("This is a help text.");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("helpTextField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("helpTextField");
        assertEquals("This is a help text.", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.HELP_TEXT));
    }

    @Test
    void whenSchemaHasTitle_resolve_infersPlaceholder() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setTitle("Enter value here");
        Map<String, Schema> properties = new HashMap<>();
        properties.put("placeholderField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("placeholderField");
        assertEquals("Enter value here", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.PLACEHOLDER));
    }

    // --- Validation Properties Inference Tests ---

    @Test
    void whenPropertyIsRequiredInParent_resolve_infersRequiredTrueAndDefaultMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        parentSchema.setRequired(Collections.singletonList("requiredField"));
        
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Schema> properties = new HashMap<>();
        properties.put("requiredField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("requiredField");
        assertEquals(true, getXUiExtension(resolvedPropertySchema, ValidationProperties.REQUIRED));
        assertEquals("Campo obrigatório", getXUiExtension(resolvedPropertySchema, ValidationProperties.REQUIRED_MESSAGE));
    }

    @Test
    void whenPropertyIsRequiredAndMessageExists_resolve_doesNotOverwriteMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        parentSchema.setRequired(Collections.singletonList("requiredField"));
        
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Object> extensions = new HashMap<>();
        extensions.put(X_UI_PREFIX + ValidationProperties.REQUIRED_MESSAGE, "Custom Required Message");
        propertySchema.setExtensions(extensions);
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("requiredField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("requiredField");
        assertEquals(true, getXUiExtension(resolvedPropertySchema, ValidationProperties.REQUIRED));
        assertEquals("Custom Required Message", getXUiExtension(resolvedPropertySchema, ValidationProperties.REQUIRED_MESSAGE));
    }

    @Test
    void whenMinMaxLengthIsSet_resolve_infersValidationPropertiesAndMessages() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setMinLength(5);
        propertySchema.setMaxLength(10);
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("lengthField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("lengthField");
        assertEquals(5, getXUiExtension(resolvedPropertySchema, ValidationProperties.MIN_LENGTH));
        assertEquals("Tamanho mínimo: 5", getXUiExtension(resolvedPropertySchema, ValidationProperties.MIN_LENGTH_MESSAGE));
        assertEquals(10, getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX_LENGTH));
        assertEquals("Tamanho máximo: 10", getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX_LENGTH_MESSAGE));
    }

    @Test
    void whenMinMaxIsSet_resolve_infersValidationPropertiesAndRangeMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setMinimum(BigDecimal.valueOf(1));
        propertySchema.setMaximum(BigDecimal.valueOf(100));
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("rangeField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("rangeField");
        assertEquals(BigDecimal.valueOf(1), getXUiExtension(resolvedPropertySchema, ValidationProperties.MIN));
        assertEquals(BigDecimal.valueOf(100), getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX));
        assertEquals("Valor deve estar entre 1 e 100", getXUiExtension(resolvedPropertySchema, ValidationProperties.RANGE_MESSAGE));
    }
    
    @Test
    void whenOnlyMinIsSet_resolve_infersMinAndRangeMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setMinimum(BigDecimal.valueOf(5));
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("minOnlyField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("minOnlyField");
        assertEquals(BigDecimal.valueOf(5), getXUiExtension(resolvedPropertySchema, ValidationProperties.MIN));
        assertEquals("Valor deve ser no mínimo 5", getXUiExtension(resolvedPropertySchema, ValidationProperties.RANGE_MESSAGE));
        assertNull(getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX));
    }

    @Test
    void whenOnlyMaxIsSet_resolve_infersMaxAndRangeMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setMaximum(BigDecimal.valueOf(50));
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("maxOnlyField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("maxOnlyField");
        assertEquals(BigDecimal.valueOf(50), getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX));
        assertEquals("Valor deve ser no máximo 50", getXUiExtension(resolvedPropertySchema, ValidationProperties.RANGE_MESSAGE));
        assertNull(getXUiExtension(resolvedPropertySchema, ValidationProperties.MIN));
    }


    @Test
    void whenPatternIsSet_resolve_infersPatternValidationAndDefaultMessage() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setPattern("^[a-zA-Z]+$");
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("patternField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("patternField");
        assertEquals("^[a-zA-Z]+$", getXUiExtension(resolvedPropertySchema, ValidationProperties.PATTERN));
        assertEquals("Formato inválido", getXUiExtension(resolvedPropertySchema, ValidationProperties.PATTERN_MESSAGE));
    }
    
    @Test
    void whenFileSchemaWithContentMediaType_resolve_infersAllowedFileTypes() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("binary"); 
        // Simulate contentMediaType being set as a direct extension on the schema (non-standard but for test)
        Map<String, Object> schemaExtensions = new HashMap<>();
        schemaExtensions.put("contentMediaType", "image/png,image/jpeg");
        propertySchema.setExtensions(schemaExtensions);

        Map<String, Schema> properties = new HashMap<>();
        properties.put("customFileField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("customFileField");
        assertEquals("image/png,image/jpeg", getXUiExtension(resolvedPropertySchema, ValidationProperties.ALLOWED_FILE_TYPES));
    }

    @Test
    void whenFileSchemaWithoutContentMediaType_resolve_infersDefaultAllowedFileTypes() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("binary"); 

        Map<String, Schema> properties = new HashMap<>();
        properties.put("genericFileField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("genericFileField");
        assertEquals("*/*", getXUiExtension(resolvedPropertySchema, ValidationProperties.ALLOWED_FILE_TYPES));
    }
    
    @Test
    void whenFileSchemaWithMaxLength_resolve_infersMaxFileSize() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string");
        propertySchema.setFormat("binary");
        propertySchema.setMaxLength(1024 * 1024); // 1MB

        Map<String, Schema> properties = new HashMap<>();
        properties.put("sizedFileField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("sizedFileField");
        assertEquals(1024L * 1024L, getXUiExtension(resolvedPropertySchema, ValidationProperties.MAX_FILE_SIZE));
    }


    // --- Smart Control Type Inference Tests ---
    @Test
    void whenPropertyNameIsCep_resolve_infersSmartCepControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Schema> properties = new HashMap<>();
        properties.put("enderecoCep", propertySchema); // "cep" in the name
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("enderecoCep");
        assertEquals(SmartFieldControlType.SMART_CEP, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenPropertyNameIsCpf_resolve_infersSmartCpfControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Schema> properties = new HashMap<>();
        properties.put("numeroCpf", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("numeroCpf");
        assertEquals(SmartFieldControlType.SMART_CPF, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }
    
    @Test
    void whenPropertyNameIsEmailAndTypeIsString_resolve_infersEmailTypeButNoSmartControlIfNotExplicit() {
        // Note: processTypeAndFormat sets FieldDataType.EMAIL if format is "email".
        // processControlTypes sets FieldDataType.EMAIL if name contains "email" AND type is not already set.
        // This test ensures that if format is not "email", but name is "email", type gets set.
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("string"); // No format="email" here
        Map<String, Schema> properties = new HashMap<>();
        properties.put("contatoEmail", propertySchema); // "email" in the name
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("contatoEmail");
        assertEquals(FieldDataType.EMAIL, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        // No specific smart control type unless one is defined for "SMART_EMAIL" and used
        assertNull(getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE)); 
    }
    
    @Test
    void whenPropertyNameIsDataNascimento_resolve_infersDateTypeAndDatePicker() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        // No type/format set on propertySchema, relying on name inference
        Map<String, Schema> properties = new HashMap<>();
        properties.put("dataNascimento", propertySchema); 
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("dataNascimento");
        assertEquals(FieldDataType.DATE, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.DATE_PICKER, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenPropertyNameIsValor_resolve_infersCurrencyInputControlType() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setType("number"); // Typical for currency
        Map<String, Schema> properties = new HashMap<>();
        properties.put("valorTotal", propertySchema); 
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("valorTotal");
        assertEquals(FieldControlType.CURRENCY_INPUT, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    @Test
    void whenSmartControlTypeCandidateAndControlTypeExists_resolve_doesNotOverwriteExistingControl() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Object> extensions = new HashMap<>();
        extensions.put(X_UI_PREFIX + FieldConfigProperties.CONTROL_TYPE, "MY_CUSTOM_TEXT_INPUT");
        propertySchema.setExtensions(extensions);
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("valorMonetario", propertySchema); // "valor" would suggest CURRENCY_INPUT
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("valorMonetario");
        assertEquals("MY_CUSTOM_TEXT_INPUT", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }

    // --- Nested Schema Tests ---
    @Test
    void whenSchemaHasNestedObject_resolve_appliesInferenceToNestedProperties() {
        Schema<?> rootSchema = createParentSchema(); // This is the DTO
        rootSchema.setType("object");

        Schema<?> nestedObjectSchema = createPropertySchema();
        nestedObjectSchema.setType("object");
        
        Schema<?> nestedProperty1 = createPropertySchema();
        nestedProperty1.setType("string");
        nestedProperty1.setFormat("email");

        Schema<?> nestedProperty2 = createPropertySchema();
        nestedProperty2.setType("integer");
        nestedProperty2.setReadOnly(true);

        Map<String, Schema> nestedPropsMap = new HashMap<>();
        nestedPropsMap.put("contactEmail", nestedProperty1);
        nestedPropsMap.put("internalId", nestedProperty2);
        nestedObjectSchema.setProperties(nestedPropsMap);

        Map<String, Schema> rootPropsMap = new HashMap<>();
        rootPropsMap.put("userDetails", nestedObjectSchema);
        rootSchema.setProperties(rootPropsMap);
        
        schemaResolver.resolve(rootSchema, null, null);

        Schema<?> resolvedNestedObject = rootSchema.getProperties().get("userDetails");
        assertNotNull(resolvedNestedObject);
        assertEquals(FieldControlType.EXPANSION_PANEL, getXUiExtension(resolvedNestedObject, FieldConfigProperties.CONTROL_TYPE));
        assertEquals("userDetails", getXUiExtension(resolvedNestedObject, FieldConfigProperties.NAME));
        assertEquals("User Details", getXUiExtension(resolvedNestedObject, FieldConfigProperties.LABEL));

        Schema<?> resolvedNestedProp1 = resolvedNestedObject.getProperties().get("contactEmail");
        assertNotNull(resolvedNestedProp1);
        assertEquals("contactEmail", getXUiExtension(resolvedNestedProp1, FieldConfigProperties.NAME));
        assertEquals("Contact Email", getXUiExtension(resolvedNestedProp1, FieldConfigProperties.LABEL));
        assertEquals(FieldDataType.EMAIL, getXUiExtension(resolvedNestedProp1, FieldConfigProperties.TYPE));

        Schema<?> resolvedNestedProp2 = resolvedNestedObject.getProperties().get("internalId");
        assertNotNull(resolvedNestedProp2);
        assertEquals("internalId", getXUiExtension(resolvedNestedProp2, FieldConfigProperties.NAME));
        assertEquals("Internal Id", getXUiExtension(resolvedNestedProp2, FieldConfigProperties.LABEL));
        assertEquals(FieldDataType.NUMBER, getXUiExtension(resolvedNestedProp2, FieldConfigProperties.TYPE));
        assertEquals(true, getXUiExtension(resolvedNestedProp2, FieldConfigProperties.READ_ONLY));
    }

    @Test
    void whenSchemaHasArrayOfObjects_resolve_appliesInferenceToArrayItemsSchema() {
        Schema<?> rootSchema = createParentSchema();
        rootSchema.setType("object");

        Schema<?> arraySchema = createPropertySchema();
        arraySchema.setType("array");

        Schema<?> itemSchema = createPropertySchema(); // Schema for the items in the array
        itemSchema.setType("object");
        
        Schema<?> itemProperty = createPropertySchema();
        itemProperty.setType("string");
        itemProperty.setFormat("date"); // Should infer DATE_PICKER for items
        
        Map<String, Schema> itemPropsMap = new HashMap<>();
        itemPropsMap.put("eventDate", itemProperty);
        itemSchema.setProperties(itemPropsMap);
        arraySchema.setItems(itemSchema);

        Map<String, Schema> rootPropsMap = new HashMap<>();
        rootPropsMap.put("eventList", arraySchema);
        rootSchema.setProperties(rootPropsMap);

        schemaResolver.resolve(rootSchema, null, null);

        Schema<?> resolvedArraySchema = rootSchema.getProperties().get("eventList");
        assertNotNull(resolvedArraySchema);
        assertEquals(FieldControlType.MULTI_SELECT, getXUiExtension(resolvedArraySchema, FieldConfigProperties.CONTROL_TYPE)); 
        // Or could be TABLE/LIST if items are objects. Current default for array is MULTI_SELECT.

        Schema<?> resolvedItemSchema = resolvedArraySchema.getItems();
        assertNotNull(resolvedItemSchema);
        // Item schema itself might get a default control type like EXPANSION_PANEL if treated as a standalone object.
        // And its properties should be resolved.
        assertEquals(FieldControlType.EXPANSION_PANEL, getXUiExtension(resolvedItemSchema, FieldConfigProperties.CONTROL_TYPE));

        Schema<?> resolvedItemProperty = resolvedItemSchema.getProperties().get("eventDate");
        assertNotNull(resolvedItemProperty);
        assertEquals("eventDate", getXUiExtension(resolvedItemProperty, FieldConfigProperties.NAME));
        assertEquals("Event Date", getXUiExtension(resolvedItemProperty, FieldConfigProperties.LABEL));
        assertEquals(FieldDataType.DATE, getXUiExtension(resolvedItemProperty, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.DATE_PICKER, getXUiExtension(resolvedItemProperty, FieldConfigProperties.CONTROL_TYPE));
    }
    
    @Test
    void whenSchemaExtensionsMapExistsButIsEmpty_resolve_worksCorrectly() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        propertySchema.setExtensions(new HashMap<>()); // Empty extensions map
        propertySchema.setType("string");
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("emptyExtField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("emptyExtField");
        assertNotNull(resolvedPropertySchema.getExtensions());
        assertEquals("emptyExtField", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.NAME));
        assertEquals(FieldDataType.TEXT, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
    }

    @Test
    void whenSchemaExtensionsMapHasUnrelatedExtensions_resolve_preservesThemAndAddsXUi() {
        Schema<?> parentSchema = createParentSchema();
        parentSchema.setType("object");
        Schema<?> propertySchema = createPropertySchema();
        Map<String, Object> extensions = new HashMap<>();
        extensions.put("x-unrelated-prop", "unrelatedValue");
        propertySchema.setExtensions(extensions);
        propertySchema.setType("boolean");
        
        Map<String, Schema> properties = new HashMap<>();
        properties.put("unrelatedExtField", propertySchema);
        parentSchema.setProperties(properties);

        schemaResolver.resolve(parentSchema, null, null);
        
        Schema<?> resolvedPropertySchema = parentSchema.getProperties().get("unrelatedExtField");
        assertNotNull(resolvedPropertySchema.getExtensions());
        assertEquals("unrelatedValue", resolvedPropertySchema.getExtensions().get("x-unrelated-prop"));
        assertEquals("unrelatedExtField", getXUiExtension(resolvedPropertySchema, FieldConfigProperties.NAME));
        assertEquals(FieldDataType.BOOLEAN, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.TYPE));
        assertEquals(FieldControlType.CHECKBOX, getXUiExtension(resolvedPropertySchema, FieldConfigProperties.CONTROL_TYPE));
    }
}
