package com.example.praxis.common.config;

public class ApiRouteDefinitions {

    // Users
    public static final String USERS_PATH = "/users";
    public static final String USERS_GROUP = "users";
    public static final String USERS_TAG = "Users";

    // HR Cargos
    public static final String HR_CARGOS_PATH = "/cargos";
    public static final String HR_CARGOS_GROUP = "cargos";
    public static final String HR_CARGOS_TAG = "HR - Cargos";

    // HR Departamentos
    public static final String HR_DEPARTAMENTOS_PATH = "/api/hr/departamentos";
    public static final String HR_DEPARTAMENTOS_GROUP = "departamentos";
    public static final String HR_DEPARTAMENTOS_TAG = "HR - Departamentos";

    // HR Funcionarios
    public static final String HR_FUNCIONARIOS_PATH = "/api/hr/funcionarios";
    public static final String HR_FUNCIONARIOS_GROUP = "funcionarios";
    public static final String HR_FUNCIONARIOS_TAG = "HR - Funcionarios";

    private ApiRouteDefinitions() {
        // Prevent instantiation
    }
}
