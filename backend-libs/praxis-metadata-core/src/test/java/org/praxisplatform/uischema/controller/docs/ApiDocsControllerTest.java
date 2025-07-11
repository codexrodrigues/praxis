package org.praxisplatform.uischema.controller.docs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ApiDocsControllerTest {

    private final ObjectMapper mapper = new ObjectMapper();
    private RestTemplate restTemplate;
    private MockRestServiceServer server;
    private ApiDocsController controller;
    private String openApiDoc;

    @BeforeEach
    void setup() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        controller = new ApiDocsController();
        ReflectionTestUtils.setField(controller, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(controller, "objectMapper", mapper);
        ReflectionTestUtils.setField(controller, "OPEN_API_BASE_PATH", "/v3/api-docs");
        openApiDoc = "{\n" +
                "  \"paths\": {\n" +
                "    \"/users\": {\n" +
                "      \"post\": {\n" +
                "        \"x-ui\": {\"responseSchema\": \"UserResponse\"},\n" +
                "        \"requestBody\": {\n" +
                "          \"content\": {\n" +
                "            \"application/json\": {\n" +
                "              \"schema\": {\"$ref\": \"#/components/schemas/UserRequest\"}\n" +
                "            }\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  },\n" +
                "  \"components\": {\n" +
                "    \"schemas\": {\n" +
                "      \"UserRequest\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"properties\": {\"name\": {\"type\": \"string\"}}\n" +
                "      },\n" +
                "      \"UserResponse\": {\n" +
                "        \"type\": \"object\",\n" +
                "        \"properties\": {\"email\": {\"type\": \"string\"}}\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";
    }

    @Test
    void findRequestSchemaExtractsName() throws Exception {
        String json = "{\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"$ref\":\"#/components/schemas/TestDTO\"}}}}}";
        JsonNode node = mapper.readTree(json);
        assertEquals("TestDTO", controller.findRequestSchema(node));
    }

    @Test
    void getFilteredSchemaSelectsSchemas() throws Exception {
        server.expect(requestTo("http://localhost/v3/api-docs/test"))
                .andRespond(withSuccess(openApiDoc, MediaType.APPLICATION_JSON));
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));

        Map<String, Object> requestSchema = controller.getFilteredSchema("/users", "test", "post", false, "request");
        assertTrue(((Map<?,?>) requestSchema.get("properties")).containsKey("name"));

        server.reset();
        server.expect(requestTo("http://localhost/v3/api-docs/test"))
                .andRespond(withSuccess(openApiDoc, MediaType.APPLICATION_JSON));

        Map<String, Object> responseSchema = controller.getFilteredSchema("/users", "test", "post", false, "response");
        assertTrue(((Map<?,?>) responseSchema.get("properties")).containsKey("email"));

        server.verify();
    }

    @Test
    void invalidSchemaTypeThrowsException() {
        server.expect(requestTo("http://localhost/v3/api-docs/test"))
                .andRespond(withSuccess(openApiDoc, MediaType.APPLICATION_JSON));
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));
        assertThrows(IllegalArgumentException.class,
                () -> controller.getFilteredSchema("/users", "test", "post", false, "unknown"));
    }
}
