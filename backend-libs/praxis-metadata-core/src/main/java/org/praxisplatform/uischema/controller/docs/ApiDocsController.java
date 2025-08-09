package org.praxisplatform.uischema.controller.docs;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.praxisplatform.uischema.FieldConfigProperties;
import org.praxisplatform.uischema.util.OpenApiGroupResolver;
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

    @Autowired(required = false)
    private OpenApiGroupResolver openApiGroupResolver;

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
     * @param schemaType            (Opcional) Define se o schema retornado deve ser o de <code>response</code> (padrão)
     *                              ou o schema do corpo de <code>request</code>.
     * @return Um mapa (<code>Map&lt;String, Object&gt;</code>) representando o esquema filtrado do OpenAPI, incluindo
     * os metadados do <code>x-ui</code> e, se solicitado, as substituições de referências internas.
     * @throws IllegalStateException    Se não for possível recuperar a documentação OpenAPI do endpoint.
     * @throws IllegalArgumentException Se o <code>path</code> ou <code>operation</code> não existirem na documentação,
     *                                  se o schema solicitado não estiver definido ou se o esquema em
     *                                  <code>components -> schemas</code> não for encontrado.
     */
    @GetMapping
    public Map<String, Object> getFilteredSchema(
            @RequestParam String path,
            @RequestParam(required = false) String document,
            @RequestParam(required = false, defaultValue = DEFAULT_OPERATION) String operation,
            @RequestParam(required = false, defaultValue = "false") boolean includeInternalSchemas,
            @RequestParam(required = false, defaultValue = "response") String schemaType) {

        if (!"response".equalsIgnoreCase(schemaType) && !"request".equalsIgnoreCase(schemaType)) {
            throw new IllegalArgumentException("schemaType deve ser 'response' ou 'request'");
        }

        // Verifica e define valores padrão para parâmetros opcionais
        if (document == null || document.trim().isEmpty()) {
            String resolved = openApiGroupResolver != null ? openApiGroupResolver.resolveGroup(path) : null;
            document = (resolved != null && !resolved.isEmpty()) ? resolved : extractDocumentFromPath(path);
        }
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

        // Escolhe o schema conforme o schemaType indicado
        String schemaName;
        if ("request".equalsIgnoreCase(schemaType)) {
            schemaName = findRequestSchema(pathsNode);
        } else {
            schemaName = findResponseSchema(pathsNode, rootNode, operation, decodedPath);
        }

        if (schemaName == null || schemaName.isEmpty()) {
            throw new IllegalArgumentException("O schema solicitado não foi encontrado ou não está definido para o caminho e operação especificados.");
        }

        LOGGER.info("Schema found: {}", schemaName);

        // Procura pelo esquema de componentes baseado no schema selecionado
        JsonNode schemasNode = rootNode.path(COMPONENTS).path(SCHEMAS).path(schemaName);

        if (schemasNode.isMissingNode()) {
            throw new IllegalArgumentException("O esquema de componentes especificado não foi encontrado na documentação.");
        }

        LOGGER.info("Schema node retrieved successfully");

        // Se includeInternalSchemas for verdadeiro, substitui schemas internos
        if (includeInternalSchemas) {
            replaceInternalSchemas((ObjectNode) schemasNode, rootNode.path(COMPONENTS).path(SCHEMAS));
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
        if (openApiGroupResolver != null) {
            String resolved = openApiGroupResolver.resolveGroup(path);
            if (resolved != null && !resolved.isEmpty()) {
                return resolved;
            }
        }
        String[] segments = path.split("/" );
        for (String segment : segments) {
            if (!segment.isEmpty() && !segment.contains("{")) {
                return segment;
            }
        }
        throw new IllegalArgumentException("Não foi possível determinar o documento a partir do path fornecido.");
    }



    // processControlTypes method is now removed as its logic is integrated into processSpecialFields
    // and OpenApiUiUtils.determineSmartControlTypeByFieldName

    /**
     * Localiza o schema do corpo de requisição para a operação informada.
     * <p>
     * Caminho esperado no JSON: {@code requestBody -> content -> application/json -> schema -> $ref}
     */
    protected String findRequestSchema(JsonNode pathsNode) {
        JsonNode schemaNode = pathsNode
                .path("requestBody")
                .path("content")
                .path("application/json")
                .path("schema");

        if (!schemaNode.isMissingNode() && schemaNode.has(REF)) {
            return extractSchemaNameFromRef(schemaNode.path(REF).asText());
        }
        return null;
    }

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
                } else {
                    // Quando a resposta referencia diretamente um DTO sem wrapper
                    return wrapperSchemaName;
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
