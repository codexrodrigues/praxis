package org.praxisplatform.meta.ui.openapi.constants;

public final class ApiEndpoints {

    private ApiEndpoints() {
        // Private constructor to prevent instantiation
    }

    // Group Names
    public static final String HR_GROUP = "Human Resources";
    public static final String USER_GROUP = "Users"; // Changed from SAMPLE_GROUP for clarity

    // Path Patterns
    public static final String HR_PATH_PATTERN = "/api/hr/**";
    public static final String USER_PATH_PATTERN = "/users/**";

    // You can add more groups and paths here as the application grows.
    // For example:
    // public static final String FINANCE_GROUP = "Finance";
    // public static final String FINANCE_PATH_PATTERN = "/api/finance/**";
}
