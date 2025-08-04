# @praxis/core

> Biblioteca central com interfaces e serviços fundamentais para o Praxis UI Workspace

## 🌟 Visão Geral

A biblioteca `@praxis/core` é o núcleo do Praxis UI Workspace, fornecendo interfaces robustas, serviços base e utilitários essenciais para todas as outras bibliotecas do ecossistema. Com a arquitetura unificada, oferece uma experiência de desenvolvimento consistente e type-safe.

## ✨ Características Principais

### 🏗️ Arquitetura Unificada

- **TableConfig único**: Interface consolidada eliminando dualidade V1/V2
- **Type Safety**: Tipagem forte e consistente
- **Modular**: Interfaces bem definidas e organizadas
- **Extensível**: Arquitetura preparada para crescimento

### 🔧 Funcionalidades Core

- **Interfaces de Configuração**: Modelos robustos para tabelas e componentes
- **Serviços Base**: TableConfigService e utilitários essenciais
- **Type Guards**: Validação em runtime
- **Helper Functions**: Utilitários para manipulação de configurações

## 🚀 Instalação

```bash
npm install @praxis/core
```

## 📝 Interfaces Principais

### MaterialTimepickerMetadata

```typescript
const workShift: MaterialTimepickerMetadata = {
  name: "workStart",
  label: "Início do expediente",
  controlType: "timePicker",
  min: "08:00",
  max: "18:00",
  stepMinute: 30,
  format: "24h",
};
```

### TableConfig - Interface Unificada

```typescript
interface TableConfig {
  /** Metadados da configuração */
  meta?: ConfigMetadata;

  /** Definições de colunas */
  columns: ColumnDefinition[];

  /** Configurações de comportamento */
  behavior?: TableBehaviorConfig;

  /** Configurações de aparência */
  appearance?: TableAppearanceConfig;

  /** Configurações de toolbar */
  toolbar?: ToolbarConfig;

  /** Configurações de ações */
  actions?: TableActionsConfig;

  /** Configurações de exportação */
  export?: ExportConfig;

  /** Mensagens e textos */
  messages?: MessagesConfig;

  /** Localização e i18n */
  localization?: LocalizationConfig;

  /** Configurações de performance */
  performance?: PerformanceConfig;

  /** Configurações de acessibilidade */
  accessibility?: AccessibilityConfig;
}
```

### ColumnDefinition

```typescript
interface ColumnDefinition {
  /** Campo da fonte de dados */
  field: string;

  /** Cabeçalho da coluna */
  header: string;

  /** Tipo de dados para formatação */
  type?: "string" | "number" | "date" | "boolean" | "currency" | "percentage" | "custom";

  /** Largura da coluna */
  width?: string;

  /** Visibilidade da coluna */
  visible?: boolean;

  /** Permitir ordenação */
  sortable?: boolean;

  /** Permitir filtragem */
  filterable?: boolean;

  /** Permitir redimensionamento */
  resizable?: boolean;

  /** Coluna fixa (sticky) */
  sticky?: boolean;

  /** Alinhamento do conteúdo */
  align?: "left" | "center" | "right";

  /** Ordem de exibição */
  order?: number;

  /** Estilo CSS personalizado */
  style?: string;

  /** Formato de exibição dos dados */
  format?: any;

  /** Mapeamento de valores para exibição */
  valueMapping?: { [key: string | number]: string };
}
```

### ConfigMetadata

```typescript
interface ConfigMetadata {
  /** Versão da configuração */
  version?: string;

  /** Identificador único */
  id?: string;

  /** Nome amigável */
  name?: string;

  /** Descrição */
  description?: string;

  /** Tags para categorização */
  tags?: string[];

  /** Data de criação */
  createdAt?: string;

  /** Data de última modificação */
  updatedAt?: string;

  /** Autor da configuração */
  author?: string;
}
```

## 🎛️ Configurações de Comportamento

### TableBehaviorConfig

```typescript
interface TableBehaviorConfig {
  /** Configurações de paginação */
  pagination?: PaginationConfig;

  /** Configurações de ordenação */
  sorting?: SortingConfig;

  /** Configurações de filtragem */
  filtering?: FilteringConfig;

  /** Configurações de seleção */
  selection?: SelectionConfig;

  /** Configurações de interação */
  interaction?: InteractionConfig;

  /** Configurações de redimensionamento */
  resizing?: ResizingConfig;

  /** Configurações de arrastar e soltar */
  dragging?: DraggingConfig;
}
```

### PaginationConfig

```typescript
interface PaginationConfig {
  /** Habilitar paginação */
  enabled: boolean;

  /** Tamanho da página */
  pageSize: number;

  /** Opções de tamanho de página */
  pageSizeOptions: number[];

  /** Mostrar botões primeira/última */
  showFirstLastButtons: boolean;

  /** Mostrar números das páginas */
  showPageNumbers: boolean;

  /** Mostrar informações da página */
  showPageInfo: boolean;

  /** Posição do paginador */
  position: "top" | "bottom" | "both";

  /** Estilo do paginador */
  style: "default" | "minimal" | "advanced";

  /** Estratégia de paginação */
  strategy: "client" | "server";
}
```

### SortingConfig

```typescript
interface SortingConfig {
  /** Habilitar ordenação */
  enabled: boolean;

  /** Permitir ordenação múltipla */
  multiSort: boolean;

  /** Estratégia de ordenação */
  strategy: "client" | "server";

  /** Mostrar indicadores de ordenação */
  showSortIndicators: boolean;

  /** Posição do indicador */
  indicatorPosition: "start" | "end";

  /** Permitir limpar ordenação */
  allowClearSort: boolean;
}
```

## 🎨 Configurações de Aparência

### TableAppearanceConfig

```typescript
interface TableAppearanceConfig {
  /** Densidade da tabela */
  density: "compact" | "comfortable" | "spacious";

  /** Configurações de bordas */
  borders?: BorderConfig;

  /** Configurações de elevação */
  elevation?: ElevationConfig;

  /** Configurações de espaçamento */
  spacing?: SpacingConfig;

  /** Configurações de tipografia */
  typography?: TypographyConfig;
}
```

### BorderConfig

```typescript
interface BorderConfig {
  /** Mostrar bordas entre linhas */
  showRowBorders: boolean;

  /** Mostrar bordas entre colunas */
  showColumnBorders: boolean;

  /** Mostrar borda externa */
  showOuterBorder: boolean;

  /** Estilo da borda */
  style: "solid" | "dashed" | "dotted";

  /** Largura da borda */
  width: number;

  /** Cor da borda */
  color: string;
}
```

## ⚡ Configurações de Performance

### PerformanceConfig

```typescript
interface PerformanceConfig {
  /** Configurações de virtualização */
  virtualization?: VirtualizationConfig;

  /** Configurações de lazy loading */
  lazyLoading?: LazyLoadingConfig;
}
```

### VirtualizationConfig

```typescript
interface VirtualizationConfig {
  /** Habilitar virtualização */
  enabled: boolean;

  /** Altura do item */
  itemHeight: number;

  /** Tamanho do buffer */
  bufferSize: number;

  /** Altura mínima do container */
  minContainerHeight: number;

  /** Estratégia de virtualização */
  strategy: "fixed" | "dynamic";
}
```

## 🔍 Configurações de Acessibilidade

### AccessibilityConfig

```typescript
interface AccessibilityConfig {
  /** Habilitar recursos de acessibilidade */
  enabled: boolean;

  /** Configurações de anúncios */
  announcements?: AnnouncementConfig;

  /** Navegação por teclado */
  keyboard?: KeyboardAccessibilityConfig;

  /** Contraste alto */
  highContrast?: boolean;

  /** Reduzir movimento */
  reduceMotion?: boolean;

  /** Labels ARIA personalizados */
  ariaLabels?: { [key: string]: string };
}
```

### AnnouncementConfig

```typescript
interface AnnouncementConfig {
  /** Anunciar mudanças de dados */
  dataChanges: boolean;

  /** Anunciar ações do usuário */
  userActions: boolean;

  /** Anunciar estados de carregamento */
  loadingStates: boolean;

  /** Tipo de live region */
  liveRegion: "polite" | "assertive";
}
```

## 🛠️ Serviços

### TableConfigService

```typescript
class TableConfigService {
  /** Definir configuração atual */
  setConfig(config: TableConfig): void;

  /** Obter configuração atual */
  getCurrentConfig(): TableConfig;

  /** Verificar se um recurso está habilitado */
  isFeatureEnabled(feature: string): boolean;

  /** Obter resumo da configuração */
  getConfigSummary(): ConfigSummary;

  /** Obter configurações de paginação */
  getPaginationConfig(): PaginationConfig | undefined;

  /** Obter configurações de ordenação */
  getSortingConfig(): SortingConfig | undefined;

  /** Obter configurações de filtragem */
  getFilteringConfig(): FilteringConfig | undefined;
}
```

### Exemplo de Uso do Serviço

```typescript
import { TableConfigService } from '@praxis/core';

@Component({...})
export class MyComponent {
  constructor(private configService: TableConfigService) {}

  ngOnInit() {
    // Definir configuração
    this.configService.setConfig(this.tableConfig);

    // Verificar recursos
    const hasMultiSort = this.configService.isFeatureEnabled('multiSort');
    const hasBulkActions = this.configService.isFeatureEnabled('bulkActions');
    const hasExport = this.configService.isFeatureEnabled('export');

    // Obter configurações específicas
    const paginationConfig = this.configService.getPaginationConfig();
    const sortingConfig = this.configService.getSortingConfig();
  }
}
```

## 🔧 Helper Functions

### Configuração Padrão

```typescript
import { createDefaultTableConfig } from "@praxis/core";

// Criar configuração padrão
const defaultConfig = createDefaultTableConfig();

console.log(defaultConfig);
// {
//   meta: { version: '2.0.0', ... },
//   columns: [],
//   behavior: { pagination: { enabled: true, ... }, ... },
//   ...
// }
```

### Validação

```typescript
import { isValidTableConfig, isTableConfigV2 } from '@praxis/core';

// Validar configuração
const config = { columns: [...] };

if (isValidTableConfig(config)) {
  console.log('Configuração válida');
}

if (isTableConfigV2(config)) {
  console.log('Configuração V2 detectada');
}
```

### Manipulação de Configurações

```typescript
import { cloneTableConfig, mergeTableConfigs, getEssentialConfig } from "@praxis/core";

// Clonar configuração
const clonedConfig = cloneTableConfig(originalConfig);

// Merge configurações
const mergedConfig = mergeTableConfigs(baseConfig, {
  behavior: {
    pagination: { pageSize: 25 },
  },
});

// Extrair configurações essenciais
const essentialConfig = getEssentialConfig(fullConfig);
```

## 📊 Type Guards e Utilitários

### Type Guards

```typescript
// Verificar se é configuração V2
function isTableConfigV2(config: any): config is TableConfig;

// Validar estrutura da configuração
function isValidTableConfig(config: any): config is TableConfig;
```

### Utilitários de Configuração

```typescript
// Criar configuração padrão
function createDefaultTableConfig(): TableConfig;

// Clonar configuração profundamente
function cloneTableConfig(config: TableConfig): TableConfig;

// Merge duas configurações
function mergeTableConfigs(base: TableConfig, override: Partial<TableConfig>): TableConfig;

// Extrair configurações essenciais
function getEssentialConfig(config: TableConfig): Partial<TableConfig>;
```

## 🧪 Testando com @praxis/core

### Setup de Testes

```typescript
import { TestBed } from "@angular/core/testing";
import { TableConfigService } from "@praxis/core";

describe("TableConfigService", () => {
  let service: TableConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableConfigService],
    });
    service = TestBed.inject(TableConfigService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should set and get config", () => {
    const config: TableConfig = {
      columns: [{ field: "test", header: "Test" }],
    };

    service.setConfig(config);
    expect(service.getCurrentConfig()).toEqual(config);
  });
});
```

### Testes de Helper Functions

```typescript
import { createDefaultTableConfig, isValidTableConfig, cloneTableConfig } from "@praxis/core";

describe("Helper Functions", () => {
  it("should create valid default config", () => {
    const config = createDefaultTableConfig();
    expect(isValidTableConfig(config)).toBe(true);
  });

  it("should clone config correctly", () => {
    const original: TableConfig = {
      columns: [{ field: "test", header: "Test" }],
      behavior: { pagination: { enabled: true } },
    };

    const cloned = cloneTableConfig(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original); // Different reference
  });
});
```

## 📋 Migration Guide

### Migração da Arquitetura V1/V2

#### Mudanças Principais

1. **Interface Unificada**:

   ```typescript
   // Antes
   import { TableConfigV1, TableConfigV2, TableConfigUnified } from "@praxis/core";

   // Depois
   import { TableConfig } from "@praxis/core";
   ```

2. **Serviços Simplificados**:

   ```typescript
   // Antes
   import { TableConfigAdapterService, TableConfigMigrationService } from "@praxis/core";

   // Depois
   import { TableConfigService } from "@praxis/core";
   ```

3. **Type Guards Atualizados**:

   ```typescript
   // Antes
   isTableConfigV1(config) || isTableConfigV2(config);

   // Depois
   isTableConfigV2(config); // Sempre true para a nova arquitetura
   ```

## 🔍 Troubleshooting

### Problemas Comuns

#### Erros de Tipagem

```typescript
// Problema: Type error em propriedades opcionais
// Solução: Usar optional chaining
const pageSize = config.behavior?.pagination?.pageSize ?? 10;
```

#### Validação de Configuração

```typescript
// Verificar se configuração é válida antes de usar
import { isValidTableConfig } from "@praxis/core";

if (!isValidTableConfig(userConfig)) {
  console.error("Configuração inválida:", userConfig);
  userConfig = createDefaultTableConfig();
}
```

#### Performance Issues

```typescript
// Para grandes volumes de dados, usar configuração otimizada
const optimizedConfig: TableConfig = {
  columns: [...],
  performance: {
    virtualization: {
      enabled: true,
      itemHeight: 48,
      bufferSize: 20
    }
  }
};
```

## 📚 API Reference Completa

### Exports Principais

```typescript
// Interfaces
export interface TableConfig;
export interface ColumnDefinition;
export interface ConfigMetadata;
export interface TableBehaviorConfig;
export interface TableAppearanceConfig;
export interface ToolbarConfig;
export interface TableActionsConfig;
export interface ExportConfig;
export interface MessagesConfig;
export interface LocalizationConfig;
export interface PerformanceConfig;
export interface AccessibilityConfig;

// Serviços
export class TableConfigService;

// Helper Functions
export function createDefaultTableConfig(): TableConfig;
export function isValidTableConfig(config: any): config is TableConfig;
export function isTableConfigV2(config: any): config is TableConfig;
export function cloneTableConfig(config: TableConfig): TableConfig;
export function mergeTableConfigs(base: TableConfig, override: Partial<TableConfig>): TableConfig;
export function getEssentialConfig(config: TableConfig): Partial<TableConfig>;

// Type Aliases
export type TableConfig = TableConfigV2;
export type TableConfigModern = TableConfigV2;

// Legacy (Deprecated)
export type LegacyTableConfig = TableConfig;
export const DEFAULT_TABLE_CONFIG = createDefaultTableConfig();
```

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie branch para feature (`git checkout -b feature/nova-interface`)
3. Commit mudanças (`git commit -m 'Add: nova interface para X'`)
4. Push para branch (`git push origin feature/nova-interface`)
5. Abra Pull Request

### Guidelines para Interfaces

- Usar nomes descritivos e consistentes
- Documentar todas as propriedades
- Manter backward compatibility quando possível
- Adicionar testes para novas interfaces

## 📊 Roadmap

### Próximas Versões

- ✅ Arquitetura unificada (v2.0.0)
- 🔄 Enhanced validation (v2.1.0)
- 📋 Plugin architecture (v2.2.0)
- 🎨 Theme system integration (v2.3.0)

## 📄 Licença

MIT License - consulte [LICENSE](../../LICENSE) para detalhes.

---

**Biblioteca Central do Praxis UI Workspace**  
**Versão**: 2.0.0 (Unified Architecture)  
**Compatibilidade**: Angular 18+ | TypeScript 5.0+
