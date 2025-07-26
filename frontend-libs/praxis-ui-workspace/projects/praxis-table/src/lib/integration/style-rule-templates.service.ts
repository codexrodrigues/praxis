import { Injectable } from '@angular/core';
import { ConditionalStyle, CellStyles } from './table-rule-engine.service';
import { RuleTemplate } from './types';

export interface StyleRuleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'status' | 'numeric' | 'temporal' | 'priority' | 'validation' | 'business';
  tags: string[];
  icon: string;
  preview: {
    backgroundColor?: string;
    textColor?: string;
    sampleText: string;
  };
  ruleTemplate: Partial<ConditionalStyle>;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'string' | 'number' | 'color' | 'select';
  defaultValue: any;
  options?: { value: any; label: string }[];
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StyleRuleTemplatesService {

  getTemplateCategories(): Array<{ id: string; name: string; icon: string; description: string }> {
    return [
      {
        id: 'status',
        name: 'Status e Estados',
        icon: 'check_circle',
        description: 'Templates para destacar diferentes status e estados dos dados'
      },
      {
        id: 'numeric',
        name: 'Valores Numéricos',
        icon: 'trending_up',
        description: 'Templates para faixas de valores, percentuais e métricas'
      },
      {
        id: 'temporal',
        name: 'Datas e Prazos',
        icon: 'schedule',
        description: 'Templates para destacar prazos, vencimentos e períodos'
      },
      {
        id: 'priority',
        name: 'Prioridades',
        icon: 'flag',
        description: 'Templates para níveis de prioridade e urgência'
      },
      {
        id: 'validation',
        name: 'Validação',
        icon: 'verified',
        description: 'Templates para indicar dados válidos, inválidos ou pendentes'
      },
      {
        id: 'business',
        name: 'Regras de Negócio',
        icon: 'business_center',
        description: 'Templates para regras específicas de domínio de negócio'
      }
    ];
  }

  getTemplatesByCategory(category: string): StyleRuleTemplate[] {
    const allTemplates = this.getAllTemplates();
    return allTemplates.filter(template => template.category === category);
  }

  getAllTemplates(): StyleRuleTemplate[] {
    return [
      // Status Templates
      {
        id: 'status-simple-active-inactive',
        name: 'Ativo/Inativo Simples',
        description: 'Destaca registros ativos em verde e inativos em vermelho',
        category: 'status',
        tags: ['ativo', 'inativo', 'status', 'boolean'],
        icon: 'toggle_on',
        preview: {
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
          sampleText: 'Ativo'
        },
        ruleTemplate: {
          name: 'Status Ativo/Inativo',
          condition: {
            specification: null,
            dsl: '${status} === "ativo" || ${status} === true',
            description: 'Quando status é ativo ou verdadeiro',
            fieldDependencies: ['status']
          },
          styles: {
            backgroundColor: '#e8f5e8',
            textColor: '#2e7d32',
            fontWeight: 'bold'
          },
          priority: 3,
          enabled: true
        },
        variables: [
          {
            name: 'fieldName',
            label: 'Campo de Status',
            type: 'string',
            defaultValue: 'status',
            description: 'Nome do campo que contém o status'
          },
          {
            name: 'activeColor',
            label: 'Cor para Ativo',
            type: 'color',
            defaultValue: '#e8f5e8'
          },
          {
            name: 'inactiveColor',
            label: 'Cor para Inativo',
            type: 'color',
            defaultValue: '#ffebee'
          }
        ]
      },

      {
        id: 'status-traffic-light',
        name: 'Semáforo (Verde/Amarelo/Vermelho)',
        description: 'Sistema de cores tipo semáforo para três estados',
        category: 'status',
        tags: ['semáforo', 'verde', 'amarelo', 'vermelho', 'três estados'],
        icon: 'traffic',
        preview: {
          backgroundColor: '#fff3e0',
          textColor: '#ef6c00',
          sampleText: 'Pendente'
        },
        ruleTemplate: {
          name: 'Status Semáforo',
          condition: {
            specification: null,
            dsl: '${status} === "sucesso" || ${status} === "ok"',
            description: 'Verde para sucesso, amarelo para atenção, vermelho para erro',
            fieldDependencies: ['status']
          },
          styles: {
            backgroundColor: '#e8f5e8',
            textColor: '#2e7d32',
            fontWeight: 'bold'
          },
          priority: 3,
          enabled: true
        },
        variables: [
          {
            name: 'fieldName',
            label: 'Campo de Status',
            type: 'string',
            defaultValue: 'status'
          },
          {
            name: 'successValues',
            label: 'Valores para Verde',
            type: 'string',
            defaultValue: 'sucesso,ok,aprovado,concluído'
          },
          {
            name: 'warningValues',
            label: 'Valores para Amarelo',
            type: 'string',
            defaultValue: 'pendente,atenção,aguardando'
          },
          {
            name: 'errorValues',
            label: 'Valores para Vermelho',
            type: 'string',
            defaultValue: 'erro,falha,rejeitado,cancelado'
          }
        ]
      },

      // Numeric Templates
      {
        id: 'numeric-ranges-low-medium-high',
        name: 'Faixas Numéricas (Baixo/Médio/Alto)',
        description: 'Destaca valores em faixas: baixo (azul), médio (amarelo), alto (verde)',
        category: 'numeric',
        tags: ['faixas', 'numérico', 'baixo', 'médio', 'alto'],
        icon: 'analytics',
        preview: {
          backgroundColor: '#e3f2fd',
          textColor: '#1976d2',
          sampleText: '150'
        },
        ruleTemplate: {
          name: 'Faixas Numéricas',
          condition: {
            specification: null,
            dsl: '${value} >= 0 && ${value} < 100',
            description: 'Quando valor está na faixa baixa',
            fieldDependencies: ['value']
          },
          styles: {
            backgroundColor: '#e3f2fd',
            textColor: '#1976d2'
          },
          priority: 3,
          enabled: true
        },
        variables: [
          {
            name: 'fieldName',
            label: 'Campo Numérico',
            type: 'string',
            defaultValue: 'value'
          },
          {
            name: 'lowThreshold',
            label: 'Limite Baixo',
            type: 'number',
            defaultValue: 100
          },
          {
            name: 'highThreshold',
            label: 'Limite Alto',
            type: 'number',
            defaultValue: 500
          }
        ]
      },

      {
        id: 'numeric-percentage-progress',
        name: 'Progress Percentual',
        description: 'Destaca progresso: 0-33% (vermelho), 34-66% (amarelo), 67-100% (verde)',
        category: 'numeric',
        tags: ['percentual', 'progresso', 'porcentagem'],
        icon: 'donut_small',
        preview: {
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
          sampleText: '85%'
        },
        ruleTemplate: {
          name: 'Progress Percentual',
          condition: {
            specification: null,
            dsl: '${progress} >= 67',
            description: 'Quando progresso é alto (≥67%)',
            fieldDependencies: ['progress']
          },
          styles: {
            backgroundColor: '#e8f5e8',
            textColor: '#2e7d32',
            fontWeight: 'bold'
          },
          priority: 3,
          enabled: true
        },
        variables: [
          {
            name: 'fieldName',
            label: 'Campo de Percentual',
            type: 'string',
            defaultValue: 'progress'
          }
        ]
      },

      // Temporal Templates
      {
        id: 'temporal-overdue-dates',
        name: 'Datas Vencidas',
        description: 'Destaca datas vencidas em vermelho, próximas do vencimento em amarelo',
        category: 'temporal',
        tags: ['data', 'vencimento', 'prazo', 'overdue'],
        icon: 'event_busy',
        preview: {
          backgroundColor: '#ffebee',
          textColor: '#c62828',
          sampleText: '15/01/2024'
        },
        ruleTemplate: {
          name: 'Datas Vencidas',
          condition: {
            specification: null,
            dsl: 'daysBetween(${dueDate}, _now) < 0',
            description: 'Quando data de vencimento já passou',
            fieldDependencies: ['dueDate']
          },
          styles: {
            backgroundColor: '#ffebee',
            textColor: '#c62828',
            fontWeight: 'bold',
            icon: {
              name: 'warning',
              position: 'before',
              color: '#c62828'
            }
          },
          priority: 5,
          enabled: true
        },
        variables: [
          {
            name: 'dateField',
            label: 'Campo de Data',
            type: 'string',
            defaultValue: 'dueDate'
          },
          {
            name: 'warningDays',
            label: 'Dias para Alerta',
            type: 'number',
            defaultValue: 7,
            description: 'Quantos dias antes do vencimento mostrar alerta'
          }
        ]
      },

      // Priority Templates
      {
        id: 'priority-high-medium-low',
        name: 'Prioridade Alta/Média/Baixa',
        description: 'Destaca por nível de prioridade com cores distintas',
        category: 'priority',
        tags: ['prioridade', 'alta', 'média', 'baixa', 'urgência'],
        icon: 'priority_high',
        preview: {
          backgroundColor: '#ffebee',
          textColor: '#c62828',
          sampleText: 'Alta'
        },
        ruleTemplate: {
          name: 'Prioridade Alta',
          condition: {
            specification: null,
            dsl: '${priority} === "alta" || ${priority} === "high" || ${priority} === 1',
            description: 'Quando prioridade é alta',
            fieldDependencies: ['priority']
          },
          styles: {
            backgroundColor: '#ffebee',
            textColor: '#c62828',
            fontWeight: 'bold',
            icon: {
              name: 'priority_high',
              position: 'before',
              color: '#c62828'
            }
          },
          priority: 5,
          enabled: true
        },
        variables: [
          {
            name: 'priorityField',
            label: 'Campo de Prioridade',
            type: 'string',
            defaultValue: 'priority'
          }
        ]
      },

      // Validation Templates
      {
        id: 'validation-valid-invalid',
        name: 'Dados Válidos/Inválidos',
        description: 'Destaca dados válidos em verde e inválidos em vermelho',
        category: 'validation',
        tags: ['validação', 'válido', 'inválido', 'erro'],
        icon: 'verified_user',
        preview: {
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
          sampleText: 'Válido'
        },
        ruleTemplate: {
          name: 'Validação de Dados',
          condition: {
            specification: null,
            dsl: '${isValid} === true || ${status} === "válido"',
            description: 'Quando dados são válidos',
            fieldDependencies: ['isValid', 'status']
          },
          styles: {
            backgroundColor: '#e8f5e8',
            textColor: '#2e7d32',
            icon: {
              name: 'check_circle',
              position: 'before',
              color: '#2e7d32'
            }
          },
          priority: 4,
          enabled: true
        },
        variables: [
          {
            name: 'validationField',
            label: 'Campo de Validação',
            type: 'string',
            defaultValue: 'isValid'
          }
        ]
      },

      // Business Templates
      {
        id: 'business-customer-vip',
        name: 'Cliente VIP',
        description: 'Destaca clientes VIP com estilo dourado',
        category: 'business',
        tags: ['cliente', 'vip', 'premium', 'especial'],
        icon: 'stars',
        preview: {
          backgroundColor: '#fff8e1',
          textColor: '#f57f17',
          sampleText: 'João Silva'
        },
        ruleTemplate: {
          name: 'Cliente VIP',
          condition: {
            specification: null,
            dsl: '${customerType} === "vip" || ${isVip} === true || ${totalPurchases} > 10000',
            description: 'Quando cliente é VIP ou tem compras altas',
            fieldDependencies: ['customerType', 'isVip', 'totalPurchases']
          },
          styles: {
            backgroundColor: '#fff8e1',
            textColor: '#f57f17',
            fontWeight: 'bold',
            icon: {
              name: 'star',
              position: 'after',
              color: '#ffd700'
            }
          },
          priority: 4,
          enabled: true
        },
        variables: [
          {
            name: 'vipField',
            label: 'Campo VIP',
            type: 'string',
            defaultValue: 'customerType'
          },
          {
            name: 'vipThreshold',
            label: 'Valor Mínimo VIP',
            type: 'number',
            defaultValue: 10000,
            description: 'Valor mínimo de compras para ser VIP'
          }
        ]
      },

      {
        id: 'business-revenue-target',
        name: 'Meta de Receita',
        description: 'Destaca quando receita atinge ou supera a meta',
        category: 'business',
        tags: ['receita', 'meta', 'target', 'vendas'],
        icon: 'monetization_on',
        preview: {
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
          sampleText: 'R$ 55.000'
        },
        ruleTemplate: {
          name: 'Meta de Receita',
          condition: {
            specification: null,
            dsl: '${revenue} >= ${target}',
            description: 'Quando receita atinge ou supera a meta',
            fieldDependencies: ['revenue', 'target']
          },
          styles: {
            backgroundColor: '#e8f5e8',
            textColor: '#2e7d32',
            fontWeight: 'bold',
            icon: {
              name: 'trending_up',
              position: 'before',
              color: '#2e7d32'
            }
          },
          priority: 4,
          enabled: true
        },
        variables: [
          {
            name: 'revenueField',
            label: 'Campo de Receita',
            type: 'string',
            defaultValue: 'revenue'
          },
          {
            name: 'targetField',
            label: 'Campo de Meta',
            type: 'string',
            defaultValue: 'target'
          }
        ]
      }
    ];
  }

  getTemplateById(id: string): StyleRuleTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(template => template.id === id) || null;
  }

  applyTemplate(template: StyleRuleTemplate, variables: Record<string, any>): ConditionalStyle {
    const rule: ConditionalStyle = {
      id: this.generateRuleId(),
      name: template.name,
      description: template.description,
      condition: {
        specification: template.ruleTemplate.condition?.specification || null,
        dsl: this.interpolateVariables(template.ruleTemplate.condition?.dsl || '', variables),
        description: template.ruleTemplate.condition?.description || '',
        fieldDependencies: template.ruleTemplate.condition?.fieldDependencies || []
      },
      styles: this.interpolateStyleVariables(template.ruleTemplate.styles || {}, variables),
      priority: template.ruleTemplate.priority || 3,
      enabled: true,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    return rule;
  }

  private interpolateVariables(text: string, variables: Record<string, any>): string {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `\${${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });
    return result;
  }

  private interpolateStyleVariables(styles: CellStyles, variables: Record<string, any>): CellStyles {
    const result: CellStyles = { ...styles };

    // Apply color variables
    if (variables['activeColor'] && result.backgroundColor === '#e8f5e8') {
      result.backgroundColor = variables['activeColor'];
    }
    if (variables['inactiveColor'] && result.backgroundColor === '#ffebee') {
      result.backgroundColor = variables['inactiveColor'];
    }

    return result;
  }

  private generateRuleId(): string {
    return `template_rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  searchTemplates(query: string): StyleRuleTemplate[] {
    const lowerQuery = query.toLowerCase();
    const allTemplates = this.getAllTemplates();
    
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getPopularTemplates(): StyleRuleTemplate[] {
    // Return most commonly used templates
    const popularIds = [
      'status-simple-active-inactive',
      'status-traffic-light',
      'numeric-ranges-low-medium-high',
      'temporal-overdue-dates',
      'priority-high-medium-low'
    ];

    return popularIds.map(id => this.getTemplateById(id)).filter(Boolean) as StyleRuleTemplate[];
  }
}