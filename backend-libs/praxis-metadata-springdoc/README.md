# Praxis Metadata SpringDoc Integration (`praxis-metadata-springdoc`)

O módulo `praxis-metadata-springdoc` atua como a ponte entre o sistema de metadados de UI do Praxis (definido no `praxis-metadata-core`) e a documentação OpenAPI gerada pelo SpringDoc. Sua principal responsabilidade é processar as anotações de UI do Praxis e enriquecer a documentação OpenAPI, tornando os metadados `x-ui` acessíveis através de um endpoint dedicado.

## 🎯 Propósito

Em muitos sistemas que geram UI dinamicamente, é crucial que o frontend tenha acesso não apenas aos schemas de dados, mas também aos metadados que descrevem como a UI deve ser renderizada (por exemplo, tipos de controle, validações, formatação, etc.). Este módulo facilita essa comunicação.

## ✨ Principais Componentes e Funcionalidades

*   **`OpenApiSchemaController`**: Um controller Spring MVC que expõe um endpoint (por padrão, `/schemas/filtered`) para recuperar partes específicas do schema OpenAPI da sua aplicação. Este schema é enriquecido com as propriedades `x-ui` definidas através das anotações do `praxis-metadata-core`. Isso permite que as interfaces de usuário busquem metadados detalhados para construir formulários, grids e outros componentes dinamicamente.
*   **Processamento de Anotações de UI**: Embora este módulo não altere fundamentalmente a forma como o SpringDoc gera o schema OpenAPI base, seus componentes, especialmente o `OpenApiSchemaController`, utilizam as anotações definidas no `praxis-metadata-core` (como `@UISchema`, `@UIExtension`, e as diversas constantes de propriedades `x-ui`) para fornecer visões do schema que são especificamente relevantes para a UI.
*   **Resolução de Schemas Internos**: O `OpenApiSchemaController` pode, opcionalmente, resolver referências internas (`$ref`) dentro dos schemas OpenAPI, embutindo as definições diretamente para facilitar o consumo pelo frontend.

## ⚙️ Como Funciona

1.  Sua aplicação principal utiliza o SpringDoc para gerar a documentação OpenAPI padrão (geralmente disponível em `/v3/api-docs`).
2.  O `OpenApiSchemaController` (deste módulo) é configurado para ler essa documentação OpenAPI gerada.
3.  Quando o endpoint `/schemas/filtered` é consultado (com parâmetros como o caminho do schema e a operação), o controller:
    *   Localiza o schema OpenAPI relevante (por exemplo, o schema de um DTO usado no corpo de uma requisição POST).
    *   Extrai os metadados `x-ui` associados, que foram originalmente definidos usando anotações como `@UISchema` nos campos do seu DTO.
    *   Retorna o schema específico, agora enriquecido com os dados `x-ui`.

## 🛠️ Configuração e Uso

1.  **Adicione a Dependência**:
    Inclua `praxis-metadata-springdoc` no `pom.xml` da sua aplicação Spring Boot:
    ```xml
    <dependency>
        <groupId>org.praxisplatform</groupId>
        <artifactId>praxis-metadata-springdoc</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </dependency>
    ```
    Este módulo depende do `praxis-metadata-core` e do `springdoc-openapi-starter-webmvc-ui`, que serão incluídos transitivamente se não estiverem já presentes com versões compatíveis.

2.  **Configure o SpringDoc**:
    Certifique-se de que o SpringDoc esteja configurado em sua aplicação para gerar a documentação OpenAPI.

3.  **Component Scan**:
    O `OpenApiSchemaController` será automaticamente detectado se sua aplicação realizar component scan no pacote `org.praxisplatform.meta.ui.openapi.controller` (o que é comum em aplicações Spring Boot com a anotação `@SpringBootApplication`).

4.  **Endpoint de Documentação**:
    O `OpenApiSchemaController` utiliza a propriedade `springdoc.api-docs.path` (padrão: `/v3/api-docs`) para localizar a documentação OpenAPI base. Se você alterou este caminho, o controller o respeitará.

## 📄 Exemplo de Interação

Se você tem um DTO `UserDTO` anotado com metadados Praxis e ele é usado em um endpoint POST `/users`, o frontend poderia consultar:
`/schemas/filtered?path=/users&operation=post`
para obter o schema do `UserDTO` enriquecido com as informações `x-ui`, pronto para ser usado na renderização de um formulário de criação de usuário.
