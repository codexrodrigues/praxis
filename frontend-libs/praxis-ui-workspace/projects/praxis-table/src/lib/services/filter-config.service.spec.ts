import { TestBed } from '@angular/core/testing';
import { ConfigStorage, CONFIG_STORAGE } from '@praxis/core';
import { FilterConfigService } from './filter-config.service';

describe('FilterConfigService', () => {
  let storage: jasmine.SpyObj<ConfigStorage>;
  let service: FilterConfigService;

  beforeEach(() => {
    storage = jasmine.createSpyObj('ConfigStorage', [
      'loadConfig',
      'saveConfig',
    ]);
    TestBed.configureTestingModule({
      providers: [
        FilterConfigService,
        { provide: CONFIG_STORAGE, useValue: storage },
      ],
    });
    service = TestBed.inject(FilterConfigService);
  });

  it('should load config with prefixed key', () => {
    storage.loadConfig.and.returnValue({ quickField: 'cpf' });
    const cfg = service.load('foo');
    expect(storage.loadConfig).toHaveBeenCalledWith('filter-config:foo');
    expect(cfg?.quickField).toBe('cpf');
  });

  it('should save config with prefixed key', () => {
    const cfg = { quickField: 'cpf' };
    service.save('bar', cfg);
    expect(storage.saveConfig).toHaveBeenCalledWith('filter-config:bar', cfg);
  });
});
