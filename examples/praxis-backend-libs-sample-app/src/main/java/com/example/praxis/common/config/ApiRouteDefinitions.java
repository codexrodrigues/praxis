package com.example.praxis.common.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class ApiRouteDefinitions {

    private static final Map<String, String> ROUTES = loadRoutes();
    private static final String HR_BASE = ROUTES.getOrDefault("humanResources", "/api/human-resources");

    // Users
    public static final String USERS_PATH = "/users";
    public static final String USERS_GROUP = "users";
    public static final String USERS_TAG = "Users";

    // HR Cargos
    public static final String HR_CARGOS_PATH = HR_BASE + "/cargos";
    public static final String HR_CARGOS_GROUP = "cargos";
    public static final String HR_CARGOS_TAG = "HR - Cargos";

    // HR Departamentos
    public static final String HR_DEPARTAMENTOS_PATH = HR_BASE + "/departamentos";
    public static final String HR_DEPARTAMENTOS_GROUP = "departamentos";
    public static final String HR_DEPARTAMENTOS_TAG = "HR - Departamentos";

    // HR Funcionarios
    public static final String HR_FUNCIONARIOS_PATH = HR_BASE + "/funcionarios";
    public static final String HR_FUNCIONARIOS_GROUP = "funcionarios";
    public static final String HR_FUNCIONARIOS_TAG = "HR - Funcionarios";

    // HR Folhas de Pagamento
    public static final String HR_FOLHAS_PAGAMENTO_PATH = HR_BASE + "/folhas-pagamento";
    public static final String HR_FOLHAS_PAGAMENTO_GROUP = "folhas-pagamento";
    public static final String HR_FOLHAS_PAGAMENTO_TAG = "HR - Folhas Pagamento";

    // HR Eventos de Folha
    public static final String HR_EVENTOS_FOLHA_PATH = HR_BASE + "/eventos-folha";
    public static final String HR_EVENTOS_FOLHA_GROUP = "eventos-folha";
    public static final String HR_EVENTOS_FOLHA_TAG = "HR - Eventos Folha";

    // HR Férias/Afastamentos
    public static final String HR_FERIAS_AFASTAMENTOS_PATH = HR_BASE + "/ferias-afastamentos";
    public static final String HR_FERIAS_AFASTAMENTOS_GROUP = "ferias-afastamentos";
    public static final String HR_FERIAS_AFASTAMENTOS_TAG = "HR - Ferias Afastamentos";

    // HR Dependentes
    public static final String HR_DEPENDENTES_PATH = HR_BASE + "/dependentes";
    public static final String HR_DEPENDENTES_GROUP = "dependentes";
    public static final String HR_DEPENDENTES_TAG = "HR - Dependentes";

    // UI Wrappers Test
    public static final String UI_WRAPPERS_TEST_PATH = ROUTES.getOrDefault("uiWrappersTest", "/api/ui-test/wrappers");
    public static final String UI_WRAPPERS_TEST_GROUP = "ui-wrappers-test";
    public static final String UI_WRAPPERS_TEST_TAG = "UI Wrappers Test";

    private ApiRouteDefinitions() {
        // Prevent instantiation
    }

    private static Map<String, String> loadRoutes() {
        try (InputStream is = ApiRouteDefinitions.class.getClassLoader().getResourceAsStream("api-routes.json")) {
            return new ObjectMapper().readValue(is, new TypeReference<>() {});
        } catch (IOException e) {
            throw new ExceptionInInitializerError("Failed to load api-routes.json" + e);
        }
    }
}
