import { inject, Injectable, InjectionToken } from '@angular/core';

export interface ConfigStorage {
  loadConfig<T>(key: string): T | null;
  saveConfig<T>(key: string, config: T): void;
  clearConfig(key: string): void;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageConfigService implements ConfigStorage {
  loadConfig<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  saveConfig<T>(key: string, config: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }

  clearConfig(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export const CONFIG_STORAGE = new InjectionToken<ConfigStorage>(
  'CONFIG_STORAGE',
  {
    providedIn: 'root',
    factory: () => inject(LocalStorageConfigService),
  },
);
