# Exemplo Prático de Integração: Visual Builder + Table Config Editor

## 📝 Resumo da Análise e Planejamento

### **Casos de Uso Identificados**

1. **Formatação Condicional Avançada** - Aplicar estilos baseados em regras visuais
2. **Mapeamento de Valores Complexo** - Transformar dados usando lógica de negócio  
3. **Visibilidade Condicional** - Mostrar/ocultar colunas baseado em contexto
4. **Validação Visual** - Destacar dados inconsistentes ou problemáticos
5. **Colunas Calculadas Dinâmicas** - Fórmulas baseadas em regras de negócio

### **Benefícios da Integração**

- **70% redução** no tempo de configuração de tabelas complexas
- **Interface visual** para criar regras sem código
- **Validação em tempo real** das regras de negócio
- **Reutilização** de configurações entre projetos
- **Autonomia** para usuários de negócio

---

## 🏗️ Arquitetura Implementada

### **1. Serviços Core**

#### **TableRuleEngineService**
- Compila regras visuais em funções executáveis
- Gerencia cache de performance
- Valida regras contra dados de exemplo
- Integra com o praxis-visual-builder

#### **FieldSchemaAdapter**
- Converte configurações de tabela para schemas de campo
- Detecta relacionamentos entre colunas
- Adapta tipos de dados entre sistemas

### **2. Componentes UI**

#### **StyleRuleBuilderComponent**
- Interface drag-and-drop para regras de estilo
- Validação em tempo real das regras
- Preview interativo dos resultados
- Templates pré-definidos para casos comuns

#### **StylePreviewComponent**
- Mostra aplicação das regras em dados reais
- Análise de cobertura das regras
- Estatísticas de uso e performance
- Feedback visual sobre efetividade

---

## 🔧 Exemplo de Integração no ColumnsConfigEditor

### **1. Atualizar o columns-config-editor.component.ts**

```typescript
// Adicionar imports
import { StyleRuleBuilderComponent } from '../integration/style-rule-builder.component';
import { TableRuleEngineService, ConditionalStyle } from '../integration/table-rule-engine.service';
import { FieldSchemaAdapter } from '../integration/field-schema-adapter.service';

@Component({
  // ... existing config
  imports: [
    // ... existing imports
    StyleRuleBuilderComponent
  ]
})
export class ColumnsConfigEditorComponent {
  // Adicionar propriedades
  private fieldSchemas: FieldSchema[] = [];
  
  constructor(
    // ... existing constructors
    private tableRuleEngine: TableRuleEngineService,
    private fieldSchemaAdapter: FieldSchemaAdapter
  ) {}

  ngOnInit() {
    // Converter configuração da tabela para schemas de campo
    this.fieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema(this.config);
    
    // Inicializar engine de regras
    this.tableRuleEngine.initialize(this.fieldSchemas);
  }

  // Adicionar método para lidar com mudanças de estilo
  onConditionalStylesChanged(column: ColumnDefinition, styles: ConditionalStyle[]) {
    // Compilar regras para funções executáveis
    if (styles.length > 0) {
      column.cellClassCondition = this.tableRuleEngine.compileConditionalStyles(styles);
    } else {
      delete column.cellClassCondition;
    }

    // Salvar regras na configuração da coluna
    column.conditionalStyles = styles;

    // Emitir mudança
    this.emitColumnChange();
  }
}
```

### **2. Atualizar o template do columns-config-editor**

```html
<!-- Adicionar aba de Regras Visuais na seção de detalhes da coluna -->
<mat-expansion-panel class="column-detail-panel">
  <mat-expansion-panel-header>
    <mat-panel-title>
      <mat-icon>palette</mat-icon>
      Regras Visuais
    </mat-panel-title>
    <mat-panel-description>
      Formatação condicional e regras de negócio
    </mat-panel-description>
  </mat-expansion-panel-header>

  <!-- Style Rule Builder Integration -->
  <style-rule-builder
    [column]="selectedColumn"
    [fieldSchemas]="fieldSchemas"
    [sampleData]="sampleTableData"
    (stylesChanged)="onConditionalStylesChanged(selectedColumn, $event)"
    (ruleValidated)="onRuleValidated($event)">
  </style-rule-builder>
</mat-expansion-panel>
```

---

## 🎯 Casos de Uso Práticos

### **Caso 1: E-commerce - Status de Pedidos**

```typescript
// Regra Visual: Colorir status baseado em múltiplas condições
const orderStatusRule = {
  name: "Status de Pedidos Críticos",
  condition: {
    dsl: `
      if (order.status == "pending" && order.daysSinceCreated > 7) {
        return true; // Aplicar estilo de alerta
      } else if (order.total > 1000 && customer.vip == true) {
        return true; // Aplicar estilo premium
      }
      return false;
    `
  },
  styles: {
    backgroundColor: order.status === "pending" ? "#ffebee" : "#e8f5e8",
    textColor: order.status === "pending" ? "#c62828" : "#2e7d32",
    icon: {
      name: order.status === "pending" ? "warning" : "star",
      position: "before"
    }
  }
};
```

### **Caso 2: RH - Análise de Funcionários**

```typescript
// Regra Visual: Destacar funcionários por performance e tempo de empresa
const employeeAnalysisRule = {
  name: "Análise de Funcionários",
  condition: {
    dsl: `
      if (employee.performance >= 4.5 && employee.yearsInCompany >= 2) {
        return "high-performer";
      } else if (employee.performance < 3.0) {
        return "needs-attention";
      } else if (employee.yearsInCompany < 0.5) {
        return "new-hire";
      }
      return "standard";
    `
  },
  styleMapping: {
    "high-performer": {
      backgroundColor: "#e8f5e8",
      textColor: "#2e7d32",
      icon: { name: "star", color: "#fdd835" }
    },
    "needs-attention": {
      backgroundColor: "#ffebee",
      textColor: "#c62828",
      icon: { name: "warning", color: "#f57c00" }
    },
    "new-hire": {
      backgroundColor: "#e3f2fd",
      textColor: "#1976d2",
      icon: { name: "person_add", color: "#1976d2" }
    }
  }
};
```

### **Caso 3: Financeiro - Análise de Receitas**

```typescript
// Regra Visual: Análise de receita com múltiplos indicadores
const revenueAnalysisRule = {
  name: "Análise de Receita",
  condition: {
    dsl: `
      const monthlyTarget = 50000;
      const growthRate = (revenue.current - revenue.previous) / revenue.previous * 100;
      
      if (revenue.current >= monthlyTarget && growthRate > 10) {
        return "exceeding";
      } else if (revenue.current >= monthlyTarget) {
        return "on-target";
      } else if (growthRate > 0) {
        return "growing";
      } else {
        return "concerning";
      }
    `
  },
  dynamicStyles: {
    backgroundColor: `
      switch (ruleResult) {
        case "exceeding": return "#e8f5e8";
        case "on-target": return "#f3e5f5";
        case "growing": return "#fff3e0";
        default: return "#ffebee";
      }
    `,
    textColor: `
      switch (ruleResult) {
        case "exceeding": return "#2e7d32";
        case "on-target": return "#7b1fa2";
        case "growing": return "#ef6c00";
        default: return "#c62828";
      }
    `
  }
};
```

---

## 📊 Templates Pré-definidos

### **Template 1: Status Simples**
```json
{
  "name": "Status Simples (0/1 → Inativo/Ativo)",
  "description": "Converte códigos numéricos em status legíveis",
  "rules": [
    {
      "condition": "${value} == 0",
      "styles": {
        "backgroundColor": "#ffebee",
        "textColor": "#c62828"
      },
      "valueMapping": "Inativo"
    },
    {
      "condition": "${value} == 1", 
      "styles": {
        "backgroundColor": "#e8f5e8",
        "textColor": "#2e7d32"
      },
      "valueMapping": "Ativo"
    }
  ]
}
```

### **Template 2: Faixas de Valores**
```json
{
  "name": "Classificação por Faixas",
  "description": "Classifica valores numéricos em faixas",
  "rules": [
    {
      "condition": "${value} < 1000",
      "styles": { "backgroundColor": "#ffcdd2" },
      "valueMapping": "Baixo (${value})"
    },
    {
      "condition": "${value} >= 1000 && ${value} < 5000",
      "styles": { "backgroundColor": "#fff9c4" },
      "valueMapping": "Médio (${value})"
    },
    {
      "condition": "${value} >= 5000",
      "styles": { "backgroundColor": "#c8e6c9" },
      "valueMapping": "Alto (${value})"
    }
  ]
}
```

### **Template 3: Análise Temporal**
```json
{
  "name": "Análise de Datas",
  "description": "Destaca registros baseado em critérios temporais",
  "rules": [
    {
      "condition": "daysBetween(${date}, now()) > 30",
      "styles": {
        "backgroundColor": "#ffebee",
        "icon": { "name": "schedule", "color": "#f44336" }
      },
      "valueMapping": "Vencido há ${daysBetween(${date}, now())} dias"
    },
    {
      "condition": "daysBetween(${date}, now()) > 7",
      "styles": {
        "backgroundColor": "#fff3e0",
        "icon": { "name": "warning", "color": "#ff9800" }
      },
      "valueMapping": "Atenção: ${daysBetween(${date}, now())} dias"
    }
  ]
}
```

---

## 🔄 Fluxo de Trabalho Completo

### **1. Usuário Configura Regra**
1. Abre editor de colunas
2. Seleciona coluna para configurar
3. Expande seção "Regras Visuais"
4. Usa interface visual para criar regra
5. Visualiza preview em tempo real

### **2. Sistema Processa Regra**
1. **Validação**: Verifica sintaxe e lógica da regra
2. **Compilação**: Converte regra visual em função JavaScript
3. **Cache**: Armazena função compilada para performance
4. **Aplicação**: Aplica regra aos dados da tabela

### **3. Resultado na Tabela**
1. **Renderização**: Aplica estilos condicionais às células
2. **Performance**: Usa cache para evitar recomputação
3. **Responsividade**: Atualiza estilos quando dados mudam
4. **Feedback**: Mostra indicadores visuais de regras ativas

---

## 📈 Métricas de Sucesso

### **Performance**
- ⚡ **Compilação de regras**: < 100ms
- 🚀 **Aplicação em 1000 linhas**: < 500ms  
- 💾 **Uso de memória**: < 50MB para 10 regras complexas
- 🔄 **Cache hit rate**: > 90%

### **Usabilidade**
- 🎯 **Tempo de configuração**: 70% redução vs código manual
- 👤 **Curva de aprendizado**: < 30min para usuário técnico
- ✅ **Taxa de sucesso**: > 95% nas regras criadas
- 🔄 **Reutilização**: > 80% das regras são reutilizadas

### **Qualidade**
- 🛡️ **Validação**: 100% das regras são validadas
- 🐛 **Taxa de erro**: < 1% em produção
- 📊 **Cobertura de testes**: > 95%
- 🔍 **Análise estática**: 0 vulnerabilidades

---

## 🚀 Próximos Passos

### **Implementação Imediata (Semana 1-2)**
1. ✅ Implementar `TableRuleEngineService`
2. ✅ Criar `StyleRuleBuilderComponent`  
3. ✅ Desenvolver `StylePreviewComponent`
4. 🔲 Integrar no `columns-config-editor`

### **Funcionalidades Avançadas (Semana 3-4)**
1. 🔲 Templates pré-definidos
2. 🔲 Advanced Value Mapping Editor
3. 🔲 Visibility Rule Builder
4. 🔲 Sistema de validação robusto

### **Otimização e UX (Semana 5-6)**
1. 🔲 Performance optimization
2. 🔲 Documentação automática
3. 🔲 Import/Export de configurações
4. 🔲 Testes automatizados

A integração do **praxis-visual-builder** com o **praxis-table-config-editor** representa um marco significativo na evolução das ferramentas de configuração, proporcionando uma experiência visual e intuitiva para criar regras de negócio complexas sem necessidade de programação manual.