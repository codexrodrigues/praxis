import { LocalStorageConfigService } from './config-storage.service';

describe('LocalStorageConfigService', () => {
  let service: LocalStorageConfigService;

  beforeEach(() => {
    localStorage.clear();
    service = new LocalStorageConfigService();
  });

  it('should save and load configuration', () => {
    service.saveConfig('key', { test: true });
    const loaded = service.loadConfig<{ test: boolean }>('key');
    expect(loaded).toEqual({ test: true });
  });

  it('should clear configuration', () => {
    localStorage.setItem('key', JSON.stringify({ test: true }));
    service.clearConfig('key');
    expect(localStorage.getItem('key')).toBeNull();
  });
});
