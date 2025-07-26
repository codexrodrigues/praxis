/**
 * Exemplos de Uso da Nova Arquitetura TableConfig V2
 * Demonstra como usar as novas interfaces modulares
 */

import { 
  TableConfigV2, 
  PaginationConfig, 
  SortingConfig, 
  FilteringConfig,
  SelectionConfig,
  TableAppearanceConfig,
  ToolbarConfig,
  TableActionsConfig,
  ExportConfig,
  MessagesConfig
} from '../models/table-config-v2.model';

import { TableConfigService } from '../services/table-config.service';
import { ColumnDefinition } from '../models/table-config.model';

// =============================================================================
// EXEMPLO 1: CONFIGURAÇÃO BÁSICA DE TABELA
// =============================================================================

export function createBasicTableConfig(): TableConfigV2 {
  const columns: ColumnDefinition[] = [
    {
      field: 'id',
      header: 'ID',
      type: 'number',
      width: '80px',
      sortable: true
    },
    {
      field: 'name',
      header: 'Nome',
      type: 'string',
      sortable: true
    },
    {
      field: 'email',
      header: 'E-mail',
      type: 'string',
      sortable: true
    },
    {
      field: 'status',
      header: 'Status',
      type: 'string',
      valueMapping: {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'pending': 'Pendente'
      }
    },
    {
      field: 'createdAt',
      header: 'Data de Criação',
      type: 'date',
      format: 'dd/MM/yyyy',
      sortable: true
    }
  ];

  return {
    meta: {
      version: '2.0.0',
      name: 'Tabela Básica de Usuários',
      description: 'Configuração básica para listagem de usuários'
    },
    columns,
    behavior: {
      pagination: {
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 25, 50],
        showFirstLastButtons: true,
        showPageNumbers: true,
        showPageInfo: true,
        position: 'bottom',
        style: 'default',
        strategy: 'server'
      },
      sorting: {
        enabled: true,
        defaultSort: { column: 'name', direction: 'asc' },
        multiSort: false,
        strategy: 'server',
        showSortIndicators: true,
        indicatorPosition: 'end',
        allowClearSort: true
      },
      filtering: {
        enabled: true,
        globalFilter: {
          enabled: true,
          placeholder: 'Buscar usuários...',
          position: 'toolbar',
          caseSensitive: false,
          allowRegex: false
        },
        strategy: 'server',
        debounceTime: 300
      }
    },
    appearance: {
      density: 'comfortable',
      borders: {
        showRowBorders: true,
        showColumnBorders: false,
        showOuterBorder: true,
        style: 'solid',
        width: 1
      }
    },
    toolbar: {
      visible: true,
      position: 'top',
      title: 'Gerenciar Usuários',
      actions: [
        {
          id: 'add-user',
          label: 'Novo Usuário',
          icon: 'add',
          type: 'button',
          color: 'primary',
          action: 'openAddUserDialog',
          position: 'end',
          order: 1
        }
      ],
      search: {
        enabled: true,
        placeholder: 'Buscar...',
        position: 'center',
        realtime: true,
        delay: 300
      }
    }
  };
}

// =============================================================================
// EXEMPLO 2: CONFIGURAÇÃO AVANÇADA COM TODAS AS FUNCIONALIDADES
// =============================================================================

export function createAdvancedTableConfig(): TableConfigV2 {
  return {
    meta: {
      version: '2.0.0',
      name: 'Tabela Avançada de Produtos',
      description: 'Configuração completa com todas as funcionalidades disponíveis',
      tags: ['produtos', 'e-commerce', 'avançado']
    },
    columns: [
      {
        field: 'id',
        header: 'ID',
        type: 'number',
        width: '80px',
        sticky: 'start'
      },
      {
        field: 'image',
        header: 'Imagem',
        type: 'custom',
        width: '100px',
        sortable: false
      },
      {
        field: 'name',
        header: 'Nome do Produto',
        type: 'string',
        width: '200px'
      },
      {
        field: 'category',
        header: 'Categoria',
        type: 'string',
        valueMapping: {
          'electronics': 'Eletrônicos',
          'clothing': 'Roupas',
          'books': 'Livros',
          'home': 'Casa e Jardim'
        }
      },
      {
        field: 'price',
        header: 'Preço',
        type: 'currency',
        format: 'R$ #,##0.00',
        align: 'right'
      },
      {
        field: 'stock',
        header: 'Estoque',
        type: 'number',
        align: 'center',
        cellStyleCondition: {
          'color': (rowData, cellValue) => cellValue < 10 ? 'red' : cellValue < 50 ? 'orange' : 'green'
        }
      },
      {
        field: 'discount',
        header: 'Desconto',
        type: 'percentage',
        format: '#0.0%'
      },
      {
        field: 'isActive',
        header: 'Ativo',
        type: 'boolean',
        valueMapping: {
          'true': 'Sim',
          'false': 'Não'
        }
      },
      {
        field: 'createdAt',
        header: 'Criado em',
        type: 'date',
        format: 'dd/MM/yyyy HH:mm'
      }
    ],
    behavior: {
      pagination: {
        enabled: true,
        pageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
        showFirstLastButtons: true,
        showPageNumbers: true,
        showPageInfo: true,
        position: 'both',
        style: 'advanced',
        strategy: 'server',
        advanced: {
          showJumpToPage: true,
          allowCustomPageSize: true,
          maxPageSize: 500
        }
      },
      sorting: {
        enabled: true,
        defaultSort: { column: 'name', direction: 'asc' },
        multiSort: true,
        strategy: 'server',
        showSortIndicators: true,
        indicatorPosition: 'end',
        allowClearSort: true
      },
      filtering: {
        enabled: true,
        globalFilter: {
          enabled: true,
          placeholder: 'Buscar produtos...',
          position: 'toolbar',
          searchableColumns: ['name', 'category', 'description'],
          caseSensitive: false,
          allowRegex: true
        },
        columnFilters: {
          enabled: true,
          defaultType: 'text',
          position: 'header'
        },
        advancedFilters: {
          enabled: true,
          queryBuilder: true,
          savePresets: true
        },
        strategy: 'server',
        debounceTime: 500
      },
      selection: {
        enabled: true,
        type: 'multiple',
        mode: 'checkbox',
        allowSelectAll: true,
        checkboxPosition: 'start',
        persistSelection: true,
        persistOnDataUpdate: false,
        maxSelections: 100,
        visual: {
          highlightSelected: true,
          highlightColor: '#e3f2fd',
          showSelectionCount: true
        }
      },
      interaction: {
        rowClick: {
          enabled: true,
          action: 'view',
          customAction: 'openProductDetails'
        },
        rowDoubleClick: {
          enabled: true,
          action: 'edit'
        },
        hover: {
          enabled: true,
          highlightRow: true,
          showActionsOnHover: true
        },
        keyboard: {
          enabled: true,
          arrowNavigation: true,
          spaceSelection: true,
          customShortcuts: {
            'Ctrl+A': 'selectAll',
            'Delete': 'deleteSelected',
            'F2': 'editSelected'
          }
        }
      },
      loading: {
        type: 'skeleton',
        position: 'replace',
        showForQuickOperations: false,
        delay: 100,
        skeleton: {
          rows: 10,
          animated: true
        }
      },
      emptyState: {
        message: 'Nenhum produto encontrado',
        icon: 'inventory_2',
        actions: [
          {
            label: 'Adicionar Produto',
            action: 'openAddProduct',
            icon: 'add',
            primary: true
          },
          {
            label: 'Importar Produtos',
            action: 'openImportDialog',
            icon: 'upload'
          }
        ],
        contexts: {
          filtered: {
            message: 'Nenhum produto corresponde aos filtros aplicados',
            actions: [
              {
                label: 'Limpar Filtros',
                action: 'clearFilters',
                icon: 'clear'
              }
            ]
          }
        }
      },
      virtualization: {
        enabled: true,
        itemHeight: 60,
        bufferSize: 10,
        minContainerHeight: 400,
        strategy: 'dynamic'
      },
      resizing: {
        enabled: true,
        minColumnWidth: 80,
        maxColumnWidth: 500,
        autoFit: false,
        persistWidths: true
      },
      dragging: {
        columns: true,
        rows: false,
        showDragIndicator: true
      }
    },
    appearance: {
      density: 'comfortable',
      borders: {
        showRowBorders: true,
        showColumnBorders: true,
        showOuterBorder: true,
        style: 'solid',
        width: 1,
        color: '#e0e0e0'
      },
      colors: {
        background: '#ffffff',
        headerBackground: '#f5f5f5',
        alternateRowBackground: '#fafafa',
        hoverBackground: '#f0f0f0',
        selectedBackground: '#e3f2fd',
        textColor: '#333333',
        headerTextColor: '#555555'
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        fontSize: '14px',
        headerFontSize: '14px',
        fontWeight: '400',
        headerFontWeight: '500'
      },
      animations: {
        enabled: true,
        duration: 250,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        specific: {
          loading: true,
          hover: true,
          selection: true,
          sorting: true
        }
      },
      responsive: {
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200
        },
        mobile: {
          horizontalScroll: true,
          collapseColumns: true,
          priorityColumns: ['name', 'price', 'stock'],
          cardMode: false
        },
        autoAdjust: {
          hideColumns: true,
          scaleFontSize: true,
          adjustPadding: true
        }
      },
      elevation: {
        level: 2,
        hoverElevation: 4
      }
    },
    toolbar: {
      visible: true,
      position: 'top',
      title: 'Gerenciar Produtos',
      subtitle: 'Catálogo completo de produtos',
      layout: {
        alignment: 'space-between',
        height: 64,
        showSeparator: true,
        backgroundColor: '#f8f9fa'
      },
      actions: [
        {
          id: 'add-product',
          label: 'Novo Produto',
          icon: 'add',
          type: 'button',
          color: 'primary',
          action: 'openAddProduct',
          position: 'end',
          order: 1,
          shortcut: 'Ctrl+N'
        },
        {
          id: 'import-products',
          label: 'Importar',
          icon: 'upload',
          type: 'button',
          action: 'openImportDialog',
          position: 'end',
          order: 2
        },
        {
          id: 'export-menu',
          label: 'Exportar',
          icon: 'download',
          type: 'menu',
          position: 'end',
          order: 3,
          children: [
            {
              id: 'export-excel',
              label: 'Excel',
              icon: 'table_chart',
              action: 'exportExcel'
            },
            {
              id: 'export-pdf',
              label: 'PDF',
              icon: 'picture_as_pdf',
              action: 'exportPdf'
            }
          ]
        }
      ],
      search: {
        enabled: true,
        placeholder: 'Buscar produtos...',
        position: 'center',
        width: '300px',
        realtime: true,
        delay: 300
      },
      filters: {
        enabled: true,
        quickFilters: [
          {
            id: 'active-only',
            label: 'Apenas Ativos',
            filter: { isActive: true },
            icon: 'visibility'
          },
          {
            id: 'low-stock',
            label: 'Estoque Baixo',
            filter: { stock: { $lt: 10 } },
            icon: 'warning'
          }
        ],
        showAdvancedButton: true
      },
      settingsMenu: {
        enabled: true,
        options: [
          {
            id: 'density',
            label: 'Densidade',
            type: 'select',
            value: 'comfortable',
            options: [
              { value: 'compact', label: 'Compacta' },
              { value: 'comfortable', label: 'Confortável' },
              { value: 'spacious', label: 'Espaçosa' }
            ]
          },
          {
            id: 'show-borders',
            label: 'Mostrar Bordas',
            type: 'toggle',
            value: true
          },
          {
            id: 'reset-columns',
            label: 'Resetar Colunas',
            type: 'action'
          }
        ]
      }
    },
    actions: {
      row: {
        enabled: true,
        position: 'end',
        width: '120px',
        actions: [
          {
            id: 'view',
            label: 'Visualizar',
            icon: 'visibility',
            action: 'viewProduct',
            tooltip: 'Ver detalhes do produto'
          },
          {
            id: 'edit',
            label: 'Editar',
            icon: 'edit',
            action: 'editProduct',
            tooltip: 'Editar produto'
          },
          {
            id: 'delete',
            label: 'Excluir',
            icon: 'delete',
            color: 'warn',
            action: 'deleteProduct',
            tooltip: 'Excluir produto',
            requiresConfirmation: true,
            separator: true
          }
        ],
        display: 'menu',
        trigger: 'always',
        maxVisibleActions: 2
      },
      bulk: {
        enabled: true,
        position: 'toolbar',
        actions: [
          {
            id: 'bulk-delete',
            label: 'Excluir Selecionados',
            icon: 'delete',
            color: 'warn',
            action: 'bulkDelete',
            requiresConfirmation: true,
            minSelections: 1
          },
          {
            id: 'bulk-activate',
            label: 'Ativar Selecionados',
            icon: 'visibility',
            action: 'bulkActivate',
            minSelections: 1
          },
          {
            id: 'bulk-export',
            label: 'Exportar Selecionados',
            icon: 'download',
            action: 'bulkExport',
            minSelections: 1,
            maxSelections: 1000
          }
        ]
      },
      context: {
        enabled: true,
        trigger: 'right-click',
        actions: [
          {
            id: 'copy-id',
            label: 'Copiar ID',
            icon: 'content_copy',
            action: 'copyProductId'
          },
          {
            id: 'duplicate',
            label: 'Duplicar',
            icon: 'content_copy',
            action: 'duplicateProduct'
          },
          {
            id: 'view-history',
            label: 'Ver Histórico',
            icon: 'history',
            action: 'viewProductHistory',
            separator: true
          }
        ]
      },
      confirmations: {
        default: {
          title: 'Confirmar Ação',
          message: 'Tem certeza que deseja realizar esta ação?',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar'
        },
        specific: {
          'deleteProduct': {
            title: 'Excluir Produto',
            message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar'
          },
          'bulkDelete': {
            title: 'Excluir Produtos',
            message: 'Tem certeza que deseja excluir os produtos selecionados? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir Todos',
            cancelText: 'Cancelar'
          }
        }
      }
    },
    export: {
      enabled: true,
      formats: ['excel', 'pdf', 'csv', 'json'],
      general: {
        includeHeaders: true,
        respectFilters: true,
        selectedRowsOnly: false,
        maxRows: 50000,
        defaultFileName: 'produtos-export',
        includeColumns: 'visible',
        applyFormatting: true
      },
      excel: {
        sheetName: 'Produtos',
        includeFormulas: false,
        freezeHeaders: true,
        autoFitColumns: true,
        styling: {
          headerStyle: {
            backgroundColor: '#4CAF50',
            fontColor: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 12
          },
          alternateRows: {
            enabled: true,
            color: '#f5f5f5'
          }
        },
        multipleSheets: false
      },
      pdf: {
        orientation: 'landscape',
        pageSize: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        header: 'Relatório de Produtos',
        footer: 'Gerado em {{date}}',
        autoPageBreak: true
      },
      csv: {
        delimiter: ';',
        escapeChar: '"',
        encoding: 'utf-8',
        includeBOM: true
      },
      templates: [
        {
          id: 'product-summary',
          name: 'Resumo de Produtos',
          description: 'Relatório resumido com informações essenciais',
          format: 'excel',
          config: {
            includeColumns: ['name', 'category', 'price', 'stock'],
            sheetName: 'Resumo'
          }
        }
      ]
    },
    messages: {
      states: {
        loading: 'Carregando produtos...',
        empty: 'Nenhum produto cadastrado',
        error: 'Erro ao carregar produtos',
        noResults: 'Nenhum produto encontrado',
        loadingMore: 'Carregando mais produtos...',
        dynamic: {
          loadingWithCount: (count) => `Carregando ${count} produtos...`,
          emptyWithFilter: (filterCount) => `Nenhum produto encontrado com ${filterCount} filtro(s) aplicado(s)`,
          searchResults: (resultCount, searchTerm) => `${resultCount} produto(s) encontrado(s) para "${searchTerm}"`
        }
      },
      actions: {
        confirmations: {
          delete: 'Tem certeza que deseja excluir este produto?',
          deleteMultiple: 'Tem certeza que deseja excluir os produtos selecionados?',
          save: 'Deseja salvar as alterações?',
          cancel: 'Deseja cancelar as alterações?',
          export: 'Deseja exportar os dados selecionados?'
        },
        success: {
          save: 'Produto salvo com sucesso!',
          delete: 'Produto excluído com sucesso!',
          export: 'Exportação concluída com sucesso!',
          import: 'Importação concluída com sucesso!'
        },
        errors: {
          save: 'Erro ao salvar produto',
          delete: 'Erro ao excluir produto',
          export: 'Erro na exportação',
          network: 'Erro de conexão',
          permission: 'Sem permissão para esta ação'
        }
      },
      validation: {
        required: 'Este campo é obrigatório',
        invalid: 'Valor inválido',
        tooLong: 'Valor muito longo',
        tooShort: 'Valor muito curto',
        types: {
          email: 'E-mail inválido',
          url: 'URL inválida',
          number: 'Deve ser um número',
          date: 'Data inválida'
        }
      },
      export: {
        starting: 'Iniciando exportação...',
        processing: 'Processando dados...',
        ready: 'Exportação concluída! Clique para baixar.',
        error: 'Erro na exportação'
      }
    },
    localization: {
      locale: 'pt-BR',
      direction: 'ltr',
      dateTime: {
        dateFormat: 'dd/MM/yyyy',
        timeFormat: 'HH:mm:ss',
        dateTimeFormat: 'dd/MM/yyyy HH:mm:ss',
        firstDayOfWeek: 0,
        relativeTime: true
      },
      number: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        defaultPrecision: 2,
        negativeSign: '-',
        negativeSignPosition: 'before'
      },
      currency: {
        code: 'BRL',
        symbol: 'R$',
        position: 'before',
        spacing: true,
        precision: 2
      },
      formatting: {
        percentageFormat: '#0.00%',
        fileSizeFormat: 'binary'
      }
    },
    performance: {
      virtualization: {
        enabled: true,
        itemHeight: 60,
        bufferSize: 10,
        minContainerHeight: 400,
        strategy: 'dynamic'
      },
      debounce: {
        search: 300,
        filter: 500,
        resize: 100,
        scroll: 16
      },
      memory: {
        maxRows: 10000,
        autoCleanup: true,
        cleanupInterval: 300000
      },
      rendering: {
        useRAF: true,
        batchUpdates: true,
        batchSize: 50,
        optimizeReRenders: true
      },
      lazyLoading: {
        images: true,
        components: true,
        threshold: 200
      }
    },
    accessibility: {
      enabled: true,
      announcements: {
        dataChanges: true,
        userActions: true,
        loadingStates: true,
        liveRegion: 'polite'
      },
      keyboard: {
        tabNavigation: true,
        arrowNavigation: true,
        shortcuts: true,
        skipLinks: true,
        focusTrap: true
      },
      ariaLabels: {
        table: 'Tabela de produtos',
        pagination: 'Navegação de páginas',
        sorting: 'Ordenar por {{column}}',
        filter: 'Filtrar {{column}}',
        selection: 'Selecionar linha',
        actions: 'Ações disponíveis'
      }
    }
  };
}

// =============================================================================
// EXEMPLO 3: USO DO SERVIÇO DE CONFIGURAÇÃO
// =============================================================================

export class TableConfigUsageExample {
  
  constructor(private configService: TableConfigService) {}

  /**
   * Exemplo de carregamento de configuração V1 (migração automática)
   */
  async loadLegacyConfig() {
    const legacyConfig = {
      columns: [
        { field: 'id', header: 'ID' },
        { field: 'name', header: 'Nome' }
      ],
      gridOptions: {
        sortable: true,
        pagination: {
          pageSize: 10,
          pageSizeOptions: [5, 10, 25]
        }
      },
      toolbar: {
        visible: true
      }
    };

    // Carrega e migra automaticamente para V2
    const migrationResult = await this.configService.loadConfig(legacyConfig).toPromise();
    
    if (migrationResult?.success) {
      console.log('Configuração migrada com sucesso:', migrationResult.config);
      if (migrationResult.warnings?.length) {
        console.warn('Avisos da migração:', migrationResult.warnings);
      }
    } else {
      console.error('Erro na migração:', migrationResult?.errors);
    }
  }

  /**
   * Exemplo de criação de configuração V2
   */
  createNewConfig() {
    const newConfig = createAdvancedTableConfig();
    
    // Carregar nova configuração
    this.configService.loadConfig(newConfig).subscribe(result => {
      if (result.success) {
        console.log('Configuração V2 carregada:', result.config);
      }
    });
  }

  /**
   * Exemplo de atualização de configuração
   */
  updateConfiguration() {
    // Atualizar apenas parte da configuração
    this.configService.updateConfig({
      behavior: {
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageNumbers: false
        }
      },
      appearance: {
        density: 'compact'
      }
    });
  }

  /**
   * Exemplo de validação
   */
  validateConfig() {
    const validation = this.configService.validateCurrentConfig();
    
    if (!validation.isValid) {
      console.error('Configuração inválida:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Avisos de configuração:', validation.warnings);
    }
  }

  /**
   * Exemplo de comparação de configurações
   */
  compareConfigurations() {
    const config1 = createBasicTableConfig();
    const config2 = createAdvancedTableConfig();
    
    const comparison = this.configService.compareConfigs(config1, config2);
    
    if (!comparison.areEqual) {
      console.log('Configurações são diferentes:', comparison.differences);
    }
  }

  /**
   * Exemplo de export para V1 (backward compatibility)
   */
  exportForLegacySystem() {
    const v1Config = this.configService.exportAsV1();
    console.log('Configuração em formato V1:', v1Config);
  }
}

// =============================================================================
// EXEMPLO 4: TEMPLATES DE CONFIGURAÇÃO
// =============================================================================

export const TABLE_CONFIG_TEMPLATES = {
  
  /**
   * Template para listagem simples
   */
  SIMPLE_LIST: {
    meta: {
      version: '2.0.0',
      name: 'Lista Simples',
      description: 'Template para listagens básicas sem funcionalidades avançadas',
      isTemplate: true
    },
    behavior: {
      pagination: {
        enabled: true,
        pageSize: 10,
        strategy: 'client'
      },
      sorting: {
        enabled: true,
        multiSort: false,
        strategy: 'client'
      },
      filtering: {
        enabled: false
      }
    },
    appearance: {
      density: 'comfortable',
      borders: {
        showRowBorders: true,
        showColumnBorders: false,
        showOuterBorder: false
      }
    },
    toolbar: {
      visible: false
    }
  } as Partial<TableConfigV2>,

  /**
   * Template para dashboards
   */
  DASHBOARD: {
    meta: {
      version: '2.0.0',
      name: 'Dashboard',
      description: 'Template otimizado para exibição em dashboards',
      isTemplate: true
    },
    behavior: {
      pagination: {
        enabled: false
      },
      sorting: {
        enabled: false
      },
      filtering: {
        enabled: false
      }
    },
    appearance: {
      density: 'compact',
      borders: {
        showRowBorders: false,
        showColumnBorders: false,
        showOuterBorder: false
      },
      elevation: {
        level: 0
      }
    },
    toolbar: {
      visible: false
    }
  } as Partial<TableConfigV2>,

  /**
   * Template para administração
   */
  ADMIN_PANEL: {
    meta: {
      version: '2.0.0',
      name: 'Painel Administrativo',
      description: 'Template com todas as funcionalidades para painéis admin',
      isTemplate: true
    },
    behavior: {
      pagination: {
        enabled: true,
        pageSize: 25,
        showPageNumbers: true,
        showPageInfo: true,
        strategy: 'server'
      },
      sorting: {
        enabled: true,
        multiSort: true,
        strategy: 'server'
      },
      filtering: {
        enabled: true,
        globalFilter: {
          enabled: true,
          position: 'toolbar'
        },
        columnFilters: {
          enabled: true,
          position: 'header'
        },
        advancedFilters: {
          enabled: true,
          queryBuilder: true
        }
      },
      selection: {
        enabled: true,
        type: 'multiple',
        mode: 'checkbox'
      }
    },
    toolbar: {
      visible: true,
      position: 'top'
    },
    actions: {
      row: {
        enabled: true,
        display: 'menu'
      },
      bulk: {
        enabled: true,
        position: 'toolbar'
      }
    },
    export: {
      enabled: true,
      formats: ['excel', 'csv', 'pdf']
    }
  } as Partial<TableConfigV2>
};