# Praxis Backend Libs - Aplicação de Exemplo

Esta aplicação de exemplo demonstra o uso das bibliotecas `praxis-backend-libs` para criar uma API Spring Boot com metadados de UI enriquecidos.

## Propósito

O objetivo principal é mostrar como as anotações e starters do Praxis podem ser utilizados para:

*   Definir metadados de UI diretamente no código Java (DTOs).
*   Expor esses metadados automaticamente através do SpringDoc.
*   Simplificar a configuração de projetos Spring Boot que utilizam Praxis.

## Módulos Praxis Utilizados

*   **`org.praxisplatform:praxis-spring-boot-starter`**: Facilita a auto-configuração e inclui dependências essenciais do Praxis.
*   **`org.praxisplatform:praxis-metadata-core`** (transitivamente): Fornece as anotações (`@UISchema`, `@UIExtension`, etc.) para definir os metadados.
*   **`org.praxisplatform:praxis-metadata-springdoc`**: Integra os metadados do Praxis com a especificação OpenAPI gerada pelo SpringDoc, adicionando extensões `x-ui`.

## Como Construir o Projeto

Para construir o projeto, execute o seguinte comando Maven na raiz deste diretório (`examples/praxis-backend-libs-sample-app`):

```bash
mvn clean install
```

Isso irá compilar o código, executar os testes e empacotar a aplicação em um arquivo JAR.

Você também pode executar apenas os testes com o comando:

```bash
mvn test
```

## Como Executar a Aplicação

## Como Executar a Aplicação

Após construir o projeto, você pode executá-lo de duas maneiras:

1.  **Usando o plugin Maven Spring Boot:**

    ```bash
    mvn spring-boot:run
    ```

2.  **Executando o JAR diretamente:**

    ```bash
    java -jar target/praxis-sample-app-1.0.0-SNAPSHOT.jar
    ```
    (O nome do artefato JAR pode variar dependendo da versão definida no `pom.xml`).

A aplicação será iniciada e estará acessível em `http://localhost:8080`.

## Acessando a UI do SpringDoc (Swagger UI)

Com a aplicação em execução, abra seu navegador e acesse:

[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

Você verá a interface do Swagger UI, que documenta os endpoints da API. Explore o endpoint POST `/users`. Você notará que o schema da requisição para `UserDTO` no Swagger UI não exibirá diretamente as anotações `x-ui` do Praxis, pois estas são extensões do schema OpenAPI e são servidas por um endpoint específico do Praxis.

## Acessando o Schema Enriquecido pelo Praxis

O `praxis-metadata-springdoc` expõe os metadados de UI enriquecidos através de um endpoint específico. Para visualizar o schema do `UserDTO` com as propriedades `x-ui` injetadas pelo Praxis, faça uma requisição GET para o seguinte endpoint (por exemplo, usando `curl` ou uma ferramenta como o Postman):

```bash
curl -X GET "http://localhost:8080/schemas/filtered?path=/users&operation=post&schemaType=request"
```

**O que esperar na resposta:**

Você receberá uma resposta JSON contendo a especificação OpenAPI para o endpoint `/users` (operação POST). Dentro desta especificação, o schema para `UserDTO` (geralmente em `components.schemas.UserDTO`) incluirá as propriedades `x-ui` que foram definidas através das anotações Praxis:

*   `fullName`: Terá `x-ui-controlType: "nomeProprio"` (devido a `@UINomeProprioExtension`).
*   `birthDate`: Terá `x-ui-controlType: "data"` (devido a `@UIDataExtension`).
*   `email`: Terá `x-ui-controlType: "email"` (definido via `@UIExtension`).
*   `active`: Não terá um `x-ui-controlType` específico, mas estará presente no schema.

Essas extensões `x-ui` são o que uma aplicação frontend compatível com Praxis (como uma construída com `praxis-ui`) utilizaria para renderizar dinamicamente formulários e componentes.

## Funcionalidades Demonstradas

*   **Anotações de Metadados:** Uso de `@UISchema`, `@UIExtension` e extensões padrão como `@UINomeProprioExtension` e `@UIDataExtension` no `UserDTO.java`.
*   **Auto-configuração:** O `praxis-spring-boot-starter` configura automaticamente os beans necessários para o Praxis funcionar.
*   **Exposição de Schema:** O `praxis-metadata-springdoc` integra-se ao SpringDoc para expor os metadados enriquecidos, que podem ser consumidos por aplicações cliente.

Este exemplo serve como um ponto de partida para entender como as bibliotecas backend do Praxis podem ser usadas para construir aplicações robustas e dinâmicas.

## Módulo de Recursos Humanos (HR) Adicional

Para expandir as demonstrações e fornecer um exemplo de domínio mais realista, um módulo de Recursos Humanos (HR) foi adicionado.

### Propósito do Módulo HR

Este módulo serve para:

*   Demonstrar a aplicação das bibliotecas Praxis em um contexto de negócios mais complexo com múltiplas entidades e relacionamentos.
*   Fornecer exemplos de DTOs, Entidades JPA, Repositórios Spring Data JPA e Controladores REST.
*   Mostrar como configurar e usar um banco de dados (H2 em memória por padrão, com opção para PostgreSQL).

### Principais Entidades do Módulo HR

O módulo HR inclui as seguintes entidades principais:

*   `Funcionario`: Representa os funcionários.
*   `Cargo`: Define os cargos e suas faixas salariais.
*   `Departamento`: Organiza os funcionários em departamentos.
*   `Endereco`: Objeto embutido para endereços dos funcionários.
*   `Dependente`: Dependentes dos funcionários.
*   `FolhaPagamento`: Registros de folhas de pagamento.
*   `EventoFolha`: Eventos (créditos/débitos) em uma folha de pagamento.
*   `FeriasAfastamento`: Registros de férias e outros afastamentos.

### APIs REST do Módulo HR

O módulo HR expõe APIs REST para interagir com suas entidades. Os endpoints principais estão sob o prefixo `/api/hr`. Por exemplo:

*   Funcionários: `/api/hr/funcionarios`
*   Cargos: `/api/hr/cargos`
*   Departamentos: `/api/hr/departamentos`

### Configuração do Banco de Dados

A aplicação é configurada para usar um banco de dados para persistir os dados do módulo HR.

*   **Padrão: Banco de Dados H2 em Memória**
    *   A aplicação utiliza um banco de dados H2 em memória por padrão.
    *   Os dados são inicializados a partir do arquivo `src/main/resources/data.sql` quando a aplicação inicia.
    *   Você pode acessar o console do H2 para inspecionar o banco de dados diretamente no seu navegador em: `http://localhost:8080/h2-console`
        *   **JDBC URL**: `jdbc:h2:mem:testdb`
        *   **User Name**: `sa`
        *   **Password**: (deixe em branco)

*   **Alternativa: Banco de Dados Externo (Exemplo com PostgreSQL)**
    *   Para usar um banco de dados externo como o PostgreSQL, você precisará:
        1.  Adicionar a dependência do driver JDBC apropriado ao `pom.xml` (ex: `postgresql`).
        2.  Modificar o arquivo `src/main/resources/application.properties`. Comente as propriedades do H2 e descomente (e ajuste) a seção de exemplo para PostgreSQL:
            ```properties
            # === External PostgreSQL Database Configuration (Example) ===
            # spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
            # spring.datasource.username=your_postgres_username
            # spring.datasource.password=your_postgres_password
            # spring.datasource.driverClassName=org.postgresql.Driver
            # spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
            # spring.jpa.hibernate.ddl-auto=update # ou 'validate'
            ```
        3.  Certifique-se de que o servidor de banco de dados externo esteja em execução e acessível.

### Executando e Acessando o Módulo HR

Após iniciar a aplicação (conforme instruções na seção "Como Executar a Aplicação"), você pode interagir com as APIs do módulo HR.

**Exemplos de requisições `curl`:**

*   **Listar todos os funcionários:**
    ```bash
    curl -X GET "http://localhost:8080/api/hr/funcionarios"
    ```

*   **Buscar funcionário pelo ID 1:**
    ```bash
    curl -X GET "http://localhost:8080/api/hr/funcionarios/1"
    ```

*   **Listar todos os cargos:**
    ```bash
    curl -X GET "http://localhost:8080/api/hr/cargos"
    ```

*   **Acessar o console H2:**
    Abra no navegador: `http://localhost:8080/h2-console`

Lembre-se que os dados iniciais são carregados a partir de `data.sql`. Você pode modificar este arquivo para testar com diferentes conjuntos de dados.
