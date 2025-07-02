# Praxis UI Metadata Framework - Documentação Técnica Completa

## 📚 Índice

1. [Introdução](#1-introdução)
2. [Processo de Enriquecimento de DTOs](#2-processo-de-enriquecimento-de-dtos)
3. [CustomOpenApiResolver - Arquitetura e Funcionamento](#3-customopenapiresolver---arquitetura-e-funcionamento)
4. [ApiDocsController - Servindo Schemas Enriquecidos](#4-apidocscontroller---servindo-schemas-enriquecidos)
5. [AbstractCrudController - Padronização de APIs](#5-abstractcrudcontroller---padronização-de-apis)
6. [Guia de Evolução e Manutenção](#6-guia-de-evolução-e-manutenção)
7. [Exemplos Práticos](#7-exemplos-práticos)

---

## 1. Introdução

O Praxis UI Metadata Framework é uma solução completa para geração automática de interfaces de usuário baseadas em metadados. O framework enriquece automaticamente schemas OpenAPI com informações de UI (`x-ui`), permitindo que frontends construam interfaces dinamicamente sem código hardcoded.

### Principais Benefícios

- ✅ **Redução de Código**: Menos código duplicado entre backend e frontend
- ✅ **Consistência**: UI sempre sincronizada com as regras de negócio do backend
- ✅ **Produtividade**: Novas telas são criadas automaticamente ao adicionar novos DTOs
- ✅ **Manutenibilidade**: Mudanças no backend refletem automaticamente na UI
- ✅ **Type Safety**: Validações e tipos são compartilhados entre camadas

---

## 2. Processo de Enriquecimento de DTOs

### 2.1 Visão Geral do Fluxo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Java DTO      │────▶│ CustomOpenApi    │────▶│ OpenAPI Schema  │
│ com Anotações   │     │    Resolver      │     │  com x-ui       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                         │
         │                        │                         ▼
    @UISchema                Processa em              Consumido por
    @Schema                  5 etapas com             ApiDocsController
    @NotNull                 precedência                    │
    @Size                    clara                          ▼
    etc.                                              Frontend Dinâmico
```

### 2.2 Ordem de Precedência (FUNDAMENTAL!)

O processo de enriquecimento segue uma ordem clara de precedência, do menor para o maior:

#### 🥉 **Etapa 1: Valores Padrão da Anotação** (Menor Precedência)
```java
// Valores padrão definidos na anotação @UISchema
@UISchema // controlType = INPUT, type = TEXT, pattern = CUSTOM
private String campo;
```

#### 🥈 **Etapa 2: Detecção Automática Baseada no Schema** 
```java
@UISchema
@Schema(type = "string", format = "date") // Detecta automaticamente!
private LocalDate dataAdmissao;
// Resultado: controlType = "date-picker", type = "date"
```

#### 🥇 **Etapa 3: Valores Explícitos do Desenvolvedor**
```java
@UISchema(controlType = FieldControlType.TEXTAREA) // Explícito vence!
@Schema(type = "string", format = "date") 
private String observacoes;
// Resultado: controlType = "textarea" (desenvolvedor tem precedência)
```

#### 🏆 **Etapa 4: Anotações Jakarta Validation**
```java
@UISchema
@NotNull // Adiciona required = true
@Size(min = 3, max = 100) // Adiciona minLength e maxLength
private String nome;
```

#### 👑 **Etapa 5: Extra Properties** (Máxima Precedência)
```java
@UISchema(extraProperties = {
    @ExtensionProperty(name = "controlType", value = "custom-widget")
})
private String campo;
// extraProperties sobrescreve TUDO!
```

### 2.3 Tabela de Detecção Automática

| OpenAPI Type | OpenAPI Format | Detecção Automática | Control Type | Data Type |
|--------------|----------------|---------------------|--------------|-----------|
| string | date | ✅ | date-picker | date |
| string | date-time | ✅ | date-time-picker | date |
| string | time | ✅ | time-picker | date |
| string | email | ✅ | email-input | email |
| string | password | ✅ | password | password |
| string | uri/url | ✅ | url-input | url |
| string | binary/byte | ✅ | file-upload | file |
| string | phone | ✅ | phone | text |
| string | color | ✅ | color-picker | text |
| string | (maxLength > 100) | ✅ | textarea | text |
| number | currency | ✅ | currency-input | number |
| number | percent | ✅ | numeric-text-box | number |
| boolean | - | ✅ | checkbox | boolean |
| array | (items com enum) | ✅ | multi-select | - |

---

## 3. CustomOpenApiResolver - Arquitetura e Funcionamento

### 3.1 Estrutura da Classe

```java
public class CustomOpenApiResolver extends ModelResolver {
    
    @Override
    protected void applyBeanValidatorAnnotations(...) {
        // Ponto de entrada principal
        if (temUISchema) {
            resolveSchemaWithPrecedence(property, annotations);
            OpenApiUiUtils.populateDefaultValidationMessages(...);
        }
    }
    
    private void resolveSchemaWithPrecedence(...) {
        // NOVA ARQUITETURA COM PRECEDÊNCIA CLARA
        applyUISchemaDefaults(annotation, uiExtension);      // Etapa 1
        applySchemaBasedDetection(property, uiExtension);    // Etapa 2
        applyUISchemaExplicitValues(annotation, uiExtension); // Etapa 3
        processJakartaValidationAnnotations(...);            // Etapa 4
        applyExtraProperties(annotation, uiExtension);       // Etapa 5
    }
}
```

### 3.2 Métodos Principais

#### `applyUISchemaDefaults`
- Aplica apenas valores padrão genéricos
- Valores que podem ser sobrescritos por detecção automática
- Exemplo: `controlType = INPUT`, `type = TEXT`

#### `applySchemaBasedDetection` ⭐ (Mais Importante!)
- Detecta tipo/formato do OpenAPI Schema
- Aplica lógica inteligente de mapeamento
- Sobrescreve valores padrão com detecções específicas
- Inclui detecção por nome do campo como fallback

#### `applyUISchemaExplicitValues`
- Processa apenas valores explicitamente definidos
- Diferencia entre valor padrão e valor definido pelo dev
- Tem precedência sobre detecção automática

#### `processJakartaValidationAnnotations`
- Processa @NotNull, @Size, @Min, @Max, etc.
- Adiciona validações e mensagens
- Complementa (não substitui) valores anteriores

#### `applyExtraProperties`
- Máxima precedência
- Permite customização total via array de propriedades
- Útil para casos especiais não cobertos

### 3.3 Fluxo de Execução Detalhado

```
1. Spring/OpenAPI chama applyBeanValidatorAnnotations()
   │
   ├─▶ 2. Verifica se tem @UISchema
   │    │
   │    └─▶ 3. Chama resolveSchemaWithPrecedence()
   │         │
   │         ├─▶ 4. applyUISchemaDefaults()
   │         │    └─▶ Define: controlType=INPUT, type=TEXT
   │         │
   │         ├─▶ 5. applySchemaBasedDetection()
   │         │    ├─▶ Detecta: type="string", format="date"
   │         │    └─▶ Sobrescreve: controlType=DATE_PICKER, type=DATE
   │         │
   │         ├─▶ 6. applyUISchemaExplicitValues()
   │         │    └─▶ Se dev definiu algo, sobrescreve detecção
   │         │
   │         ├─▶ 7. processJakartaValidationAnnotations()
   │         │    └─▶ Adiciona: required, minLength, pattern, etc.
   │         │
   │         └─▶ 8. applyExtraProperties()
   │              └─▶ Sobrescreve tudo se houver
   │
   └─▶ 9. populateDefaultValidationMessages()
        └─▶ Gera mensagens de erro em português
```

---

## 4. ApiDocsController - Servindo Schemas Enriquecidos

### 4.1 Endpoint Principal

```
GET /schemas/filtered
```

#### Parâmetros
- `path` (obrigatório): Caminho da API (ex: `/api/usuarios`)
- `document` (opcional): Grupo OpenAPI (ex: `usuarios`)
- `operation` (opcional): Verbo HTTP (default: `get`)
- `includeInternalSchemas` (opcional): Resolver $refs (default: `false`)
- `schemaType` (opcional): `response` ou `request` (default: `response`)

### 4.2 Processo de Resolução

```
1. Cliente solicita schema
   GET /schemas/filtered?path=/api/usuarios&operation=post
   │
2. ApiDocsController determina documento
   ├─▶ Usa OpenApiGroupResolver
   └─▶ Ou extrai do path
   │
3. Busca documento OpenAPI completo
   GET /v3/api-docs/usuarios
   │
4. Localiza operação no path
   paths → /api/usuarios → post
   │
5. Identifica schema principal
   ├─▶ Prioridade 1: x-ui.responseSchema
   ├─▶ Prioridade 2: responses.200.content
   └─▶ Prioridade 3: Inferência do path
   │
6. Resolve referências se solicitado
   $ref: "#/components/schemas/UsuarioDTO"
   │
7. Retorna schema com x-ui
   {
     "properties": { ... },
     "x-ui": { ... }
   }
```

---

## 5. AbstractCrudController - Padronização de APIs

### 5.1 Endpoints Automaticamente Disponíveis

| Método | Path | Descrição | Resposta |
|--------|------|-----------|----------|
| GET | /all | Lista todos | `RestApiResponse<List<EntityModel<D>>>` |
| GET | /{id} | Busca por ID | `RestApiResponse<D>` |
| POST | / | Cria novo | `RestApiResponse<D>` (201) |
| PUT | /{id} | Atualiza | `RestApiResponse<D>` |
| DELETE | /{id} | Remove | `Void` (204) |
| POST | /filter | Filtra com paginação | `RestApiResponse<Page<EntityModel<D>>>` |

### 5.2 Links HATEOAS Incluídos

Cada resposta inclui links relevantes:
- `self`: Link para o próprio recurso
- `all`: Link para listagem
- `schema`: Link para o schema UI (via ApiDocsController)
- `create`, `update`, `delete`: Links para operações

---

## 6. Guia de Evolução e Manutenção

### 6.1 Adicionando Novo Formato de Detecção

Para adicionar suporte a um novo formato (ex: CPF):

1. **No `applySchemaBasedDetection`**:
```java
case "cpf":
    detectedControlType = FieldControlType.CPF_INPUT.getValue();
    detectedDataType = FieldDataType.TEXT.getValue();
    // Adicionar máscara, validação, etc.
    break;
```

2. **Criar novo FieldControlType** (se necessário):
```java
public enum FieldControlType {
    // ...
    CPF_INPUT("cpf-input"),
    // ...
}
```

3. **Testar com DTO**:
```java
@UISchema
@Schema(type = "string", format = "cpf")
private String cpf;
```

### 6.2 Debugging do Processo

Para debug, adicione logs em pontos estratégicos:

```java
private void applySchemaBasedDetection(...) {
    LOGGER.debug("Detectando tipo para campo: {}", fieldName);
    LOGGER.debug("OpenAPI type: {}, format: {}", openApiType, openApiFormat);
    
    // ... lógica de detecção ...
    
    LOGGER.debug("Resultado - controlType: {}, dataType: {}", 
                 detectedControlType, detectedDataType);
}
```

### 6.3 Testes Recomendados

```java
@Test
void testDateFieldDetection() {
    // Arrange
    Schema<String> dateSchema = new Schema<>();
    dateSchema.setType("string");
    dateSchema.setFormat("date");
    
    // Act
    resolver.applyBeanValidatorAnnotations(dateSchema, ...);
    
    // Assert
    Map<String, Object> xUi = getXUiExtension(dateSchema);
    assertEquals("date-picker", xUi.get("controlType"));
    assertEquals("date", xUi.get("type"));
}
```

---

## 7. Exemplos Práticos

### 7.1 DTO Completo com Todos os Recursos

```java
@Schema(description = "Dados do funcionário")
public class FuncionarioDTO {
    
    // Campo com detecção automática de data
    @UISchema
    @Schema(type = "string", format = "date", description = "Data de nascimento")
    private LocalDate dataNascimento;
    
    // Campo com override explícito
    @UISchema(
        controlType = FieldControlType.CURRENCY_INPUT,
        numericFormat = NumericFormat.CURRENCY
    )
    @Schema(type = "number", description = "Salário do funcionário")
    private BigDecimal salario;
    
    // Campo com validações Jakarta
    @UISchema(
        icon = "envelope",
        iconPosition = IconPosition.LEFT
    )
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    private String email;
    
    // Campo com extraProperties para customização total
    @UISchema(
        label = "Observações Especiais",
        extraProperties = {
            @ExtensionProperty(name = "rows", value = "5"),
            @ExtensionProperty(name = "maxRows", value = "10"),
            @ExtensionProperty(name = "autoResize", value = "true")
        }
    )
    @Size(max = 1000)
    private String observacoes;
}
```

### 7.2 Resultado no OpenAPI (x-ui)

```json
{
  "dataNascimento": {
    "type": "string",
    "format": "date",
    "description": "Data de nascimento",
    "x-ui": {
      "controlType": "date-picker",
      "type": "date",
      "helpText": "Data de nascimento",
      "label": "Data Nascimento"
    }
  },
  "salario": {
    "type": "number",
    "description": "Salário do funcionário",
    "x-ui": {
      "controlType": "currency-input",
      "type": "number",
      "numericFormat": "currency",
      "helpText": "Salário do funcionário",
      "label": "Salario"
    }
  },
  "email": {
    "type": "string",
    "x-ui": {
      "controlType": "email-input",
      "type": "email",
      "icon": "envelope",
      "iconPosition": "left",
      "required": true,
      "requiredMessage": "Email é obrigatório",
      "pattern": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$",
      "patternMessage": "Email inválido"
    }
  },
  "observacoes": {
    "type": "string",
    "x-ui": {
      "controlType": "textarea",
      "type": "text",
      "label": "Observações Especiais",
      "maxLength": 1000,
      "rows": "5",
      "maxRows": "10",
      "autoResize": "true"
    }
  }
}
```

---

## 🚀 Preparando para Open Source

### Checklist de Qualidade

- [x] Código bem documentado com JavaDoc
- [x] Ordem de precedência clara e previsível
- [x] Testes unitários para casos principais
- [x] Exemplos práticos funcionais
- [x] Documentação técnica completa
- [ ] Guia de contribuição (CONTRIBUTING.md)
- [ ] Versionamento semântico
- [ ] CI/CD configurado

### Próximos Passos

1. **Criar mais testes de integração** para cobrir edge cases
2. **Adicionar benchmarks** de performance
3. **Documentar API pública** com exemplos
4. **Criar guia de migração** para versões futuras
5. **Estabelecer roadmap** de features

---

## 📝 Notas Finais

O Praxis UI Metadata Framework representa uma evolução significativa na forma como construímos aplicações web modernas. Ao centralizar metadados de UI no backend e usar detecção inteligente, reduzimos drasticamente a complexidade e aumentamos a produtividade.

A arquitetura foi desenhada para ser:
- **Extensível**: Fácil adicionar novos tipos e formatos
- **Previsível**: Ordem de precedência clara
- **Performática**: Processamento ocorre em build-time
- **Compatível**: Não quebra código existente

Com esta documentação, qualquer desenvolvedor pode entender, manter e evoluir o framework de forma eficiente.

**Praxis: Transformando metadados em interfaces poderosas! 🎯**