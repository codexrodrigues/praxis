# Praxis UI Workspace

> Uma suíte completa de componentes UI Angular para desenvolvimento de aplicações empresariais modernas

## 🌟 Visão Geral

O Praxis UI Workspace é um monorepo Angular que contém uma coleção de bibliotecas especializadas para criação de interfaces de usuário sofisticadas e funcionais. Focado em tabelas dinâmicas, formulários adaptativos e ferramentas de configuração visual.

## 📦 Bibliotecas Incluídas

### 🎯 Praxis Core (`@praxis/core`)

**Biblioteca central com interfaces e serviços fundamentais**

- ✅ **TableConfig Unificado**: Interface moderna e type-safe para configuração de tabelas
- ✅ **Modelos de Dados**: Definições robustas para paginação, filtros e configurações
- ✅ **Serviços Base**: TableConfigService e utilitários essenciais
- ✅ **Type Guards**: Validação e verificação de tipos em runtime
- ✅ **OverlayDeciderService**: Seleção automática de modal, drawer ou página

### 🗃️ Praxis Table (`@praxis/table`)

**Componente de tabela avançado com recursos empresariais**

- ✅ **Arquitetura Unificada**: Eliminação da dualidade V1/V2
- ✅ **PraxisTable**: Componente principal otimizado e simplificado
- ✅ **Editores Especializados**: Configuration editors para diferentes aspectos
- ✅ **Performance**: Virtualização e lazy loading integrados
- ✅ **Acessibilidade**: Suporte completo a screen readers e navegação por teclado
- ✅ **Filtros Dinâmicos**: Carregamento de campos via schema específico de `POST /filter`

### 🎨 Praxis Visual Builder (`@praxis/visual-builder`)

**Ferramentas visuais para criação de regras e especificações**

- ✅ **Rule Builder**: Interface visual para criação de regras de negócio
- ✅ **Template System**: Sistema de templates reutilizáveis
- ✅ **DSL Integration**: Mini-DSL para expressões complexas
- ✅ **Export Integration**: Integração com sistemas externos

### 📋 Praxis Specification (`@praxis/specification`)

**Sistema de especificações e validações**

- ✅ **Field Specifications**: Definições avançadas de campos
- ✅ **Validation Engine**: Motor de validação flexível
- ✅ **Boolean Composition**: Lógica booleana complexa
- ✅ **Metadata Management**: Gerenciamento de metadados

### 🔄 Praxis CRUD (`@praxis/crud`)

**Operações CRUD unificadas com integração tabela-formulário**

- ✅ **CRUD Completo**: Create, Read, Update, Delete automatizado
- ✅ **Integração Seamless**: Tabela + Formulário em um componente
- ✅ **Modal/Route**: Suporte a diferentes modos de abertura
- ✅ **Metadata-driven**: Configuração via JSON

### 📦 Praxis Dynamic Fields (`@praxis/dynamic-fields`)

**Componentes de input reutilizáveis com Material Design**

- ✅ **30+ Componentes**: Inputs, selects, datepickers, etc.
- ✅ **Lazy Loading**: Carregamento sob demanda
- ✅ **Type-safe**: Totalmente tipado
- ✅ **Extensível**: Fácil adicionar novos componentes

### 📋 Praxis Dynamic Form (`@praxis/dynamic-form`)

**Sistema de formulários dinâmicos com layout configurável**

- ✅ **Layout Visual**: Editor drag-and-drop
- ✅ **Regras Condicionais**: Visibilidade e validação dinâmica
- ✅ **Integração Backend**: Via GenericCrudService
- ✅ **Persistência**: Salvamento de layouts personalizados

### ⚙️ Praxis Settings Panel (`@praxis/settings-panel`)

**Painéis de configuração e preferências**

- ✅ **Drawer Panel**: Interface lateral deslizante
- ✅ **Configurações Dinâmicas**: Baseadas em metadados
- ✅ **Persistência**: Local e remota
- ✅ **Temas e Preferências**: Gestão centralizada

## 📚 Arquitetura das Bibliotecas

### 🎯 Guia de Decisão Rápido

```
Preciso de...
├─ 🔤 Um campo de input individual? → @praxis/dynamic-fields
├─ 📝 Um formulário completo? → @praxis/dynamic-form
├─ 📊 Uma tabela de dados? → @praxis/table
├─ 🔄 CRUD completo (tabela + form)? → @praxis/crud
├─ ✅ Validação e regras complexas? → @praxis/specification
├─ 🎨 Editor visual de regras? → @praxis/visual-builder
├─ ⚙️ Painel de configurações? → @praxis/settings-panel
└─ 🏗️ Interface/modelo/serviço base? → @praxis/core
```

### 📦 @praxis/core - Fundação do Ecossistema

**🎯 Objetivo Principal**  
Fornecer a infraestrutura base compartilhada por todas as outras bibliotecas: interfaces, modelos, serviços fundamentais e utilitários.

**✅ Quando Usar**

- Precisa de interfaces TypeScript (TableConfig, FormConfig, FieldDefinition)
- Implementar serviços de CRUD genéricos
- Acessar tokens de injeção (API_URL, OVERLAY_DECISION_MATRIX)
- Usar o OverlayDeciderService para escolher modal/drawer/page
- Normalizar schemas do backend

**📋 Responsabilidades**

- Definições de tipos e interfaces base
- GenericCrudService para operações REST
- SchemaNormalizerService para metadados
- OverlayDeciderService para decisões de UI
- Tokens de configuração global
- Modelos de paginação e resposta API

**❌ NÃO Pertence Aqui**

- Componentes visuais (vão para outras libs)
- Lógica de negócio específica
- Implementações concretas de UI

**🔗 Dependências**: Nenhuma (é a base)

**💡 Exemplo de Uso**

```typescript
import { TableConfig, GenericCrudService, API_URL } from '@praxis/core';

// Usar interface para configurar tabela
const config: TableConfig = { /* ... */ };

// Injetar serviço CRUD
constructor(private crud: GenericCrudService<Usuario>) {
  crud.configure('usuarios');
}
```

### 🔤 @praxis/dynamic-fields - Componentes de Input

**🎯 Objetivo Principal**  
Fornecer componentes de input individuais e reutilizáveis com Material Design, com sistema de registro dinâmico e lazy loading.

**✅ Quando Usar**

- Precisa de um campo de input específico (text, select, date, etc.)
- Quer lazy loading de componentes
- Necessita de componentes Material Design padronizados
- Implementar novos tipos de input customizados

**📋 Responsabilidades**

- Componentes individuais de input (30+ tipos)
- Sistema de registro dinâmico (ComponentRegistry)
- Lazy loading e cache de componentes
- Validadores e error matchers
- Componentes especializados (ColorPicker, TimePicker, FileUpload)

**❌ NÃO Pertence Aqui**

- Layout de formulários (vai para dynamic-form)
- Lógica de CRUD
- Configuração de tabelas
- Regras de negócio complexas

**🔗 Dependências**: @praxis/core

**💡 Exemplo de Uso**

```typescript
import { ComponentRegistryService, FieldControlType } from "@praxis/dynamic-fields";

// Registrar e usar componente dinamicamente
const component = await registry.getComponent(FieldControlType.DATE_PICKER);
```

### 📝 @praxis/dynamic-form - Formulários Dinâmicos

**🎯 Objetivo Principal**  
Construir formulários completos e dinâmicos com layout configurável, regras condicionais e integração com backend.

**✅ Quando Usar**

- Precisa de um formulário completo (não apenas campos)
- Quer layout configurável (fieldsets, rows, columns)
- Necessita de regras condicionais entre campos
- Precisa de editor visual de layout
- Integração com backend para save/load

**📋 Responsabilidades**

- PraxisDynamicForm component
- Sistema de layout (fieldsets, rows, fields)
- Editor visual de layout (drag-and-drop)
- Regras condicionais e visibilidade
- Integração com GenericCrudService
- Persistência de configurações

**❌ NÃO Pertence Aqui**

- Componentes de input individuais (vêm do dynamic-fields)
- Tabelas de dados
- Validações complexas de negócio (usar specification)

**🔗 Dependências**: @praxis/core, @praxis/dynamic-fields

**💡 Exemplo de Uso**

```typescript
<praxis-dynamic-form
  [formId]="'user-form'"
  [resourcePath]="'usuarios'"
  [resourceId]="userId"
  [mode]="'edit'"
  (formSubmit)="onSave($event)">
</praxis-dynamic-form>
```

### 📊 @praxis/table - Tabelas Avançadas

**🎯 Objetivo Principal**  
Fornecer componente de tabela empresarial com recursos avançados como paginação, ordenação, filtros e editores visuais.

**✅ Quando Usar**

- Exibir dados em formato tabular
- Necessita paginação, ordenação ou filtros
- Quer configuração visual da tabela
- Precisa de exportação (CSV, Excel, PDF)
- Seleção e ações em lote

**📋 Responsabilidades**

- PraxisTable component
- Paginação client/server-side
- Ordenação múltipla
- Filtros globais e por coluna
- Editores de configuração visual
- Virtualização para grandes volumes
- Exportação de dados

**❌ NÃO Pertence Aqui**

- Formulários de edição (usar dynamic-form)
- Lógica de CRUD (usar crud lib)
- Componentes de input

**🔗 Dependências**: @praxis/core, @praxis/dynamic-fields

**💡 Exemplo de Uso**

```typescript
<praxis-table
  [config]="tableConfig"
  [resourcePath]="'funcionarios'"
  (rowClick)="onRowClick($event)"
  (rowAction)="onAction($event)">
</praxis-table>
```

### ✅ @praxis/specification - Validações e Regras

**🎯 Objetivo Principal**  
Sistema de especificações para validações complexas, regras de negócio e composição booleana avançada.

**✅ Quando Usar**

- Validações além das básicas (required, min, max)
- Regras de negócio complexas
- Validações condicionais entre campos
- Composição booleana (AND, OR, XOR, IMPLIES)
- DSL para expressões de validação

**📋 Responsabilidades**

- Motor de especificações
- Validadores condicionais
- Composição booleana
- Parser e tokenizer DSL
- Context providers
- Metadata de especificações

**❌ NÃO Pertence Aqui**

- Componentes visuais
- Lógica de UI
- Operações CRUD
- Layout de formulários

**🔗 Dependências**: @praxis/core

**💡 Exemplo de Uso**

```typescript
import { FieldSpecification, AndSpecification } from "@praxis/specification";

const spec = new AndSpecification([new FieldSpecification("age", ">=", 18), new FieldSpecification("hasLicense", "==", true)]);

const isValid = spec.isSatisfiedBy(context);
```

### 🎨 @praxis/visual-builder - Editores Visuais

**🎯 Objetivo Principal**  
Ferramentas visuais para construção de regras, expressões DSL e templates com interface gráfica intuitiva.

**✅ Quando Usar**

- Editor visual de regras de negócio
- Construtor de expressões DSL
- Templates de regras reutilizáveis
- Conversão visual ↔ textual (round-trip)
- Validação em tempo real de expressões

**📋 Responsabilidades**

- Visual Rule Builder
- Expression Editor com autocomplete
- Context Variable Manager
- Template System
- DSL Parser/Validator
- Round-trip conversion
- Export/Import de regras

**❌ NÃO Pertence Aqui**

- Execução de regras (usar specification)
- Componentes de formulário
- Tabelas de dados
- Operações CRUD

**🔗 Dependências**: @praxis/core, @praxis/specification

**💡 Exemplo de Uso**

```typescript
<praxis-visual-rule-builder
  [fieldSchemas]="fields"
  [contextVariables]="variables"
  [(rule)]="currentRule"
  (export)="onExport($event)">
</praxis-visual-rule-builder>
```

### 🔄 @praxis/crud - Operações CRUD Unificadas

**🎯 Objetivo Principal**  
Unificar tabela e formulário em um componente CRUD completo com suporte a diferentes modos de abertura (modal/rota).

**✅ Quando Usar**

- CRUD completo sem configuração manual
- Integração automática tabela + formulário
- Alternar entre modal e navegação por rota
- Configuração via metadata JSON
- Ações padronizadas (criar, editar, excluir)

**📋 Responsabilidades**

- PraxisCrudComponent
- CrudLauncherService
- Gestão de modais e rotas
- Mapeamento de parâmetros
- Integração com PraxisTable e PraxisDynamicForm
- Dialog host para formulários

**❌ NÃO Pertence Aqui**

- Componentes de input básicos
- Validações de negócio
- Editores visuais
- Configurações globais

**🔗 Dependências**: @praxis/core, @praxis/dynamic-form, @praxis/table

**💡 Exemplo de Uso**

```typescript
<praxis-crud
  [metadata]="crudMetadata"
  (afterSave)="onSave($event)"
  (afterDelete)="onDelete($event)">
</praxis-crud>
```

### ⚙️ @praxis/settings-panel - Painéis de Configuração

**🎯 Objetivo Principal**  
Fornecer painéis deslizantes (drawers) para configurações, preferências e opções avançadas da aplicação.

**✅ Quando Usar**

- Painéis de configuração da aplicação
- Preferências do usuário
- Configurações avançadas
- Drawers laterais para opções
- Persistência de preferências

**📋 Responsabilidades**

- SettingsPanelComponent
- SettingsPanelService
- Gestão de estado do painel
- Persistência local/remota
- Animações de abertura/fechamento
- Integração com temas

**❌ NÃO Pertence Aqui**

- Formulários de dados (usar dynamic-form)
- Tabelas (usar table)
- Validações complexas
- Lógica de CRUD

**🔗 Dependências**: @praxis/core

**💡 Exemplo de Uso**

```typescript
constructor(private settingsPanel: SettingsPanelService) {}

openSettings() {
  this.settingsPanel.open({
    title: 'Configurações',
    component: MySettingsComponent,
    width: '400px'
  });
}
```

## 🔗 Matriz de Responsabilidades

| Biblioteca     | Input         | Form        | Table        | CRUD | Rules        | Visual | Config        |
| -------------- | ------------- | ----------- | ------------ | ---- | ------------ | ------ | ------------- |
| core           | ❌            | ❌          | ❌           | ❌   | ❌           | ❌     | ✅ Interfaces |
| dynamic-fields | ✅ Individual | ❌          | ❌           | ❌   | ❌           | ❌     | ❌            |
| dynamic-form   | ❌            | ✅ Completo | ❌           | ❌   | ✅ Simples   | ❌     | ✅ Layout     |
| table          | ❌            | ❌          | ✅           | ❌   | ❌           | ❌     | ✅ Columns    |
| specification  | ❌            | ❌          | ❌           | ❌   | ✅ Complexas | ❌     | ❌            |
| visual-builder | ❌            | ❌          | ❌           | ❌   | ✅ Editor    | ✅     | ❌            |
| crud           | ❌            | ✅ Via form | ✅ Via table | ✅   | ❌           | ❌     | ✅ Metadata   |
| settings-panel | ❌            | ❌          | ❌           | ❌   | ❌           | ❌     | ✅ App        |

## 🚀 Novidades da Arquitetura Unificada

### ⚡ Principais Melhorias

1. **Eliminação da Dualidade V1/V2**
   - Interface única `TableConfig`
   - Remoção de código legacy
   - Simplificação dramática da API

2. **Type Safety Aprimorada**
   - Interfaces mais robustas
   - IntelliSense melhorado
   - Detecção de erros em compile-time

3. **Performance Otimizada**
   - Remoção de overhead de adaptação
   - Bundle size reduzido
   - Runtime mais eficiente

4. **Developer Experience**
   - API mais intuitiva
   - Documentação consolidada
   - Debugging simplificado

## 🛠️ Instalação e Configuração

### Pré-requisitos

```bash
Node.js >= 18.0.0
Angular CLI >= 18.0.0
```

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd praxis-ui-workspace

# Instalar dependências
npm install

# Build de todas as bibliotecas
npm run build:libs

# Executar aplicação de desenvolvimento
npm start
```

## 📚 Guia de Navegação

### 🏗️ Build e Desenvolvimento

- [🏗️ Arquitetura de Build](#%EF%B8%8F-arquitetura-de-build) - Por que monorepo e como funciona
- [⚙️ Comandos de Build Detalhados](#%EF%B8%8F-comandos-de-build-detalhados) - Watch, produção e debug
- [📦 Processo de Publicação](#-processo-de-publicação) - Versionamento e NPM publish
- [🏗️ Build e Deploy Avançado](#%EF%B8%8F-build-e-deploy-avançado) - CI/CD, Docker e otimizações
- [🔧 Desenvolvimento](#-desenvolvimento) - Setup, debug e fluxo de trabalho

### 🎯 Uso e Integração

- [📚 Arquitetura das Bibliotecas](#-arquitetura-das-bibliotecas) - Objetivos e responsabilidades de cada lib
- [📝 Uso Básico](#-uso-básico) - Exemplos práticos
- [🔗 Integração com Backend](#-integração-com-backend-praxis-metadata-core) - Metadados e APIs
- [🧭 Matriz de Decisão de Overlays](#-matriz-de-decisão-de-overlays) - Seleção automática de UI patterns

### 📖 Documentação e Referências

- [📚 Documentação](#-documentação) - Guias detalhados e API reference
- [🧪 Testes](#-testes) - Como executar e configurar testes
- [🤝 Contribuição](#-contribuição) - Guidelines para contribuir

## 🧭 Matriz de Decisão de Overlays

O `OverlayDeciderService` do `@praxis/core` seleciona automaticamente o padrão de overlay (`modal`, `drawer`, `page`, `bottom-sheet` ou `full-screen-dialog`) com base no dispositivo, número de campos e dependências do formulário.

```ts
import { OverlayDeciderService } from "@praxis/core";

const decider = inject(OverlayDeciderService);
const decision = decider.decide({ device: "desktop", fieldCount: 18, dependencyCount: 5 });
// => { pattern: 'drawer', config: { side: 'end', width: 'min(45vw, 920px)', modal: true, footerFixed: true }, reason: 'Formulário médio...' }
```

É possível sobrescrever a matriz padrão usando `provideOverlayDecisionMatrix` na configuração da aplicação.

### Usar em seu projeto

```bash
npm install @praxis/core @praxis/table @praxis/visual-builder @praxis/specification
```

## 📝 Uso Básico

### Configuração Simples de Tabela

```typescript
import { TableConfig } from "@praxis/core";
import { PraxisTable } from "@praxis/table";

@Component({
  selector: "app-example",
  template: ` <praxis-table [config]="tableConfig" [data]="tableData"> </praxis-table> `,
})
export class ExampleComponent {
  tableConfig: TableConfig = {
    columns: [
      { field: "id", header: "ID", type: "number" },
      { field: "name", header: "Nome", type: "string" },
      { field: "email", header: "Email", type: "string" },
    ],
    behavior: {
      pagination: { enabled: true, pageSize: 10 },
      sorting: { enabled: true, multiSort: false },
      filtering: { enabled: true },
    },
  };

  tableData = [
    { id: 1, name: "João", email: "joao@example.com" },
    { id: 2, name: "Maria", email: "maria@example.com" },
  ];
}
```

### Editor Visual de Configuração

```typescript
import { PraxisTableConfigEditor } from '@praxis/table';

// Abrir editor de configuração
openConfigEditor() {
  const dialogRef = this.dialog.open(PraxisTableConfigEditor, {
    data: { config: this.tableConfig },
    width: '90vw',
    height: '90vh'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.tableConfig = result;
    }
  });
}
```

## 🔗 Integração com Backend (Praxis Metadata Core)

O ecossistema Praxis é projetado para uma integração transparente entre o frontend e o backend. As bibliotecas do `praxis-ui-workspace` são otimizadas para consumir metadados de UI fornecidos por um backend que utiliza o **`praxis-metadata-core`**.

### Fluxo de Metadados

1.  **Definição no Backend**: Desenvolvedores backend utilizam a anotação `@UISchema` nos seus DTOs Java para definir como cada campo deve ser apresentado e validado na UI (tipo de controle, rótulo, obrigatoriedade, etc.).

    ```java
    // Exemplo de DTO no backend (praxis-metadata-core)
    public class CargoDTO {
        @UISchema(label = "Código", readOnly = true)
        private Long id;

        @UISchema(label = "Nome do Cargo", required = true)
        private String nome;
    }
    ```

2.  **Exposição via API**: O backend expõe esses metadados através de um endpoint específico, geralmente `/api/{recurso}/schemas` ou, de forma mais centralizada, em `/schemas/filtered`.

3.  **Consumo no Frontend**: A biblioteca `@praxis/core`, através do `GenericCrudService`, busca esses metadados.

    ```typescript
    // Exemplo de uso no frontend
    import { GenericCrudService } from "@praxis/core";

    @Injectable({ providedIn: "root" })
    export class CargoService extends GenericCrudService<Cargo> {
      constructor(http: HttpClient, schemaNormalizer: SchemaNormalizerService, apiUrl: ApiUrlConfig) {
        super(http, schemaNormalizer, apiUrl);
        this.configure("human-resources/cargos"); // Configura o endpoint base
      }
    }
    ```

4.  **Renderização Dinâmica**: O `GenericCrudService` utiliza o método `getFilteredSchema` para obter a configuração da UI. Essa configuração é então passada para componentes como o `<praxis-table>`, que a utiliza para renderizar colunas, filtros e formulários de edição dinamicamente, sem a necessidade de definir a estrutura no código do frontend.

    ```typescript
    // Componente que usa o serviço para obter o schema
    this.cargoService.getFilteredSchema({ path: "/api/human-resources/cargos" }).subscribe((fieldDefinitions) => {
      // As fieldDefinitions são usadas para construir a configuração da tabela
      const tableConfig = this.buildTableConfig(fieldDefinitions);
      this.tableConfig = tableConfig;
    });
    ```

### Aplicação de Exemplo

O projeto `praxis-backend-libs-sample-app` no repositório serve como uma implementação de referência completa de um backend que utiliza o `praxis-metadata-core` e expõe as APIs necessárias para alimentar o `praxis-ui-workspace`. Ele é fundamental para testar a integração e entender o fluxo de ponta a ponta.

## 🏢 Consumo via Metadados em Ambientes Corporativos

O `praxis-ui-workspace` foi pensado para organizações que padronizam suas interfaces por meio de **metadados**. A seguir algumas recomendações para adoção em ambientes corporativos:

1. **Centralize a configuração de APIs**
   - Utilize `ApiUrlConfig` ou arquivos de `environment` para definir o `baseApiUrl`.
   - Empregue variáveis de ambiente para separar staging, homologação e produção.

2. **Versione e valide os schemas**
   - Exponha endpoints versionados como `/schemas/v1` para garantir compatibilidade entre times.
   - Automatize a validação dos schemas em pipelines de CI/CD antes de disponibilizá-los.

3. **Segurança e governança**
   - Restrinja o acesso aos endpoints de metadados conforme as políticas internas.
   - Habilite logging estruturado para auditoria e troubleshooting.

4. **Experiência do usuário consistente**
   - Componentes como `PraxisDynamicForm` e `PraxisTable` aplicam automaticamente padrões de UX a partir dos metadados, garantindo consistência visual e comportamental entre aplicações.

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Testes por biblioteca

```bash
# Core
ng test praxis-core

# Table
ng test praxis-table

# Visual Builder
ng test praxis-visual-builder

# Specification
ng test praxis-specification
```

### Coverage

```bash
npm run test:coverage
```

## 🏗️ Arquitetura de Build

### Por que um Monorepo?

O Praxis UI Workspace utiliza uma arquitetura de **monorepo** que oferece vantagens significativas:

- 🔗 **Versionamento Unificado**: Todas as bibliotecas evoluem de forma sincronizada
- 🚀 **Desenvolvimento Integrado**: Mudanças em uma lib são imediatamente refletidas em outras
- 🎯 **Reutilização de Código**: Componentes e utilitários compartilhados entre projetos
- 🛠️ **Tooling Consistente**: Mesmas configurações de build, lint e test para todas as libs

### Diferença entre Aplicação e Bibliotecas

```bash
# 📱 APLICAÇÃO PRINCIPAL (praxis-ui-workspace)
# - Consome as bibliotecas
# - Usado para desenvolvimento e testes
# - Build gera arquivos para browser (JS, CSS, HTML)
ng build                                    # Build da aplicação
ng serve                                    # Servidor de desenvolvimento

# 📦 BIBLIOTECAS (praxis-core, praxis-table, etc.)
# - Código reutilizável
# - Podem ser publicadas no NPM
# - Build gera arquivos para distribuição (.d.ts, .mjs, .umd.js)
ng build praxis-core                        # Build de biblioteca específica
ng build praxis-table                       # Build de biblioteca específica
```

### Dependências entre Bibliotecas

As bibliotecas possuem uma hierarquia de dependências bem definida:

```
📊 Hierarquia de Dependências:
┌─ praxis-core (base - sem dependências internas)
├─ praxis-dynamic-fields (depende: core)
├─ praxis-specification (depende: core)
├─ praxis-dynamic-form (depende: core, dynamic-fields)
├─ praxis-table (depende: core, dynamic-fields)
├─ praxis-visual-builder (depende: core, specification)
├─ praxis-crud (depende: core, dynamic-form)
└─ praxis-settings-panel (depende: core)
```

**⚠️ Ordem de Build Importante**: As bibliotecas base devem ser compiladas antes das que dependem delas.

## ⚙️ Comandos de Build Detalhados

### 🔄 Desenvolvimento (Watch Mode)

```bash
# 🎯 Recomendado: Build automático de todas as libs + serve da aplicação
npm run dev
# Executa: watch-all + ng serve em paralelo
# Resultado: Mudanças em qualquer lib são refletidas automaticamente na app

# 📚 Apenas build automático das libs (sem servidor)
npm run watch-all
# Rebuilda automaticamente: core, table, specification, dynamic-fields, dynamic-form
# Útil quando você quer apenas compilar libs sem rodar a aplicação

# 🔧 Build individual com watch
ng build praxis-core --watch               # Rebuild automático apenas do core
ng build praxis-table --watch --configuration development
```

### 🏭 Produção

```bash
# 🎯 Build completo otimizado
npm run build
# Compila aplicação principal em modo de produção

# 📦 Build de todas as bibliotecas para distribuição (desenvolvimento)
npm run build:libs

# 📦 Build de todas as bibliotecas para distribuição (produção)
npm run build:libs:prod

# 📦 Build manual individual (caso necessário)
ng build praxis-core && \
ng build praxis-dynamic-fields && \
ng build praxis-specification && \
ng build praxis-dynamic-form && \
ng build praxis-table && \
ng build praxis-visual-builder && \
ng build praxis-crud && \
ng build praxis-settings-panel

# 🎯 Build individual otimizado
ng build praxis-core --configuration production
```

### 🔍 Build com Verificações

```bash
# ✅ Build + testes
npm run build && npm test

# 🔎 Build + análise de bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/praxis-ui-workspace/stats.json

# 🛡️ Build com strict mode (mais verificações)
ng build --configuration production --aot --build-optimizer
```

### 🧹 Limpeza e Rebuild

```bash
# 🗑️ Limpar builds anteriores
rm -rf dist/
rm -rf node_modules/.angular/

# 🔄 Rebuild completo limpo
npm run build:clean
```

## 📦 Processo de Publicação

### 🎯 Versionamento Semântico

O projeto segue [Semantic Versioning](https://semver.org/):

```bash
# 🐛 Bug fix (1.0.0 → 1.0.1)
npm run release patch

# ✨ Nova funcionalidade (1.0.1 → 1.1.0)
npm run release minor

# 💥 Breaking change (1.1.0 → 2.0.0)
npm run release major

# 🎯 Versão específica
npm run release 2.1.3

# 📝 Ou usar diretamente o script
./scripts/release-all.sh patch
```

### 🚀 Publicação no NPM

```bash
# 1️⃣ Build de produção de todas as libs
npm run build:libs:prod

# 2️⃣ Publicação individual (em ordem de dependência)
cd dist/praxis-core && npm publish
cd ../praxis-dynamic-fields && npm publish
cd ../praxis-specification && npm publish
cd ../praxis-dynamic-form && npm publish
cd ../praxis-table && npm publish
cd ../praxis-visual-builder && npm publish
cd ../praxis-crud && npm publish
cd ../praxis-settings-panel && npm publish

# 🔙 Voltar para raiz
cd ../../
```

### 🔐 Configuração NPM (primeira vez)

```bash
# Login no NPM
npm login

# Verificar configuração
npm whoami
npm config list

# Configurar scope (se necessário)
npm config set @praxis:registry https://registry.npmjs.org/
```

### 🏷️ Tags e Releases

```bash
# Criar tag de versão
git tag v$(node -p "require('./projects/praxis-core/package.json').version")

# Push com tags
git push origin main --tags

# Criar release no GitHub (manual ou via GitHub CLI)
gh release create v2.1.0 --title "Release v2.1.0" --notes "Changelog..."
```

## 🏗️ Build e Deploy Avançado

### 📊 Análise de Performance

```bash
# Bundle analyzer para aplicação principal
ng build --stats-json
npx webpack-bundle-analyzer dist/praxis-ui-workspace/stats.json

# Análise de dependências
npm ls --depth=0
npm outdated

# Size tracking
npm install -g bundlesize
bundlesize
```

### 🐳 Docker Build

```dockerfile
# Dockerfile (exemplo)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/praxis-ui-workspace /usr/share/nginx/html
```

### ☁️ CI/CD Pipeline

```yaml
# .github/workflows/build.yml (exemplo)
name: Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run build
      - run: npm test

      # Build all libraries
      - run: |
          ng build praxis-core
          ng build praxis-dynamic-fields  
          ng build praxis-table
          # ... outras libs
```

### 🔧 Troubleshooting de Build

#### ❌ Problemas Comuns

**1. Erro de Dependência Circular:**

```bash
# ❌ ERROR: Circular dependency detected
# ✅ Solução: Revisar imports e extrair interfaces comuns
```

**2. Memory Issues:**

```bash
# ❌ JavaScript heap out of memory
# ✅ Solução: Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

**3. TypeScript Errors:**

```bash
# ❌ TS errors in libs
# ✅ Verificar tsconfig.json e dependências
ng build praxis-core --verbose
```

**4. ng-packagr Issues:**

```bash
# ❌ ng-packagr build failed
# ✅ Limpar cache e rebuildar
rm -rf node_modules/.ng_pkg_build/
ng build praxis-core
```

#### 🔍 Debug de Build

```bash
# Build verbose para mais detalhes
ng build --verbose

# Check de configuração
ng config

# Análise de dependências
npm ls @angular/core
npm ls typescript

# Verificar compatibilidade
ng update --dry-run
```

### 📈 Otimizações de Performance

```bash
# Build com otimizações máximas
ng build --optimization --aot --build-optimizer --extract-licenses

# Parallel builds (experimental)
npm install -g @angular/build-angular
ng build --parallel

# Cache de build (para CIs)
ng build --cache-path=.angular-cache
```

## 🔧 Desenvolvimento

### 🚀 Setup de Desenvolvimento

#### Primeiro Setup

```bash
# 1️⃣ Clone e instalação
git clone <repository-url>
cd praxis-ui-workspace
npm install

# 2️⃣ Build inicial das libs (necessário na primeira vez)
npm run build:libs

# 3️⃣ Iniciar desenvolvimento
npm run dev
# Resultado: Servidor em http://localhost:4003 + watch automático das libs
```

#### 🔄 Desenvolvimento Diário

```bash
# Comando único para desenvolvimento
npm run dev

# Ou comandos separados
npm run watch-all    # Terminal 1: Watch das libs
npm start           # Terminal 2: Servidor da aplicação
```

### 🧩 Adicionando Nova Funcionalidade

#### 1️⃣ Escolher Biblioteca Apropriada

```bash
# 🎯 Core: Interfaces, modelos, serviços base
# 📦 Dynamic Fields: Componentes de input reutilizáveis
# 📋 Dynamic Form: Formulários dinâmicos e layout
# 🗃️ Table: Componentes de tabela avançados
# 🎨 Visual Builder: Ferramentas visuais e rule builders
# 📋 Specification: Sistema de validação e especificações
# 🔄 CRUD: Operações CRUD unificadas
# ⚙️ Settings Panel: Painéis de configuração
```

#### 2️⃣ Fluxo de Desenvolvimento

```bash
# 1. Criar o componente/serviço
ng generate component nova-funcionalidade --project=praxis-table

# 2. Implementar funcionalidade
# - Editar o código do componente
# - Adicionar ao public-api.ts da biblioteca

# 3. Testar localmente
ng test praxis-table

# 4. Build para verificar se não quebrou nada
ng build praxis-table

# 5. Testar na aplicação principal
npm run dev
```

#### 3️⃣ Estrutura de Arquivos

```
projects/praxis-[lib]/src/lib/
├── components/          # Componentes UI
├── services/           # Serviços e lógica de negócio
├── models/             # Interfaces e tipos
├── utils/              # Utilitários
├── directives/         # Diretivas customizadas
└── public-api.ts       # ⚠️ SEMPRE atualizar com exports
```

### 🐛 Debug e Troubleshooting

#### 🔍 Debug de Desenvolvimento

```bash
# Logs detalhados de build
ng build praxis-core --verbose

# Debug no browser
# 1. Abrir DevTools
# 2. Sources → webpack:// → libs/praxis-[lib]
# 3. Breakpoints funcionam normalmente

# Verificar linking das libs
npm ls @praxis/core
npm ls @praxis/table

# Hot reload não funciona?
# Verificar se watch-all está rodando
ps aux | grep "ng build"
```

#### 🚨 Problemas Comuns

**1. Lib não atualiza na aplicação:**

```bash
# ✅ Verificar se watch está ativo
npm run watch-all

# ✅ Forçar rebuild
ng build praxis-core --watch
```

**2. Erros de TypeScript:**

```bash
# ✅ Verificar public-api.ts atualizado
cat projects/praxis-core/src/public-api.ts

# ✅ Verificar tsconfig.json
npx tsc --noEmit --project projects/praxis-core/tsconfig.lib.json
```

**3. Hot reload quebrado:**

```bash
# ✅ Restart completo
pkill -f "ng serve"
pkill -f "ng build"
npm run dev
```

**4. Dependências quebradas:**

```bash
# ✅ Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# ✅ Verificar compatibilidade Angular
ng update --dry-run
```

### 🧪 Desenvolvimento com Testes

```bash
# Teste durante desenvolvimento
ng test praxis-core --watch

# Teste de toda a suite (aplicação principal)
npm test

# Teste de todas as bibliotecas
npm run test:libs

# Coverage específico
ng test praxis-table --code-coverage

# E2E (se configurado)
ng e2e
```

### 🔗 Linking Local para Projetos Externos

```bash
# 1️⃣ Build da lib
ng build praxis-core

# 2️⃣ Link global
cd dist/praxis-core
npm link

# 3️⃣ No projeto externo
cd /path/to/external-project
npm link @praxis/core

# 4️⃣ Para desfazer
npm unlink @praxis/core  # no projeto externo
npm unlink               # no dist/praxis-core
```

### 📊 Performance de Desenvolvimento

```bash
# Build mais rápido (skip otimizações)
ng build praxis-core --configuration development

# Parallel watch (experimental)
npm run watch-all --parallel

# Cache agressivo (cuidado com mudanças)
ng build --cache-path=.angular-cache

# Memory profiling
node --inspect-brk node_modules/@angular/cli/bin/ng build praxis-core
```

### Estrutura do Projeto

```
praxis-ui-workspace/
├── projects/
│   ├── praxis-core/           # Interface e serviços base
│   ├── praxis-table/          # Componentes de tabela
│   ├── praxis-visual-builder/ # Ferramentas visuais
│   └── praxis-specification/  # Sistema de especificações
├── src/                       # Aplicação demo/teste
├── docs/                      # Documentação detalhada
└── ARCHITECTURE-UNIFICATION.md # Detalhes da arquitetura
```

### Persistência de Layout de Formulários

O layout dos formulários dinâmicos é armazenado localmente utilizando o
`localStorage`. Cada formulário é salvo com a chave
`praxis-layout-<formId>`, permitindo que o usuário mantenha personalizações
entre sessões. O serviço responsável por essa funcionalidade foi estruturado
para que, futuramente, seja possível substituir o mecanismo de persistência por
uma chamada REST sem alterar as chamadas no restante da aplicação.

### Contexto e Regras de Formulário

O `FormContextService` gerencia a lista de campos disponíveis, referências de componentes e
as regras de layout de cada formulário. Ele suporta múltiplos contextos, permitindo
compartilhar regras entre formulários sem conflitos. Para verificar condições de
visibilidade ou estilo, utilize as funções utilitárias em `form-rule.utils`.

### Editor de Layout com Drag & Drop

O `FormLayoutEditor` permite reorganizar visualmente fieldsets, linhas e campos
utilizando o módulo `DragDrop` do Angular CDK. As mudanças são emitidas por
eventos e podem ser persistidas via `FormLayoutService`. Essa abordagem facilita
o ajuste fino dos formulários sem modificar o código-fonte.

### Integração CRUD

O `PraxisDynamicForm` utiliza o `GenericCrudService` para buscar o schema e
persistir dados. É possível definir endpoints customizados para cada operação
por meio do input `customEndpoints`, permitindo integrar o formulário a APIs
diversas. Durante a submissão, eventos `FormSubmitEvent` são emitidos indicando
o resultado das operações de criação ou atualização, cabendo à aplicação exibir
as mensagens de sucesso ou erro ao usuário.

### Exemplo de Visualização de Registro

No módulo de **Funcionários** existe uma rota de exemplo que abre um formulário
em modo de visualização quando o usuário clica em uma linha da tabela. O
componente `FuncionariosListComponent` emite o evento `rowClick` para navegar até
`/funcionarios/view/:id`:

```html
<praxis-table resourcePath="funcionarios" [editModeEnabled]="true" (rowClick)="onRowClick($event)"></praxis-table>
```

```typescript
// funcionarios-list.component.ts
constructor(private router: Router) {}
onRowClick(event: { row: any }): void {
  this.router.navigate(['/funcionarios/view', event.row.id]);
}
```

A rota declara o componente `FuncionarioViewComponent`, que carrega o
`PraxisDynamicForm` em modo `view` para apresentar os dados do registro
selecionado:

```typescript
export const routes: Routes = [
  { path: "funcionarios", component: FuncionariosListComponent },
  { path: "funcionarios/view/:id", component: FuncionarioViewComponent },
  // ...demais rotas
];
```

```typescript
@Component({
  selector: "app-funcionario-view",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, PraxisDynamicForm],
  template: ` <praxis-dynamic-form resourcePath="funcionarios" [resourceId]="id" mode="view"> </praxis-dynamic-form> `,
  styleUrl: "./funcionario-view.component.scss",
})
export class FuncionarioViewComponent {
  id: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((p) => (this.id = p.get("id")));
  }
}
```

Esse fluxo demonstra como utilizar o `PraxisDynamicForm` para visualizar uma
entidade e pode servir de base para cenários de edição ou criação.

## 📚 Documentação

### Guias Detalhados

- [**Architecture Unification**](./ARCHITECTURE-UNIFICATION.md) - Detalhes da unificação V1/V2
- [**Integration Plan**](./INTEGRATION-PLAN.md) - Plano de integração
- [**Integration Example**](./INTEGRATION-EXAMPLE.md) - Exemplos práticos

### API Reference

- [Praxis Core API](./projects/praxis-core/README.md)
- [Praxis Table API](./projects/praxis-table/README.md)
- [Visual Builder API](./projects/praxis-visual-builder/README.md)
- [Specification API](./projects/praxis-specification/README.md)

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Guidelines

- Seguir convenções de código Angular
- Adicionar testes para novas funcionalidades
- Manter documentação atualizada
- Usar commits semânticos

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas

- Arquitetura unificada TableConfig
- Componente PraxisTable otimizado
- Editores de configuração especializados
- Sistema de validação robusto
- Suite completa de testes
- Documentação abrangente

### 🔄 Em Desenvolvimento

- Enhanced accessibility features
- Performance optimizations
- Advanced export options
- Mobile responsiveness improvements

### 📋 Roadmap

- Plugin architecture
- Theme customization
- Advanced filtering
- Real-time collaboration features

## 🛡️ Compatibilidade

### Versões Suportadas

- **Angular**: 18.x+
- **TypeScript**: 5.0+
- **Node.js**: 18.x+

### Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🙋‍♂️ Suporte

### Como Obter Ajuda

- 📖 Consulte a [documentação](./docs/)
- 🐛 Reporte bugs via [Issues](../../issues)
- 💬 Discussões via [Discussions](../../discussions)
- 📧 Contato direto: [suporte@praxis.com](mailto:suporte@praxis.com)

---

**Desenvolvido com ❤️ pela equipe Praxis**  
**Versão**: 2.0.0 (Unified Architecture)  
**Última atualização**: Janeiro 2025
