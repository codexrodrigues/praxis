# Praxis Metadata Core

## Introduction

Praxis Metadata Core (`praxis-metadata-core`) is a foundational library providing the core definitions for the Praxis UI Metadata framework. It includes essential annotations, property interfaces, and base classes designed to streamline the development of backend services that can dynamically drive user interfaces. The primary purpose of this library is to enable developers to define UI metadata directly within their backend code, facilitating the automatic generation and configuration of UI components such as forms, tables, and filters.

## Features

The `praxis-metadata-core` library offers a comprehensive set of features to accelerate backend development and enable dynamic UI rendering:

*   **Dynamic UI Schema Generation:** Define rich UI metadata directly in your Java DTOs or entities using the `@UISchema` annotation. This metadata, including details about labels, control types, layout, validation, and visibility, can be exposed via an API endpoint, allowing frontends to dynamically render interfaces.
*   **Generic CRUD Infrastructure:** Provides abstract base classes (`AbstractCrudController`, `BaseCrudService`) to rapidly implement standardized CRUD (Create, Read, Update, Delete) operations, significantly reducing boilerplate code.
*   **Dynamic Query Filtering:** Annotate DTO fields with `@Filterable` to easily enable them as criteria for dynamic, type-safe JPA query generation, supporting various filter operations and entity relationships.
*   **Automatic Validation Integration:** Standard Jakarta Bean Validation annotations are interpreted and exposed through the `x-ui` extension, allowing frontends to automatically enforce and display validation rules defined on the backend.
*   **HATEOAS Support:** Automatically includes HATEOAS links in API responses, making your APIs more discoverable and self-descriptive.
*   **Standardized API Responses:** Utilizes a consistent `RestApiResponse` wrapper for all API endpoints, ensuring a uniform response structure for clients.
*   **Pagination and Sorting:** Offers out-of-the-box support for paginated responses and default entity sorting (configurable via the `@DefaultSortColumn` annotation) through Spring Data Pageable.
*   **Extensible Design:** Built with extensibility in mind, allowing developers to easily introduce custom UI components, validation logic, and other behaviors.
*   **Spring Boot & OpenAPI Integration:** Seamlessly integrates with Spring Boot and leverages OpenAPI for API documentation and schema exposure, facilitating clear communication between backend and frontend systems.

### Library Resources

The main resources of this library are designed to work together and reduce boilerplate when creating data-driven applications:

* **Generic CRUD** – Use `AbstractCrudController` and `BaseCrudService` as a starting point to implement standardized create, read, update and delete endpoints with minimal code.
* **Filters** – Mark DTO fields with `@Filterable` and let the framework build type-safe JPA `Specification` queries behind the scenes, exposing a convenient `/filter` endpoint.
* **Automatic Validation** – Bean Validation constraints (`@NotNull`, `@Size`, etc.) are merged with `@UISchema` attributes so that generated UI schemas contain the expected rules and error messages without extra configuration.

## Getting Started

To get started with Praxis Metadata Core, include the following Maven dependency in your project's `pom.xml`:

```xml
<dependency>
    <groupId>org.praxisplatform</groupId>
    <artifactId>praxis-metadata-core</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```
**Note:** Please replace `1.0.0-SNAPSHOT` with the latest stable released version. You can find available versions on your Maven repository.

### Basic Usage Example

Here's a simple example of how to use the `@UISchema` annotation on an entity:

```java
package com.example.model;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.FieldDataType;
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.NumericFormat; // Corrected import

// Basic imports for JPA if this were a real entity
// import jakarta.persistence.Entity;
// import jakarta.persistence.Id;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;

// @Entity // If this were a JPA entity
@UISchema(
    name = "product",
    label = "Product Information",
    description = "Represents a product in the catalog",
    formHidden = false, // Example: make it visible in forms
    tableHidden = false // Example: make it visible in tables
)
public class Product {

    // @Id // If this were a JPA entity
    // @GeneratedValue(strategy = GenerationType.IDENTITY) // If this were a JPA entity
    private Long id;

    @UISchema(
        label = "Product Name",
        description = "The official name of the product",
        required = true,
        controlType = FieldControlType.INPUT,
        type = FieldDataType.TEXT
    )
    private String name;

    @UISchema(
        label = "Description",
        description = "A brief summary of the product",
        controlType = FieldControlType.TEXTAREA, // Example of a different control type
        type = FieldDataType.TEXT
    )
    private String description;

    @UISchema(
        label = "Price",
        description = "The retail price of the product",
        required = true,
        controlType = FieldControlType.INPUT,
        type = FieldDataType.NUMBER, // Example of numeric type
        numericFormat = NumericFormat.CURRENCY // Corrected usage
    )
    private double price;

    // Constructors, Getters, and Setters
    public Product() {
    }

    public Product(Long id, String name, String description, double price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
```

This example demonstrates how to apply the `@UISchema` annotation at both the class level to define overall schema properties for the `Product` entity, and at the field level to specify UI characteristics for individual properties like `name`, `description`, and `price`. These annotations can then be processed by the Praxis UI Metadata framework to dynamically generate user interfaces.

### Extended Field Example

Below is a small snippet demonstrating several of the available attributes on `@UISchema` for a field:

```java
@UISchema(
    label = "Email",
    placeholder = "user@example.com",
    helpText = "Provide a valid email address",
    controlType = FieldControlType.INPUT,
    type = FieldDataType.EMAIL,
    icon = "envelope",
    iconPosition = IconPosition.RIGHT,
    required = true,
    minLength = 5,
    maxLength = 100,
    pattern = ValidationPattern.EMAIL
)
private String email;

@UISchema(
    label = "Age",
    type = FieldDataType.NUMBER,
    controlType = FieldControlType.INPUT,
    numericMin = "18",
    numericMax = "120",
    numericStep = "1",
    numericFormat = NumericFormat.INTEGER,
    filterable = true,
    required = true
)
private Integer age;
```

## Core Concepts

The Praxis Metadata Core library revolves around a few key concepts that enable its dynamic UI generation and data management capabilities:

### 1. `@UISchema` Annotation

*   **Location:** `org.praxisplatform.uischema.extension.annotation.UISchema`
*   **Purpose:** This is the primary annotation used to mark a Java class (typically an entity or a DTO) for which a UI schema should be generated. It acts as a container for metadata that describes how the class and its properties should be represented and behave in a user interface.
*   **Key Attributes:** The `@UISchema` annotation can be applied at the class level and also at the field level.
    *   **Class-level:** Defines overall characteristics like the schema `name` (identifier), `label` (display name for the entity/form), and `description`.
    *   **Field-level:** When applied to a field, it specifies how that individual field should be rendered and managed. Common attributes include:
        *   `label`: The display name for the field.
        *   `description`: A tooltip or help text for the field.
        *   `controlType`: Specifies the UI component to use (e.g., text input, dropdown, checkbox - see `FieldControlType`).
        *   `type`: Defines the data type of the field (e.g., text, number, date - see `FieldDataType`).
        *   `required`: Indicates if the field is mandatory.
        *   `hidden`, `tableHidden`, `formHidden`: Control the visibility of the field in different UI contexts.
        *   `order`: Defines the display order of fields.
        *   The annotation supports many other attributes for validation, layout, styling, icons, numeric formatting, and conditional rendering.

### 2. Field Configuration

To support the `@UISchema` annotation, especially at the field level, several enums and helper classes define the possible configurations:

*   **`FieldConfigProperties.java`**: An enum that provides a standardized set of string keys for all supported UI configuration properties. This is used internally by the framework and can be helpful for developers building custom extensions.
*   **`FieldControlType.java`**: An enum listing the various types of UI controls that can be used to render a field (e.g., `INPUT`, `SELECT`, `TEXTAREA`, `CHECKBOX`, `RADIO`, `DATEPICKER`). This is used in the `controlType` attribute of `@UISchema`.
*   **`FieldDataType.java`**: An enum defining the logical data types for fields (e.g., `TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `CURRENCY`). This is used in the `type` attribute of `@UISchema` and helps in determining appropriate rendering and validation.

These components work in tandem. For instance, when you annotate a field with `@UISchema`, you might set its `controlType` to `FieldControlType.SELECT` and its `type` to `FieldDataType.TEXT`.

### 3. `@Filterable` Annotation

*   **Location:** `org.praxisplatform.uischema.filter.annotation.Filterable`
*   **Purpose:** This annotation is used to mark specific fields within a Data Transfer Object (DTO) as being available for use as filter criteria in dynamic database queries.
*   **Usage:**
    *   When a DTO is used as input for a filtering operation (e.g., in an API endpoint), fields annotated with `@Filterable` are identified by the framework.
    *   The `BaseCrudService` (often used by an `AbstractCrudController`) can then use a `GenericSpecificationsBuilder` to construct JPA Specifications based on the values provided in these `@Filterable` DTO fields.
    *   The `@Filterable` annotation has key attributes such as:
        *   `operation()`: Defines the comparison operation (e.g., `EQUAL`, `LIKE`, `GREATER_THAN`, `BETWEEN` via the `FilterOperation` enum).
        *   `relation()`: Specifies a path to a field in a related entity if the filter needs to span across JPA relationships (e.g., `customer.address.city`).

### 4. CRUD Helpers

To simplify the creation of RESTful services with UI metadata capabilities, the library provides abstract base classes:

*   **`AbstractCrudController<E, D, FD, ID>`**:
    *   This generic class serves as a foundation for creating CRUD controllers. Concrete controllers extend it, specifying their Entity (`E`), DTO (`D`), Filter DTO (`FD`), and Identifier Type (`ID`).
    *   It automatically provides standard REST endpoints for create, read (all and by ID), update, delete, and a powerful `/filter` endpoint that works with `@Filterable` DTOs.
    *   Crucially, it integrates UI schema generation by providing a `/schemas` endpoint (and a `/schemas/filtered` variant) that exposes the metadata defined by `@UISchema` annotations for the controller's entity/DTO. This allows frontends to fetch UI configurations dynamically.
    *   It also incorporates HATEOAS link generation and standardized API responses using `RestApiResponse`.

*   **`BaseCrudService<E, ID, FD>`**:
    *   This generic interface (often implemented by an abstract class or a concrete service) defines the standard contract for service-layer CRUD operations.
    *   Implementations typically interact with a `BaseCrudRepository`.
    *   It includes methods for `findAll`, `findById`, `save`, `update`, `deleteById`, and a `filter` method that takes a `@Filterable` DTO and `Pageable` information to return paginated and filtered results.
    *   It also handles default sorting based on the `@DefaultSortColumn` annotation that can be placed on entity fields.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request to the repository. You can find the source code management (SCM) details, including the repository URL, in the project's `pom.xml` file. The primary repository is located at: `https://github.com/praxis-platform/praxis-metadata-core.git`.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](../../LICENSE) file for details.
