/**
 * Testes de Integração para PraxisTable com Unified Architecture
 * Verifica funcionalidade da arquitetura unificada
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PraxisTable } from '../praxis-table';
import { TableConfig, TableConfigService } from '@praxis/core';
import { GenericCrudService } from '@praxis/core';

describe('PraxisTable Unified Architecture', () => {
  let component: PraxisTable;
  let fixture: ComponentFixture<PraxisTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisTable, NoopAnimationsModule],
      providers: [
        TableConfigService,
        { provide: GenericCrudService, useValue: { configure: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTable);
    component = fixture.componentInstance;
  });

  describe('Basic Configuration Support', () => {
    it('should handle basic configuration correctly', () => {
      const config: TableConfig = {
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Nome', type: 'string' },
        ],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
        toolbar: {
          visible: true,
          position: 'top',
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.getSortingEnabled()).toBe(true);
      expect(component.getPaginationEnabled()).toBe(true);
      expect(component.getPaginationPageSize()).toBe(10);
    });
  });

  describe('Advanced Configuration Support', () => {
    it('should handle advanced configuration correctly', () => {
      const config: TableConfig = {
        meta: {
          version: '2.0.0',
          name: 'Advanced Config',
        },
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Nome', type: 'string' },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50],
            showFirstLastButtons: false,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'server',
          },
          sorting: {
            enabled: true,
            multiSort: true,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          filtering: {
            enabled: true,
            strategy: 'client',
            debounceTime: 300,
          },
        },
        appearance: {
          density: 'compact',
          borders: {
            showRowBorders: true,
            showColumnBorders: false,
            showOuterBorder: true,
            style: 'solid',
            width: 1,
            color: '#e0e0e0',
          },
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.getSortingEnabled()).toBe(true);
      expect(component.getPaginationEnabled()).toBe(true);
      expect(component.getPaginationPageSize()).toBe(25);
      expect(component.getPaginationShowFirstLast()).toBe(false);
    });
  });

  describe('Feature Detection', () => {
    it('should detect available features correctly', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: true,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
        actions: {
          bulk: { enabled: true, position: 'toolbar', actions: [] },
        },
        export: {
          enabled: true,
          formats: ['csv', 'excel'],
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.isFeatureAvailable('multiSort')).toBe(true);
      expect(component.isFeatureAvailable('bulkActions')).toBe(true);
      expect(component.isFeatureAvailable('export')).toBe(true);
    });

    it('should handle disabled features correctly', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.isFeatureAvailable('multiSort')).toBe(false);
      expect(component.isFeatureAvailable('bulkActions')).toBe(false);
      expect(component.isFeatureAvailable('export')).toBe(false);
    });
  });

  describe('Template Helpers', () => {
    it('should provide correct pagination settings', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 15,
            pageSizeOptions: [5, 15, 30],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.getPaginationEnabled()).toBe(true);
      expect(component.getPaginationPageSize()).toBe(15);
      expect(component.getPaginationPageSizeOptions()).toEqual([5, 15, 30]);
      expect(component.getPaginationShowFirstLast()).toBe(true);
    });

    it('should provide correct sorting settings', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: false,
            multiSort: true,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.getSortingEnabled()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty configuration gracefully', () => {
      component.config = { columns: [] };
      fixture.detectChanges();

      expect(component.getSortingEnabled()).toBe(true); // Default value
      expect(component.getPaginationEnabled()).toBe(true); // Default value
    });

    it('should handle undefined configuration', () => {
      component.config = null as any;
      fixture.detectChanges();

      expect(() => component.getSortingEnabled()).not.toThrow();
      expect(() => component.getPaginationEnabled()).not.toThrow();
    });
  });

  describe('Configuration Access', () => {
    it('should provide access to current configuration', () => {
      const config: TableConfig = {
        meta: { version: '2.0.0', name: 'Test' },
        columns: [{ field: 'test', header: 'Test' }],
      };

      component.config = config;
      fixture.detectChanges();

      expect(component.config).toBeTruthy();
      expect(component.config.meta?.name).toBe('Test');
      expect(component.config.columns.length).toBe(1);
    });
  });
});
