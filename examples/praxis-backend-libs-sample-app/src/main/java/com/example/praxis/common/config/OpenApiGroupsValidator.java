package com.example.praxis.common.config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;

@Configuration
public class OpenApiGroupsValidator implements SmartInitializingSingleton {

    private static final Logger logger = LoggerFactory.getLogger(OpenApiGroupsValidator.class);

    @Autowired
    private List<GroupedOpenApi> groupedOpenApis;

    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

    // Add this in a configuration class if not already present
    @Bean
    public RequestMappingHandlerMapping requestMappingHandlerMapping() {
        return new RequestMappingHandlerMapping();
    }

    @Override
    public void afterSingletonsInstantiated() {
        logger.info("Iniciando validação dos GroupedOpenApi...");

        // 1. Coletar todos os paths definidos em GroupedOpenApi
        Map<String, List<String>> groupToPaths = new HashMap<>();
        Map<String, String> pathPatterns = new HashMap<>();

        for (GroupedOpenApi api : groupedOpenApis) {
            String group = api.getGroup();
            List<String> paths = new java.util.ArrayList<>(api.getPathsToMatch());
            groupToPaths.put(group, paths);

            // Registrar padrões para verificar sobreposições
            for (String path : paths) {
                if (pathPatterns.containsKey(normalizePath(path))) {
                    logger.warn("Possível sobreposição detectada: grupo {} e grupo {} possuem padrões de path sobrepostos: {} e {}",
                            pathPatterns.get(normalizePath(path)), group,
                            path, normalizePath(path));
                }
                pathPatterns.put(normalizePath(path), group);
            }

            logger.info("Grupo registrado: {} com paths: {}", group, paths);
        }

        // 2. Verificar se existe um path para cada constante GROUP em ApiEndpoints
        validateApiEndpointsMappings();

        // 3. Verificar se todos os controllers estão mapeados para algum grupo
        validateControllerMappings(groupToPaths);

        logger.info("Validação dos GroupedOpenApi concluída com sucesso.");
    }

    /**
     * Normaliza o path removendo caracteres curingas para comparações
     */
    private String normalizePath(String path) {
        return path.replace("/**", "").replace("/*", "");
    }

    /**
     * Valida se todos os grupos definidos em ApiEndpoints têm configuração correspondente
     */
    private void validateApiEndpointsMappings() {
        Set<String> configuredGroups = groupedOpenApis.stream()
                .map(GroupedOpenApi::getGroup)
                .collect(Collectors.toSet());

        List<String> missingGroups = new ArrayList<>();

        // Buscar todos os campos _GROUP em ApiEndpoints por reflexão
        for (Field field : OpenApiGroupsConfig.class.getDeclaredFields()) {
            if (field.getName().endsWith("_GROUP") && field.getType() == String.class) {
                try {
                    String groupName = (String) field.get(null);
                    if (!configuredGroups.contains(groupName)) {
                        missingGroups.add(groupName);
                    }

                    // Verificar também se existe PATH correspondente
                    String pathFieldName = field.getName().replace("_GROUP", "_PATH");
                    try {
                        Field pathField = OpenApiGroupsConfig.class.getDeclaredField(pathFieldName);
                        // Verificar se o GROUP está coerente com o PATH
                        String pathValue = (String) pathField.get(null);
                        if (!normalizePath(pathValue).substring(1).equals(groupName)) {
                            logger.warn("Inconsistência entre GROUP e PATH: {} não corresponde a {}",
                                    groupName, pathValue);
                        }
                    } catch (NoSuchFieldException e) {
                        logger.warn("Campo PATH não encontrado para o GROUP {}: {}", groupName, pathFieldName);
                    }
                } catch (Exception e) {
                    logger.error("Erro ao acessar campo de ApiEndpoints", e);
                }
            }
        }

        if (!missingGroups.isEmpty()) {
            logger.warn("Os seguintes grupos definidos em ApiEndpoints não estão configurados em SwaggerConfig: {}",
                    missingGroups);
        }
    }

    /**
     * Valida se todos os controllers da aplicação estão mapeados em algum grupo OpenAPI
     */
    private void validateControllerMappings(Map<String, List<String>> groupToPaths) {
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping.getHandlerMethods();
        List<String> unmatchedPaths = new ArrayList<>();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo mappingInfo = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();

            // Obter path do controller
            String controllerPath = "";
            RequestMapping classMapping = AnnotationUtils.findAnnotation(
                    handlerMethod.getBeanType(), RequestMapping.class);

            if (classMapping != null && classMapping.value().length > 0) {
                controllerPath = classMapping.value()[0];

                // Verificar se este path está coberto por algum grupo
                boolean matched = false;
                for (Map.Entry<String, List<String>> group : groupToPaths.entrySet()) {
                    for (String pattern : group.getValue()) {
                        if (pattern.startsWith(controllerPath) ||
                                normalizePath(pattern).equals(controllerPath)) {
                            matched = true;
                            break;
                        }
                    }
                    if (matched) break;
                }

                if (!matched) {
                    unmatchedPaths.add(controllerPath + " (" + handlerMethod.getBeanType().getSimpleName() + ")");
                }
            }
        }

        if (!unmatchedPaths.isEmpty()) {
            logger.warn("Os seguintes controllers não estão cobertos por nenhum grupo OpenAPI: {}",
                    unmatchedPaths);
        }
    }
}
