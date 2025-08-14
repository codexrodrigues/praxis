import { Inject, Injectable } from '@angular/core';
import { ConfigStorage, CONFIG_STORAGE } from '@praxis/core';

export type FilterConfig = {
  quickField?: string;
  alwaysVisibleFields?: string[];
  placeholder?: string;
  showAdvanced?: boolean;
};

@Injectable({ providedIn: 'root' })
export class FilterConfigService {
  private readonly PREFIX = 'filter-config:';

  constructor(@Inject(CONFIG_STORAGE) private storage: ConfigStorage) {}

  /**
   * Load a persisted filter configuration for the given key.
   */
  load(key: string): FilterConfig | undefined {
    return this.storage.loadConfig<FilterConfig>(this.PREFIX + key) ?? undefined;
  }

  /**
   * Persist a filter configuration for the given key.
   */
  save(key: string, config: FilterConfig): void {
    this.storage.saveConfig(this.PREFIX + key, config);
  }
}
