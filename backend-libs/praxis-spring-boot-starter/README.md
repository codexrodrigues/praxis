# Praxis Spring Boot Starter (`praxis-spring-boot-starter`)

O `praxis-spring-boot-starter` é projetado para simplificar a integração e a configuração automática da framework Praxis UI Metadata em suas aplicações Spring Boot. Ele visa reduzir a necessidade de configuração manual, permitindo que você comece a usar os recursos do Praxis rapidamente.

## 🎯 Propósito

Este starter serve como um ponto de entrada único para a utilização do ecossistema Praxis em um ambiente Spring Boot, configurando automaticamente os componentes essenciais e gerenciando dependências.

## ✨ Principais Funcionalidades e Componentes Auto-configurados

*   **Integração com o Core (`praxis-metadata-core`)**:
    *   Inclui automaticamente o `praxis-metadata-core`, fornecendo acesso a todas as anotações de metadados de UI, interfaces de configuração e funcionalidades de filtragem dinâmica.

*   **Configuração Automática de Componentes Praxis**:
    *   **`PraxisExceptionHandler`**: Registra um handler de exceções global que lida com exceções específicas da aplicação (como `BusinessLogicException` e outras) e as traduz em respostas HTTP padronizadas, seguindo o formato Problem Detail (RFC 7807).
    *   **`PraxisMessageSource`**: Configura um `MessageSource` para o tratamento de mensagens internacionalizadas, frequentemente utilizado para mensagens de validação e erros de forma consistente.
    *   **Integração com `praxis-metadata-springdoc`**: Se o módulo `praxis-metadata-springdoc` estiver presente no classpath, este starter garante que o `OpenApiSchemaController` seja configurado, tornando o endpoint `/schemas/filtered` (ou o caminho configurado) disponível para que sua UI possa buscar metadados de schema enriquecidos.

*   **Gerenciamento Simplificado de Dependências (via dependências opcionais)**:
    *   O starter declara várias dependências como opcionais, permitindo que você inclua apenas o que é necessário para sua aplicação:
        *   `praxis-metadata-springdoc`: Para a integração dos metadados de UI com SpringDoc/OpenAPI.
        *   `spring-boot-starter-web`: Essencial para aplicações web.
        *   `spring-boot-starter-data-jpa`: Para funcionalidades de acesso a dados baseadas em JPA.
        *   `spring-boot-starter-hateoas`: Para adicionar links HATEOAS às suas respostas de API.
        *   `springdoc-openapi-starter-webmvc-ui`: Para a interface de usuário do SpringDoc.

## 🛠️ Como Usar

1.  **Adicione a Dependência Principal**:
    Inclua `praxis-spring-boot-starter` no arquivo `pom.xml` do seu projeto Spring Boot:
    ```xml
    <dependency>
        <groupId>org.praxisplatform</groupId>
        <artifactId>praxis-spring-boot-starter</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </dependency>
    ```

2.  **Adicione Dependências Opcionais (conforme necessário)**:
    Se você precisar da funcionalidade fornecida por uma das dependências opcionais, adicione-a explicitamente ao seu `pom.xml`. Por exemplo, para usar a integração com SpringDoc e o `OpenApiSchemaController`:
    ```xml
    <dependency>
        <groupId>org.praxisplatform</groupId>
        <artifactId>praxis-metadata-springdoc</artifactId>
        <version>1.0.0-SNAPSHOT</version> 
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <!-- A versão será gerenciada pelo BOM do Spring Boot ou pelo praxis-bom se importado -->
    </dependency>
    ```
    A auto-configuração do starter se adaptará com base nas dependências presentes no classpath.

## 🌟 Benefícios

*   **Redução de Configuração Boilerplate**: Minimiza a quantidade de configuração manual necessária para usar a framework Praxis.
*   **Configuração Correta**: Garante que os componentes do Praxis sejam registrados e configurados corretamente dentro do ecossistema Spring.
*   **Experiência "Batteries-Included"**: Facilita o início rápido do desenvolvimento com as funcionalidades do Praxis em aplicações Spring Boot.
