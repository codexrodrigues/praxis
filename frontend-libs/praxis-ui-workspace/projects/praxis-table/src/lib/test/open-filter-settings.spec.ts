import { Subject } from 'rxjs';
import { PraxisFilter } from '../praxis-filter';
import { SettingsPanelService } from '@praxis/settings-panel';
import { FilterConfigService, FilterConfig } from '../services/filter-config.service';
import { GenericCrudService, ConfigStorage } from '@praxis/core';

describe('PraxisFilter openSettings', () => {
  it('should apply changes and persist on save', () => {
    const applied$ = new Subject<FilterConfig>();
    const saved$ = new Subject<FilterConfig>();
    const ref = { applied$, saved$, close: jasmine.createSpy('close') } as any;
    const settingsPanel: SettingsPanelService = {
      open: () => ref,
    } as any;
    const filterConfig: FilterConfigService = {
      save: jasmine.createSpy('save'),
      load: () => undefined,
    } as any;
    const crud = { configure: () => {} } as unknown as GenericCrudService<any>;
    const storage = {
      loadConfig: () => undefined,
      saveConfig: () => undefined,
      clearConfig: () => {},
    } as ConfigStorage;
    const destroyRef = { onDestroy: () => {} } as any;

    const filter = new PraxisFilter(
      crud,
      storage,
      destroyRef,
      filterConfig,
      settingsPanel,
    );
    (filter as any).configKey = 'f1';
    (filter as any).schemaMetas = [];
    filter.quickField = 'cpf';
    filter.alwaysVisibleFields = ['age'];

    filter.openSettings();

    const newConfig: FilterConfig = {
      quickField: 'name',
      alwaysVisibleFields: ['age', 'cpf'],
      placeholder: 'Buscar',
      showAdvanced: true,
    };
    applied$.next(newConfig);
    expect(filter.quickField).toBe('name');
    expect(filter.alwaysVisibleFields).toEqual(['age', 'cpf']);
    expect(ref.close).toHaveBeenCalled();

    saved$.next({ quickField: 'id' });
    expect(filterConfig.save).toHaveBeenCalledWith('f1', {
      quickField: 'id',
      alwaysVisibleFields: [],
      placeholder: undefined,
      showAdvanced: false,
    });
  });
});
