# DTOs e FilterDTOs do módulo de Recursos Humanos

Este guia descreve os principais objetos de **Data Transfer Object (DTO)** e **FilterDTO**
utilizados no exemplo `praxis-backend-libs-sample-app` no pacote
`com.example.praxis.humanresources.dto`.

Os DTOs são responsáveis por representar os dados de exibição, criação e edição
expostos pelas APIs de Recursos Humanos. Já os FilterDTOs definem exclusivamente
os campos que podem ser utilizados como filtros de pesquisa e paginação. Ambos
são reconhecidos pelas bibliotecas do Praxis por meio da herança de
`GenericFilterDTO`.

## Por que separar DTO e FilterDTO?

- Evita enviar campos desnecessários nas requisições de filtro.
- Permite controlar quais operações de busca são válidas para cada campo
  (por exemplo, habilitar `LIKE` apenas em campos textuais).
- Facilita a criação de componentes de UI reutilizáveis a partir dos metadados
  de filtragem.

## Anotações Principais

| Anotação  | Uso nos DTOs  | Função principal |
|-----------|---------------|-----------------|
| `@UISchema` | Campos de DTOs e FilterDTOs | Marca o campo para que as bibliotecas do Praxis exponham metadados de UI (labels, tipos de controle, etc.). |
| `@Filterable` | Apenas em FilterDTOs | Indica que o campo pode ser utilizado em filtros. Permite configurar a operação (por exemplo `LIKE` ou `BETWEEN`) e relações aninhadas. |

### Operações de filtro suportadas

`Filterable.FilterOperation` define as operações padrão:
`EQUAL`, `LIKE`, `GREATER_THAN`, `LESS_THAN`, `IN` e `BETWEEN`.
No módulo de RH são utilizados principalmente `LIKE` e `BETWEEN`.

## Exemplos de DTO/FilterDTO

### CargoDTO e CargoFilterDTO

`CargoDTO` representa os dados de um cargo, incluindo nome, nível e faixas
salarial. Já `CargoFilterDTO` define os campos de filtro permitidos:

```java
@UISchema
@Filterable(operation = Filterable.FilterOperation.LIKE)
private String nome;

@UISchema
@Filterable(operation = Filterable.FilterOperation.BETWEEN)
private List<BigDecimal> salario;
```

Uma requisição de filtro típica para cargos:

```bash
POST /api/human-resources/cargos/filter
{
  "nome": "Engenheiro",
  "salario": [5000, 10000]
}
```

### FuncionarioDTO e FuncionarioFilterDTO

`FuncionarioDTO` contém as propriedades de um funcionário (CPF, cargo,
salário, endereço). Seu par `FuncionarioFilterDTO` permite filtrar por vários
atributos, inclusive campos do endereço através do atributo `relation` da
anotação `@Filterable`:

```java
@UISchema
@Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.cidade")
private String cidade;

@UISchema
@Filterable(operation = Filterable.FilterOperation.BETWEEN)
private List<LocalDate> dataAdmissao;
```

Exemplo de uso em uma requisição:

```bash
POST /api/human-resources/funcionarios/filter
{
  "cidade": "São Paulo",
  "dataAdmissao": ["2023-01-01", "2023-12-31"]
}
```

## Lista de DTOs disponíveis

- `CargoDTO` / `CargoFilterDTO`
- `DepartamentoDTO` / `DepartamentoFilterDTO`
- `EventoFolhaDTO` / `EventoFolhaFilterDTO`
- `FeriasAfastamentoDTO` / `FeriasAfastamentoFilterDTO`
- `FolhaPagamentoDTO` / `FolhaPagamentoFilterDTO`
- `FuncionarioDTO` / `FuncionarioFilterDTO`
- `DependenteDTO` e `EnderecoDTO` (sem FilterDTO específico)

Os arquivos podem ser encontrados em
`examples/praxis-backend-libs-sample-app/src/main/java/com/example/praxis/humanresources/dto`.

---

Com essa estrutura de DTOs e FilterDTOs, o módulo de Recursos Humanos consegue
expor APIs padronizadas e facilitar a geração dinâmica de formulários e telas de
busca pelo frontend.
