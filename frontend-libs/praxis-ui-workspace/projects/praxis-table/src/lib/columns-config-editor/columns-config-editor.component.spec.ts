import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ColumnsConfigEditorComponent } from './columns-config-editor.component';
import { TableConfig, ColumnDefinition } from '@praxis/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TableRuleEngineService } from '../integration/table-rule-engine.service';
import { FieldSchemaAdapter } from '../integration/field-schema-adapter.service';
import { FormulaDefinition } from '../visual-formula-builder/formula-types';

describe('ColumnsConfigEditorComponent', () => {
  let component: ColumnsConfigEditorComponent;
  let fixture: ComponentFixture<ColumnsConfigEditorComponent>;
  let mockTableRuleEngine: jasmine.SpyObj<TableRuleEngineService>;
  let mockFieldSchemaAdapter: jasmine.SpyObj<FieldSchemaAdapter>;

  const createMockColumn = (field: string, order: number = 0): ColumnDefinition => ({
    field,
    header: `Header ${field}`,
    visible: true,
    order,
    _isApiField: true
  });

  beforeEach(async () => {
    mockTableRuleEngine = jasmine.createSpyObj('TableRuleEngineService', ['compileConditionalStyles']);
    mockFieldSchemaAdapter = jasmine.createSpyObj('FieldSchemaAdapter', ['adaptTableConfigToFieldSchema']);
    mockFieldSchemaAdapter.adaptTableConfigToFieldSchema.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [
        ColumnsConfigEditorComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TableRuleEngineService, useValue: mockTableRuleEngine },
        { provide: FieldSchemaAdapter, useValue: mockFieldSchemaAdapter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsConfigEditorComponent);
    component = fixture.componentInstance;
    
    // Initialize with test data
    component.config = {
      columns: [
        createMockColumn('field1', 0),
        createMockColumn('field2', 1),
        createMockColumn('field3', 2)
      ]
    };
    
    fixture.detectChanges();
  });

  describe('removeColumn', () => {
    it('should handle removing selected column correctly', () => {
      // Select middle column
      component.selectColumn(1);
      expect(component.selectedColumnIndex).toBe(1);
      expect(component.selectedColumn?.field).toBe('field2');

      // Remove it
      const event = new Event('click');
      component.removeColumn(1, event);
      
      // Wait for debounced operation
      fixture.detectChanges();
      tick(150);

      // Should clear selection
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
      expect(component.columns.length).toBe(2);
      expect(component.columns[0].field).toBe('field1');
      expect(component.columns[1].field).toBe('field3');
    });

    it('should adjust selection index when removing column before selection', fakeAsync(() => {
      // Select last column
      component.selectColumn(2);
      expect(component.selectedColumnIndex).toBe(2);

      // Remove first column
      const event = new Event('click');
      component.removeColumn(0, event);
      tick(150);

      // Selection should shift down
      expect(component.selectedColumnIndex).toBe(1);
      expect(component.selectedColumn?.field).toBe('field3');
    }));

    it('should not change selection when removing column after selection', fakeAsync(() => {
      // Select first column
      component.selectColumn(0);
      
      // Remove last column
      const event = new Event('click');
      component.removeColumn(2, event);
      tick(150);

      // Selection should remain unchanged
      expect(component.selectedColumnIndex).toBe(0);
      expect(component.selectedColumn?.field).toBe('field1');
    }));

    it('should handle invalid indices gracefully', () => {
      const event = new Event('click');
      const initialLength = component.columns.length;

      // Try to remove negative index
      component.removeColumn(-1, event);
      expect(component.columns.length).toBe(initialLength);

      // Try to remove beyond array bounds
      component.removeColumn(10, event);
      expect(component.columns.length).toBe(initialLength);
    });

    it('should prevent concurrent removals', fakeAsync(() => {
      const event = new Event('click');
      
      // Start first removal
      component.removeColumn(0, event);
      
      // Try second removal immediately (should be ignored)
      component.removeColumn(1, event);
      
      tick(150);
      
      // Only first removal should succeed
      expect(component.columns.length).toBe(2);
      expect(component.columns[0].field).toBe('field2');
    }));
  });

  describe('addNewColumn', () => {
    it('should generate unique field names', fakeAsync(() => {
      // Add first calculated column
      component.addNewColumn();
      tick(150);
      
      expect(component.columns.length).toBe(4);
      expect(component.columns[3].field).toBe('calculatedField4');
      
      // Add second calculated column
      component.addNewColumn();
      tick(150);
      
      expect(component.columns.length).toBe(5);
      expect(component.columns[4].field).toBe('calculatedField5');
    }));

    it('should handle duplicate field names', fakeAsync(() => {
      // Manually add a column with specific field name
      component.columns.push({
        field: 'calculatedField4',
        header: 'Manual Column',
        visible: true,
        order: 3
      } as any);
      
      // Add new column - should skip calculatedField4
      component.addNewColumn();
      tick(150);
      
      const newColumn = component.columns[component.columns.length - 1];
      expect(newColumn.field).toBe('calculatedField5');
    }));

    it('should select newly added column', fakeAsync(() => {
      component.addNewColumn();
      tick(150);
      
      expect(component.selectedColumnIndex).toBe(3);
      expect(component.selectedColumn?.field).toBe('calculatedField4');
    }));
  });

  describe('onColumnReorder', () => {
    it('should update selected index when moving selected column', fakeAsync(() => {
      component.selectColumn(1);
      
      const event: any = {
        previousIndex: 1,
        currentIndex: 2,
        stopPropagation: () => {}
      };
      
      component.onColumnReorder(event);
      tick(150);
      
      expect(component.selectedColumnIndex).toBe(2);
      expect(component.selectedColumn?.field).toBe('field2');
    }));

    it('should handle moving column before selection', fakeAsync(() => {
      component.selectColumn(2);
      
      const event: any = {
        previousIndex: 0,
        currentIndex: 1,
        stopPropagation: () => {}
      };
      
      component.onColumnReorder(event);
      tick(150);
      
      // Selection should shift down
      expect(component.selectedColumnIndex).toBe(1);
      expect(component.selectedColumn?.field).toBe('field3');
    }));

    it('should validate reorder indices', () => {
      const event: any = {
        previousIndex: -1,
        currentIndex: 2,
        stopPropagation: () => {}
      };
      
      const initialOrder = component.columns.map(c => c.field);
      component.onColumnReorder(event);
      
      // Order should not change
      expect(component.columns.map(c => c.field)).toEqual(initialOrder);
    });

    it('should update column orders after reorder', fakeAsync(() => {
      const event: any = {
        previousIndex: 0,
        currentIndex: 2,
        stopPropagation: () => {}
      };
      
      component.onColumnReorder(event);
      tick(150);
      
      // Check orders are sequential
      component.columns.forEach((col, index) => {
        expect(col.order).toBe(index);
      });
    }));
  });

  describe('selectColumn', () => {
    it('should validate selection bounds', () => {
      // Valid selection
      component.selectColumn(1);
      expect(component.selectedColumnIndex).toBe(1);
      expect(component.selectedColumn?.field).toBe('field2');
      
      // Invalid index (too high)
      component.selectColumn(10);
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
      
      // Invalid index (too low)
      component.selectColumn(-5);
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
      
      // Clear selection
      component.selectColumn(-1);
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
    });
  });

  describe('column property changes with validation', () => {
    beforeEach(() => {
      component.selectColumn(0);
    });

    it('should validate column reference before formula change', () => {
      const formula: FormulaDefinition = { type: 'concat', params: {} };
      
      // Valid change
      component.onFormulaChange(formula);
      expect(component.selectedColumn?.calculationType).toBe('concat');
      
      // Simulate stale reference
      component.selectedColumnIndex = 10;
      component.onFormulaChange(formula);
      
      // Should reset selection
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
    });

    it('should validate column reference before expression change', () => {
      // Valid change
      component.onGeneratedExpressionChange('rowData.value * 2');
      expect(component.selectedColumn?._generatedValueGetter).toBe('rowData.value * 2');
      
      // Remove the selected column from array but keep reference
      const selectedCol = component.selectedColumn;
      component.columns = component.columns.filter(c => c !== selectedCol);
      
      // Try to change expression on removed column
      component.onGeneratedExpressionChange('rowData.value * 3');
      
      // Should reset selection
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
    });

    it('should validate column reference before mapping change', () => {
      const mapping = { '1': 'One', '2': 'Two' };
      
      // Valid change
      component.onMappingChange(mapping);
      expect(component.selectedColumn?.valueMapping).toEqual(mapping);
      
      // Simulate column removal
      component.columns = [];
      component.onMappingChange({ '3': 'Three' });
      
      // Should reset selection
      expect(component.selectedColumnIndex).toBe(-1);
      expect(component.selectedColumn).toBeNull();
    });
  });

  describe('race condition prevention', () => {
    it('should prevent concurrent column operations', fakeAsync(() => {
      // Try multiple operations rapidly
      component.addNewColumn();
      component.addNewColumn();
      component.addNewColumn();
      
      tick(50); // Less than debounce time
      
      // Should still be processing first operation
      expect(component.columns.length).toBe(3);
      
      tick(100); // Complete first operation
      
      // Now should have processed first addition
      expect(component.columns.length).toBe(4);
      
      tick(200); // Let all operations complete
      
      // All operations should complete eventually
      expect(component.columns.length).toBe(6);
    }));
  });

  describe('data integrity', () => {
    it('should emit deep cloned data to prevent external mutations', () => {
      let emittedConfig: TableConfig | undefined;
      component.configChange.subscribe(config => {
        emittedConfig = config;
      });
      
      component.selectColumn(0);
      component.onColumnPropertyChange();
      
      // Modify emitted data
      if (emittedConfig?.columns[0]) {
        emittedConfig.columns[0].field = 'mutated';
      }
      
      // Original should be unchanged
      expect(component.columns[0].field).toBe('field1');
    });

    it('should maintain column order integrity', fakeAsync(() => {
      const event = new Event('click');
      
      // Remove middle column
      component.removeColumn(1, event);
      tick(150);
      
      // Check orders are still sequential
      component.columns.forEach((col, index) => {
        expect(col.order).toBe(index);
      });
    }));
  });
});