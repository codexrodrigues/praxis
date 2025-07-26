/**
 * Serviço Unificado de Configuração de Tabela
 * Gerencia configurações usando apenas a arquitetura modular V2
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  TableConfig,
  ColumnDefinition,
  createDefaultTableConfig,
  isValidTableConfig,
  cloneTableConfig,
  mergeTableConfigs
} from '../models/table-config.model';

export interface TableConfigState {
  config: TableConfig;
  isLoading: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TableConfigService {
  
  private readonly _state$: BehaviorSubject<TableConfigState>;
  public readonly state$: Observable<TableConfigState>;

  constructor() {
    // Initialize with default configuration
    this._state$ = new BehaviorSubject<TableConfigState>({
      config: createDefaultTableConfig(),
      isLoading: false
    });
    
    this.state$ = this._state$.asObservable();
  }

  /**
   * Obtém o estado atual da configuração
   */
  get currentState(): TableConfigState {
    return this._state$.value;
  }

  /**
   * Obtém a configuração atual
   */
  get currentConfig(): TableConfig {
    return this.currentState.config;
  }

  /**
   * Observable da configuração atual
   */
  get config$(): Observable<TableConfig> {
    return this.state$.pipe(
      map(state => state.config)
    );
  }

  /**
   * Carrega uma nova configuração
   */
  loadConfig(config: TableConfig): void {
    if (!isValidTableConfig(config)) {
      this.updateState({ 
        error: 'Invalid table configuration provided',
        isLoading: false 
      });
      return;
    }

    this.updateState({ 
      config: cloneTableConfig(config),
      isLoading: false,
      error: undefined 
    });
  }

  /**
   * Atualiza a configuração atual
   */
  updateConfig(configUpdate: Partial<TableConfig>): void {
    const currentConfig = this.currentConfig;
    const updatedConfig = mergeTableConfigs(currentConfig, configUpdate);
    
    this.updateState({ 
      config: updatedConfig,
      error: undefined 
    });
  }

  /**
   * Atualiza configuração de coluna específica
   */
  updateColumn(columnIndex: number, columnUpdate: Partial<ColumnDefinition>): void {
    const currentConfig = this.currentConfig;
    const updatedColumns = [...currentConfig.columns];
    
    if (columnIndex >= 0 && columnIndex < updatedColumns.length) {
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        ...columnUpdate
      };
      
      this.updateConfig({ columns: updatedColumns });
    }
  }

  /**
   * Adiciona nova coluna
   */
  addColumn(column: ColumnDefinition): void {
    const currentConfig = this.currentConfig;
    const updatedColumns = [...currentConfig.columns, column];
    
    this.updateConfig({ columns: updatedColumns });
  }

  /**
   * Remove coluna por índice
   */
  removeColumn(columnIndex: number): void {
    const currentConfig = this.currentConfig;
    const updatedColumns = currentConfig.columns.filter((_, index) => index !== columnIndex);
    
    this.updateConfig({ columns: updatedColumns });
  }

  /**
   * Reordena colunas
   */
  reorderColumns(fromIndex: number, toIndex: number): void {
    const currentConfig = this.currentConfig;
    const updatedColumns = [...currentConfig.columns];
    
    if (fromIndex >= 0 && fromIndex < updatedColumns.length && 
        toIndex >= 0 && toIndex < updatedColumns.length) {
      const [movedColumn] = updatedColumns.splice(fromIndex, 1);
      updatedColumns.splice(toIndex, 0, movedColumn);
      
      this.updateConfig({ columns: updatedColumns });
    }
  }

  /**
   * Obtém coluna por índice
   */
  getColumn(columnIndex: number): ColumnDefinition | undefined {
    const currentConfig = this.currentConfig;
    return currentConfig.columns[columnIndex];
  }

  /**
   * Obtém coluna por field
   */
  getColumnByField(field: string): ColumnDefinition | undefined {
    const currentConfig = this.currentConfig;
    return currentConfig.columns.find(col => col.field === field);
  }

  /**
   * Verifica se um recurso está habilitado
   */
  isFeatureEnabled(feature: keyof TableConfig): boolean {
    const config = this.currentConfig;
    
    switch (feature) {
      case 'behavior':
        return config.behavior !== undefined;
      case 'toolbar':
        return config.toolbar?.visible === true;
      case 'actions':
        return config.actions?.row?.enabled === true || config.actions?.bulk?.enabled === true;
      case 'export':
        return config.export?.enabled === true;
      case 'performance':
        return config.performance?.virtualization?.enabled === true || 
               (config.performance?.lazyLoading?.threshold ?? 0) > 0;
      default:
        return config[feature] !== undefined;
    }
  }

  /**
   * Obtém configuração de paginação
   */
  getPaginationConfig() {
    return this.currentConfig.behavior?.pagination;
  }

  /**
   * Obtém configuração de ordenação
   */
  getSortingConfig() {
    return this.currentConfig.behavior?.sorting;
  }

  /**
   * Obtém configuração de filtragem
   */
  getFilteringConfig() {
    return this.currentConfig.behavior?.filtering;
  }

  /**
   * Obtém configuração de seleção
   */
  getSelectionConfig() {
    return this.currentConfig.behavior?.selection;
  }

  /**
   * Obtém configuração da toolbar
   */
  getToolbarConfig() {
    return this.currentConfig.toolbar;
  }

  /**
   * Obtém configuração de ações
   */
  getActionsConfig() {
    return this.currentConfig.actions;
  }

  /**
   * Obtém configuração de aparência
   */
  getAppearanceConfig() {
    return this.currentConfig.appearance;
  }

  /**
   * Obtém configuração de mensagens
   */
  getMessagesConfig() {
    return this.currentConfig.messages;
  }

  /**
   * Obtém configuração de localização
   */
  getLocalizationConfig() {
    return this.currentConfig.localization;
  }

  /**
   * Reset para configuração padrão
   */
  resetToDefault(): void {
    this.loadConfig(createDefaultTableConfig());
  }

  /**
   * Valida a configuração atual
   */
  validateCurrentConfig(): { isValid: boolean; errors: string[] } {
    const config = this.currentConfig;
    const errors: string[] = [];

    // Validação básica
    if (!isValidTableConfig(config)) {
      errors.push('Invalid table configuration structure');
    }

    // Validação de colunas
    if (!Array.isArray(config.columns)) {
      errors.push('Columns must be an array');
    } else {
      config.columns.forEach((column, index) => {
        if (!column.field) {
          errors.push(`Column at index ${index} is missing required 'field' property`);
        }
        if (!column.header) {
          errors.push(`Column at index ${index} is missing required 'header' property`);
        }
      });
    }

    // Validação de paginação
    const pagination = config.behavior?.pagination;
    if (pagination?.enabled && pagination.pageSize <= 0) {
      errors.push('Page size must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exporta configuração como JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }

  /**
   * Importa configuração de JSON
   */
  importConfig(jsonConfig: string): { success: boolean; error?: string } {
    try {
      const config = JSON.parse(jsonConfig);
      
      if (!isValidTableConfig(config)) {
        return { success: false, error: 'Invalid configuration format' };
      }

      this.loadConfig(config);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format' 
      };
    }
  }

  /**
   * Clona a configuração atual
   */
  cloneCurrentConfig(): TableConfig {
    return cloneTableConfig(this.currentConfig);
  }

  /**
   * Atualiza o estado interno
   */
  private updateState(stateUpdate: Partial<TableConfigState>): void {
    const currentState = this.currentState;
    const newState = { ...currentState, ...stateUpdate };
    
    // Update metadata if config changed
    if (stateUpdate.config) {
      newState.config = {
        ...newState.config,
        meta: {
          ...newState.config.meta,
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    this._state$.next(newState);
  }

  /**
   * Obtém estatísticas da configuração atual
   */
  getConfigurationStats() {
    const config = this.currentConfig;
    
    return {
      totalColumns: config.columns.length,
      visibleColumns: config.columns.filter(col => col.visible !== false).length,
      sortableColumns: config.columns.filter(col => col.sortable !== false).length,
      filterableColumns: config.columns.filter(col => (col as any).filterable === true).length,
      stickyColumns: config.columns.filter(col => col.sticky).length,
      hasToolbar: config.toolbar?.visible === true,
      hasRowActions: config.actions?.row?.enabled === true,
      hasBulkActions: config.actions?.bulk?.enabled === true,
      hasPagination: config.behavior?.pagination?.enabled === true,
      hasSorting: config.behavior?.sorting?.enabled === true,
      hasFiltering: config.behavior?.filtering?.enabled === true,
      hasSelection: config.behavior?.selection?.enabled === true,
      hasExport: config.export?.enabled === true,
      hasVirtualScroll: config.performance?.virtualization?.enabled === true,
      hasLazyLoading: (config.performance?.lazyLoading?.threshold ?? 0) > 0
    };
  }
}