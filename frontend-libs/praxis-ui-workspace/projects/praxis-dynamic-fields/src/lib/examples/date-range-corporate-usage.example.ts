/**
 * @fileoverview Exemplos de uso corporativo do MaterialDateRangeComponent
 * 
 * Demonstra cenários reais de uso empresarial:
 * 📊 Relatórios financeiros com presets trimestrais
 * 📈 Analytics com períodos customizáveis
 * 🔍 Auditoria com validação rigorosa
 * 📅 Planejamento com ano fiscal
 */

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialDatepickerMetadata, DateRangeValue } from '@praxis/core';

// =============================================================================
// EXEMPLOS DE CONFIGURAÇÃO CORPORATIVA
// =============================================================================

/**
 * Configuração para relatórios financeiros trimestrais
 * Cenário: CFO precisa gerar relatórios financeiros por trimestres
 */
export const FINANCIAL_QUARTERLY_REPORT: MaterialDatepickerMetadata = {
  name: 'financialPeriod',
  label: 'Período do Relatório Financeiro',
  controlType: 'dateRange',
  description: 'Selecione o período para análise financeira corporativa',
  required: true,
  
  // Presets corporativos focados em períodos fiscais
  rangePresets: {
    enabled: true,
    displayStyle: 'buttons',
    defaultPreset: 'thisQuarter',
    presets: [
      'thisQuarter', 
      'lastQuarter', 
      'thisYear', 
      'lastYear'
    ],
    
    // Presets customizados para ano fiscal
    customPresets: [{
      label: 'Ano Fiscal Atual (2024-2025)',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      icon: 'account_balance',
      group: 'fiscal'
    }, {
      label: 'Q1 Fiscal 2024',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      icon: 'trending_up',
      group: 'fiscal'
    }]
  },
  
  // Validação para garantir períodos sensatos para finanças
  rangeValidation: {
    maxRangeDays: 365,        // Máximo 1 ano
    minRangeDays: 7,          // Mínimo 1 semana
    allowSameDate: false,     // Evitar relatórios de 1 dia
    requireBothDates: true,
    validationMessage: 'Período deve ter entre 1 semana e 1 ano para análise financeira adequada'
  },
  
  // Configuração fiscal para empresas
  fiscalYear: {
    enabled: true,
    startMonth: 4,    // Abril
    startDay: 1,
    showFiscalYear: true,
    fiscalYearFormat: 'FY {year}'
  },
  
  // Auditoria obrigatória para dados financeiros
  auditTrail: {
    enabled: true,
    trackFields: ['startDate', 'endDate', 'preset', 'user'],
    auditEndpoint: '/api/audit/financial-reports'
  },
  
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

/**
 * Configuração para analytics de vendas com múltiplas opções
 * Cenário: Equipe de vendas quer analisar performance em diferentes períodos
 */
export const SALES_ANALYTICS_PERIOD: MaterialDatepickerMetadata = {
  name: 'salesAnalyticsPeriod',
  label: 'Período de Análise de Vendas',
  controlType: 'dateRange',
  description: 'Compare performance de vendas em diferentes períodos',
  required: false,
  
  rangePresets: {
    enabled: true,
    displayStyle: 'dropdown',
    presets: [
      'today', 'yesterday', 'thisWeek', 'lastWeek',
      'thisMonth', 'lastMonth', 'last7Days', 'last30Days', 'last90Days'
    ]
  },
  
  // Comparação com período anterior para analytics
  rangeComparison: {
    enabled: true,
    showComparisonPicker: true,
    autoComparison: 'previousPeriod',
    comparisonLabel: 'Comparar com período anterior'
  },
  
  rangeValidation: {
    maxRangeDays: 730,        // Máximo 2 anos
    minRangeDays: 1,          // Mínimo 1 dia
    allowSameDate: true       // Permite análise diária
  },
  
  materialDesign: {
    appearance: 'fill',
    color: 'accent'
  }
};

/**
 * Configuração para auditoria de compliance com validação rigorosa
 * Cenário: Auditores internos precisam revisar períodos específicos
 */
export const COMPLIANCE_AUDIT_PERIOD: MaterialDatepickerMetadata = {
  name: 'auditCompliancePeriod',
  label: 'Período de Auditoria de Compliance',
  controlType: 'dateRange',
  description: 'Período para auditoria de conformidade regulatória',
  required: true,
  
  // Sem presets - auditores devem ser precisos nas datas
  rangePresets: {
    enabled: false
  },
  
  // Validação muito rigorosa para auditoria
  rangeValidation: {
    maxRangeDays: 31,         // Máximo 1 mês por auditoria
    minRangeDays: 1,          // Mínimo 1 dia
    allowSameDate: false,
    requireBothDates: true,
    validationMessage: 'Auditoria deve cobrir período entre 1 dia e 1 mês para análise efetiva'
  },
  
  // Calendário corporativo excluindo feriados
  businessCalendar: {
    businessDaysOnly: true,
    holidayProvider: 'brazil',
    workingDays: [1, 2, 3, 4, 5] // Segunda a sexta
  },
  
  // Auditoria completa para compliance
  auditTrail: {
    enabled: true,
    trackFields: ['value', 'startDate', 'endDate', 'user'],
    auditEndpoint: '/api/audit/compliance-reviews'
  },
  
  // Timezone crítico para multinacionais
  timezone: {
    enabled: true,
    defaultTimezone: 'America/Sao_Paulo',
    showTimezoneSelector: true,
    storeAsUTC: true
  },
  
  materialDesign: {
    appearance: 'outline',
    color: 'warn',
    hideRequiredMarker: false
  }
};

/**
 * Configuração para planejamento estratégico anual
 * Cenário: C-Level definindo períodos de planejamento estratégico
 */
export const STRATEGIC_PLANNING_PERIOD: MaterialDatepickerMetadata = {
  name: 'strategicPlanningPeriod',
  label: 'Período de Planejamento Estratégico',
  controlType: 'dateRange',
  description: 'Defina os períodos para iniciativas estratégicas da empresa',
  required: true,
  
  rangePresets: {
    enabled: true,
    displayStyle: 'buttons',
    presets: ['thisQuarter', 'thisYear'],
    
    // Presets específicos para planejamento estratégico
    customPresets: [{
      label: 'Planejamento 2025',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      icon: 'trending_up',
      group: 'strategic'
    }, {
      label: 'Roadmap H1 2025',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      icon: 'timeline',
      group: 'strategic'
    }, {
      label: 'Roadmap H2 2025',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      icon: 'timeline',
      group: 'strategic'
    }]
  },
  
  rangeValidation: {
    maxRangeDays: 730,        // Máximo 2 anos
    minRangeDays: 90,         // Mínimo 1 trimestre
    allowSameDate: false,
    requireBothDates: true
  },
  
  fiscalYear: {
    enabled: true,
    startMonth: 1,            // Janeiro para planejamento
    showFiscalYear: true
  },
  
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

// =============================================================================
// COMPONENTE DE EXEMPLO DE USO
// =============================================================================

@Component({
  selector: 'app-corporate-date-range-examples',
  template: `
    <div class="corporate-examples">
      <h2>Exemplos Corporativos de Date Range</h2>
      
      <!-- Formulário de exemplo -->
      <form [formGroup]="exampleForm" class="example-form">
        
        <!-- Relatório Financeiro -->
        <section class="example-section">
          <h3>📊 Relatório Financeiro Trimestral</h3>
          <pdx-material-date-range
            [metadata]="financialReportConfig"
            formControlName="financialPeriod"
            (valueChange)="onFinancialPeriodChange($event)">
          </pdx-material-date-range>
          
          @if (selectedFinancialRange) {
            <div class="range-info">
              <strong>Período selecionado:</strong>
              {{ selectedFinancialRange.startDate | date:'dd/MM/yyyy' }} - 
              {{ selectedFinancialRange.endDate | date:'dd/MM/yyyy' }}
              @if (selectedFinancialRange.preset) {
                <span class="preset-badge">({{ selectedFinancialRange.preset }})</span>
              }
            </div>
          }
        </section>
        
        <!-- Analytics de Vendas -->
        <section class="example-section">
          <h3>📈 Analytics de Vendas</h3>
          <pdx-material-date-range
            [metadata]="salesAnalyticsConfig"
            formControlName="salesPeriod">
          </pdx-material-date-range>
        </section>
        
        <!-- Auditoria de Compliance -->
        <section class="example-section">
          <h3>🔍 Auditoria de Compliance</h3>
          <pdx-material-date-range
            [metadata]="complianceAuditConfig"
            formControlName="auditPeriod">
          </pdx-material-date-range>
        </section>
        
        <!-- Planejamento Estratégico -->
        <section class="example-section">
          <h3>📅 Planejamento Estratégico</h3>
          <pdx-material-date-range
            [metadata]="strategicPlanningConfig"
            formControlName="planningPeriod">
          </pdx-material-date-range>
        </section>
        
      </form>
      
      <!-- Debug Info -->
      <div class="debug-info">
        <h4>Form Values:</h4>
        <pre>{{ exampleForm.value | json }}</pre>
        
        <h4>Form Status:</h4>
        <p>Valid: {{ exampleForm.valid }}</p>
        <p>Errors: {{ getFormErrors() | json }}</p>
      </div>
    </div>
  `,
  styles: [`
    .corporate-examples {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .example-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    
    .example-section h3 {
      margin-top: 0;
      color: #1976d2;
    }
    
    .range-info {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .preset-badge {
      background-color: #2196f3;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }
    
    .debug-info {
      margin-top: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    
    pre {
      background-color: #fff;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .example-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `]
})
export class CorporateDateRangeExamplesComponent {
  private fb = inject(FormBuilder);
  
  // Configurações dos componentes
  financialReportConfig = FINANCIAL_QUARTERLY_REPORT;
  salesAnalyticsConfig = SALES_ANALYTICS_PERIOD;
  complianceAuditConfig = COMPLIANCE_AUDIT_PERIOD;
  strategicPlanningConfig = STRATEGIC_PLANNING_PERIOD;
  
  // Estado do componente
  selectedFinancialRange: DateRangeValue | null = null;
  
  // Formulário reativo
  exampleForm: FormGroup = this.fb.group({
    financialPeriod: [null, Validators.required],
    salesPeriod: [null],
    auditPeriod: [null, Validators.required],
    planningPeriod: [null, Validators.required]
  });
  
  constructor() {
    // Observar mudanças no período financeiro
    this.exampleForm.get('financialPeriod')?.valueChanges.subscribe(value => {
      this.selectedFinancialRange = value;
    });
  }
  
  onFinancialPeriodChange(range: DateRangeValue) {
    console.log('Financial period changed:', range);
    
    // Exemplo de lógica de negócio
    if (range.preset === 'thisQuarter') {
      console.log('Quarterly report period selected');
      // Trigger quarterly report generation
    }
  }
  
  getFormErrors() {
    const errors: any = {};
    Object.keys(this.exampleForm.controls).forEach(key => {
      const control = this.exampleForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}

// =============================================================================
// UTILITÁRIOS PARA INTEGRAÇÃO
// =============================================================================

/**
 * Utilitário para converter DateRangeValue para formato de API
 */
export function formatDateRangeForAPI(range: DateRangeValue): any {
  return {
    startDate: range.startDate?.toISOString(),
    endDate: range.endDate?.toISOString(),
    preset: range.preset,
    timezone: range.timezone || 'UTC',
    durationDays: range.startDate && range.endDate 
      ? Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : null
  };
}

/**
 * Validador customizado para períodos corporativos
 */
export function validateCorporatePeriod(maxDays: number = 365) {
  return (control: any) => {
    const range: DateRangeValue = control.value;
    if (!range?.startDate || !range?.endDate) return null;
    
    const diffDays = Math.ceil(
      (range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays > maxDays) {
      return { corporatePeriodTooLong: { maxDays, actualDays: diffDays } };
    }
    
    return null;
  };
}

/**
 * Exemplos de presets customizados para diferentes indústrias
 */
export const INDUSTRY_PRESETS = {
  // Varejo
  retail: {
    blackFriday: { label: 'Black Friday 2024', startDate: '2024-11-29', endDate: '2024-12-02' },
    holiday: { label: 'Período Natalino', startDate: '2024-12-01', endDate: '2024-12-31' },
    backToSchool: { label: 'Volta às Aulas', startDate: '2024-01-15', endDate: '2024-02-15' }
  },
  
  // Financeiro
  finance: {
    q1: { label: 'Q1 2024', startDate: '2024-01-01', endDate: '2024-03-31' },
    h1: { label: 'H1 2024', startDate: '2024-01-01', endDate: '2024-06-30' },
    fiscalYear: { label: 'Ano Fiscal 2024', startDate: '2024-04-01', endDate: '2025-03-31' }
  },
  
  // Educação
  education: {
    semester1: { label: '1º Semestre', startDate: '2024-02-01', endDate: '2024-06-30' },
    semester2: { label: '2º Semestre', startDate: '2024-08-01', endDate: '2024-12-15' },
    summer: { label: 'Férias de Verão', startDate: '2024-12-16', endDate: '2025-01-31' }
  }
};