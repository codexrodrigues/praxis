import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FormConfig,
  FormConfigState,
  createDefaultFormConfig,
  isValidFormConfig
} from '@praxis/core';

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private readonly _state$ = new BehaviorSubject<FormConfigState>({
    config: createDefaultFormConfig(),
    isLoading: false
  });

  readonly state$: Observable<FormConfigState> = this._state$.asObservable();
  readonly config$: Observable<FormConfig> = this._state$.pipe(map(s => s.config));

  get currentConfig(): FormConfig {
    return this._state$.value.config;
  }

  loadConfig(config: FormConfig): void {
    if (!isValidFormConfig(config)) {
      this.updateState({ error: 'Invalid form configuration', isLoading: false });
      return;
    }
    this.updateState({ config: { ...config }, isLoading: false, error: undefined });
  }

  updateConfig(configUpdate: Partial<FormConfig>): void {
    this.updateState({
      config: { ...this.currentConfig, ...configUpdate },
      error: undefined
    });
  }

  private updateState(state: Partial<FormConfigState>): void {
    this._state$.next({ ...this._state$.value, ...state });
  }

  /**
   * Export the current configuration as a JSON string.
   * @param pretty whether to pretty print the JSON
   */
  exportToJson(pretty = true): string {
    return JSON.stringify(this.currentConfig, null, pretty ? 2 : undefined);
  }

  /**
   * Load a configuration from a JSON string.
   * Invalid JSON will emit an error on the service state.
   */
  importFromJson(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.loadConfig(parsed);
    } catch {
      this.updateState({ error: 'Invalid JSON', isLoading: false });
    }
  }

  /**
   * Validate a configuration returning an array of error messages.
   */
  validateConfig(config: FormConfig): string[] {
    const errors: string[] = [];
    if (!isValidFormConfig(config)) {
      errors.push('Invalid form configuration');
      return errors;
    }

    const ids = new Set<string>();
    for (const section of config.sections) {
      if (!section.id) {
        errors.push('Section id is required');
      } else if (ids.has(section.id)) {
        errors.push(`Duplicate section id: ${section.id}`);
      } else {
        ids.add(section.id);
      }
    }

    return errors;
  }
}
