import { Subject, of } from 'rxjs';
import { PraxisFilter } from '../praxis-filter';
import { SettingsPanelService } from '@praxis/settings-panel';
import {
  FilterConfigService,
  FilterConfig,
} from '../services/filter-config.service';
import { GenericCrudService, ConfigStorage } from '@praxis/core';

describe('PraxisFilter openSettings', () => {
  it('should apply changes and persist on apply and save', () => {
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
    (filter as any).schemaMetas = [
      { name: 'cpf' } as any,
      { name: 'age' } as any,
      { name: 'name' } as any,
    ];
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
    expect(filter.quickFieldMeta?.name).toBe('name');
    expect(filter.alwaysVisibleMetas.map((m) => m.name)).toEqual([
      'age',
      'cpf',
    ]);
    expect(filter.i18n!.searchPlaceholder).toBe('Buscar');
    expect(filter.advancedOpen).toBeTrue();
    expect(ref.close).toHaveBeenCalled();
    expect(filterConfig.save).toHaveBeenCalledWith('f1', {
      quickField: 'name',
      alwaysVisibleFields: ['age', 'cpf'],
      placeholder: 'Buscar',
      showAdvanced: true,
    });

    (filterConfig.save as jasmine.Spy).calls.reset();
    saved$.next({ quickField: 'id' });
    expect(filterConfig.save).toHaveBeenCalledWith('f1', {
      quickField: 'id',
      alwaysVisibleFields: [],
      placeholder: undefined,
      showAdvanced: false,
    });
  });

  it('should reapply saved config when reopened', () => {
    const settingsPanel: SettingsPanelService = {
      open: () => ({}) as any,
    } as any;
    const metas = [{ name: 'name' } as any, { name: 'age' } as any];
    const filterConfig: FilterConfigService = {
      save: () => {},
      load: () => ({
        quickField: 'name',
        alwaysVisibleFields: ['age'],
        placeholder: 'Buscar',
        showAdvanced: true,
      }),
    } as any;
    const crud = {
      configure: () => {},
      getFilteredSchema: () => of([]),
      getSchema: () => of([]),
    } as any;
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
    filter.resourcePath = '/test';
    filter.formId = 'f1';
    filter.ngOnInit();
    (filter as any).schemaMetas = metas;
    (filter as any).applySchemaMetas();

    expect(filter.quickField).toBe('name');
    expect(filter.alwaysVisibleFields).toEqual(['age']);
    expect(filter.i18n!.searchPlaceholder).toBe('Buscar');
    expect(filter.advancedOpen).toBeTrue();
    expect(filter.quickFieldMeta?.name).toBe('name');
    expect(filter.alwaysVisibleMetas.map((m) => m.name)).toEqual(['age']);
  });
});
