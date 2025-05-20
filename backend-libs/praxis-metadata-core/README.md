# Praxis Metadata Core

O módulo `praxis-metadata-core` é a fundação da biblioteca Praxis para a definição de metadados de UI em aplicações Java. Ele fornece as anotações essenciais e as interfaces base que permitem aos desenvolvedores enriquecer seus DTOs e entidades com informações que podem ser usadas para gerar interfaces de usuário dinâmicas e interativas.

Este módulo é projetado para ser leve e com o mínimo de dependências, focando em fornecer as definições centrais para a especificação de metadados de UI.

## 🚀 Visão Geral

Com o `praxis-metadata-core`, você pode:

* Utilizar anotações para definir como os campos de seus DTOs devem ser interpretados e apresentados na UI.
* Integrar com a especificação OpenAPI para que esses metadados de UI enriqueçam sua documentação de API.
* Estabelecer uma base para a geração de formulários, grids e outros componentes de UI de forma dinâmica.
* Definir filtros e especificações de consulta de forma declarativa.

## ✨ Principais Funcionalidades

* **Anotações de Metadados de UI**:
    * `@UISchema`: Anotação principal para campos, que aplica implicitamente `@io.swagger.v3.oas.annotations.media.Schema` e serve como contêiner para metadados `x-ui`.
    * `@UIExtension`: Define um conjunto de propriedades chave-valor (`ExtensionProperty`) que serão agrupadas sob a extensão `"x-ui"` no schema OpenAPI. Usada dentro de `@UISchema` ou como meta-anotação.
    * **Anotações de Especialização**: Um conjunto de anotações pré-definidas (como `@UINomeProprioExtension`, `@UIDataExtension`, `@UITextInputExtension`) que são meta-anotadas com `@UIExtension` para aplicar configurações comuns de `x-ui` a tipos de campos específicos, reduzindo a verbosidade.
* **Constantes de Configuração de UI**:
    * Interfaces como `FieldConfigProperty`, `FieldControlType`, `FieldDataType`, `ValidationProperty` que definem as chaves padrão para as propriedades `x-ui`.
* **Filtragem Dinâmica**:
    * `@Filterable`: Anotação para marcar campos em DTOs que podem ser usados como critérios de filtro.
    * `FilterCriteria`: Interface marcadora para DTOs de filtro.
    * `PraxisSpecificationBuilder` e `PraxisSpecification`: Classes para construir especificações JPA dinâmicas a partir de DTOs de filtro.
* **Abstrações de Dados**:
    * `PraxisCrudRepository`: Interface base para repositórios CRUD.
    * `PraxisCrudService`: Interface base para serviços CRUD.
    * `PraxisMapper`: Interface base para mappers entre DTOs e Entidades.

## ⚙️ Configuração (Maven)

Adicione a dependência `praxis-metadata-core` ao seu arquivo `pom.xml`:

```xml
<dependency>
    <groupId>org.praxisplatform</groupId>
    <artifactId>praxis-metadata-core</artifactId>
    <version>1.0.0-SNAPSHOT</version> </dependency>

<dependency>
    <groupId>io.swagger.core.v3</groupId>
    <artifactId>swagger-annotations</artifactId>
    <version>2.2.22</version> </dependency>
<dependency>
    <groupId>jakarta.persistence</groupId>
    <artifactId>jakarta.persistence-api</artifactId>
    </dependency>
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-commons</artifactId>
    </dependency>
