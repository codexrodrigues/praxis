# Praxis Metadata Core

## Introduction

Praxis Metadata Core (`praxis-metadata-core`) is a foundational library providing the core definitions for the Praxis UI Metadata framework. It includes essential annotations, property interfaces, and base classes designed to streamline the development of backend services that can dynamically drive user interfaces. The primary purpose of this library is to enable developers to define UI metadata directly within their backend code, facilitating the automatic generation and configuration of UI components such as forms, tables, and filters.

## Features

The `praxis-metadata-core` library offers a comprehensive set of features to accelerate backend development and enable dynamic UI rendering:

*   **Dynamic UI Schema Generation:** Define rich UI metadata directly in your Java DTOs or entities using the `@UISchema` annotation. This metadata, including details about labels, control types, layout, validation, and visibility, can be exposed via an API endpoint, allowing frontends to dynamically render interfaces.
*   **Generic CRUD Infrastructure:** Provides abstract base classes (`AbstractCrudController`, `BaseCrudService`) to rapidly implement standardized CRUD (Create, Read, Update, Delete) operations, significantly reducing boilerplate code.
*   **Dynamic Query Filtering:** Annotate DTO fields with `@Filterable` to easily enable them as criteria for dynamic, type-safe JPA query generation, supporting various filter operations and entity relationships.
*   **HATEOAS Support:** Automatically includes HATEOAS links in API responses, making your APIs more discoverable and self-descriptive.
*   **Standardized API Responses:** Utilizes a consistent `RestApiResponse` wrapper for all API endpoints, ensuring a uniform response structure for clients.
*   **Pagination and Sorting:** Offers out-of-the-box support for paginated responses and default entity sorting (configurable via `@DefaultSortColumn` annotation) through Spring Data Pageable.
*   **Extensible Design:** Built with extensibility in mind, allowing developers to easily introduce custom UI components, validation logic, and other behaviors.
*   **Spring Boot & OpenAPI Integration:** Seamlessly integrates with Spring Boot and leverages OpenAPI for API documentation and schema exposure, facilitating clear communication between backend and frontend systems.

## Documentation

This repository currently contains only the backend library. Documentation can be generated locally or published automatically via GitHub Actions.

### Generating backend docs

```bash
cd backend-libs/praxis-metadata-core
../../mvnw javadoc:javadoc
```

The generated Javadoc will be placed in `target/site/apidocs`.
