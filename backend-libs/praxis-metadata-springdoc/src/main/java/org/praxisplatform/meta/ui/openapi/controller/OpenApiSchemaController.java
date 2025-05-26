package org.praxisplatform.meta.ui.openapi.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
// ArrayNode removed
import com.fasterxml.jackson.databind.node.ObjectNode;
// org.praxisplatform.meta.ui.model.property.* removed
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Controlador responsável por filtrar e retornar partes específicas da documentação OpenAPI.
 */
@RestController
@RequestMapping("/schemas/filtered")
public class OpenApiSchemaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenApiSchemaController.class);

    // ------------------------------------------------------------------------
    // Base Path do OpenAPI
    // ------------------------------------------------------------------------
    @Value("${springdoc.api-docs.path:/v3/api-docs}")
    private String OPEN_API_BASE_PATH;

    // Constantes para chaves do JSON
    private static final String PATHS = "paths";
    private static final String COMPONENTS = "components";
    private static final String SCHEMAS = "schemas";
    private static final String X_UI = "x-ui";
    private static final String RESPONSE_SCHEMA = "responseSchema";
    private static final String PROPERTIES = "properties";
    private static final String REF = "$ref";
    private static final String ITEMS = "items";

    // Constantes para valores padrão
    private static final String DEFAULT_OPERATION = "get";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Recupera e filtra a documentação OpenAPI para o caminho, operação e documento especificados.
     * <p>
     * O método busca um documento OpenAPI em <code>/v3/api-docs/{document}</code> e, a partir dele,
     * filtra o esquema correspondente ao <code>path</code> e <code>operation</code> fornecidos. Caso
     * o parâmetro <code>includeInternalSchemas</code> seja verdadeiro, substitui referências internas
     * (<code>$ref</code>) pelos esquemas correspondentes.
     *
     * @param path                  O caminho específico dentro da documentação OpenAPI (por exemplo, "/dados-pessoa-fisica/all").
     *                              Se contiver barras ou caracteres especiais, deve estar devidamente codificado em URL.
     * @param document              (Opcional) O nome do documento OpenAPI (por exemplo, "dados-pessoa-fisica").
     *                              Se não fornecido ou vazio, será extraído automaticamente do <code>path</code>.
     * @param operation             (Opcional) A operação HTTP para o caminho especificado (por exemplo, "get", "post").
     *                              Caso não seja fornecido, o valor padrão é <code>"get"</code>.
     * @param includeInternalSchemas (Opcional) Define se referências internas (<code>$ref</code>) devem ser substituídas
     *                              pelas propriedades reais. Se <code>true</code>, faz a substituição recursiva; caso contrário,
     *                              mantém as referências originais. O valor padrão é <code>false</code>.
     * @return Um mapa (<code>Map&lt;String, Object&gt;</code>) representando o esquema filtrado do OpenAPI, incluindo
     *         os metadados do <code>x-ui</code> e, se solicitado, as substituições de referências internas.
     * @throws IllegalStateException    Se não for possível recuperar a documentação OpenAPI do endpoint.
     * @throws IllegalArgumentException Se o <code>path</code> ou <code>operation</code> não existirem na documentação,
     *                                  se o <code>responseSchema</code> não estiver definido ou se o esquema em
     *                                  <code>components -> schemas</code> não for encontrado.
     */
    @GetMapping
    public Map<String, Object> getFilteredSchema(
            @RequestParam String path,
            @RequestParam(required = false) String document,
            @RequestParam(required = false, defaultValue = DEFAULT_OPERATION) String operation,
            @RequestParam(required = false, defaultValue = "false") boolean includeInternalSchemas) {

        // Verifica e define valores padrão para parâmetros opcionais
        document = (document == null || document.trim().isEmpty()) ? extractDocumentFromPath(path) : document;
        operation = (operation == null || operation.trim().isEmpty()) ? DEFAULT_OPERATION : operation;

        // Monta a URL base da aplicação e o endpoint do documento
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String url = baseUrl + OPEN_API_BASE_PATH +"/"+ document;

        JsonNode rootNode = restTemplate.getForObject(url, JsonNode.class);

        if (rootNode == null) {
            throw new IllegalStateException("A documentação OpenAPI não pôde ser recuperada");
        }

        LOGGER.info("Root node retrieved successfully");

        // Decodifica o path para tratar caracteres especiais (por exemplo, '%2F')
        String decodedPath = UriUtils.decode(path, StandardCharsets.UTF_8);

        // Procura o caminho especificado no JSON
        JsonNode pathsNode = rootNode.path(PATHS).path(decodedPath).path(operation);

        if (pathsNode.isMissingNode()) {
            throw new IllegalArgumentException("O caminho ou operação especificado não foi encontrado na documentação.");
        }

        LOGGER.info("Path and operation node retrieved successfully");

        // Procura pelo "responseSchema" no nó x-ui
        JsonNode xUiNode = pathsNode.path(X_UI);
        if (xUiNode.isMissingNode() || xUiNode.path(RESPONSE_SCHEMA).isMissingNode()) {
            throw new IllegalArgumentException("O 'responseSchema' não foi encontrado na documentação.");
        }

        String responseSchema = xUiNode.path(RESPONSE_SCHEMA).asText();

        LOGGER.info("Response schema found: {}", responseSchema);

        // Procura pelo esquema de componentes baseado no responseSchema
        JsonNode schemasNode = rootNode.path(COMPONENTS).path(SCHEMAS).path(responseSchema);

        if (schemasNode.isMissingNode()) {
            throw new IllegalArgumentException("O esquema de componentes especificado não foi encontrado na documentação.");
        }

        LOGGER.info("Schema node retrieved successfully");

        // Se includeInternalSchemas for verdadeiro, substitui schemas internos
        if (includeInternalSchemas) {
            replaceInternalSchemas((ObjectNode) schemasNode, rootNode.path(COMPONENTS).path(SCHEMAS));
        }

        // Converte o esquema para um Map
        Map<String, Object> schemaMap = objectMapper.convertValue(
                schemasNode,
                new TypeReference<Map<String, Object>>() {}
        );

        // --- Adjusted x-ui Combination Logic ---
        // Get or create the x-ui map from the DTO schema (schemasNode)
        Object dtoXuiObject = schemaMap.get(X_UI);
        Map<String, Object> dtoXuiMap;

        if (dtoXuiObject instanceof Map) {
            // It's already a Map, create a mutable copy (LinkedHashMap to preserve order)
            // Suppressing unchecked cast warning as we check with instanceof
            @SuppressWarnings("unchecked")
            Map<String, Object> tempMap = (Map<String, Object>) dtoXuiObject;
            dtoXuiMap = new java.util.LinkedHashMap<>(tempMap);
        } else {
            // Not a map or doesn't exist, create a new one
            dtoXuiMap = new java.util.LinkedHashMap<>();
        }
        
        // Convert xUiNode (operation's x-ui) to operationXUiMap
        // xUiNode is already confirmed to exist and contain RESPONSE_SCHEMA by prior checks.
        Map<String, Object> operationXUiMap = objectMapper.convertValue(
                xUiNode, // This is the x-ui node from the operation
                new TypeReference<Map<String, Object>>() {}
        );
        
        // Merge operation's x-ui into DTO's x-ui, operation's values take precedence
        if (operationXUiMap != null) {
            dtoXuiMap.putAll(operationXUiMap); // putAll will overwrite existing keys in dtoXuiMap
        }
        
        // Set the merged x-ui map back to schemaMap
        schemaMap.put(X_UI, dtoXuiMap);
        // --- End of Adjusted x-ui Combination Logic ---

        return schemaMap;
    }

    /**
     * Substitui referências internas (<code>$ref</code>) em um schema JSON por suas propriedades reais,
     * de forma recursiva, caso seja necessário.
     *
     * @param schemaNode Nó (schema) em que serão buscadas as referências para substituição.
     * @param allSchemas Nó contendo todos os schemas para referência, geralmente em <code>components -> schemas</code>.
     */
    private void replaceInternalSchemas(ObjectNode schemaNode, JsonNode allSchemas) {
        if (schemaNode.has(PROPERTIES)) {
            Iterator<Entry<String, JsonNode>> fields = schemaNode.path(PROPERTIES).fields();
            while (fields.hasNext()) {
                Entry<String, JsonNode> field = fields.next();
                JsonNode fieldValue = field.getValue();
                JsonNode refNode = fieldValue.path(REF);
                if (!refNode.isMissingNode()) {
                    String ref = refNode.asText();
                    String refSchemaName = ref.substring(ref.lastIndexOf('/') + 1);
                    JsonNode refSchemaNode = allSchemas.path(refSchemaName);
                    if (!refSchemaNode.isMissingNode()) {
                        LOGGER.info("Replacing $ref {} with schema {}", ref, refSchemaName);
                        // Substitui a referência pelas propriedades do schema
                        JsonNode propertiesNode = refSchemaNode.path(PROPERTIES);
                        if (!propertiesNode.isMissingNode()) {
                            ((ObjectNode) fieldValue).remove(REF);
                            ((ObjectNode) fieldValue).setAll((ObjectNode) propertiesNode);
                            LOGGER.info("Replaced $ref {} with properties {}", ref, propertiesNode);
                            // Substituição recursiva de referências dentro do novo objeto
                            replaceInternalSchemas((ObjectNode) fieldValue, allSchemas);
                        } else {
                            LOGGER.warn("No properties found for schema {}", refSchemaName);
                        }
                    } else {
                        LOGGER.warn("Schema {} not found in allSchemas", refSchemaName);
                    }
                }
                // Verifica recursivamente objetos aninhados e arrays
                if (fieldValue.has(PROPERTIES)) {
                    LOGGER.info("Recursively replacing properties in nested object {}", field.getKey());
                    replaceInternalSchemas((ObjectNode) fieldValue, allSchemas);
                }
                if (fieldValue.has(ITEMS)) {
                    LOGGER.info("Recursively replacing properties in array items of {}", field.getKey());
                    replaceInternalSchemas((ObjectNode) fieldValue.path(ITEMS), allSchemas);
                }
            }
        } else {
            LOGGER.warn("No properties found in schema node");
        }
    }

    /**
     * Extrai o nome do documento (por exemplo, "dados-pessoa-fisica") do path fornecido,
     * ignorando segmentos vazios ou que contenham chaves de variável (e.g., "{id}").
     *
     * @param path Caminho de onde se tentará extrair o nome do documento.
     * @return Nome do documento extraído.
     * @throws IllegalArgumentException Se não for possível determinar o nome do documento.
     */
    private String extractDocumentFromPath(String path) {
        String[] segments = path.split("/");
        for (String segment : segments) {
            if (!segment.isEmpty() && !segment.contains("{")) {
                return segment;
            }
        }
        throw new IllegalArgumentException("Não foi possível determinar o document a partir do path fornecido.");
    }

}
