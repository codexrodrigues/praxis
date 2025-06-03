package org.praxisplatform.uischema.controller.docs;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.praxisplatform.uischema.FieldConfigProperties;
import org.praxisplatform.uischema.util.OpenApiUiUtils;
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
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Controlador responsável por filtrar e retornar partes específicas da documentação OpenAPI.
 */
@RestController
@RequestMapping("/schemas/filtered")
public class ApiDocsController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiDocsController.class);

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
     * @param path                   O caminho específico dentro da documentação OpenAPI (por exemplo, "/dados-pessoa-fisica/all").
     *                               Se contiver barras ou caracteres especiais, deve estar devidamente codificado em URL.
     * @param document               (Opcional) O nome do documento OpenAPI (por exemplo, "dados-pessoa-fisica").
     *                               Se não fornecido ou vazio, será extraído automaticamente do <code>path</code>.
     * @param operation              (Opcional) A operação HTTP para o caminho especificado (por exemplo, "get", "post").
     *                               Caso não seja fornecido, o valor padrão é <code>"get"</code>.
     * @param includeInternalSchemas (Opcional) Define se referências internas (<code>$ref</code>) devem ser substituídas
     *                               pelas propriedades reais. Se <code>true</code>, faz a substituição recursiva; caso contrário,
     *                               mantém as referências originais. O valor padrão é <code>false</code>.
     * @return Um mapa (<code>Map&lt;String, Object&gt;</code>) representando o esquema filtrado do OpenAPI, incluindo
     * os metadados do <code>x-ui</code> e, se solicitado, as substituições de referências internas.
     * @throws IllegalStateException    Se não for possível recuperar a documentação OpenAPI do endpoint.
     * @throws IllegalArgumentException Se o <code>path</code> ou <code>operation</code> não existirem na documentação,
     *                                  se o <code>responseSchema</code> não estiver definido ou se o esquema em
     *                                  <code>components -> schemas</code> não for encontrado.
     */
    @GetMapping
    public Map<String, Object> getFilteredSchema(@RequestParam String path, @RequestParam(required = false) String document, @RequestParam(required = false, defaultValue = DEFAULT_OPERATION) String operation, @RequestParam(required = false, defaultValue = "false") boolean includeInternalSchemas) {

        // Verifica e define valores padrão para parâmetros opcionais
        document = (document == null || document.trim().isEmpty()) ? extractDocumentFromPath(path) : document;
        operation = (operation == null || operation.trim().isEmpty()) ? DEFAULT_OPERATION : operation;

        // Monta a URL base da aplicação e o endpoint do documento
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        String url = baseUrl + OPEN_API_BASE_PATH + "/" + document;

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

        // Usa nosso novo método para encontrar o responseSchema
        String responseSchema = findResponseSchema(pathsNode, rootNode, operation, decodedPath);
        if (responseSchema == null || responseSchema.isEmpty()) {
            throw new IllegalArgumentException("O responseSchema não foi encontrado ou não está definido para o caminho e operação especificados.");
        }

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

        // Processa campos especiais do OpenAPI
        if (schemasNode instanceof ObjectNode) {
            processSpecialFields((ObjectNode) schemasNode);
        }

        // Converte o esquema para um Map
        Map<String, Object> schemaMap = objectMapper.convertValue(schemasNode, new TypeReference<Map<String, Object>>() {
        });

        // Copia os valores de xUiNode para o "x-ui" do objeto retornado
        JsonNode xUiNode = pathsNode.path(X_UI);
        Map<String, Object> xUiMap = objectMapper.convertValue(xUiNode, new TypeReference<Map<String, Object>>() {
        });

        schemaMap.put(X_UI, xUiMap);

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

    /**
     * Processa campos especiais do OpenAPI, adicionando atributos apropriados aos campos no JSON.
     * Preserva valores x-ui já existentes e adiciona novos atributos conforme necessário.
     *
     * @param schemasNode O nó que contém as propriedades do schema a serem processadas
     */
    private void processSpecialFields(ObjectNode schemasNode) {
        // Processa campos obrigatórios que estão em uma array no nível do schema
        JsonNode requiredArray = schemasNode.get("required");

        if (schemasNode.has(PROPERTIES)) {
            ObjectNode propertiesNode = (ObjectNode) schemasNode.get(PROPERTIES);
            Iterator<String> fieldNames = propertiesNode.fieldNames();

            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode fieldValue = propertiesNode.get(fieldName);

                if (fieldValue instanceof ObjectNode fieldNode) {

                    // Garante que o nó x-ui existe para cada propriedade
                    if (!fieldNode.has(X_UI)) {
                        fieldNode.set(X_UI, objectMapper.createObjectNode());
                    }

                    ObjectNode xUiNode = (ObjectNode) fieldNode.get(X_UI);
                    Map<String, Object> xUiMap = objectMapper.convertValue(xUiNode, new TypeReference<Map<String, Object>>() {
                    });

                    // Processa required primeiro
                    if (requiredArray != null && requiredArray.isArray()) {
                        for (JsonNode requiredField : requiredArray) {
                            if (requiredField.isTextual() && requiredField.asText().equals(fieldName)) {
                                OpenApiUiUtils.populateUiRequired(xUiMap, true);
                                // Message for required is now handled by populateDefaultValidationMessages
                                break;
                            }
                        }
                    }

                    // Processa os atributos padrões para cada propriedade (populates xUiMap which is then converted to xUiNode)
                    processStandardAttributes(fieldName, fieldNode, xUiNode); // xUiNode is updated inside this call from its own map

                    // Re-convert xUiNode to xUiMap after processStandardAttributes to get its latest state
                    Map<String, Object> currentXUiMap = objectMapper.convertValue(xUiNode, new TypeReference<Map<String, Object>>() {
                    });

                    // Control Type Determination Logic using determineEffectiveControlType
                    String openApiType = fieldNode.has("type") ? fieldNode.get("type").asText() : null;
                    String openApiFormat = fieldNode.has("format") ? fieldNode.get("format").asText() : null;
                    boolean hasEnum = fieldNode.has("enum") && fieldNode.get("enum").isArray() && fieldNode.get("enum").size() > 0;
                    Integer maxLengthSchema = fieldNode.has("maxLength") ? fieldNode.get("maxLength").asInt() : null;
                    boolean isArrayType = "array".equals(openApiType);
                    String itemType = null;
                    String itemFormat = null;
                    boolean isArrayItemsHaveEnum = false;

                    if (isArrayType && fieldNode.has(ITEMS)) {
                        JsonNode itemsNode = fieldNode.get(ITEMS);
                        itemType = itemsNode.has("type") ? itemsNode.get("type").asText() : null;
                        itemFormat = itemsNode.has("format") ? itemsNode.get("format").asText() : null;
                        if (itemsNode.has("enum") && itemsNode.get("enum").isArray() && itemsNode.get("enum").size() > 0) {
                            isArrayItemsHaveEnum = true;
                        }
                        // Preserve array item type/format in x-ui
                        if (itemType != null && !currentXUiMap.containsKey("itemType")) {
                            currentXUiMap.put("itemType", itemType);
                        }
                        if (itemFormat != null && !currentXUiMap.containsKey("itemFormat")) {
                            currentXUiMap.put("itemFormat", itemFormat);
                        }
                    }

                    String finalControlType = OpenApiUiUtils.determineEffectiveControlType(openApiType, openApiFormat, hasEnum, maxLengthSchema, isArrayType, itemType, itemFormat, isArrayItemsHaveEnum, fieldName);

                    OpenApiUiUtils.populateUiControlType(currentXUiMap, finalControlType);

                    // Processa validações específicas (populates currentXUiMap)
                    // processValidations now updates currentXUiMap directly or via xUiNode map conversion within itself.
                    // Ensure processValidations uses and updates a map representation that will be reflected in xUiNode.
                    processValidations(fieldNode, currentXUiMap); // Pass currentXUiMap

                    // Update xUiNode from currentXUiMap to reflect all changes
                    xUiNode.removeAll();
                    for (Map.Entry<String, Object> entry : currentXUiMap.entrySet()) {
                        xUiNode.putPOJO(entry.getKey(), entry.getValue());
                    }

                    // Populate default validation messages using the most up-to-date xUiMap
                    OpenApiUiUtils.populateDefaultValidationMessages(currentXUiMap);

                    // Final update to xUiNode from currentXUiMap after default messages, if currentXUiMap was modified by populateDefaultValidationMessages
                    // This ensures xUiNode accurately reflects currentXUiMap which might have new messages.
                    // ObjectNode xUiNode is the one that gets saved back to the main schema.
                    // We need to ensure that the currentXUiMap (which was passed to populateDefaultValidationMessages and potentially modified)
                    // is fully reflected in xUiNode.
                    // The previous loop already updated xUiNode from currentXUiMap. If populateDefaultValidationMessages modifies currentXUiMap,
                    // we need to sync again.
                    // For simplicity, let's assume populateDefaultValidationMessages directly modifies the map,
                    // and the existing loop that updates xUiNode from currentXUiMap is sufficient if placed *after* this call.
                    // Let's adjust the order: processValidations -> populateDefaultValidationMessages -> then update xUiNode from currentXUiMap

                    // Re-arranging the logic flow slightly for clarity and correctness:
                    // 1. processStandardAttributes (updates xUiNode, then currentXUiMap is derived from it)
                    // 2. Control Type Determination (updates currentXUiMap)
                    // 3. processValidations (updates currentXUiMap)
                    // 4. populateDefaultValidationMessages (updates currentXUiMap)
                    // 5. Update xUiNode from the final currentXUiMap

                    // The code block above already has:
                    // OpenApiUiUtils.populateUiControlType(currentXUiMap, finalControlType);
                    // processValidations(fieldNode, currentXUiMap); // CHANGED: Pass currentXUiMap
                    // OpenApiUiUtils.populateDefaultValidationMessages(currentXUiMap); // ADDED
                    // And then the loop to update xUiNode from currentXUiMap. This order looks correct.


                    // Transferir exemplo para o x-ui se existir (if array and not handled by standard attributes)
                    // This was specific to arrays in old code, ensure it's covered or correctly placed.
                    // populateUiDefaultValue in processStandardAttributes should handle most cases.
                    // This seems to be a duplicate or misplaced from old array logic.
                    // If `fieldNode.has("example")` refers to the array itself, it's processed by `processStandardAttributes`.
                    // If it refers to `itemsNode.get("example")`, that's a different scenario.
                    // For now, this specific block is removed as populateUiDefaultValue should cover fieldNode.get("example").
                /*
                if (isArrayType && fieldNode.has("example") && !xUiNode.has(FieldConfigProperties.DEFAULT_VALUE.getValue())) {
                    xUiNode.set(FieldConfigProperties.DEFAULT_VALUE.getValue(), fieldNode.get("example"));
                }
                */

                    // Processa recursivamente objetos aninhados e items de arrays
                    if (openApiType != null) {
                        if ("object".equals(openApiType) && fieldNode.has(PROPERTIES)) {
                            processSpecialFields(fieldNode); // Recursive call for nested objects
                        } else if (isArrayType && fieldNode.has(ITEMS)) {
                            JsonNode itemsNode = fieldNode.get(ITEMS);
                            if (itemsNode instanceof ObjectNode && itemsNode.has(PROPERTIES)) {
                                // If array items are complex objects, process their fields recursively
                                processSpecialFields((ObjectNode) itemsNode);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Processa atributos standard do OpenAPI e configura os campos x-ui correspondentes.
     */
    private void processStandardAttributes(String fieldName, ObjectNode fieldNode, ObjectNode xUiNode) {
        // Convert ObjectNode to Map for OpenApiUiUtils
        Map<String, Object> xUiMap = objectMapper.convertValue(xUiNode, new TypeReference<Map<String, Object>>() {
        });

        // Populate standard UI attributes using OpenApiUiUtils
        OpenApiUiUtils.populateUiName(xUiMap, fieldName);
        OpenApiUiUtils.populateUiLabel(xUiMap, fieldNode.path("title").asText(null), fieldName); // Use title for labelText if available

        // Processa o tipo de dado com base no type e format (existing logic, not replaced by a util yet for TYPE itself)
        if (fieldNode.has("type")) {
            String type = fieldNode.get("type").asText();
            String format = fieldNode.has("format") ? fieldNode.get("format").asText() : null;

            if (!xUiNode.has(FieldConfigProperties.TYPE.getValue())) {
                processTypeAndFormat(type, format, xUiNode);
            }

            // Preserva o formato original quando relevante
            if (format != null && !xUiNode.has("format")) {
                xUiNode.put("format", format);
            }
        }

        Boolean readOnly = fieldNode.has("readOnly") ? fieldNode.get("readOnly").asBoolean(false) : null;
        OpenApiUiUtils.populateUiReadOnly(xUiMap, readOnly);

        JsonNode exampleNode = fieldNode.get("example");
        Object exampleValue = null;
        if (exampleNode != null && !exampleNode.isNull()) {
            try {
                // Convert JsonNode to actual Java object to preserve type
                exampleValue = objectMapper.treeToValue(exampleNode, Object.class);
            } catch (Exception e) {
                LOGGER.warn("Failed to convert exampleNode to Object for field {}: {}", fieldName, e.getMessage());
                // Fallback or decide if string representation is acceptable
                exampleValue = exampleNode.asText();
            }
        }
        OpenApiUiUtils.populateUiDefaultValue(xUiMap, exampleValue);

        List<Object> enumValuesList = null;
        if (fieldNode.has("enum")) {
            JsonNode enumNode = fieldNode.get("enum");
            if (enumNode.isArray()) {
                // Convert JsonNode array to List<Object> for the utility method
                enumValuesList = objectMapper.convertValue(enumNode, new TypeReference<List<Object>>() {
                });
            }
        }
        OpenApiUiUtils.populateUiOptionsFromEnum(xUiMap, enumValuesList, objectMapper);

        OpenApiUiUtils.populateUiHelpText(xUiMap, fieldNode.path("description").asText(null));
        OpenApiUiUtils.populateUiPlaceholder(xUiMap, fieldNode.path("title").asText(null)); // Using title for placeholder

        // Update xUiNode from the modified xUiMap
        xUiNode.removeAll(); // Clear existing fields
        for (Map.Entry<String, Object> entry : xUiMap.entrySet()) {
            // Need to convert back to JsonNode or use putPOJO if the value is simple
            if (entry.getValue() instanceof JsonNode) {
                xUiNode.set(entry.getKey(), (JsonNode) entry.getValue());
            } else {
                xUiNode.putPOJO(entry.getKey(), entry.getValue());
            }
        }
    }

    /**
     * Processa o tipo e formato do campo para definir o tipo adequado no x-ui
     */
    private void processTypeAndFormat(String type, String format, ObjectNode xUiNode) {
        Map<String, Object> xUiMap = objectMapper.convertValue(xUiNode, new TypeReference<Map<String, Object>>() {
        });

        OpenApiUiUtils.populateUiDataType(xUiMap, type, format);

        // Existing logic for NUMERIC_FORMAT (not part of FieldDataType determination)
        if (("integer".equals(type) || "number".equals(type)) && format != null) {
            if (format.equals("float") || format.equals("double")) {
                if (!xUiMap.containsKey(FieldConfigProperties.NUMERIC_FORMAT.getValue())) {
                    // "n2" is not in NumberFormatStyle enum, so it remains a string.
                    xUiMap.put(FieldConfigProperties.NUMERIC_FORMAT.getValue(), "n2");
                }
            }
        }

        // Update xUiNode from the modified xUiMap
        xUiNode.removeAll();
        for (Map.Entry<String, Object> entry : xUiMap.entrySet()) {
            xUiNode.putPOJO(entry.getKey(), entry.getValue());
        }
    }

    /**
     * Processa validações do OpenAPI e configura os campos x-ui correspondentes.
     */
    private void processValidations(ObjectNode fieldNode, Map<String, Object> xUiMap) { // Changed signature to accept Map
        // No need to convert xUiNode to xUiMap, it's passed directly

        // Tamanho mínimo
        Integer minLength = fieldNode.has("minLength") ? fieldNode.get("minLength").asInt() : null;
        OpenApiUiUtils.populateUiMinLength(xUiMap, minLength, null); // Message argument changed to null

        // Tamanho máximo
        Integer maxLength = fieldNode.has("maxLength") ? fieldNode.get("maxLength").asInt() : null;
        OpenApiUiUtils.populateUiMaxLength(xUiMap, maxLength, null); // Message argument changed to null

        // Valor mínimo
        Number minimum = fieldNode.has("minimum") ? fieldNode.get("minimum").numberValue() : null;
        OpenApiUiUtils.populateUiMinimum(xUiMap, minimum, null); // Message argument changed to null

        // Valor máximo
        Number maximum = fieldNode.has("maximum") ? fieldNode.get("maximum").numberValue() : null;
        OpenApiUiUtils.populateUiMaximum(xUiMap, maximum, null); // Message argument changed to null

        // Padrão (regex)
        String pattern = fieldNode.has("pattern") ? fieldNode.get("pattern").asText(null) : null;
        OpenApiUiUtils.populateUiPattern(xUiMap, pattern, null); // Message argument changed to null

        // Tipos de arquivo permitidos para format=binary
        if (fieldNode.has("format") && "binary".equals(fieldNode.get("format").asText())) {
            String contentMediaType = fieldNode.has("contentMediaType") ? fieldNode.get("contentMediaType").asText() : null;
            OpenApiUiUtils.populateUiAllowedFileTypes(xUiMap, contentMediaType);

            // Tamanho máximo de arquivo para binary (extracted from general maxLength)
            // Note: OpenAPI spec uses maxLength for string length, but some might use it for file size in bytes for binary type.
            // The previous code used fieldNode.get("maxLength").asLong() for MAX_FILE_SIZE.
            // We'll continue this interpretation.
            Long maxFileSize = fieldNode.has("maxLength") ? fieldNode.get("maxLength").asLong() : null;
            OpenApiUiUtils.populateUiMaxFileSize(xUiMap, maxFileSize);
        }

        // xUiMap is modified in place. The caller (processSpecialFields)
        // will handle updating the ObjectNode xUiNode from this map.
        // So, no need to update xUiNode here.
    }

    // processControlTypes method is now removed as its logic is integrated into processSpecialFields
    // and OpenApiUiUtils.determineSmartControlTypeByFieldName

    /**
     * Localiza o responseSchema na documentação OpenAPI, tentando várias estratégias
     */
    private String findResponseSchema(JsonNode pathsNode, JsonNode rootNode, String operation, String decodedPath) {
        // 1. Primeiro tenta encontrar no nó x-ui (abordagem atual)
        JsonNode xUiNode = pathsNode.path(X_UI);
        if (!xUiNode.isMissingNode() && !xUiNode.path(RESPONSE_SCHEMA).isMissingNode()) {
            String responseSchema = xUiNode.path(RESPONSE_SCHEMA).asText();
            LOGGER.info("Response schema encontrado em x-ui: {}", responseSchema);
            return responseSchema;
        }

        // 2. Tenta extrair do schema de resposta 200 OK
        JsonNode responses = pathsNode.path("responses");
        JsonNode okResponse = responses.path("200").path("content").path("*/*").path("schema");
        if (okResponse.isMissingNode()) {
            // Tenta outros content types se não encontrou com */*
            okResponse = responses.path("200").path("content").path("application/json").path("schema");
        }

        if (!okResponse.isMissingNode() && okResponse.has("$ref")) {
            String schemaRef = okResponse.path("$ref").asText();
            String wrapperSchemaName = extractSchemaNameFromRef(schemaRef);
            LOGGER.info("Schema wrapper encontrado: {}", wrapperSchemaName);

            // Agora temos o nome do schema wrapper, vamos localizar o tipo real dentro do wrapper
            JsonNode wrapperSchema = rootNode.path(COMPONENTS).path(SCHEMAS).path(wrapperSchemaName);

            if (!wrapperSchema.isMissingNode()) {
                // Verificar se é RestApiResponseTestDTO ou RestApiResponseListTestDTO
                if (wrapperSchemaName.startsWith("RestApiResponse")) {
                    // Encontrar o tipo genérico dentro do RestApiResponse
                    String realTypeName = extractRealTypeFromRestApiResponse(wrapperSchema, wrapperSchemaName);
                    if (realTypeName != null) {
                        LOGGER.info("Tipo real extraído de {}: {}", wrapperSchemaName, realTypeName);
                        return realTypeName;
                    }
                }
            }
        }

        // 3. Tenta inferir pelo nome do endpoint
        String[] pathParts = decodedPath.split("/");
        if (pathParts.length > 0) {
            String lastSegment = pathParts[pathParts.length - 1];
            // Se o último segmento do path for "list", podemos inferir que o retorno é uma lista
            // de algum tipo, provavelmente relacionado ao penúltimo segmento
            if ("list".equals(lastSegment) && pathParts.length > 1) {
                String entityName = pathParts[pathParts.length - 2];
                String capitalizedName = entityName.substring(0, 1).toUpperCase() + entityName.substring(1);
                if (capitalizedName.endsWith("s")) {
                    capitalizedName = capitalizedName.substring(0, capitalizedName.length() - 1);
                }
                String potentialTypeName = capitalizedName + "DTO";

                // Verifica se o schema inferido existe
                if (!rootNode.path(COMPONENTS).path(SCHEMAS).path(potentialTypeName).isMissingNode()) {
                    LOGGER.info("Schema inferido pela URL: {}", potentialTypeName);
                    return potentialTypeName;
                }
            }
        }

        LOGGER.warn("Não foi possível encontrar um responseSchema para {}", decodedPath);
        return null;
    }

    /**
     * Extrai o tipo real contido dentro de um RestApiResponse ou coleção
     */
    private String extractRealTypeFromRestApiResponse(JsonNode wrapperSchema, String wrapperSchemaName) {
        // Análise do nome para casos comuns como "RestApiResponseTestDTO" ou "RestApiResponseListTestDTO"
        if (wrapperSchemaName.startsWith("RestApiResponse")) {
            String remaining = wrapperSchemaName.substring("RestApiResponse".length());

            // Verifica se é uma lista (RestApiResponseListXXX)
            if (remaining.startsWith("List")) {
                String typeName = remaining.substring("List".length());
                return typeName; // Retorna o tipo contido na lista (ex: "TestDTO")
            } else {
                return remaining; // Retorna o tipo direto (ex: "TestDTO")
            }
        }

        // Se a análise pelo nome não funcionar, tenta analisar a estrutura do schema
        // Especificamente, buscamos a propriedade "data" do RestApiResponse
        JsonNode dataSchema = wrapperSchema.path("properties").path("data").path("schema");

        // Verifica se data é um array
        if (dataSchema.has("type") && "array".equals(dataSchema.path("type").asText()) && dataSchema.has("items") && dataSchema.path("items").has("$ref")) {
            // É um array, extrai o tipo dos items
            return extractSchemaNameFromRef(dataSchema.path("items").path("$ref").asText());
        }
        // Se data tem referência direta
        else if (dataSchema.has("$ref")) {
            return extractSchemaNameFromRef(dataSchema.path("$ref").asText());
        }

        // Segunda tentativa: olhar propriedades do schema wrapper
        JsonNode properties = wrapperSchema.path("properties");
        if (!properties.isMissingNode()) {
            JsonNode dataProperty = properties.path("data");

            // Verifica se data é um objeto ou array
            if (!dataProperty.isMissingNode()) {
                // Se data é um array
                if (dataProperty.has("type") && "array".equals(dataProperty.path("type").asText())) {
                    // Verifica se o array tem referência para o tipo dos itens
                    if (dataProperty.has("items") && dataProperty.path("items").has("$ref")) {
                        String itemRef = dataProperty.path("items").path("$ref").asText();
                        return extractSchemaNameFromRef(itemRef);
                    }
                }
                // Se data tem referência direta
                else if (dataProperty.has("$ref")) {
                    return extractSchemaNameFromRef(dataProperty.path("$ref").asText());
                }
            }
        }

        // Não conseguiu extrair o tipo
        return null;
    }

    /**
     * Extrai o nome do schema de uma referência ($ref)
     */
    private String extractSchemaNameFromRef(String ref) {
        return ref.substring(ref.lastIndexOf('/') + 1);
    }


}
