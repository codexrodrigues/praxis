import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PraxisTable } from '../praxis-table';
import {
  TableConfig,
  CONFIG_STORAGE,
  ConfigStorage,
  GenericCrudService,
} from '@praxis/core';
import { SettingsPanelService } from '@praxis/settings-panel';

describe('PraxisTable row actions contract', () => {
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

  it('should emit rowAction when action uses id property', () => {
    const config: TableConfig = {
      columns: [{ field: 'id', header: 'ID' }],
      actions: {
        row: {
          enabled: true,
          actions: [{ id: 'delete', icon: 'delete' }] as any,
        },
      },
    } as any;

    component.config = config;
    component.dataSource.data = [{ id: 1 }];
    const spy = jasmine.createSpy('rowAction');
    component.rowAction.subscribe(spy);

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.praxis-actions-cell button',
    );
    button.click();

    expect(spy).toHaveBeenCalledWith({ action: 'delete', row: { id: 1 } });
  });
});
