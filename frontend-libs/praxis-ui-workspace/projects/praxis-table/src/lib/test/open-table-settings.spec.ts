import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { TableConfig, createDefaultTableConfig } from '@praxis/core';
import { PraxisTable } from '../praxis-table';
import { TableDefaultsProvider } from '../services/table-defaults.provider';
import { DataFormattingService } from '../data-formatter/data-formatting.service';
import { SettingsPanelService } from '@praxis/settings-panel';
import { GenericCrudService, ConfigStorage } from '@praxis/core';
import { FilterConfigService } from '../services/filter-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('PraxisTable openTableSettings', () => {
  it('should persist config on save and load defaults on reset', () => {
    const saved$ = new Subject<TableConfig>();
    const reset$ = new Subject<void>();
    const applied$ = new Subject<TableConfig>();
    const settingsRef = { saved$, reset$, applied$ } as any;
    const settingsPanel: SettingsPanelService = {
      open: () => settingsRef,
    } as any;
    const configStorage = {
      saveConfig: jasmine.createSpy('saveConfig'),
      loadConfig: () => undefined,
      clearConfig: () => {},
    } as unknown as ConfigStorage;
    const filterConfig = {
      save: jasmine.createSpy('save'),
      load: () => undefined,
    } as unknown as FilterConfigService;
    const defaults = createDefaultTableConfig();
    defaults.behavior!.filtering!.advancedFilters = {
      enabled: true,
      settings: { quickField: 'id' },
    } as any;
    const tableDefaultsProvider: TableDefaultsProvider = {
      getDefaults: jasmine.createSpy('getDefaults').and.returnValue(defaults),
    } as any;

    const crudService = {} as GenericCrudService<any>;
    const cdr = { detectChanges: () => {} } as ChangeDetectorRef;
    const formatting = {} as DataFormattingService;
    const snackBar = {} as MatSnackBar;

    const table = new PraxisTable(
      crudService,
      cdr,
      settingsPanel,
      formatting,
      configStorage,
      tableDefaultsProvider,
      snackBar,
      filterConfig,
    );
    table.tableId = 'myTable';
    table.config = createDefaultTableConfig();

    table.openTableSettings();

    const newConfig = {
      columns: [],
      behavior: {
        filtering: {
          advancedFilters: { settings: { quickField: 'name' } },
        },
      },
    } as unknown as TableConfig;
    saved$.next(newConfig);
    expect(configStorage.saveConfig).toHaveBeenCalledWith(
      'table-config:myTable',
      newConfig,
    );
    expect(filterConfig.save).toHaveBeenCalledWith('myTable-filter', {
      quickField: 'name',
    });

    reset$.next();
    expect(tableDefaultsProvider.getDefaults).toHaveBeenCalledWith('myTable');
    expect(filterConfig.save).toHaveBeenCalledWith('myTable-filter', {
      quickField: 'id',
    });
  });
});
