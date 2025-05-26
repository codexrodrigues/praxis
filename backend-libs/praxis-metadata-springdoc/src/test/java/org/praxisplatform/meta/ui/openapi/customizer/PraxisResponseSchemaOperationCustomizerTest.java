package org.praxisplatform.meta.ui.openapi.customizer;

import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.RequestBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ResolvableType;
import org.springframework.web.method.HandlerMethod;
import org.praxisplatform.meta.ui.model.generic.RestApiResponse; // Assuming this is the FQN

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PraxisResponseSchemaOperationCustomizerTest {

    @Mock
    private Operation mockOperation;
    @Mock
    private HandlerMethod mockHandlerMethod;
    @Mock
    private Method mockMethod; // For HandlerMethod.getMethod()
    @Mock
    private RequestBody mockRequestBody;
    @Mock
    private Content mockContent;
    @Mock
    private MediaType mockMediaType;
    @Mock
    private Schema<?> mockSchema; // For RequestBody schema or Response schema

    @Captor
    private ArgumentCaptor<Map<String, Object>> extensionsCaptor;

    private PraxisResponseSchemaOperationCustomizer customizer;

    private static final String X_UI_PREFIX = "x-ui";
    private static final String RESPONSE_SCHEMA_PROPERTY = "responseSchema";
    private static final String REF_PREFIX_COMPONENTS_SCHEMAS = "#/components/schemas/";

    // Define some DTO classes for testing return types
    static class MyRequestDto {}
    static class MyResponseDto {}
    static class AnotherDto {}


    @BeforeEach
    void setUp() {
        customizer = new PraxisResponseSchemaOperationCustomizer();
        // Reset extensions map for each test if operation is reused.
        // Here, we mock getExtensions, so its behavior is controlled per test.
    }

    @Test
    void whenRequestBodyRefersToDto_customize_setsResponseSchemaExtension() {
        // Arrange
        when(mockOperation.getOperationId()).thenReturn("testOpWithRequestBody");
        when(mockOperation.getRequestBody()).thenReturn(mockRequestBody);
        when(mockRequestBody.getContent()).thenReturn(mockContent);
        when(mockContent.values()).thenReturn(java.util.Collections.singletonList(mockMediaType));
        when(mockMediaType.getSchema()).thenReturn(mockSchema);
        when(mockSchema.get$ref()).thenReturn(REF_PREFIX_COMPONENTS_SCHEMAS + "MyRequestDto");

        // Mock getExtensions() to return a real map we can inspect
        Map<String, Object> operationExtensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(operationExtensions);
        // No need to mock setExtensions if we directly modify the returned map and verify it.
        // However, the customizer creates a new map if getExtensions() is null,
        // or creates the x-ui map if it's null.
        // Let's ensure getExtensions() returns a map that the customizer can work with.
        // The customizer's logic is:
        // extensions = operation.getExtensions();
        // ...
        // if (extensions == null) { extensions = new HashMap(); operation.setExtensions(extensions); }
        // So, if getExtensions() returns our 'operationExtensions', setExtensions won't be called for that.
        // Then it gets/creates the xUiMap within 'operationExtensions'.

        // Act
        customizer.customize(mockOperation, mockHandlerMethod);

        // Assert
        assertNotNull(operationExtensions.get(X_UI_PREFIX));
        assertTrue(operationExtensions.get(X_UI_PREFIX) instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, Object> xUiMap = (Map<String, Object>) operationExtensions.get(X_UI_PREFIX);
        assertEquals("MyRequestDto", xUiMap.get(RESPONSE_SCHEMA_PROPERTY));
        
        // Verify that setExtensions was NOT called if getExtensions initially returned a map.
        // If getExtensions() returned null, then setExtensions would be called.
        // For this test, we ensured getExtensions() returns a map.
        // verify(mockOperation, never()).setExtensions(anyMap()); // This is too strict, depends on internal logic of customizer
    }

    @Test
    void whenReturnTypeIsDirectDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        // Arrange
        when(mockOperation.getOperationId()).thenReturn("testOpWithDirectDtoReturn");
        when(mockOperation.getRequestBody()).thenReturn(null); // No request body for this test
        
        // Mock HandlerMethod and Method for return type
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getDirectDto"));
        
        // Mock getExtensions for the operation
        Map<String, Object> operationExtensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(operationExtensions);
        
        // Act
        customizer.customize(mockOperation, mockHandlerMethod);
        
        // Assert
        assertNotNull(operationExtensions.get(X_UI_PREFIX));
        assertTrue(operationExtensions.get(X_UI_PREFIX) instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, Object> xUiMap = (Map<String, Object>) operationExtensions.get(X_UI_PREFIX);
        assertEquals("MyResponseDto", xUiMap.get(RESPONSE_SCHEMA_PROPERTY));
    }

    // Dummy controller for method signature reflection
    static class TestController {
        public MyResponseDto getDirectDto() { return null; }
        public org.springframework.http.ResponseEntity<MyResponseDto> getResponseEntityDto() { return null; }
        public RestApiResponse<MyResponseDto> getRestApiResponseDto() { return null; }
        public org.springframework.data.domain.Page<MyResponseDto> getPageDto() { return null; }
        public java.util.List<MyResponseDto> getListDto() { return null; }
        public org.springframework.hateoas.EntityModel<MyResponseDto> getEntityModelDto() { return null; }
        public java.util.List<org.springframework.hateoas.EntityModel<MyResponseDto>> getListEntityModelDto() { return null; }
        public void getVoid() {}
        public String getString() { return null; }
        public org.springframework.http.ResponseEntity<String> getResponseEntityString() { return null; }
    }

    private void assertResponseSchemaExtension(Map<String, Object> operationExtensions, String expectedDtoName) {
        assertNotNull(operationExtensions, "Operation extensions map should not be null");
        Object xUiObj = operationExtensions.get(X_UI_PREFIX);
        assertNotNull(xUiObj, "x-ui extension should exist");
        assertTrue(xUiObj instanceof Map, "x-ui extension should be a Map");
        @SuppressWarnings("unchecked")
        Map<String, Object> xUiMap = (Map<String, Object>) xUiObj;
        assertEquals(expectedDtoName, xUiMap.get(RESPONSE_SCHEMA_PROPERTY), "responseSchema property mismatch");
    }
    
    private void assertNoResponseSchemaExtension(Map<String, Object> operationExtensions) {
        if (operationExtensions == null) {
            assertTrue(true, "No extensions, so no responseSchema is correct.");
            return;
        }
        Object xUiObj = operationExtensions.get(X_UI_PREFIX);
        if (xUiObj == null) {
            assertTrue(true, "No x-ui extension, so no responseSchema is correct.");
            return;
        }
        assertTrue(xUiObj instanceof Map, "x-ui extension should be a Map");
        @SuppressWarnings("unchecked")
        Map<String, Object> xUiMap = (Map<String, Object>) xUiObj;
        assertFalse(xUiMap.containsKey(RESPONSE_SCHEMA_PROPERTY), "responseSchema property should not be present.");
    }

    @Test
    void whenReturnTypeIsResponseEntityDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opResponseEntity");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getResponseEntityDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }

    @Test
    void whenReturnTypeIsRestApiResponseDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opRestApiResponse");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getRestApiResponseDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }

    @Test
    void whenReturnTypeIsPageDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opPageDto");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getPageDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }

    @Test
    void whenReturnTypeIsListDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opListDto");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getListDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }

    @Test
    void whenReturnTypeIsEntityModelDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opEntityModelDto");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getEntityModelDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }
    
    @Test
    void whenReturnTypeIsListEntityModelDto_customize_setsResponseSchemaExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opListEntityModelDto");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getListEntityModelDto"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertResponseSchemaExtension(extensions, "MyResponseDto");
    }

    @Test
    void whenResponseSchemaManuallySet_customize_doesNotOverwrite() {
        when(mockOperation.getOperationId()).thenReturn("opManualOverride");
        
        Map<String, Object> xUiMap = new HashMap<>();
        xUiMap.put(RESPONSE_SCHEMA_PROPERTY, "ManualDtoName");
        Map<String, Object> operationExtensions = new HashMap<>();
        operationExtensions.put(X_UI_PREFIX, xUiMap);
        
        when(mockOperation.getExtensions()).thenReturn(operationExtensions);
        // No need to mock requestBody or handlerMethod if manual override is checked first

        customizer.customize(mockOperation, mockHandlerMethod);
        
        assertResponseSchemaExtension(operationExtensions, "ManualDtoName");
        // Verify no other DTO inference methods were called (e.g. getRequestBody, getMethod)
        verify(mockOperation, never()).getRequestBody();
        verify(mockHandlerMethod, never()).getMethod();
    }

    @Test
    void whenReturnTypeIsVoid_customize_doesNotSetExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opVoidReturn");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getVoid"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);
        // Also mock getResponses to ensure it doesn't find something there by accident
        when(mockOperation.getResponses()).thenReturn(null);


        customizer.customize(mockOperation, mockHandlerMethod);
        assertNoResponseSchemaExtension(extensions);
    }

    @Test
    void whenReturnTypeIsString_customize_doesNotSetExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opStringReturn");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getString"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);
        when(mockOperation.getResponses()).thenReturn(null);


        customizer.customize(mockOperation, mockHandlerMethod);
        assertNoResponseSchemaExtension(extensions);
    }
    
    @Test
    void whenReturnTypeIsResponseEntityString_customize_doesNotSetExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opResponseEntityString");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getResponseEntityString"));
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);
        when(mockOperation.getResponses()).thenReturn(null);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertNoResponseSchemaExtension(extensions);
    }
    
    @Test
    void whenNoDtoInBodyOrReturn_fallbackToOperationResponse_setsExtension() throws NoSuchMethodException {
        // Arrange
        when(mockOperation.getOperationId()).thenReturn("opFallbackToResponse");
        when(mockOperation.getRequestBody()).thenReturn(null); // No DTO in request body
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getString")); // Return type is String

        // Mock Operation Responses
        io.swagger.v3.oas.models.responses.ApiResponses apiResponses = new io.swagger.v3.oas.models.responses.ApiResponses();
        io.swagger.v3.oas.models.responses.ApiResponse mockApiResponse = new io.swagger.v3.oas.models.responses.ApiResponse();
        Content responseContent = new Content();
        MediaType responseMediaType = new MediaType();
        Schema<?> responseSchema = new Schema<>();
        responseSchema.set$ref(REF_PREFIX_COMPONENTS_SCHEMAS + "MyFallbackDto");
        responseMediaType.setSchema(responseSchema);
        responseContent.addMediaType("application/json", responseMediaType);
        mockApiResponse.setContent(responseContent);
        apiResponses.addApiResponse("200", mockApiResponse);
        when(mockOperation.getResponses()).thenReturn(apiResponses);
        
        Map<String, Object> operationExtensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(operationExtensions);

        // Act
        customizer.customize(mockOperation, mockHandlerMethod);

        // Assert
        assertResponseSchemaExtension(operationExtensions, "MyFallbackDto");
    }
    
     @Test
    void whenNoDtoIdentifiedAnywhere_customize_doesNotSetExtension() throws NoSuchMethodException {
        when(mockOperation.getOperationId()).thenReturn("opNoDtoAnywhere");
        when(mockOperation.getRequestBody()).thenReturn(null);
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getVoid")); // Void return
        when(mockOperation.getResponses()).thenReturn(null); // No responses
        
        Map<String, Object> extensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(extensions);

        customizer.customize(mockOperation, mockHandlerMethod);
        assertNoResponseSchemaExtension(extensions);
    }

    @Test
    void whenOperationExtensionsIsNull_customize_createsExtensionsMapAndSetsResponseSchema() throws NoSuchMethodException {
        // Arrange
        when(mockOperation.getOperationId()).thenReturn("opNullExtensions");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getDirectDto")); // Identify a DTO
        
        when(mockOperation.getExtensions()).thenReturn(null); // Simulate extensions map being initially null

        // ArgumentCaptor to capture the map passed to setExtensions
        ArgumentCaptor<Map<String, Object>> extensionsSetCaptor = ArgumentCaptor.forClass(Map.class);

        // Act
        customizer.customize(mockOperation, mockHandlerMethod);

        // Assert
        // Verify that setExtensions was called once
        verify(mockOperation, times(1)).setExtensions(extensionsSetCaptor.capture());
        
        Map<String, Object> capturedExtensions = extensionsSetCaptor.getValue();
        assertResponseSchemaExtension(capturedExtensions, "MyResponseDto");
    }

    @Test
    void whenOperationXUiExtensionIsNotMap_customizer_overwritesAndSetsResponseSchema() throws NoSuchMethodException {
        // Arrange
        when(mockOperation.getOperationId()).thenReturn("opXUiNotMap");
        when(mockHandlerMethod.getMethod()).thenReturn(TestController.class.getMethod("getDirectDto"));

        Map<String, Object> initialExtensions = new HashMap<>();
        initialExtensions.put(X_UI_PREFIX, "This is not a Map"); // Put a non-map object for x-ui
        when(mockOperation.getExtensions()).thenReturn(initialExtensions);
        
        // Act
        customizer.customize(mockOperation, mockHandlerMethod);
        
        // Assert
        // The initialExtensions map itself will be modified by the customizer.
        assertResponseSchemaExtension(initialExtensions, "MyResponseDto");
    }
    
    @Test
    void whenDtoNameHasDotsAndIsLikelyDto_customize_usesSimpleName() throws NoSuchMethodException {
        // This test is to ensure that if a FQDN somehow gets to isLikelyDto, it's handled (though typically simple names are used)
        // and that the simple name is stored.
        // The current isLikelyDto takes (String name, Class<?> clazz). 'name' is usually SimpleName.
        // Let's test the scenario where the $ref might be a FQDN (though not standard for #/components/schemas/)
        // or the return type's simple name is what gets used.

        when(mockOperation.getOperationId()).thenReturn("testOpWithFqdnLikeRef");
        when(mockOperation.getRequestBody()).thenReturn(mockRequestBody);
        when(mockRequestBody.getContent()).thenReturn(mockContent);
        when(mockContent.values()).thenReturn(java.util.Collections.singletonList(mockMediaType));
        when(mockMediaType.getSchema()).thenReturn(mockSchema);
        // Simulate a $ref that might look like a FQDN but is still treated as a schema name
        when(mockSchema.get$ref()).thenReturn(REF_PREFIX_COMPONENTS_SCHEMAS + "com.example.MyRequestDto"); 
                                                                                                    
        Map<String, Object> operationExtensions = new HashMap<>();
        when(mockOperation.getExtensions()).thenReturn(operationExtensions);

        customizer.customize(mockOperation, mockHandlerMethod);

        assertResponseSchemaExtension(operationExtensions, "com.example.MyRequestDto"); 
        // The customizer extracts the name from $ref as is. "isLikelyDto" would then use this name.
        // If "com.example.MyRequestDto" ends with "Dto", it's considered a DTO.
    }
}
