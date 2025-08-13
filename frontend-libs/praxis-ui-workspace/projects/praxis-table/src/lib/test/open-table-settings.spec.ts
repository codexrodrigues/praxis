import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { TableConfig, createDefaultTableConfig } from '@praxis/core';
import { PraxisTable } from '../praxis-table';
import { TableDefaultsProvider } from '../services/table-defaults.provider';
import { DataFormattingService } from '../data-formatter/data-formatting.service';
import { SettingsPanelService } from '@praxis/settings-panel';
import { GenericCrudService, ConfigStorage } from '@praxis/core';

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
    } as ConfigStorage;
    const defaults = createDefaultTableConfig();
    const tableDefaultsProvider: TableDefaultsProvider = {
      getDefaults: jasmine.createSpy('getDefaults').and.returnValue(defaults),
    } as any;

    const crudService = {} as GenericCrudService<any>;
    const cdr = { detectChanges: () => {} } as ChangeDetectorRef;
    const formatting = {} as DataFormattingService;

    const table = new PraxisTable(
      crudService,
      cdr,
      settingsPanel,
      formatting,
      configStorage,
      tableDefaultsProvider,
    );
    table.tableId = 'myTable';
    table.config = createDefaultTableConfig();
    spyOn(table as any, 'applyTableConfig');

    table.openTableSettings();

    const newConfig: TableConfig = { columns: [] } as TableConfig;
    saved$.next(newConfig);
    expect(configStorage.saveConfig).toHaveBeenCalledWith(
      'table-config:myTable',
      newConfig,
    );
    expect((table as any).applyTableConfig).toHaveBeenCalledWith(newConfig);

    reset$.next();
    expect(tableDefaultsProvider.getDefaults).toHaveBeenCalledWith('myTable');
    expect((table as any).applyTableConfig).toHaveBeenCalledWith(defaults);
  });
});
