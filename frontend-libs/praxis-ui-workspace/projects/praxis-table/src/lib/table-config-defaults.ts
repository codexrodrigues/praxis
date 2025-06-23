import { TableConfig } from '@praxis/core';

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  columns: [],
  data: [],
  showActionsColumn: true,
  gridOptions: {
    pagination: { pageSize: 5 },
    sortable: true,
    filterable: false,
    groupable: false
  },
  toolbar: {
    visible: true,
    actions: [],
    showNewButton: true,
    newButtonText: 'Novo'
  },
  exportOptions: {
    excel: false,
    pdf: false
  },
  messages: {
    empty: '',
    loading: '',
    error: ''
  },
  rowActions: []
};

export function mergeWithDefaults(config: TableConfig): TableConfig {
  const merged: TableConfig = JSON.parse(JSON.stringify(DEFAULT_TABLE_CONFIG));
  Object.assign(merged, config);
if (config.gridOptions) {
  merged.gridOptions = { ...DEFAULT_TABLE_CONFIG.gridOptions, ...config.gridOptions };
  if (config.gridOptions.pagination) {
    merged.gridOptions.pagination = {
      ...DEFAULT_TABLE_CONFIG.gridOptions!.pagination,
      ...config.gridOptions.pagination
    };
  }
}
  if (config.toolbar) {
    merged.toolbar = { ...DEFAULT_TABLE_CONFIG.toolbar, ...config.toolbar };
  }
  if (config.exportOptions) {
    merged.exportOptions = { ...DEFAULT_TABLE_CONFIG.exportOptions, ...config.exportOptions };
  }
  if (config.messages) {
    merged.messages = { ...DEFAULT_TABLE_CONFIG.messages, ...config.messages };
  }
  if (config.rowActions) {
    merged.rowActions = [...config.rowActions];
  }
  return merged;
}
