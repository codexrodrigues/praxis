package com.example.praxis.common.config;

public class ApiRouteDefinitions {

    // Users
    public static final String USERS_PATH = "/users";
    public static final String USERS_GROUP = "users";
    public static final String USERS_TAG = "Users";

    // HR Cargos
    public static final String HR_CARGOS_PATH = "/api/human-resources/cargos";
    public static final String HR_CARGOS_GROUP = "cargos";
    public static final String HR_CARGOS_TAG = "HR - Cargos";

    // HR Departamentos
    public static final String HR_DEPARTAMENTOS_PATH = "/api/human-resources/departamentos";
    public static final String HR_DEPARTAMENTOS_GROUP = "departamentos";
    public static final String HR_DEPARTAMENTOS_TAG = "HR - Departamentos";

    // HR Funcionarios
    public static final String HR_FUNCIONARIOS_PATH = "/api/human-resources/funcionarios";
    public static final String HR_FUNCIONARIOS_GROUP = "funcionarios";
    public static final String HR_FUNCIONARIOS_TAG = "HR - Funcionarios";

    // HR Folhas de Pagamento
    public static final String HR_FOLHAS_PAGAMENTO_PATH = "/api/human-resources/folhas-pagamento";
    public static final String HR_FOLHAS_PAGAMENTO_GROUP = "folhas-pagamento";
    public static final String HR_FOLHAS_PAGAMENTO_TAG = "HR - Folhas Pagamento";

    // HR Eventos de Folha
    public static final String HR_EVENTOS_FOLHA_PATH = "/api/human-resources/eventos-folha";
    public static final String HR_EVENTOS_FOLHA_GROUP = "eventos-folha";
    public static final String HR_EVENTOS_FOLHA_TAG = "HR - Eventos Folha";

    // HR Férias/Afastamentos
    public static final String HR_FERIAS_AFASTAMENTOS_PATH = "/api/human-resources/ferias-afastamentos";
    public static final String HR_FERIAS_AFASTAMENTOS_GROUP = "ferias-afastamentos";
    public static final String HR_FERIAS_AFASTAMENTOS_TAG = "HR - Ferias Afastamentos";

    private ApiRouteDefinitions() {
        // Prevent instantiation
    }
}
