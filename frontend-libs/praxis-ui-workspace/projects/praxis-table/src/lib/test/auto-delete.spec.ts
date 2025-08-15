import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PraxisTable } from '../praxis-table';
import {
  TableConfig,
  CONFIG_STORAGE,
  ConfigStorage,
  GenericCrudService,
  BatchDeleteResult,
} from '@praxis/core';
import { SettingsPanelService } from '@praxis/settings-panel';

describe('PraxisTable auto delete', () => {
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
    crud.delete.and.returnValue(of(void 0));
    crud.deleteMany.and.returnValue(
      of({ successIds: [1, 2], errors: [] } as BatchDeleteResult<number>),
    );

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
    component.resourcePath = '/items';
    component.autoDelete = true;
  });

  function createConfig(): TableConfig {
    return {
      columns: [{ field: 'id', header: 'ID' }],
      actions: {
        row: {
          enabled: true,
          position: 'end',
          display: 'icons',
          trigger: 'hover',
          actions: [
            {
              id: 'delete',
              label: 'Excluir',
              action: 'delete',
              autoDelete: true,
            },
          ],
        },
        bulk: {
          enabled: true,
          position: 'toolbar',
          actions: [
            {
              id: 'bulkDel',
              label: 'Excluir',
              action: 'delete',
              autoDelete: true,
            },
          ],
        },
      },
      behavior: {
        selection: {
          enabled: true,
          type: 'multiple',
          mode: 'checkbox',
          allowSelectAll: true,
        },
      },
    } as TableConfig;
  }

  it('should automatically delete row', () => {
    component.config = createConfig();
    fixture.detectChanges();
    const row = { id: 1 };
    component.onRowAction('delete', row, new Event('click'));
    expect(crud.delete).toHaveBeenCalledWith(1);
  });

  it('should automatically delete selected rows', () => {
    component.config = createConfig();
    component.dataSource.data = [{ id: 1 }, { id: 2 }];
    fixture.detectChanges();
    component.selection.select(component.dataSource.data[0]);
    component.selection.select(component.dataSource.data[1]);
    component.onToolbarAction({ action: 'delete' });
    expect(crud.deleteMany).toHaveBeenCalledWith([1, 2], jasmine.any(Object));
  });

  it('should emit bulkDeleteError when some deletions fail', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    component.config = createConfig();
    component.dataSource.data = rows;
    fixture.detectChanges();
    component.selection.select(rows[0]);
    component.selection.select(rows[1]);
    const result: BatchDeleteResult<number> = {
      successIds: [1],
      errors: [
        {
          id: 2,
          success: false,
          index: 2,
          total: 2,
        },
      ],
    };
    crud.deleteMany.and.returnValue(of(result));
    const spy = jasmine.createSpy('bulkDeleteError');
    component.bulkDeleteError.subscribe(spy);
    component.onToolbarAction({ action: 'delete' });
    expect(spy).toHaveBeenCalledWith({ rows: [rows[1]], error: result.errors });
  });
});
