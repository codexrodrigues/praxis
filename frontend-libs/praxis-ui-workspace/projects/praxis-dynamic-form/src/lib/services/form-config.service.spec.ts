import { FormConfigService } from './form-config.service';
import { FormConfig } from '@praxis/core';

describe('FormConfigService', () => {
  let service: FormConfigService;

  beforeEach(() => {
    service = new FormConfigService();
  });

  it('should load config', () => {
    const cfg: FormConfig = { sections: [{ id: 's1', rows: [] }] };
    service.loadConfig(cfg);
    expect(service.currentConfig).toEqual(cfg);
  });

  it('should update config', () => {
    service.updateConfig({ sections: [{ id: 's2', rows: [] }] });
    expect(service.currentConfig.sections[0].id).toBe('s2');
  });

  it('should export and import JSON', () => {
    const cfg: FormConfig = { sections: [{ id: 's3', rows: [] }] };
    service.loadConfig(cfg);
    const json = service.exportToJson();
    const other = new FormConfigService();
    other.importFromJson(json);
    expect(other.currentConfig).toEqual(cfg);
  });

  it('validateConfig should detect duplicates', () => {
    const cfg: FormConfig = { sections: [{ id: 'dup', rows: [] }, { id: 'dup', rows: [] }] };
    const errors = service.validateConfig(cfg);
    expect(errors.length).toBeGreaterThan(0);
  });
});
