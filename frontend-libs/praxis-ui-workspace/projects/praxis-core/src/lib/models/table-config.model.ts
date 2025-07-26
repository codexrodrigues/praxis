// =============================================================================
// PRAXIS TABLE CONFIG - UNIFIED ARCHITECTURE
// =============================================================================

/**
 * Re-export da arquitetura unificada V2
 * Esta é agora a única interface suportada para TableConfig
 */
export * from './table-config-v2.model';

// Alias para a interface principal - sempre usa a estrutura V2
export type TableConfig = import('./table-config-v2.model').TableConfigV2;

// Re-export dos tipos principais com nomes simplificados
export type {
  TableConfigV2 as TableConfigModern,
  ColumnDefinition,
  ConfigMetadata,
  TableBehaviorConfig,
  TableAppearanceConfig,
  ToolbarConfig,
  TableActionsConfig,
  ExportConfig,
  MessagesConfig,
  LocalizationConfig,
  DataConfig,
  ThemeConfig,
  PerformanceConfig,
  PluginConfig,
  AccessibilityConfig,
  
  // Behavior sub-configs
  PaginationConfig,
  SortingConfig,
  FilteringConfig,
  SelectionConfig,
  InteractionConfig,
  ResizingConfig,
  DraggingConfig,
  
  // Appearance sub-configs
  BorderConfig,
  ElevationConfig,
  SpacingConfig,
  TypographyConfig,
  
  // Toolbar sub-configs
  ToolbarLayoutConfig,
  ToolbarSearchConfig,
  ToolbarFilterConfig,
  ToolbarSettingsConfig,
  
  // Actions sub-configs
  RowActionsConfig,
  BulkActionsConfig,
  
  // Messages sub-configs
  StateMessagesConfig,
  ActionMessagesConfig,
  ValidationMessagesConfig,
  
  // Localization sub-configs
  DateTimeLocaleConfig,
  NumberLocaleConfig,
  CurrencyLocaleConfig,
  FormattingLocaleConfig,
  
  // Export sub-configs
  GeneralExportConfig,
  CsvExportConfig,
  ExcelExportConfig,
  PdfExportConfig,
  
  // Performance sub-configs
  VirtualizationConfig,
  LazyLoadingConfig,
  
  // Accessibility sub-configs
  KeyboardAccessibilityConfig
} from './table-config-v2.model';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Cria uma configuração padrão para TableConfig
 */
export function createDefaultTableConfig(): TableConfig {
  return {
    meta: {
      version: '2.0.0',
      name: 'Default Table',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    columns: [],
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
        strategy: 'client'
      },
      sorting: {
        enabled: true,
        multiSort: false,
        strategy: 'client',
        showSortIndicators: true,
        indicatorPosition: 'end',
        allowClearSort: true
      },
      filtering: {
        enabled: true,
        strategy: 'client',
        debounceTime: 300,
        globalFilter: {
          enabled: true,
          placeholder: 'Buscar...',
          position: 'toolbar'
        },
        columnFilters: {
          enabled: false,
          defaultType: 'text',
          position: 'header'
        }
      },
      selection: {
        enabled: false,
        type: 'single',
        mode: 'checkbox',
        allowSelectAll: true,
        checkboxPosition: 'start',
        persistSelection: false,
        persistOnDataUpdate: false
      },
      interaction: {
        rowClick: {
          enabled: true,
          action: 'select'
        },
        // hoverHighlight: {
        //   enabled: true,
        //   style: 'background'
        // },
        // cellClick: {
        //   enabled: false
        // } // Property doesn't exist in InteractionConfig
      },
      resizing: {
        enabled: false,
        autoFit: false,
        persistWidths: true,
        minColumnWidth: 50,
        maxColumnWidth: 500
      },
      dragging: {
        columns: false,
        rows: false,
        showDragIndicator: false
      }
    },
    appearance: {
      density: 'comfortable',
      borders: {
        showRowBorders: true,
        showColumnBorders: false,
        showOuterBorder: true,
        style: 'solid',
        width: 1,
        color: '#e0e0e0'
      },
      elevation: {
        level: 1,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      spacing: {
        cellPadding: '8px 16px',
        headerPadding: '12px 16px',
        // verticalGap: '0px' // Property doesn't exist
      },
      typography: {
        headerFontWeight: '500',
        fontWeight: '400',
        fontSize: '14px',
        headerFontSize: '14px'
      }
    },
    toolbar: {
      visible: false,
      position: 'top'
    },
    actions: {
      row: {
        enabled: false,
        position: 'end',
        width: '120px',
        display: 'icons',
        trigger: 'hover',
        actions: []
      },
      bulk: {
        enabled: false,
        position: 'toolbar',
        actions: []
      }
    },
    export: {
      enabled: false,
      formats: ['csv', 'excel'],
      // defaultFormat: 'csv' // Property doesn't exist in ExportConfig
    },
    messages: {
      states: {
        loading: 'Carregando...',
        empty: 'Nenhum dado disponível',
        error: 'Erro ao carregar dados',
        noResults: 'Nenhum resultado encontrado',
        loadingMore: 'Carregando mais dados...'
      }
    },
    localization: {
      locale: 'pt-BR',
      direction: 'ltr'
    },
    // data: {
    //   source: 'local',
    //   strategy: 'client'
    // },
    performance: {
      virtualization: {
        enabled: false,
        itemHeight: 48,
        bufferSize: 10,
        minContainerHeight: 200,
        strategy: 'fixed'
      },
      lazyLoading: {
        threshold: 100,
        images: true,
        components: true
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
        shortcuts: true,
        tabNavigation: true,
        arrowNavigation: true,
        skipLinks: false,
        focusTrap: false
      },
      highContrast: false,
      reduceMotion: false
    }
  };
}

/**
 * Valida se uma configuração TableConfig é válida
 */
export function isValidTableConfig(config: any): config is TableConfig {
  return (
    config &&
    typeof config === 'object' &&
    Array.isArray(config.columns) &&
    (!config.meta || typeof config.meta === 'object')
  );
}

/**
 * Clona profundamente uma configuração TableConfig
 */
export function cloneTableConfig(config: TableConfig): TableConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Merge duas configurações TableConfig, priorizando a segunda
 */
export function mergeTableConfigs(base: TableConfig, override: Partial<TableConfig>): TableConfig {
  const cloned = cloneTableConfig(base);
  return {
    ...cloned,
    ...override,
    meta: {
      ...cloned.meta,
      ...override.meta,
      updatedAt: new Date().toISOString()
    },
    columns: override.columns || cloned.columns,
    behavior: override.behavior ? {
      ...cloned.behavior,
      ...override.behavior
    } : cloned.behavior,
    appearance: override.appearance ? {
      ...cloned.appearance,
      ...override.appearance
    } : cloned.appearance,
    toolbar: override.toolbar ? {
      ...cloned.toolbar,
      ...override.toolbar
    } : cloned.toolbar,
    actions: override.actions ? {
      ...cloned.actions,
      ...override.actions
    } : cloned.actions,
    messages: override.messages ? {
      ...cloned.messages,
      ...override.messages
    } : cloned.messages,
    localization: override.localization ? {
      ...cloned.localization,
      ...override.localization
    } : cloned.localization
  };
}

/**
 * Extrai apenas as configurações essenciais para compatibilidade
 */
export function getEssentialConfig(config: TableConfig): Partial<TableConfig> {
  return {
    columns: config.columns,
    behavior: {
      pagination: config.behavior?.pagination,
      sorting: config.behavior?.sorting,
      filtering: config.behavior?.filtering,
      selection: config.behavior?.selection
    },
    toolbar: config.toolbar,
    actions: config.actions,
    messages: config.messages
  };
}

// =============================================================================
// DEPRECATED EXPORTS (For gradual migration)
// =============================================================================

/**
 * @deprecated Use TableConfig instead
 */
export type LegacyTableConfig = TableConfig;

/**
 * @deprecated Use createDefaultTableConfig instead
 */
export const DEFAULT_TABLE_CONFIG = createDefaultTableConfig();