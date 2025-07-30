import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FormConfig,
  FormConfigState,
  createDefaultFormConfig,
  isValidFormConfig
} from '../models/form-config.model';

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private readonly _state$ = new BehaviorSubject<FormConfigState>({
    config: createDefaultFormConfig(),
    isLoading: false
  });

  readonly state$: Observable<FormConfigState> = this._state$.asObservable();

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
}
