/**
 * Templates de configuração específicos para GenericCrud no wizard
 * 
 * Define configurações pré-definidas que facilitam a criação de CRUDs
 * comuns através do wizard, integrando-se ao sistema de metadados.
 */

export interface GenericCrudTemplate {
  id: string;
  name: string;
  description: string;
  category: 'standalone' | 'master-detail' | 'integration';
  complexity: 'basic' | 'intermediate' | 'advanced';
  useCase: string;
  configuration: {
    basicConfig: {
      title: string;
      description?: string;
    };
    componentInputs: Record<string, any>;
    outputActions?: any[];
    inputMappings?: any[];
    position?: {
      colSpan: number;
      rowSpan: number;
    };
  };
  requiredComponents?: string[];
  integrationHints?: string[];
  nextSteps?: string[];
}

/**
 * Templates predefinidos para GenericCrud
 */
export const GENERIC_CRUD_WIZARD_TEMPLATES: GenericCrudTemplate[] = [
  // === STANDALONE TEMPLATES ===
  {
    id: 'crud-standalone-basic',
    name: 'CRUD Básico Standalone',
    description: 'Gerenciamento completo de uma entidade em componente único',
    category: 'standalone',
    complexity: 'basic',
    useCase: 'Administração simples de dados com listagem, criação, edição e exclusão',
    configuration: {
      basicConfig: {
        title: 'Gerenciamento de Registros',
        description: 'CRUD completo para gerenciar registros'
      },
      componentInputs: {
        dashboardMode: false, // Modo standalone não usa dashboard
        resourcePath: 'usuarios', // Será personalizado pelo usuário
        initialMode: 'list',
        listTitle: 'Lista de Registros',
        formTitle: 'Cadastro',
        editMode: true
      },
      position: {
        colSpan: 12,
        rowSpan: 10
      }
    },
    integrationHints: [
      'Este CRUD funciona de forma independente',
      'Usa navegação tradicional via router',
      'Ideal para páginas dedicadas ao gerenciamento de dados'
    ],
    nextSteps: [
      'Configure o resourcePath para sua API',
      'Personalize os títulos conforme sua necessidade',
      'Teste as operações CRUD'
    ]
  },

  {
    id: 'crud-dashboard-basic',
    name: 'CRUD Dashboard Básico',
    description: 'CRUD configurado para uso em dashboard com eventos',
    category: 'standalone',
    complexity: 'basic',
    useCase: 'CRUD integrado em dashboard com comunicação via eventos',
    configuration: {
      basicConfig: {
        title: 'CRUD Dashboard',
        description: 'CRUD otimizado para dashboard'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'usuarios',
        initialMode: 'list',
        listTitle: 'Lista de Registros',
        formTitle: 'Cadastro',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'notify',
              message: 'Registro criado com sucesso!',
              notificationType: 'success'
            }
          ]
        },
        {
          outputName: 'itemUpdated',
          actions: [
            {
              type: 'notify',
              message: 'Registro atualizado com sucesso!',
              notificationType: 'success'
            }
          ]
        },
        {
          outputName: 'itemDeleted',
          actions: [
            {
              type: 'notify',
              message: 'Registro excluído com sucesso!',
              notificationType: 'success'
            }
          ]
        }
      ],
      position: {
        colSpan: 8,
        rowSpan: 10
      }
    },
    integrationHints: [
      'Este CRUD emite eventos para outros componentes',
      'Use input/output mappings para integração',
      'Navegação controlada via dashboard'
    ],
    nextSteps: [
      'Configure o resourcePathInput',
      'Adicione outros componentes para integração',
      'Configure input/output mappings conforme necessário'
    ]
  },

  // === MASTER-DETAIL TEMPLATES ===
  {
    id: 'crud-master-principal',
    name: 'CRUD Master Principal',
    description: 'CRUD principal que controla componentes dependentes',
    category: 'master-detail',
    complexity: 'intermediate',
    useCase: 'Componente master que alimenta tabelas e formulários relacionados',
    configuration: {
      basicConfig: {
        title: 'Master - Lista Principal',
        description: 'Componente master que controla outros tiles'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'clientes',
        initialMode: 'list',
        listTitle: 'Lista de Clientes',
        formTitle: 'Dados do Cliente',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'itemSelected',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'TARGET_DETAIL_TILE', // Será substituído pelo usuário
              targetProperty: 'defaultFilters.clienteId',
              valuePath: 'id'
            }
          ]
        },
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'notify',
              message: 'Cliente criado com sucesso!',
              notificationType: 'success'
            }
          ]
        }
      ],
      position: {
        colSpan: 6,
        rowSpan: 12
      }
    },
    requiredComponents: ['dynamicTable', 'dynamicForm', 'tabs'],
    integrationHints: [
      'Este CRUD alimenta automaticamente componentes dependentes',
      'Seleção de item filtra tabelas relacionadas',
      'Ideal para cenários Master-Detail complexos'
    ],
    nextSteps: [
      'Adicione tabela de detalhes ao dashboard',
      'Configure input mappings na tabela detail',
      'Substitua TARGET_DETAIL_TILE pelo ID real do tile'
    ]
  },

  {
    id: 'crud-detail-dependente',
    name: 'CRUD Detail Dependente',
    description: 'CRUD que responde a seleções de um componente master',
    category: 'master-detail',
    complexity: 'intermediate',
    useCase: 'Componente detail que filtra dados baseado em seleção master',
    configuration: {
      basicConfig: {
        title: 'Detail - Dados Relacionados',
        description: 'Componente que responde a seleções master'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'enderecos',
        initialMode: 'list',
        listTitle: 'Endereços do Cliente',
        formTitle: 'Endereço',
        editMode: true
      },
      inputMappings: [
        {
          sourceTileId: 'SOURCE_MASTER_TILE', // Será substituído pelo usuário
          inputName: 'defaultFilters.clienteId',
          sourceOutputName: 'itemSelected',
          valuePath: 'id'
        }
      ],
      outputActions: [
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'notify',
              message: 'Endereço adicionado com sucesso!',
              notificationType: 'success'
            }
          ]
        }
      ],
      position: {
        colSpan: 6,
        rowSpan: 8
      }
    },
    requiredComponents: ['genericCrud'], // Requer outro CRUD como master
    integrationHints: [
      'Este CRUD filtra dados baseado em seleção master',
      'Atualiza automaticamente quando master muda',
      'Ideal para relacionamentos pai-filho'
    ],
    nextSteps: [
      'Configure SOURCE_MASTER_TILE com ID do tile master',
      'Ajuste o filtro conforme sua estrutura de dados',
      'Teste a sincronização entre master e detail'
    ]
  },

  // === INTEGRATION TEMPLATES ===
  {
    id: 'crud-table-integration',
    name: 'CRUD + Tabela Integrados',
    description: 'CRUD integrado com tabela dinâmica para exibição completa',
    category: 'integration',
    complexity: 'intermediate',
    useCase: 'CRUD para operações + Tabela para visualização otimizada',
    configuration: {
      basicConfig: {
        title: 'CRUD Principal',
        description: 'CRUD integrado com tabela'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'produtos',
        initialMode: 'list',
        listTitle: 'Gerenciar Produtos',
        formTitle: 'Dados do Produto',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'TABELA_PRODUTOS', // Será substituído
              targetProperty: 'refresh',
              valuePath: 'true'
            },
            {
              type: 'notify',
              message: 'Produto criado com sucesso!',
              notificationType: 'success'
            }
          ]
        },
        {
          outputName: 'itemUpdated',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'TABELA_PRODUTOS',
              targetProperty: 'refresh',
              valuePath: 'true'
            }
          ]
        },
        {
          outputName: 'itemDeleted',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'TABELA_PRODUTOS',
              targetProperty: 'refresh',
              valuePath: 'true'
            }
          ]
        }
      ],
      position: {
        colSpan: 4,
        rowSpan: 10
      }
    },
    requiredComponents: ['dynamicTable'],
    integrationHints: [
      'CRUD para operações, tabela para visualização',
      'Tabela se atualiza automaticamente após operações CRUD',
      'Otimizado para grandes volumes de dados'
    ],
    nextSteps: [
      'Adicione uma tabela dinâmica ao dashboard',
      'Configure a tabela com o mesmo resourcePath',
      'Substitua TABELA_PRODUTOS pelo ID real da tabela'
    ]
  },

  {
    id: 'crud-form-stepper',
    name: 'CRUD + Formulário + Stepper',
    description: 'CRUD integrado com formulário detalhado e processo guiado',
    category: 'integration',
    complexity: 'advanced',
    useCase: 'Processo complexo com múltiplas etapas e validações',
    configuration: {
      basicConfig: {
        title: 'Lista Principal',
        description: 'CRUD integrado com processo guiado'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'pedidos',
        initialMode: 'list',
        listTitle: 'Lista de Pedidos',
        formTitle: 'Dados do Pedido',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'requestCreate',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'STEPPER_PEDIDO', // Será substituído
              targetProperty: 'activeStep',
              valuePath: '0'
            }
          ]
        },
        {
          outputName: 'itemSelected',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'FORM_DETALHES',
              targetProperty: 'entityId',
              valuePath: 'id'
            }
          ]
        }
      ],
      position: {
        colSpan: 4,
        rowSpan: 12
      }
    },
    requiredComponents: ['stepper', 'dynamicForm'],
    integrationHints: [
      'CRUD lista itens, stepper guia criação/edição',
      'Formulário mostra detalhes do item selecionado',
      'Processo guiado para operações complexas'
    ],
    nextSteps: [
      'Adicione stepper para processo de criação',
      'Adicione formulário para edição detalhada',
      'Configure IDs dos tiles nos output actions'
    ]
  },

  // === DOMAIN-SPECIFIC TEMPLATES ===
  {
    id: 'crud-usuarios-sistema',
    name: 'Gestão de Usuários',
    description: 'CRUD específico para administração de usuários do sistema',
    category: 'standalone',
    complexity: 'basic',
    useCase: 'Administração de usuários com perfis e permissões',
    configuration: {
      basicConfig: {
        title: 'Gestão de Usuários',
        description: 'Administração completa de usuários'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'usuarios',
        initialMode: 'list',
        listTitle: 'Usuários do Sistema',
        formTitle: 'Dados do Usuário',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'notify',
              message: 'Usuário criado com sucesso! Email de boas-vindas enviado.',
              notificationType: 'success'
            }
          ]
        },
        {
          outputName: 'itemDeleted',
          actions: [
            {
              type: 'notify',
              message: 'Usuário removido do sistema.',
              notificationType: 'warning'
            }
          ]
        }
      ],
      position: {
        colSpan: 10,
        rowSpan: 12
      }
    },
    integrationHints: [
      'Otimizado para gestão de usuários',
      'Notificações específicas para ações de usuário',
      'Ideal para painéis administrativos'
    ],
    nextSteps: [
      'Configure permissões de acesso',
      'Integre com sistema de autenticação',
      'Adicione validações específicas de usuário'
    ]
  },

  {
    id: 'crud-produtos-ecommerce',
    name: 'Catálogo de Produtos',
    description: 'CRUD para gerenciamento de produtos em e-commerce',
    category: 'integration',
    complexity: 'intermediate',
    useCase: 'Gestão completa de produtos com categorias e estoque',
    configuration: {
      basicConfig: {
        title: 'Catálogo de Produtos',
        description: 'Gerenciamento de produtos e estoque'
      },
      componentInputs: {
        dashboardMode: true,
        resourcePathInput: 'produtos',
        initialMode: 'list',
        listTitle: 'Catálogo de Produtos',
        formTitle: 'Dados do Produto',
        editMode: true
      },
      outputActions: [
        {
          outputName: 'itemCreated',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'ANALYTICS_PRODUTOS',
              targetProperty: 'refresh',
              valuePath: 'true'
            },
            {
              type: 'notify',
              message: 'Produto adicionado ao catálogo!',
              notificationType: 'success'
            }
          ]
        },
        {
          outputName: 'itemSelected',
          actions: [
            {
              type: 'updateTile',
              targetTileId: 'DETALHES_PRODUTO',
              targetProperty: 'productData',
              valuePath: '$event'
            }
          ]
        }
      ],
      position: {
        colSpan: 6,
        rowSpan: 10
      }
    },
    requiredComponents: ['card', 'dynamicTable'],
    integrationHints: [
      'Otimizado para e-commerce',
      'Integra com analytics de produtos',
      'Ideal para gestão de catálogo'
    ],
    nextSteps: [
      'Adicione cards de analytics',
      'Configure gestão de categorias',
      'Integre com sistema de estoque'
    ]
  }
];

/**
 * Função para obter templates por categoria
 */
export function getTemplatesByCategory(category: string): GenericCrudTemplate[] {
  return GENERIC_CRUD_WIZARD_TEMPLATES.filter(template => template.category === category);
}

/**
 * Função para obter template por ID
 */
export function getTemplateById(id: string): GenericCrudTemplate | undefined {
  return GENERIC_CRUD_WIZARD_TEMPLATES.find(template => template.id === id);
}

/**
 * Função para obter templates por complexidade
 */
export function getTemplatesByComplexity(complexity: string): GenericCrudTemplate[] {
  return GENERIC_CRUD_WIZARD_TEMPLATES.filter(template => template.complexity === complexity);
}

/**
 * Configurações de wizard específicas para GenericCrud
 */
export const GENERIC_CRUD_WIZARD_CONFIG = {
  // Steps customizados para GenericCrud
  steps: [
    {
      id: 'template-selection',
      title: 'Escolher Template',
      description: 'Selecione um template pré-configurado para seu caso de uso',
      optional: true
    },
    {
      id: 'basic-config',
      title: 'Configuração Básica',
      description: 'Título, posição e configurações gerais do tile'
    },
    {
      id: 'crud-setup',
      title: 'Configuração CRUD',
      description: 'Resource path, modo inicial e configurações específicas'
    },
    {
      id: 'integration-setup',
      title: 'Integração',
      description: 'Input/Output mappings e integrações com outros componentes'
    },
    {
      id: 'preview',
      title: 'Preview',
      description: 'Revisar configuração antes de criar o componente'
    }
  ],

  // Validações específicas para GenericCrud
  validation: {
    requiredFields: ['resourcePathInput', 'initialMode'],
    conditionalValidation: {
      dashboardMode: {
        true: ['resourcePathInput'],
        false: ['resourcePath']
      }
    }
  },

  // Hints contextuais
  hints: {
    dashboardMode: 'Ative para integração com outros componentes do dashboard',
    resourcePathInput: 'Caminho da API que fornece os dados (ex: usuarios, produtos)',
    initialMode: 'Modo inicial: list (listagem), create (novo), edit (editar), view (visualizar)',
    integration: 'Configure input/output mappings para comunicação entre tiles'
  }
};