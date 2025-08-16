import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PraxisTable, RowActionsBehavior } from '../praxis-table';
import {
  TableConfig,
  CONFIG_STORAGE,
  ConfigStorage,
  GenericCrudService,
} from '@praxis/core';
import { SettingsPanelService } from '@praxis/settings-panel';

describe('PraxisTable row actions overflow', () => {
  let fixture: ComponentFixture<PraxisTable>;
  let component: PraxisTable;
  let crud: jasmine.SpyObj<GenericCrudService<any>>;
  let storage: jasmine.SpyObj<ConfigStorage>;
  let settingsPanel: jasmine.SpyObj<SettingsPanelService>;

  beforeEach(async () => {
    crud = jasmine.createSpyObj('GenericCrudService', [
      'configure',
      'filter',
      'getSchema',
      'delete',
      'deleteMany',
    ]);
    crud.filter.and.returnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        pageSize: 0,
      }),
    );
    crud.getSchema.and.returnValue(of([]));

    storage = jasmine.createSpyObj('ConfigStorage', [
      'loadConfig',
      'saveConfig',
      'clearConfig',
    ]);
    settingsPanel = jasmine.createSpyObj('SettingsPanelService', ['open']);

    await TestBed.configureTestingModule({
      imports: [PraxisTable, NoopAnimationsModule],
      providers: [
        { provide: GenericCrudService, useValue: crud },
        { provide: CONFIG_STORAGE, useValue: storage },
        { provide: SettingsPanelService, useValue: settingsPanel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTable);
    component = fixture.componentInstance;
  });

  function createConfig(behavior?: Partial<RowActionsBehavior>): TableConfig {
    return {
      columns: [{ field: 'id', header: 'ID' }],
      actions: {
        row: {
          enabled: true,
          actions: [
            { action: 'edit', icon: 'edit', alwaysInline: true },
            { action: 'delete', icon: 'delete' },
            { action: 'duplicate', icon: 'content_copy', priority: 1 },
            {
              action: 'view',
              icon: 'visibility',
              visible: (r: any) => r.active,
              disabled: (r: any) => r.disabled,
            },
          ],
          behavior: {
            enabled: true,
            maxInline: { xs: 1, sm: 2, md: 3, lg: 4 },
            ...behavior,
          },
        },
      },
    } as TableConfig;
  }

  it('should distribute actions between inline and overflow respecting priority and alwaysInline', () => {
    component.config = createConfig();
    spyOn<any>(component, 'getMaxInline').and.returnValue(3);
    const row = { id: 1, active: true, disabled: false };
    const inline = component.getInlineRowActions(row).map((a) => a.action);
    const overflow = component.getOverflowRowActions(row).map((a) => a.action);
    expect(inline).toEqual(['edit', 'duplicate', 'delete']);
    expect(overflow).toEqual(['view']);
    expect(component.hasOverflowRowActions(row)).toBeTrue();
  });

  it('should respect visible and disabled predicates', () => {
    component.config = createConfig();
    spyOn<any>(component, 'getMaxInline').and.returnValue(3);
    const rowInvisible = { id: 1, active: false, disabled: false };
    const rowDisabled = { id: 1, active: true, disabled: true };
    const inline = component
      .getInlineRowActions(rowInvisible)
      .map((a) => a.action);
    const overflow = component.getOverflowRowActions(rowInvisible);
    expect(inline).toEqual(['edit', 'duplicate', 'delete']);
    expect(overflow.length).toBe(0);
    expect(
      component.isActionVisible(
        component.config.actions!.row!.actions[3],
        rowInvisible,
      ),
    ).toBeFalse();
    expect(
      component.isActionDisabled(
        component.config.actions!.row!.actions[3],
        rowDisabled,
      ),
    ).toBeTrue();
  });

  it('should show all actions inline when overflow behavior disabled', () => {
    component.config = createConfig({ enabled: false });
    const row = { id: 1, active: true, disabled: false };
    const inline = component.getInlineRowActions(row).map((a) => a.action);
    const overflow = component.getOverflowRowActions(row);
    expect(inline).toEqual(['edit', 'duplicate', 'delete', 'view']);
    expect(overflow.length).toBe(0);
    expect(component.hasOverflowRowActions(row)).toBeFalse();
  });

  it('should use measured width when maxInline is auto with measure strategy', () => {
    component.config = createConfig({
      maxInline: 'auto',
      autoStrategy: 'measure',
    });
    (component as any).measuredInline = 2;
    const row = { id: 1, active: true, disabled: false };
    const inline = component.getInlineRowActions(row).map((a) => a.action);
    const overflow = component.getOverflowRowActions(row).map((a) => a.action);
    expect(inline).toEqual(['edit', 'duplicate']);
    expect(overflow).toEqual(['delete', 'view']);
  });
});
