# Controllers do módulo de Recursos Humanos

Este guia descreve as principais controllers presentes em
`examples/praxis-backend-libs-sample-app` dentro do pacote
`com.example.praxis.humanresources.controller`.
Ele explica o propósito de cada controller, as bibliotecas do Praxis
utilizadas e mostra exemplos de chamadas para os endpoints padrão de CRUD
fornecidos por `AbstractCrudController`.

Todas as controllers listadas abaixo estendem
`AbstractCrudController` da biblioteca
`org.praxisplatform.uischema.controller.base`, o que fornece
automaticamente operações de **listar**, **buscar por ID**, **criar**,
**atualizar**, **excluir** e **filtrar** registros com suporte a
HATEOAS e OpenAPI.

Além disso, cada controller define sua rota base e metadados de
Swagger/OpenAPI por meio das constantes de `ApiRouteDefinitions` e da
anotação `@Tag`.

Os serviços e mapeadores são injetados pelo Spring Boot com `@Autowired`,
permitindo que a controller delegue para as camadas de serviço e mapper
sem código adicional.

---

## CargoController

**Propósito**: Gerenciar os cargos (funções) disponíveis no RH.

**Principais imports**:

- `AbstractCrudController` – provê todos os métodos CRUD.
- `ApiRouteDefinitions.HR_CARGOS_PATH` – define o caminho
  `/api/human-resources/cargos`.
- `CargoService` e `CargoMapper` – executam a regra de negócio e a
  conversão entre `Cargo` e `CargoDTO`.
- `@Tag` – configura o grupo "HR - Cargos" na documentação Swagger.

### Exemplos de chamadas

Listar todos os cargos:

```bash
GET /api/human-resources/cargos/all
```

Buscar cargo de id 1:

```bash
GET /api/human-resources/cargos/1
```

Criar um novo cargo:

```bash
POST /api/human-resources/cargos
Content-Type: application/json

{
  "nome": "Analista de Dados",
  "nivel": "Pleno",
  "descricao": "Atua com BI e ETL",
  "salarioMinimo": 6000.00,
  "salarioMaximo": 9000.00
}
```

Filtrar cargos pelo campo `nome`:

```bash
POST /api/human-resources/cargos/filter
Content-Type: application/json

{
  "nome": "Engenheiro"
}
```

---

## DepartamentoController

**Propósito**: Organizar os funcionários em departamentos.

**Destaques**:

- Usa `DepartamentoService` e `DepartamentoMapper`.
- Rota base `/api/human-resources/departamentos`.
- Permite filtrar por `nome`, `codigo` e `responsavelId`.

### Exemplo de criação

```bash
POST /api/human-resources/departamentos
Content-Type: application/json

{
  "nome": "Marketing",
  "codigo": "MKT",
  "responsavelId": 1
}
```

---

## FuncionarioController

**Propósito**: Gerenciar os funcionários da empresa.

A controller recebe `FuncionarioService` e `FuncionarioMapper` via
injeção de dependências e está mapeada para
`/api/human-resources/funcionarios`.

Exemplo de consulta por ID:

```bash
GET /api/human-resources/funcionarios/1
```

Para buscar funcionários utilizando filtros:

```bash
POST /api/human-resources/funcionarios/filter
Content-Type: application/json

{
  "nomeCompleto": "Alice",
  "departamentoId": 1
}
```

---

## FolhaPagamentoController

**Propósito**: Manipular registros de folhas de pagamento.

- Rota `/api/human-resources/folhas-pagamento`.
- Filtra por `funcionarioId`, `ano`, `mes` e faixas de valores.

Exemplo de chamada para listar todas as folhas:

```bash
GET /api/human-resources/folhas-pagamento/all
```

---

## EventoFolhaController

**Propósito**: Registrar créditos e descontos de uma folha de pagamento.

- Depende de `EventoFolhaService` e `EventoFolhaMapper`.
- Rota `/api/human-resources/eventos-folha`.

Exemplo para criar um evento:

```bash
POST /api/human-resources/eventos-folha
Content-Type: application/json

{
  "folhaPagamentoId": 1,
  "descricao": "Bônus de Performance",
  "tipo": "ADICIONAL",
  "valor": 500.00
}
```

---

## FeriasAfastamentoController

**Propósito**: Registrar períodos de férias ou outros afastamentos.

- Usa `FeriasAfastamentoService` e `FeriasAfastamentoMapper`.
- Rota `/api/human-resources/ferias-afastamentos`.

Exemplo de filtro por funcionário:

```bash
POST /api/human-resources/ferias-afastamentos/filter
Content-Type: application/json

{
  "funcionarioId": 2,
  "tipo": "FÉRIAS"
}
```

---

### Como o Spring injeta dependências

Todos os serviços e mapeadores são declarados como beans do Spring.
Ao marcar os campos das controllers com `@Autowired`, o contêiner do
Spring Boot injeta automaticamente as instâncias necessárias no momento
da criação da controller.

Isso permite que cada controller apenas delegue as operações ao serviço
correspondente, mantendo o código enxuto e reutilizável.

