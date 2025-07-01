# Plano de Integração: Praxis Visual Builder + Praxis Table Config Editor

## 📋 Análise dos Casos de Uso

### **1. Casos de Uso Identificados para Integração**

#### **A. Formatação Condicional Avançada**
```typescript
// Exemplo: Colorir células baseado em regras complexas
if (${user.status} == "active" && ${user.lastLogin} > dateAdd(now(), -30, "days")) {
  // Aplicar estilo: background verde, texto branco
} else if (${user.status} == "inactive") {
  // Aplicar estilo: background vermelho, texto branco
}
```

#### **B. Mapeamento de Valores com Lógica Complexa**
```typescript
// Exemplo: Status baseado em múltiplos campos
if (${order.total} > 1000 && ${customer.vip} == true) {
  return "Cliente Premium";
} else if (${order.status} == "pending" && ${order.daysSinceCreated} > 7) {
  return "Pedido Atrasado";
} else {
  return "Status Normal";
}
```

#### **C. Visibilidade Condicional de Colunas**
```typescript
// Exemplo: Mostrar coluna apenas para certas condições
showColumn(${user.role} == "admin" || ${user.permissions}.includes("view_sensitive_data"))
```

#### **D. Validação e Alertas Visuais**
```typescript
// Exemplo: Destacar dados inconsistentes
if (${product.price} < ${product.cost}) {
  // Aplicar ícone de aviso e cor vermelha
  return { style: "warning", icon: "warning", tooltip: "Preço menor que custo" };
}
```

#### **E. Colunas Calculadas Dinâmicas**
```typescript
// Exemplo: Fórmulas baseadas em regras de negócio
if (${customer.type} == "wholesale") {
  return ${product.price} * 0.8; // 20% desconto
} else if (${customer.loyaltyLevel} == "gold") {
  return ${product.price} * 0.9; // 10% desconto
} else {
  return ${product.price};
}
```

### **2. Benefícios da Integração**

#### **Para Usuários Técnicos:**
- **Interface Visual**: Criar regras complexas sem escrever código
- **Validação em Tempo Real**: Verificar se as regras fazem sentido
- **Reutilização**: Salvar e reutilizar regras em diferentes tabelas
- **Documentação Automática**: Regras autodocumentadas e compreensíveis

#### **Para Usuários de Negócio:**
- **Autonomia**: Configurar comportamentos sem depender de desenvolvedores
- **Flexibilidade**: Adaptar rapidamente a mudanças de requisitos
- **Visualização**: Entender facilmente quais regras estão aplicadas
- **Testes**: Simular cenários antes de aplicar em produção

---

## 🏗️ Arquitetura de Integração

### **1. Estrutura de Componentes**

```
praxis-table-config-editor/
├── columns-config-editor/
│   ├── conditional-styling-editor/           [NOVO]
│   │   ├── style-rule-builder.component.ts
│   │   ├── style-preview.component.ts
│   │   └── style-templates.service.ts
│   ├── conditional-visibility-editor/        [NOVO]
│   │   ├── visibility-rule-builder.component.ts
│   │   └── visibility-preview.component.ts
│   ├── advanced-value-mapping-editor/        [ENHANCED]
│   │   ├── rule-based-mapping.component.ts
│   │   └── mapping-wizard.component.ts
│   └── calculated-column-editor/             [ENHANCED]
│       ├── business-rule-builder.component.ts
│       └── formula-validator.component.ts
```

### **2. Modelo de Dados Estendido**

#### **ColumnDefinition Estendida:**
```typescript
export interface ColumnDefinition {
  // Propriedades existentes...
  field: string;
  header: string;
  type?: ColumnDataType;
  
  // NOVAS propriedades para regras visuais
  conditionalStyles?: ConditionalStyle[];
  visibilityRules?: VisibilityRule[];
  advancedValueMapping?: AdvancedValueMapping;
  businessRules?: BusinessRule[];
  validationRules?: ValidationRule[];
}

export interface ConditionalStyle {
  id: string;
  name: string;
  description?: string;
  condition: VisualRule;
  styles: CellStyles;
  priority: number;
  enabled: boolean;
}

export interface VisualRule {
  // Integração com praxis-visual-builder
  specification: any; // Specification from visual builder
  dsl: string;        // DSL representation
  description: string; // Human-readable description
}

export interface CellStyles {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  border?: BorderStyle;
  icon?: IconConfig;
  tooltip?: string;
  className?: string;
}

export interface AdvancedValueMapping {
  rules: ValueMappingRule[];
  defaultValue?: string;
  cacheEnabled?: boolean;
}

export interface ValueMappingRule {
  id: string;
  condition: VisualRule;
  outputValue: string;
  priority: number;
}
```

### **3. Serviços de Integração**

#### **TableRuleEngine Service:**
```typescript
@Injectable()
export class TableRuleEngineService {
  constructor(
    private visualBuilder: RuleBuilderService,
    private specificationBridge: SpecificationBridgeService
  ) {}

  // Converte regras visuais para funções de célula
  compileConditionalStyles(rules: ConditionalStyle[]): CellStyleFunction {
    return (rowData: any, cellValue: any) => {
      for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
        if (this.evaluateRule(rule.condition, rowData, cellValue)) {
          return rule.styles;
        }
      }
      return {};
    };
  }

  // Avalia regras usando o engine do visual builder
  evaluateRule(rule: VisualRule, rowData: any, cellValue: any): boolean {
    const context = { ...rowData, _cellValue: cellValue };
    return this.visualBuilder.evaluateSpecification(rule.specification, context);
  }

  // Compila mapeamentos de valor baseados em regras
  compileValueMapping(mapping: AdvancedValueMapping): ValueMappingFunction {
    return (rowData: any, cellValue: any) => {
      for (const rule of mapping.rules.sort((a, b) => b.priority - a.priority)) {
        if (this.evaluateRule(rule.condition, rowData, cellValue)) {
          return rule.outputValue;
        }
      }
      return mapping.defaultValue || cellValue;
    };
  }
}
```

#### **FieldSchemaAdapter Service:**
```typescript
@Injectable()
export class FieldSchemaAdapter {
  // Converte TableConfig para esquema compatível com visual builder
  adaptTableConfigToFieldSchema(config: TableConfig): FieldSchema[] {
    return config.columns.map(column => ({
      name: column.field,
      label: column.header,
      type: this.mapColumnTypeToFieldType(column.type),
      required: false,
      metadata: {
        columnConfig: column,
        originalType: column._originalApiType
      }
    }));
  }

  // Detecta relacionamentos entre colunas para regras avançadas
  detectFieldRelationships(columns: ColumnDefinition[]): FieldRelationship[] {
    // Lógica para detectar relacionamentos (ex: customer.id -> customer.name)
    return [];
  }
}
```

---

## 🎨 Componentes da Interface

### **1. Style Rule Builder Component**

```typescript
@Component({
  selector: 'style-rule-builder',
  template: `
    <div class="style-rule-builder">
      <!-- Header com Preview -->
      <div class="header-section">
        <h3>Regras de Formatação Condicional</h3>
        <style-preview [styles]="previewStyles" [sampleData]="sampleData"></style-preview>
      </div>

      <!-- Abas para diferentes tipos de regras -->
      <mat-tab-group>
        <mat-tab label="Regras de Cor">
          <visual-rule-editor
            [fieldSchemas]="fieldSchemas"
            [ruleType]="'color'"
            (ruleChanged)="onColorRuleChanged($event)">
          </visual-rule-editor>
        </mat-tab>

        <mat-tab label="Ícones e Badges">
          <icon-rule-editor
            [fieldSchemas]="fieldSchemas"
            (ruleChanged)="onIconRuleChanged($event)">
          </icon-rule-editor>
        </mat-tab>

        <mat-tab label="Formatação de Texto">
          <text-format-rule-editor
            [fieldSchemas]="fieldSchemas"
            (ruleChanged)="onTextRuleChanged($event)">
          </text-format-rule-editor>
        </mat-tab>
      </mat-tab-group>

      <!-- Lista de Regras Ativas -->
      <div class="active-rules">
        <h4>Regras Configuradas</h4>
        <div *ngFor="let rule of conditionalStyles" class="rule-item">
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>{{ rule.name }}</mat-panel-title>
              <mat-panel-description>{{ rule.description }}</mat-panel-description>
            </mat-expansion-panel-header>
            
            <rule-detail-editor
              [rule]="rule"
              [fieldSchemas]="fieldSchemas"
              (ruleUpdated)="onRuleUpdated($event)"
              (ruleDeleted)="onRuleDeleted($event)">
            </rule-detail-editor>
          </mat-expansion-panel>
        </div>
      </div>
    </div>
  `
})
export class StyleRuleBuilderComponent {
  @Input() column: ColumnDefinition;
  @Input() fieldSchemas: FieldSchema[];
  @Output() stylesChanged = new EventEmitter<ConditionalStyle[]>();

  conditionalStyles: ConditionalStyle[] = [];
  previewStyles: CellStyles = {};
  sampleData: any = {};

  // Integração com praxis-visual-builder
  onColorRuleChanged(visualRule: any) {
    const styleRule: ConditionalStyle = {
      id: generateId(),
      name: 'Regra de Cor',
      condition: visualRule,
      styles: { backgroundColor: visualRule.color },
      priority: this.conditionalStyles.length + 1,
      enabled: true
    };
    
    this.conditionalStyles.push(styleRule);
    this.stylesChanged.emit(this.conditionalStyles);
  }
}
```

### **2. Advanced Value Mapping Component**

```typescript
@Component({
  selector: 'advanced-value-mapping',
  template: `
    <div class="advanced-mapping">
      <!-- Wizard de Configuração -->
      <mat-stepper linear #stepper>
        <mat-step [stepControl]="mappingTypeForm">
          <ng-template matStepLabel>Tipo de Mapeamento</ng-template>
          <mapping-type-selector
            (typeSelected)="onMappingTypeSelected($event)">
          </mapping-type-selector>
        </mat-step>

        <mat-step [stepControl]="rulesForm">
          <ng-template matStepLabel>Configurar Regras</ng-template>
          <visual-mapping-rules
            [fieldSchemas]="fieldSchemas"
            [mappingType]="selectedMappingType"
            (rulesChanged)="onMappingRulesChanged($event)">
          </visual-mapping-rules>
        </mat-step>

        <mat-step [stepControl]="previewForm">
          <ng-template matStepLabel>Preview e Teste</ng-template>
          <mapping-preview
            [rules]="mappingRules"
            [sampleData]="sampleData"
            (testPassed)="onTestPassed($event)">
          </mapping-preview>
        </mat-step>
      </mat-stepper>

      <!-- Templates Pré-definidos -->
      <div class="template-section">
        <h4>Templates Prontos</h4>
        <div class="template-grid">
          <template-card
            *ngFor="let template of mappingTemplates"
            [template]="template"
            (templateSelected)="onTemplateSelected($event)">
          </template-card>
        </div>
      </div>
    </div>
  `
})
export class AdvancedValueMappingComponent {
  mappingTemplates = [
    {
      name: 'Status Simples',
      description: 'Mapear 0/1 para Inativo/Ativo',
      rules: [
        { condition: '${value} == 0', output: 'Inativo' },
        { condition: '${value} == 1', output: 'Ativo' }
      ]
    },
    {
      name: 'Faixas de Valores',
      description: 'Classificar por faixas numéricas',
      rules: [
        { condition: '${value} < 1000', output: 'Baixo' },
        { condition: '${value} >= 1000 && ${value} < 5000', output: 'Médio' },
        { condition: '${value} >= 5000', output: 'Alto' }
      ]
    }
  ];
}
```

### **3. Visibility Rule Builder Component**

```typescript
@Component({
  selector: 'visibility-rule-builder',
  template: `
    <div class="visibility-rules">
      <div class="rule-explanation">
        <mat-icon>visibility</mat-icon>
        <p>Configure quando esta coluna deve ser visível baseado nos dados da linha ou contexto do usuário.</p>
      </div>

      <!-- Configuração de Regras de Visibilidade -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Regras de Visibilidade</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <praxis-rule-editor
            [config]="visibilityRuleConfig"
            [initialRules]="currentVisibilityRules"
            (rulesChanged)="onVisibilityRulesChanged($event)">
          </praxis-rule-editor>
        </mat-card-content>
      </mat-card>

      <!-- Preview de Visibilidade -->
      <visibility-preview
        [rules]="visibilityRules"
        [sampleRows]="sampleData"
        (previewReady)="onPreviewReady($event)">
      </visibility-preview>
    </div>
  `
})
export class VisibilityRuleBuilderComponent {
  @Input() column: ColumnDefinition;
  @Input() tableConfig: TableConfig;
  @Output() visibilityRulesChanged = new EventEmitter<VisibilityRule[]>();

  visibilityRuleConfig: RuleBuilderConfig = {
    fieldSchemas: [], // Derivado do tableConfig
    allowedRuleTypes: ['field-condition', 'boolean-group'],
    contextVariables: {
      user: { role: 'string', permissions: 'array' },
      session: { theme: 'string', locale: 'string' }
    }
  };
}
```

---

## 🔄 Fluxo de Integração

### **1. Inicialização**
```typescript
// No columns-config-editor.component.ts
export class ColumnsConfigEditorComponent implements OnInit {
  ngOnInit() {
    // Converter configuração da tabela para esquemas de campo
    this.fieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema(this.config);
    
    // Inicializar serviços de regras
    this.tableRuleEngine.initialize(this.fieldSchemas);
    
    // Configurar contexto para regras
    this.setupRuleContext();
  }

  private setupRuleContext() {
    this.ruleContext = {
      tableColumns: this.config.columns.map(c => ({ name: c.field, type: c.type })),
      availableFields: this.fieldSchemas,
      userContext: {
        // Contexto do usuário atual
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      }
    };
  }
}
```

### **2. Compilação de Regras**
```typescript
// Quando as regras são alteradas
onConditionalStylesChanged(styles: ConditionalStyle[]) {
  // Compilar regras para funções executáveis
  this.selectedColumn.cellClassCondition = this.tableRuleEngine.compileConditionalStyles(styles);
  
  // Atualizar preview em tempo real
  this.updateColumnPreview();
  
  // Emitir mudança para o componente pai
  this.emitColumnChange();
}

private updateColumnPreview() {
  // Aplicar regras aos dados de exemplo
  this.previewData = this.sampleData.map(row => ({
    ...row,
    _computedStyles: this.selectedColumn.cellClassCondition?.(row, row[this.selectedColumn.field])
  }));
}
```

### **3. Serialização e Persistência**
```typescript
// Serializar regras visuais para JSON
serializeColumnRules(column: ColumnDefinition): any {
  return {
    ...column,
    conditionalStyles: column.conditionalStyles?.map(style => ({
      ...style,
      condition: {
        specification: this.specificationBridge.exportSpecification(style.condition.specification),
        dsl: style.condition.dsl,
        description: style.condition.description
      }
    })),
    advancedValueMapping: this.serializeValueMapping(column.advancedValueMapping)
  };
}

// Deserializar regras do JSON
deserializeColumnRules(columnData: any): ColumnDefinition {
  const column: ColumnDefinition = { ...columnData };
  
  if (columnData.conditionalStyles) {
    column.conditionalStyles = columnData.conditionalStyles.map(styleData => ({
      ...styleData,
      condition: {
        specification: this.specificationBridge.importSpecification(styleData.condition.specification),
        dsl: styleData.condition.dsl,
        description: styleData.condition.description
      }
    }));
  }
  
  return column;
}
```

---

## 🚀 Fases de Implementação

### **Fase 1: Integração Básica (2-3 semanas)**
1. **Criar serviços de adaptação** entre table-config e visual-builder
2. **Implementar Style Rule Builder** básico
3. **Adicionar aba "Regras Visuais"** no columns-config-editor
4. **Configurar preview em tempo real** das regras aplicadas

### **Fase 2: Funcionalidades Avançadas (3-4 semanas)**
1. **Advanced Value Mapping** com wizard
2. **Visibility Rule Builder** 
3. **Templates pré-definidos** para casos comuns
4. **Sistema de validação** de regras

### **Fase 3: Otimização e UX (2-3 semanas)**
1. **Performance optimization** para grandes volumes
2. **Documentação automática** das regras
3. **Import/Export** de configurações
4. **Testes automatizados** das regras

### **Fase 4: Funcionalidades Premium (2-3 semanas)**
1. **Rule Debugger** para troubleshooting
2. **A/B Testing** de regras
3. **Analytics** de uso das regras
4. **Integração com APIs externas** para dados dinâmicos

---

## 📊 Benefícios Esperados

### **Técnicos:**
- **Redução de 70%** no tempo de configuração de tabelas complexas
- **Eliminação de código customizado** para formatação condicional
- **Validação automática** de regras de negócio
- **Reutilização** de configurações entre projetos

### **Negócio:**
- **Autonomia** para usuários de negócio configurarem tabelas
- **Flexibilidade** para mudanças rápidas de requisitos
- **Consistência** visual e funcional entre diferentes telas
- **Documentação** automática de regras de negócio

---

## 🔧 Considerações Técnicas

### **Performance:**
- **Lazy loading** de componentes de regras
- **Memoização** de resultados de regras
- **Web Workers** para processamento de grandes volumes
- **Virtual scrolling** para previews com muitos dados

### **Compatibilidade:**
- **Fallback gracioso** para regras não suportadas
- **Versionamento** de configurações
- **Migração automática** de configurações antigas
- **Validação** de compatibilidade entre versões

### **Segurança:**
- **Sanitização** de expressões DSL
- **Validação** de contexto de execução
- **Controle de acesso** baseado em roles
- **Auditoria** de mudanças de configuração

Este plano fornece uma roadmap completa para integrar o praxis-visual-builder ao praxis-table-config-editor, criando uma solução poderosa e flexível para configuração visual de tabelas dinâmicas.