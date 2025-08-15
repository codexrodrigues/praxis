/**
 * Testes para Configuração Unificada de Tabela
 * Verifica o gerenciamento e validação de configurações
 */

import { TestBed } from '@angular/core/testing';
import {
  TableConfig,
  TableConfigService,
  ColumnDefinition,
  isValidTableConfig,
} from '@praxis/core';

describe('Unified Table Configuration Tests', () => {
  let configService: TableConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableConfigService],
    });

    configService = TestBed.inject(TableConfigService);
  });

  describe('Configuration Validation', () => {
    it('should correctly validate valid configurations', () => {
      const validConfigs: TableConfig[] = [
        {
          columns: [{ field: 'test', header: 'Test' }],
        },
        {
          meta: { version: '2.0.0' },
          columns: [{ field: 'test', header: 'Test' }],
          behavior: {
            pagination: { enabled: true, pageSize: 10 },
          },
        },
        {
          meta: { version: '2.0.0' },
          columns: [],
          toolbar: { visible: true, position: 'top' },
          appearance: { density: 'compact' },
          messages: { states: { loading: 'Loading...' } },
        },
      ];

      validConfigs.forEach((config) => {
        expect(isValidTableConfig(config)).toBe(true);
      });
    });

    it('should handle edge cases correctly', () => {
      // Empty configuration
      expect(isValidTableConfig({ columns: [] })).toBe(true);

      // Null/undefined
      expect(isValidTableConfig(null as any)).toBe(false);
      expect(isValidTableConfig(undefined as any)).toBe(false);

      // Invalid configurations
      expect(isValidTableConfig({} as any)).toBe(false);
      expect(isValidTableConfig({ meta: {} } as any)).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should load and manage basic configuration', () => {
      const config: TableConfig = {
        columns: [
          { field: 'id', header: 'ID', type: 'number', visible: true },
          { field: 'name', header: 'Name', type: 'string', sortable: false },
        ],
      };

      configService.loadConfig(config);
      const currentConfig = configService.currentConfig;

      expect(currentConfig).toBeDefined();
      expect(currentConfig.columns).toEqual(config.columns);
    });

    it('should manage advanced configuration features', () => {
      const config: TableConfig = {
        meta: { version: '2.0.0', name: 'Advanced Table' },
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            sortable: true,
          },
          {
            field: 'name',
            header: 'Name',
            type: 'string',
            visible: true,
            filterable: true,
          },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
            showFirstLastButtons: true,
            strategy: 'client',
          },
          sorting: {
            enabled: true,
            multiSort: true,
          },
          filtering: {
            enabled: true,
          },
          selection: {
            enabled: true,
            type: 'multiple',
            mode: 'checkbox',
          },
        },
        toolbar: {
          visible: true,
          position: 'top',
          actions: [
            {
              id: 'add',
              label: 'Add',
              icon: 'add',
              type: 'button',
              action: 'add',
              position: 'start',
            },
          ],
        },
        actions: {
          row: {
            enabled: true,
            actions: [
              { id: 'edit', label: 'Edit', icon: 'edit', action: 'edit' },
              {
                id: 'delete',
                label: 'Delete',
                icon: 'delete',
                action: 'delete',
              },
            ],
          },
          bulk: {
            enabled: true,
            actions: [
              {
                id: 'deleteSelected',
                label: 'Delete Selected',
                icon: 'delete',
                action: 'deleteSelected',
              },
            ],
          },
        },
      };

      configService.loadConfig(config);
      const currentConfig = configService.currentConfig;

      expect(currentConfig.meta?.version).toBe('2.0.0');
      expect(currentConfig.behavior?.pagination?.pageSize).toBe(25);
      expect(currentConfig.behavior?.sorting?.multiSort).toBe(true);
      expect(currentConfig.toolbar?.visible).toBe(true);
      expect(currentConfig.actions?.row?.enabled).toBe(true);
    });

    it('should update configuration and columns', () => {
      const initialConfig: TableConfig = {
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Name', type: 'string' },
        ],
      };

      configService.loadConfig(initialConfig);

      // Update column
      configService.updateColumn(0, { header: 'Updated ID', width: '100px' });

      const updatedColumn = configService.getColumn(0);
      expect(updatedColumn?.header).toBe('Updated ID');
      expect(updatedColumn?.width).toBe('100px');

      // Add new column
      const newColumn: ColumnDefinition = {
        field: 'email',
        header: 'Email',
        type: 'string',
        visible: true,
      };

      configService.addColumn(newColumn);
      expect(configService.currentConfig.columns).toHaveLength(3);

      // Remove column
      configService.removeColumn(1);
      expect(configService.currentConfig.columns).toHaveLength(2);
    });

    it('should handle column reordering', () => {
      const config: TableConfig = {
        columns: [
          { field: 'first', header: 'First' },
          { field: 'second', header: 'Second' },
          { field: 'third', header: 'Third' },
        ],
      };

      configService.loadConfig(config);

      // Move first column to last position
      configService.reorderColumns(0, 2);

      const reorderedColumns = configService.currentConfig.columns;
      expect(reorderedColumns[0].field).toBe('second');
      expect(reorderedColumns[1].field).toBe('third');
      expect(reorderedColumns[2].field).toBe('first');
    });
  });

  describe('Feature Detection', () => {
    it('should correctly identify enabled features', () => {
      const config: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
        behavior: {
          pagination: { enabled: true },
          sorting: { enabled: true, multiSort: true },
          filtering: { enabled: true },
        },
        toolbar: { visible: true },
        actions: {
          row: { enabled: true, actions: [] },
          bulk: { enabled: true, actions: [] },
        },
        export: { enabled: true, formats: ['csv'] },
      };

      configService.loadConfig(config);

      expect(configService.isFeatureEnabled('behavior')).toBe(true);
      expect(configService.isFeatureEnabled('toolbar')).toBe(true);
      expect(configService.isFeatureEnabled('actions')).toBe(true);
      expect(configService.isFeatureEnabled('export')).toBe(true);

      // Test individual behavior configs
      expect(configService.getPaginationConfig()?.enabled).toBe(true);
      expect(configService.getSortingConfig()?.multiSort).toBe(true);
      expect(configService.getFilteringConfig()?.enabled).toBe(true);
    });

    it('should handle disabled features', () => {
      const config: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
        behavior: {
          pagination: { enabled: false },
        },
        toolbar: { visible: false },
      };

      configService.loadConfig(config);

      expect(configService.isFeatureEnabled('toolbar')).toBe(false);
      expect(configService.getPaginationConfig()?.enabled).toBe(false);
    });
  });

  describe('Configuration Statistics', () => {
    it('should provide accurate configuration statistics', () => {
      const config: TableConfig = {
        columns: [
          {
            field: 'id',
            header: 'ID',
            visible: true,
            sortable: true,
            sticky: true,
          },
          { field: 'name', header: 'Name', visible: true, sortable: false },
          { field: 'email', header: 'Email', visible: false },
          { field: 'status', header: 'Status', visible: true },
        ],
        behavior: {
          pagination: { enabled: true },
          sorting: { enabled: true },
          filtering: { enabled: true },
          selection: { enabled: true },
        },
        toolbar: { visible: true },
        actions: {
          row: { enabled: true, actions: [] },
          bulk: { enabled: true, actions: [] },
        },
        export: { enabled: true, formats: ['csv'] },
      };

      configService.loadConfig(config);
      const stats = configService.getConfigurationStats();

      expect(stats.totalColumns).toBe(4);
      expect(stats.visibleColumns).toBe(3);
      expect(stats.sortableColumns).toBe(1);
      expect(stats.stickyColumns).toBe(1);
      expect(stats.hasToolbar).toBe(true);
      expect(stats.hasRowActions).toBe(true);
      expect(stats.hasBulkActions).toBe(true);
      expect(stats.hasPagination).toBe(true);
      expect(stats.hasSorting).toBe(true);
      expect(stats.hasFiltering).toBe(true);
      expect(stats.hasSelection).toBe(true);
      expect(stats.hasExport).toBe(true);
    });
  });

  describe('Configuration Import/Export', () => {
    it('should export and import configuration as JSON', () => {
      const config: TableConfig = {
        meta: { version: '2.0.0', name: 'Test Export' },
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Name', type: 'string' },
        ],
        behavior: {
          pagination: { enabled: true, pageSize: 10 },
        },
      };

      configService.loadConfig(config);

      // Export configuration
      const exportedJson = configService.exportConfig();
      expect(exportedJson).toBeTruthy();

      const parsedConfig = JSON.parse(exportedJson);
      expect(parsedConfig.meta.name).toBe('Test Export');
      expect(parsedConfig.columns).toHaveLength(2);

      // Import configuration
      const importResult = configService.importConfig(exportedJson);
      expect(importResult.success).toBe(true);

      const importedConfig = configService.currentConfig;
      expect(importedConfig.meta?.name).toBe('Test Export');
      expect(importedConfig.columns).toHaveLength(2);
    });

    it('should handle invalid JSON during import', () => {
      const invalidJson = '{ invalid json }';
      const result = configService.importConfig(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate current configuration', () => {
      const validConfig: TableConfig = {
        columns: [
          { field: 'id', header: 'ID' },
          { field: 'name', header: 'Name' },
        ],
        behavior: {
          pagination: { enabled: true, pageSize: 10 },
        },
      };

      configService.loadConfig(validConfig);
      const validation = configService.validateCurrentConfig();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      // Load a configuration with missing required properties
      const invalidConfig = {
        columns: [
          { field: '', header: '' }, // Missing field and header
          { field: 'valid', header: 'Valid' },
        ],
      } as TableConfig;

      configService.loadConfig(invalidConfig);
      const validation = configService.validateCurrentConfig();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large configurations efficiently', () => {
      const largeConfig: TableConfig = {
        columns: Array.from({ length: 100 }, (_, i) => ({
          field: `field${i}`,
          header: `Header ${i}`,
          type: i % 3 === 0 ? 'number' : i % 3 === 1 ? 'string' : 'boolean',
          visible: i < 50,
          sortable: i % 2 === 0,
        })),
      };

      const startTime = performance.now();
      configService.loadConfig(largeConfig);
      const stats = configService.getConfigurationStats();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(stats.totalColumns).toBe(100);
      expect(stats.visibleColumns).toBe(50);
    });
  });
});
