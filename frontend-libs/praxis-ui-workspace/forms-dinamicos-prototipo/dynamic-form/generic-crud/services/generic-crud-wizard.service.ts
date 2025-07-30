/**
 * Serviço especializado para integração GenericCrud com o wizard
 *
 * Fornece funcionalidades específicas para configuração de GenericCrud
 * através do wizard, incluindo templates, validações e integrações.
 */

import { Injectable } from '@angular/core';
import {
  GenericCrudTemplate,
  GENERIC_CRUD_WIZARD_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  GENERIC_CRUD_WIZARD_CONFIG
} from '../config/generic-crud-wizard-templates';

export interface CrudWizardStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  data?: any;
}

export interface CrudWizardConfiguration {
  selectedTemplate?: GenericCrudTemplate;
  basicConfig: {
    title: string;
    description?: string;
    position: {
      col: number;
      row: number;
      colSpan: number;
      rowSpan: number;
    };
  };
  crudConfig: {
    resourcePath?: string;
    resourcePathInput?: string;
    dashboardMode: boolean;
    initialMode: 'list' | 'create' | 'edit' | 'view';
    listTitle: string;
    formTitle: string;
    editMode: boolean;
  };
  integrationConfig: {
    outputActions: any[];
    inputMappings: any[];
    relatedTiles: string[];
  };
  previewData?: {
    componentInputs: Record<string, any>;
    estimatedComplexity: 'low' | 'medium' | 'high';
    integrationWarnings: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class GenericCrudWizardService {

  constructor() { }

  /**
   * === TEMPLATE MANAGEMENT ===
   */

  /**
   * Obtém todos os templates disponíveis
   */
  getAllTemplates(): GenericCrudTemplate[] {
    return GENERIC_CRUD_WIZARD_TEMPLATES;
  }

  /**
   * Obtém templates por categoria
   */
  getTemplatesByCategory(category: string): GenericCrudTemplate[] {
    return getTemplatesByCategory(category);
  }

  /**
   * Obtém template específico por ID
   */
  getTemplate(id: string): GenericCrudTemplate | undefined {
    return getTemplateById(id);
  }

  /**
   * Obtém templates recomendados baseado em contexto
   */
  getRecommendedTemplates(context?: {
    existingComponents?: string[];
    dashboardSize?: number;
    userExperience?: 'beginner' | 'intermediate' | 'advanced';
  }): GenericCrudTemplate[] {
    const templates = this.getAllTemplates();

    if (!context) {
      return templates.filter(t => t.complexity === 'basic').slice(0, 3);
    }

    // Filtrar por experiência do usuário
    let filtered = templates;
    if (context.userExperience) {
      const complexityMap = {
        'beginner': ['basic'],
        'intermediate': ['basic', 'intermediate'],
        'advanced': ['basic', 'intermediate', 'advanced']
      };
      const allowedComplexities = complexityMap[context.userExperience];
      filtered = filtered.filter(t => allowedComplexities.includes(t.complexity));
    }

    // Recomendar templates com base em componentes existentes
    if (context.existingComponents?.length) {
      const hasTable = context.existingComponents.includes('dynamicTable');
      const hasForm = context.existingComponents.includes('dynamicForm');
      const hasStepper = context.existingComponents.includes('stepper');

      if (hasTable && !hasForm) {
        // Tem tabela, recomendar integração CRUD+Tabela
        filtered = filtered.filter(t =>
          t.id === 'crud-table-integration' ||
          t.category === 'master-detail'
        );
      } else if (hasStepper) {
        // Tem stepper, recomendar integração com processo
        filtered = filtered.filter(t =>
          t.id === 'crud-form-stepper' ||
          t.category === 'integration'
        );
      }
    }

    return filtered.slice(0, 5);
  }

  /**
   * === WIZARD FLOW MANAGEMENT ===
   */

  /**
   * Inicializa nova configuração de wizard
   */
  initializeWizardConfiguration(template?: GenericCrudTemplate): CrudWizardConfiguration {
    const config: CrudWizardConfiguration = {
      basicConfig: {
        title: template?.configuration.basicConfig.title || 'Novo CRUD',
        description: template?.configuration.basicConfig.description || '',
        position: {
          col: 1,
          row: 1,
          colSpan: template?.configuration.position?.colSpan || 8,
          rowSpan: template?.configuration.position?.rowSpan || 10
        }
      },
      crudConfig: {
        dashboardMode: template?.configuration.componentInputs['dashboardMode'] ?? true,
        resourcePathInput: template?.configuration.componentInputs['resourcePathInput'] || '',
        initialMode: template?.configuration.componentInputs['initialMode'] || 'list',
        listTitle: template?.configuration.componentInputs['listTitle'] || 'Lista de Registros',
        formTitle: template?.configuration.componentInputs['formTitle'] || 'Cadastro',
        editMode: template?.configuration.componentInputs['editMode'] ?? true
      },
      integrationConfig: {
        outputActions: template?.configuration.outputActions || [],
        inputMappings: template?.configuration.inputMappings || [],
        relatedTiles: []
      }
    };

    if (template) {
      config.selectedTemplate = template;
    }

    return config;
  }

  /**
   * Obtém steps do wizard
   */
  getWizardSteps(): CrudWizardStep[] {
    return GENERIC_CRUD_WIZARD_CONFIG.steps.map((step, index) => ({
      ...step,
      isComplete: false,
      isActive: index === 0
    }));
  }

  /**
   * === VALIDATION ===
   */

  /**
   * Valida configuração do step atual
   */
  validateStep(stepId: string, configuration: CrudWizardConfiguration): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (stepId) {
      case 'basic-config':
        if (!configuration.basicConfig.title?.trim()) {
          errors.push('Título é obrigatório');
        }
        if (configuration.basicConfig.position.colSpan < 4) {
          warnings.push('ColSpan muito pequeno pode comprometer a visualização');
        }
        break;

      case 'crud-setup':
        if (configuration.crudConfig.dashboardMode) {
          if (!configuration.crudConfig.resourcePathInput?.trim()) {
            errors.push('Resource Path Input é obrigatório em modo dashboard');
          }
        } else {
          if (!configuration.crudConfig.resourcePath?.trim()) {
            errors.push('Resource Path é obrigatório em modo standalone');
          }
        }
        if (!configuration.crudConfig.listTitle?.trim()) {
          errors.push('Título da lista é obrigatório');
        }
        if (!configuration.crudConfig.formTitle?.trim()) {
          errors.push('Título do formulário é obrigatório');
        }
        break;

      case 'integration-setup':
        if (configuration.crudConfig.dashboardMode) {
          if (configuration.integrationConfig.outputActions.length === 0) {
            warnings.push('Considere adicionar output actions para melhor integração');
          }
          // Verificar se há referências TARGET_* não resolvidas
          const hasUnresolvedTargets = configuration.integrationConfig.outputActions.some(action =>
            action.actions?.some((a: any) =>
              a.targetTileId?.includes('TARGET_') ||
              a.targetTileId?.includes('SOURCE_')
            )
          );
          if (hasUnresolvedTargets) {
            warnings.push('Há referências de tiles não resolvidas (TARGET_*, SOURCE_*)');
          }
        }
        break;

      case 'preview':
        // Validação final
        const basicValidation = this.validateStep('basic-config', configuration);
        const crudValidation = this.validateStep('crud-setup', configuration);
        const integrationValidation = this.validateStep('integration-setup', configuration);

        errors.push(...basicValidation.errors, ...crudValidation.errors, ...integrationValidation.errors);
        warnings.push(...basicValidation.warnings, ...crudValidation.warnings, ...integrationValidation.warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * === CONFIGURATION GENERATION ===
   */

  /**
   * Gera configuração final do componente
   */
  generateComponentConfiguration(wizardConfig: CrudWizardConfiguration): {
    componentType: string;
    title: string;
    description?: string;
    position: any;
    componentInputs: Record<string, any>;
    outputActions?: any[];
    inputMappings?: any[];
  } {
    return {
      componentType: 'genericCrud',
      title: wizardConfig.basicConfig.title,
      description: wizardConfig.basicConfig.description,
      position: wizardConfig.basicConfig.position,
      componentInputs: {
        // Inputs baseados no modo
        ...(wizardConfig.crudConfig.dashboardMode ? {
          dashboardMode: true,
          resourcePathInput: wizardConfig.crudConfig.resourcePathInput,
        } : {
          dashboardMode: false,
          resourcePath: wizardConfig.crudConfig.resourcePath,
        }),

        // Configurações comuns
        initialMode: wizardConfig.crudConfig.initialMode,
        listTitle: wizardConfig.crudConfig.listTitle,
        formTitle: wizardConfig.crudConfig.formTitle,
        editMode: wizardConfig.crudConfig.editMode
      },
      outputActions: wizardConfig.integrationConfig.outputActions.length > 0
        ? wizardConfig.integrationConfig.outputActions
        : undefined,
      inputMappings: wizardConfig.integrationConfig.inputMappings.length > 0
        ? wizardConfig.integrationConfig.inputMappings
        : undefined
    };
  }

  /**
   * Gera preview da configuração
   */
  generatePreview(wizardConfig: CrudWizardConfiguration): {
    componentInputs: Record<string, any>;
    estimatedComplexity: 'low' | 'medium' | 'high';
    integrationWarnings: string[];
    features: string[];
    integrationPoints: string[];
  } {
    const componentInputs = this.generateComponentConfiguration(wizardConfig).componentInputs;

    // Calcular complexidade
    let complexityScore = 0;
    if (wizardConfig.crudConfig.dashboardMode) complexityScore += 1;
    if (wizardConfig.integrationConfig.outputActions.length > 2) complexityScore += 1;
    if (wizardConfig.integrationConfig.inputMappings.length > 0) complexityScore += 1;
    if (wizardConfig.selectedTemplate?.complexity === 'advanced') complexityScore += 1;

    const estimatedComplexity: 'low' | 'medium' | 'high' =
      complexityScore <= 1 ? 'low' :
      complexityScore <= 2 ? 'medium' : 'high';

    // Features baseadas na configuração
    const features: string[] = [];
    if (wizardConfig.crudConfig.dashboardMode) {
      features.push('🔗 Integração Dashboard');
    }
    if (wizardConfig.crudConfig.editMode) {
      features.push('✏️ Edição/Exclusão');
    } else {
      features.push('👁️ Somente Leitura');
    }
    if (wizardConfig.integrationConfig.outputActions.length > 0) {
      features.push('📤 Eventos de Saída');
    }
    if (wizardConfig.integrationConfig.inputMappings.length > 0) {
      features.push('📥 Mapeamentos de Entrada');
    }

    // Pontos de integração
    const integrationPoints: string[] = [];
    wizardConfig.integrationConfig.outputActions.forEach(action => {
      action.actions?.forEach((a: any) => {
        if (a.type === 'updateTile') {
          integrationPoints.push(`→ ${a.targetTileId} (${a.targetProperty})`);
        } else if (a.type === 'notify') {
          integrationPoints.push(`🔔 Notificação: ${a.message}`);
        }
      });
    });

    wizardConfig.integrationConfig.inputMappings.forEach(mapping => {
      integrationPoints.push(`← ${mapping.sourceTileId} (${mapping.sourceOutputName})`);
    });

    // Warnings de integração
    const integrationWarnings: string[] = [];
    const validation = this.validateStep('integration-setup', wizardConfig);
    integrationWarnings.push(...validation.warnings);

    return {
      componentInputs,
      estimatedComplexity,
      integrationWarnings,
      features,
      integrationPoints
    };
  }

  /**
   * === HELPER METHODS ===
   */

  /**
   * Aplica template à configuração
   */
  applyTemplate(template: GenericCrudTemplate, currentConfig: CrudWizardConfiguration): CrudWizardConfiguration {
    return {
      ...currentConfig,
      selectedTemplate: template,
      basicConfig: {
        ...currentConfig.basicConfig,
        title: template.configuration.basicConfig.title,
        description: template.configuration.basicConfig.description || currentConfig.basicConfig.description,
        position: {
          ...currentConfig.basicConfig.position,
          colSpan: template.configuration.position?.colSpan || currentConfig.basicConfig.position.colSpan,
          rowSpan: template.configuration.position?.rowSpan || currentConfig.basicConfig.position.rowSpan
        }
      },
      crudConfig: {
        ...currentConfig.crudConfig,
        ...template.configuration.componentInputs
      },
      integrationConfig: {
        ...currentConfig.integrationConfig,
        outputActions: template.configuration.outputActions || [],
        inputMappings: template.configuration.inputMappings || []
      }
    };
  }

  /**
   * Obtém sugestões de resource paths (mock - em produção viria da API)
   */
  getResourcePathSuggestions(): string[] {
    return [
      'usuarios',
      'clientes',
      'produtos',
      'pedidos',
      'fornecedores',
      'enderecs',
      'documentos',
      'categorias',
      'roles',
      'permissoes'
    ];
  }

  /**
   * Obtém tiles disponíveis para integração (mock - viria do dashboard atual)
   */
  getAvailableTiles(): Array<{id: string; title: string; type: string}> {
    // Em produção, isso viria do DynamicDashboardComponent atual
    return [
      { id: 'table-usuarios', title: 'Tabela de Usuários', type: 'dynamicTable' },
      { id: 'form-detalhes', title: 'Formulário de Detalhes', type: 'dynamicForm' },
      { id: 'analytics-vendas', title: 'Analytics de Vendas', type: 'card' },
      { id: 'stepper-processo', title: 'Processo Guiado', type: 'stepper' }
    ];
  }
}
