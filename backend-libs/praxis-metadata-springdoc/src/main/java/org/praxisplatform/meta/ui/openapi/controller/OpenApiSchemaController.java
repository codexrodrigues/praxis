package org.praxisplatform.meta.ui.openapi.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.praxisplatform.meta.ui.model.property.*;
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

        // Processa campos especiais do OpenAPI
        if (schemasNode instanceof ObjectNode) {
            processSpecialFields((ObjectNode) schemasNode);
        }

        // Converte o esquema para um Map
        Map<String, Object> schemaMap = objectMapper.convertValue(
                schemasNode,
                new TypeReference<Map<String, Object>>() {}
        );

        // Copia os valores de xUiNode para o "x-ui" do objeto retornado
        Map<String, Object> xUiMap = objectMapper.convertValue(
                xUiNode,
                new TypeReference<Map<String, Object>>() {}
        );

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
            Iterator<Entry<String, JsonNode>> fields = propertiesNode.fields();

            while (fields.hasNext()) {
                Entry<String, JsonNode> field = fields.next();
                String fieldName = field.getKey();
                JsonNode fieldValue = field.getValue();

                if (fieldValue instanceof ObjectNode) {
                    ObjectNode fieldNode = (ObjectNode) fieldValue;

                    // Garante que o nó x-ui existe
                    if (!fieldNode.has(X_UI)) {
                        fieldNode.set(X_UI, objectMapper.createObjectNode());
                    }

                    ObjectNode xUiNode = (ObjectNode) fieldNode.get(X_UI);

                    // Define o campo como obrigatório se estiver no array required
                    if (requiredArray != null && requiredArray.isArray() && !xUiNode.has(ValidationProperties.REQUIRED)) {
                        for (JsonNode requiredField : requiredArray) {
                            if (requiredField.isTextual() && requiredField.asText().equals(fieldName)) {
                                xUiNode.put(ValidationProperties.REQUIRED, true);
                                if (!xUiNode.has(ValidationProperties.REQUIRED_MESSAGE)) {
                                    xUiNode.put(ValidationProperties.REQUIRED_MESSAGE, "Campo obrigatório");
                                }
                                break;
                            }
                        }
                    }

                    // Processa atributos padrão do OpenAPI e adiciona ao nó x-ui
                    processStandardAttributes(fieldName, fieldNode, xUiNode);

                    // Processa validações do OpenAPI
                    processValidations(fieldNode, xUiNode);

                    // Processa tipos de controle especiais
                    processControlTypes(fieldName, fieldNode, xUiNode);

                    // Processa campos aninhados para objetos
                    if (fieldNode.has("type") && "object".equals(fieldNode.get("type").asText()) && fieldNode.has(PROPERTIES)) {
                        processSpecialFields((ObjectNode) fieldNode);
                    }

                    // Processa itens de array
                    if (fieldNode.has("type") && "array".equals(fieldNode.get("type").asText()) && fieldNode.has(ITEMS)) {
                        JsonNode itemsNode = fieldNode.get(ITEMS);
                        if (itemsNode instanceof ObjectNode && ((ObjectNode) itemsNode).has(PROPERTIES)) {
                            processSpecialFields((ObjectNode) itemsNode);
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
        // Define o nome do campo se ainda não estiver definido
        if (!xUiNode.has(FieldConfigProperties.NAME)) {
            xUiNode.put(FieldConfigProperties.NAME, fieldName);
        }

        // Define o label baseado no nome do campo se não estiver definido
        if (!xUiNode.has(FieldConfigProperties.LABEL)) {
            String label = fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1)
                    .replaceAll("([A-Z])", " $1")
                    .trim();
            xUiNode.put(FieldConfigProperties.LABEL, label);
        }

        // Processa o tipo de dado com base no type e format
        if (fieldNode.has("type") && !xUiNode.has(FieldConfigProperties.TYPE)) {
            String type = fieldNode.get("type").asText();
            String format = fieldNode.has("format") ? fieldNode.get("format").asText() : null;

            processTypeAndFormat(type, format, xUiNode);
        }

        // Processa somente leitura
        if (fieldNode.has("readOnly") && fieldNode.get("readOnly").asBoolean() &&
                !xUiNode.has(FieldConfigProperties.READ_ONLY)) {
            xUiNode.put(FieldConfigProperties.READ_ONLY, true);
        }

        // Processa valores de exemplo como valor padrão
        if (fieldNode.has("example") && !xUiNode.has(FieldConfigProperties.DEFAULT_VALUE)) {
            JsonNode example = fieldNode.get("example");
            if (example.isValueNode()) {
                xUiNode.set(FieldConfigProperties.DEFAULT_VALUE, example);
            }
        }

        // Processa enum como opções de select
        if (fieldNode.has("enum") && !xUiNode.has(FieldConfigProperties.OPTIONS)) {
            JsonNode enumValues = fieldNode.get("enum");
            if (enumValues.isArray()) {
                ArrayNode optionsArray = objectMapper.createArrayNode();

                for (JsonNode enumValue : enumValues) {
                    ObjectNode optionNode = objectMapper.createObjectNode();
                    optionNode.set("value", enumValue);
                    optionNode.set("label", enumValue);
                    optionsArray.add(optionNode);
                }

                xUiNode.set(FieldConfigProperties.OPTIONS, optionsArray);

                if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                    xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.SELECT);
                }
            }
        }

        // Processa descrição como campo de ajuda
        if (fieldNode.has("description") && !xUiNode.has(FieldConfigProperties.HELP_TEXT)) {
            xUiNode.put(FieldConfigProperties.HELP_TEXT, fieldNode.get("description").asText());
        }

        // Processa placeholder
        if (fieldNode.has("title") && !xUiNode.has(FieldConfigProperties.PLACEHOLDER)) {
            xUiNode.put(FieldConfigProperties.PLACEHOLDER, fieldNode.get("title").asText());
        }
    }

    /**
     * Processa o tipo e formato do campo para definir o tipo adequado no x-ui
     */
    private void processTypeAndFormat(String type, String format, ObjectNode xUiNode) {
        switch (type) {
            case "string":
                if (format != null) {
                    switch (format) {
                        case "date":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.DATE);
                            if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                                xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_PICKER);
                            }
                            break;
                        case "date-time":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.DATE);
                            if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                                xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_TIME_PICKER);
                            }
                            break;
                        case "email":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.EMAIL);
                            break;
                        case "password":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.PASSWORD);
                            if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                                xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.PASSWORD);
                            }
                            break;
                        case "uri":
                        case "url":
                        case "uri-reference":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.URL);
                            if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                                xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.URL_INPUT);
                            }
                            break;
                        case "binary":
                        case "byte":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.FILE);
                            if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                                xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.FILE_UPLOAD);
                            }
                            break;
                        case "json":
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.JSON);
                            break;
                        default:
                            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.TEXT);
                            break;
                    }
                } else {
                    xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.TEXT);
                }
                break;
            case "integer":
            case "number":
                xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.NUMBER);
                if (format != null) {
                    if (format.equals("float") || format.equals("double")) {
                        if (!xUiNode.has(FieldConfigProperties.NUMERIC_FORMAT)) {
                            xUiNode.put(FieldConfigProperties.NUMERIC_FORMAT, "n2");  // Formato com 2 casas decimais
                        }
                    }
                }
                break;
            case "boolean":
                xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.BOOLEAN);
                if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                    xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.CHECKBOX);
                }
                break;
            case "array":
                if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                    xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.MULTI_SELECT);
                }
                break;
            case "object":
                if (!xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
                    xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.EXPANSION_PANEL);
                }
                break;
        }
    }

    /**
     * Processa validações do OpenAPI e configura os campos x-ui correspondentes.
     */
    private void processValidations(ObjectNode fieldNode, ObjectNode xUiNode) {
        // Campo required já é tratado separadamente no processamento do array "required" no método principal

        // Tamanho mínimo
        if (fieldNode.has("minLength") && !xUiNode.has(ValidationProperties.MIN_LENGTH)) {
            xUiNode.put(ValidationProperties.MIN_LENGTH, fieldNode.get("minLength").asInt());
            if (!xUiNode.has(ValidationProperties.MIN_LENGTH_MESSAGE)) {
                xUiNode.put(ValidationProperties.MIN_LENGTH_MESSAGE, "Tamanho mínimo: " + fieldNode.get("minLength").asInt());
            }
        }

        // Tamanho máximo
        if (fieldNode.has("maxLength") && !xUiNode.has(ValidationProperties.MAX_LENGTH)) {
            xUiNode.put(ValidationProperties.MAX_LENGTH, fieldNode.get("maxLength").asInt());
            if (!xUiNode.has(ValidationProperties.MAX_LENGTH_MESSAGE)) {
                xUiNode.put(ValidationProperties.MAX_LENGTH_MESSAGE, "Tamanho máximo: " + fieldNode.get("maxLength").asInt());
            }
        }

        // Valor mínimo
        if (fieldNode.has("minimum") && !xUiNode.has(ValidationProperties.MIN)) {
            xUiNode.put(ValidationProperties.MIN, fieldNode.get("minimum").asDouble());
            if (!xUiNode.has(ValidationProperties.RANGE_MESSAGE)) {
                xUiNode.put(ValidationProperties.RANGE_MESSAGE, "Valor deve ser no mínimo " + fieldNode.get("minimum").asText());
            }
        }

        // Valor máximo
        if (fieldNode.has("maximum") && !xUiNode.has(ValidationProperties.MAX)) {
            xUiNode.put(ValidationProperties.MAX, fieldNode.get("maximum").asDouble());
            if (xUiNode.has(ValidationProperties.RANGE_MESSAGE) && fieldNode.has("minimum")) {
                xUiNode.put(ValidationProperties.RANGE_MESSAGE, "Valor deve estar entre " +
                             fieldNode.get("minimum").asText() + " e " + fieldNode.get("maximum").asText());
            } else if (!xUiNode.has(ValidationProperties.RANGE_MESSAGE)) {
                xUiNode.put(ValidationProperties.RANGE_MESSAGE, "Valor deve ser no máximo " + fieldNode.get("maximum").asText());
            }
        }

        // Padrão (regex)
        if (fieldNode.has("pattern") && !xUiNode.has(ValidationProperties.PATTERN)) {
            xUiNode.put(ValidationProperties.PATTERN, fieldNode.get("pattern").asText());
            if (!xUiNode.has(ValidationProperties.PATTERN_MESSAGE)) {
                xUiNode.put(ValidationProperties.PATTERN_MESSAGE, "Formato inválido");
            }
        }

        // Tipos de arquivo permitidos para format=binary
        if (fieldNode.has("format") && "binary".equals(fieldNode.get("format").asText()) &&
            !xUiNode.has(ValidationProperties.ALLOWED_FILE_TYPES)) {
            if (fieldNode.has("contentMediaType")) {
                xUiNode.put(ValidationProperties.ALLOWED_FILE_TYPES, fieldNode.get("contentMediaType").asText());
            } else {
                // Valor padrão para aceitar qualquer tipo de arquivo
                xUiNode.put(ValidationProperties.ALLOWED_FILE_TYPES, "*/*");
            }
        }

        // Tamanho máximo de arquivo para binary
        if (fieldNode.has("format") && "binary".equals(fieldNode.get("format").asText()) &&
            fieldNode.has("maxLength") && !xUiNode.has(ValidationProperties.MAX_FILE_SIZE)) {
            xUiNode.put(ValidationProperties.MAX_FILE_SIZE, fieldNode.get("maxLength").asLong());
        }
    }

    /**
     * Processa tipos de controle específicos e campos inteligentes baseados no nome do campo.
     */
    private void processControlTypes(String fieldName, ObjectNode fieldNode, ObjectNode xUiNode) {
        // Se um tipo de controle já estiver definido, não o sobrescreva
        if (xUiNode.has(FieldConfigProperties.CONTROL_TYPE)) {
            return;
        }

        // Detecta e configura campos inteligentes com base no nome do campo
        String normalizedFieldName = fieldName.toLowerCase();

        if (normalizedFieldName.contains("cep") || normalizedFieldName.contains("zipcode")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CEP);
        } else if (normalizedFieldName.contains("cidade") || normalizedFieldName.contains("city")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CIDADE);
        } else if (normalizedFieldName.contains("estado") || normalizedFieldName.contains("uf")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_ESTADO);
        } else if (normalizedFieldName.contains("setor")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_SETOR);
        } else if (normalizedFieldName.equals("cpf") || normalizedFieldName.endsWith("cpf")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CPF);
        } else if (normalizedFieldName.equals("cnpj") || normalizedFieldName.endsWith("cnpj")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CNPJ);
        } else if (normalizedFieldName.contains("banco")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_BANCO);
        } else if (normalizedFieldName.contains("telefone") || normalizedFieldName.contains("fone") ||
                   normalizedFieldName.contains("celular") || normalizedFieldName.contains("phone")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_TELEFONE);
        } else if (normalizedFieldName.contains("pis") || normalizedFieldName.contains("pasep")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PIS);
        } else if (normalizedFieldName.contains("matricula")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_MATRICULA);
        } else if (normalizedFieldName.contains("placa")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PLACA_VEICULO);
        } else if (normalizedFieldName.contains("funcionario") || normalizedFieldName.contains("employee")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_FUNCIONARIO);
        } else if (normalizedFieldName.contains("cliente") || normalizedFieldName.contains("customer")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CLIENTE);
        } else if (normalizedFieldName.contains("produto") || normalizedFieldName.contains("product")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PRODUTO);
        } else if (normalizedFieldName.contains("projeto") || normalizedFieldName.contains("project")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_PROJETO);
        } else if (normalizedFieldName.contains("fornecedor") || normalizedFieldName.contains("supplier")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_FORNECEDOR);
        } else if (normalizedFieldName.contains("departamento") || normalizedFieldName.contains("department")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_DEPARTAMENTO);
        } else if (normalizedFieldName.contains("contacorrente") ||
                   (normalizedFieldName.contains("conta") && normalizedFieldName.contains("corrente"))) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CONTA_CORRENTE);
        } else if (normalizedFieldName.contains("contrato") || normalizedFieldName.contains("contract")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, SmartFieldControlType.SMART_CONTRATO);
        } else if (normalizedFieldName.contains("descricao") || normalizedFieldName.contains("observacao") ||
                   normalizedFieldName.contains("description") || normalizedFieldName.contains("comment")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.TEXTAREA);
        } else if (normalizedFieldName.contains("valor") || normalizedFieldName.contains("preco") ||
                   normalizedFieldName.contains("price") || normalizedFieldName.contains("amount")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.CURRENCY_INPUT);
        } else if (normalizedFieldName.contains("url") || normalizedFieldName.contains("link") ||
                   normalizedFieldName.contains("website") || normalizedFieldName.contains("site")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.URL);
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.URL_INPUT);
        } else if (normalizedFieldName.contains("cor") || normalizedFieldName.contains("color")) {
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.COLOR_PICKER);
        } else if (normalizedFieldName.contains("senha") || normalizedFieldName.contains("password")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.PASSWORD);
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.PASSWORD);
        } else if (normalizedFieldName.contains("email")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.EMAIL);
        } else if (normalizedFieldName.contains("data") || normalizedFieldName.contains("date")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.DATE);
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.DATE_PICKER);
        } else if (normalizedFieldName.contains("imagem") || normalizedFieldName.contains("foto") ||
                   normalizedFieldName.contains("image") || normalizedFieldName.contains("photo")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.FILE);
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.FILE_UPLOAD);
        } else if (normalizedFieldName.contains("arquivo") || normalizedFieldName.contains("file")) {
            xUiNode.put(FieldConfigProperties.TYPE, FieldDataType.FILE);
            xUiNode.put(FieldConfigProperties.CONTROL_TYPE, FieldControlType.FILE_UPLOAD);
        }
    }

}
