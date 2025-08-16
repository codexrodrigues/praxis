import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { PraxisTable } from '../praxis-table';
import { PraxisFilter } from '../praxis-filter';
import {
  TableConfig,
  TableConfigService,
  CONFIG_STORAGE,
  ConfigStorage,
  GenericCrudService,
} from '@praxis/core';
import { SettingsPanelService } from '@praxis/settings-panel';
import { FilterConfigService } from '../services/filter-config.service';

describe('PraxisTable advanced filter integration', () => {
  let fixture: ComponentFixture<PraxisTable>;
  let component: PraxisTable;
  let crud: jasmine.SpyObj<GenericCrudService<any>>;
  let storage: jasmine.SpyObj<ConfigStorage>;
  let settingsPanel: jasmine.SpyObj<SettingsPanelService>;

  beforeEach(async () => {
    crud = jasmine.createSpyObj('GenericCrudService', [
      'configure',
      'filter',
      'getFilteredSchema',
      'getSchema',
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
    crud.getFilteredSchema.and.returnValue(of([]));
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
        TableConfigService,
        FilterConfigService,
        { provide: GenericCrudService, useValue: crud },
        { provide: CONFIG_STORAGE, useValue: storage },
        { provide: SettingsPanelService, useValue: settingsPanel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTable);
    component = fixture.componentInstance;
    component.resourcePath = '/test';
  });

  function setConfig(advancedEnabled: boolean, toolbarVisible = true): void {
    const config: TableConfig = {
      columns: [],
      toolbar: { visible: toolbarVisible },
      behavior: {
        filtering: {
          enabled: true,
          strategy: 'client',
          debounceTime: 0,
          advancedFilters: { enabled: advancedEnabled },
        },
      },
    } as TableConfig;
    component.config = config;
  }

  it('should render PraxisFilter when advanced filters are enabled', () => {
    setConfig(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('praxis-filter')).toBeTruthy();
  });

  it('should render PraxisFilter even if toolbar is hidden in config', () => {
    setConfig(true, false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('praxis-filter')).toBeTruthy();
  });

  it('should not render PraxisFilter when advanced filters are disabled', () => {
    setConfig(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('praxis-filter')).toBeFalsy();
  });

  it('should pass quickField setting to PraxisFilter', () => {
    setConfig(true);
    component.config.behavior!.filtering!.advancedFilters!.settings = {
      quickField: 'name',
    };
    fixture.detectChanges();
    const filter = fixture.debugElement.query(By.directive(PraxisFilter))
      .componentInstance as PraxisFilter;
    expect(filter.quickField).toBe('name');
  });
});
