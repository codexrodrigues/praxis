/**
 * Serviço ultra-simplificado de registro de componentes
 * Focado no essencial: registro, carregamento e cache básico
 */

import { Injectable } from '@angular/core';
import {
  FieldControlType as FieldControlTypeEnum,
  type FieldControlType,
} from '@praxis/core';
import {
  IComponentRegistry,
  ComponentRegistration,
  RegistryStats,
  ComponentLoadResult,
  CACHE_TTL,
  MAX_LOAD_ATTEMPTS,
  RETRY_DELAY,
} from './component-registry.interface';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ColorInputComponent } from '../../components/color-input/color-input.component';
import { DateInputComponent } from '../../components/date-input/date-input.component';
import { MaterialDatepickerComponent } from '../../components/material-datepicker/material-datepicker.component';
import { MaterialDateRangeComponent } from '../../components/material-date-range/material-date-range.component';
import { DatetimeLocalInputComponent } from '../../components/datetime-local-input/datetime-local-input.component';
import { MonthInputComponent } from '../../components/month-input/month-input.component';
import { NumberInputComponent } from '../../components/number-input/number-input.component';
import { MaterialCurrencyComponent } from '../../components/material-currency/material-currency.component';
import { MaterialPriceRangeComponent } from '../../components/material-price-range/material-price-range.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { PhoneInputComponent } from '../../components/phone-input/phone-input.component';
import { TimeInputComponent } from '../../components/time-input/time-input.component';
import { MaterialTimepickerComponent } from '../../components/material-timepicker/material-timepicker.component';
import { UrlInputComponent } from '../../components/url-input/url-input.component';
import { WeekInputComponent } from '../../components/week-input/week-input.component';
import { MaterialColorPickerComponent } from '../../components/material-colorpicker/material-colorpicker.component';
import { MaterialTextareaComponent } from '../../components/material-textarea/material-textarea.component';
import { MaterialSelectComponent } from '../../components/material-select/material-select.component';
import { MaterialMultiSelectComponent } from '../../components/material-multi-select/material-multi-select.component';
import { MaterialSearchableSelectComponent } from '../../components/material-searchable-select/material-searchable-select.component';
import { MaterialAsyncSelectComponent } from '../../components/material-async-select/material-async-select.component';
import { MaterialRadioGroupComponent } from '../../components/material-radio-group/material-radio-group.component';
import { MaterialCheckboxGroupComponent } from '../../components/material-checkbox-group/material-checkbox-group.component';

@Injectable({
  providedIn: 'root',
})
export class ComponentRegistryService implements IComponentRegistry {
  /**
   * Registro interno de componentes
   */
  private readonly registry = new Map<
    FieldControlType,
    ComponentRegistration
  >();

  constructor() {
    this.initializeDefaultComponents();
  }

  // =============================================================================
  // INTERFACE PÚBLICA ESSENCIAL
  // =============================================================================

  /**
   * Registra um novo componente
   */
  register<T>(
    type: FieldControlType,
    factory: () => Promise<import('@angular/core').Type<T>>,
  ): void {
    this.registry.set(type, { factory });
  }

  /**
   * Obtém um componente registrado com cache inteligente
   * Handles both string literals and enum values for backward compatibility
   */
  async getComponent<T>(
    type: FieldControlType | string,
  ): Promise<import('@angular/core').Type<T> | null> {
    // Normalize the type - convert string literals to enum values if needed
    const normalizedType = this.normalizeControlType(type);

    const registration = this.registry.get(normalizedType);
    if (!registration) {
      console.warn(
        `[ComponentRegistry] Componente '${type}' (normalized: '${normalizedType}') não registrado`,
      );
      return null;
    }

    // Verificar se o cache é válido
    if (this.isCacheValid(registration)) {
      return registration.cached as import('@angular/core').Type<T>;
    }

    // Tentar carregar com retry logic
    return this.loadComponentWithRetry(registration, normalizedType as string);
  }

  /**
   * Verifica se um tipo está registrado
   * Handles both string literals and enum values
   */
  isRegistered(type: FieldControlType | string): boolean {
    const normalizedType = this.normalizeControlType(type);
    return this.registry.has(normalizedType);
  }

  /**
   * Lista todos os tipos registrados
   */
  getRegisteredTypes(): FieldControlType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Limpa o cache de todos os componentes
   */
  clearCache(): void {
    this.registry.forEach((registration) => {
      registration.cached = undefined;
      registration.cachedAt = undefined;
      registration.loadAttempts = 0;
      registration.lastError = undefined;
    });
    console.debug('[ComponentRegistry] Cache limpo');
  }

  // =============================================================================
  // MÉTODOS UTILITÁRIOS ESSENCIAIS
  // =============================================================================

  /**
   * Obtém estatísticas do registro
   */
  getStats(): RegistryStats {
    const cachedCount = Array.from(this.registry.values()).filter(
      (reg) => reg.cached,
    ).length;

    return {
      registeredComponents: this.registry.size,
      cachedComponents: cachedCount,
      registeredTypes: this.getRegisteredTypes(),
    };
  }

  /**
   * Limpa cache de componentes específicos ou todos
   */
  clearCacheForType(type: FieldControlType): void {
    const registration = this.registry.get(type);
    if (registration) {
      registration.cached = undefined;
      registration.cachedAt = undefined;
      registration.loadAttempts = 0;
      registration.lastError = undefined;
      console.debug(`[ComponentRegistry] Cache limpo para ${type}`);
    }
  }

  /**
   * Remove um componente do registro
   */
  unregister(type: FieldControlType): boolean {
    return this.registry.delete(type);
  }

  /**
   * Pré-carrega componentes especificados
   */
  async preload(types: FieldControlType[]): Promise<ComponentLoadResult[]> {
    const results: ComponentLoadResult[] = [];

    for (const type of types) {
      try {
        const component = await this.getComponent(type);
        results.push({
          component,
          success: !!component,
        });
      } catch (error) {
        results.push({
          component: null,
          success: false,
          error: error as Error,
        });
      }
    }

    return results;
  }

  // =============================================================================
  // MÉTODOS PRIVADOS DE NORMALIZAÇÃO
  // =============================================================================

  /**
   * Normalizes control type to handle both string literals and enum values
   * This provides backward compatibility for existing code using string literals
   */
  private normalizeControlType(
    type: FieldControlType | string,
  ): FieldControlType {
    // If it's already a valid enum value, return as-is
    if (
      Object.values(FieldControlTypeEnum).includes(type as FieldControlType)
    ) {
      return type as FieldControlType;
    }

    const sanitized = String(type)
      .toLowerCase()
      .replace(/[-_\s]/g, '');
    const synonyms: Record<string, FieldControlType> = {
      radiogroup: FieldControlTypeEnum.RADIO,
      checkboxgroup: FieldControlTypeEnum.CHECKBOX,
    };

    if (synonyms[sanitized]) {
      return synonyms[sanitized];
    }

    // Try to find matching enum value by string comparison
    const enumEntry = Object.entries(FieldControlTypeEnum).find(
      ([key, value]) => value === type || key.toLowerCase() === sanitized,
    );

    if (enumEntry) {
      return enumEntry[1] as FieldControlType;
    }

    // Fallback: return the original type (might cause issues but maintains compatibility)
    console.warn(
      `[ComponentRegistry] Could not normalize control type: '${type}'`,
    );
    return type as FieldControlType;
  }

  // =============================================================================
  // INICIALIZAÇÃO DE COMPONENTES PADRÃO
  // =============================================================================

  /**
   * Registra componentes Material Design padrão
   */
  private initializeDefaultComponents(): void {
    const wrap = <T>(c: import('@angular/core').Type<T>) => Promise.resolve(c);

    // Inputs básicos e variantes
    this.register(FieldControlTypeEnum.INPUT, () => wrap(TextInputComponent));
    this.register(FieldControlTypeEnum.EMAIL_INPUT, () =>
      wrap(EmailInputComponent),
    );
    this.register(FieldControlTypeEnum.PASSWORD, () =>
      wrap(PasswordInputComponent),
    );
    this.register(FieldControlTypeEnum.COLOR_INPUT, () =>
      wrap(ColorInputComponent),
    );
    this.register(FieldControlTypeEnum.DATE_INPUT, () =>
      wrap(DateInputComponent),
    );
    this.register(FieldControlTypeEnum.DATETIME_LOCAL_INPUT, () =>
      wrap(DatetimeLocalInputComponent),
    );
    this.register(FieldControlTypeEnum.MONTH_INPUT, () =>
      wrap(MonthInputComponent),
    );
    this.register(FieldControlTypeEnum.NUMERIC_TEXT_BOX, () =>
      wrap(NumberInputComponent),
    );
    this.register(FieldControlTypeEnum.CURRENCY_INPUT, () =>
      wrap(MaterialCurrencyComponent),
    );
    this.register(FieldControlTypeEnum.RANGE_SLIDER, () =>
      wrap(MaterialPriceRangeComponent),
    );
    this.register(FieldControlTypeEnum.SEARCH_INPUT, () =>
      wrap(SearchInputComponent),
    );
    this.register(FieldControlTypeEnum.PHONE, () => wrap(PhoneInputComponent));
    this.register(FieldControlTypeEnum.TIME_INPUT, () =>
      wrap(TimeInputComponent),
    );
    this.register(FieldControlTypeEnum.TIME_PICKER, () =>
      wrap(MaterialTimepickerComponent),
    );
    this.register(FieldControlTypeEnum.URL_INPUT, () =>
      wrap(UrlInputComponent),
    );
    this.register(FieldControlTypeEnum.WEEK_INPUT, () =>
      wrap(WeekInputComponent),
    );
    this.register(FieldControlTypeEnum.COLOR_PICKER, () =>
      wrap(MaterialColorPickerComponent),
    );

    // Date inputs com Material
    this.register(FieldControlTypeEnum.DATE_PICKER, () =>
      wrap(MaterialDatepickerComponent),
    );
    this.register(FieldControlTypeEnum.DATE_RANGE, () =>
      wrap(MaterialDateRangeComponent),
    );

    // Textarea e selects
    this.register(FieldControlTypeEnum.TEXTAREA, () =>
      wrap(MaterialTextareaComponent),
    );
    this.register(FieldControlTypeEnum.SELECT, () =>
      wrap(MaterialSelectComponent),
    );
    this.register(FieldControlTypeEnum.MULTI_SELECT, () =>
      wrap(MaterialMultiSelectComponent),
    );
    this.register('searchable-select' as FieldControlType, () =>
      wrap(MaterialSearchableSelectComponent),
    );
    this.register(FieldControlTypeEnum.AUTO_COMPLETE, () =>
      wrap(MaterialSearchableSelectComponent),
    );
    this.register('async-select' as FieldControlType, () =>
      wrap(MaterialAsyncSelectComponent),
    );
    this.register(FieldControlTypeEnum.RADIO, () =>
      wrap(MaterialRadioGroupComponent),
    );
    this.register(FieldControlTypeEnum.CHECKBOX, () =>
      wrap(MaterialCheckboxGroupComponent),
    );

    // Mapeamentos para controlTypes do JSON Schema/OpenAPI
    this.register('numericTextBox' as FieldControlType, () =>
      wrap(NumberInputComponent),
    );
    this.register('phone' as FieldControlType, () => wrap(PhoneInputComponent));
    this.register('date' as FieldControlType, () =>
      wrap(MaterialDatepickerComponent),
    );
    this.register('dateRange' as FieldControlType, () =>
      wrap(MaterialDateRangeComponent),
    );
    this.register('checkbox' as FieldControlType, () =>
      wrap(TextInputComponent),
    );
  }

  // =============================================================================
  // MÉTODOS DE CACHE INTELIGENTE
  // =============================================================================

  /**
   * Verifica se o cache de um componente é válido
   */
  private isCacheValid(registration: ComponentRegistration): boolean {
    if (!registration.cached || !registration.cachedAt) {
      return false;
    }

    // Em produção, cache nunca expira
    if (this.isProduction()) {
      return true;
    }

    // Em desenvolvimento, verificar TTL
    const now = Date.now();
    const cacheAge = now - registration.cachedAt;
    return cacheAge < CACHE_TTL;
  }

  /**
   * Carrega componente com lógica de retry
   */
  private async loadComponentWithRetry<T>(
    registration: ComponentRegistration,
    type: string,
  ): Promise<import('@angular/core').Type<T> | null> {
    const attempts = registration.loadAttempts || 0;

    if (attempts >= MAX_LOAD_ATTEMPTS) {
      console.error(
        `[ComponentRegistry] Máximo de tentativas atingido para '${type}'. Último erro:`,
        registration.lastError,
      );
      return null;
    }

    try {
      // Incrementar contador de tentativas
      registration.loadAttempts = attempts + 1;

      // Delay entre tentativas (exceto primeira)
      if (attempts > 0) {
        await this.delay(RETRY_DELAY * attempts);
        console.warn(
          `[ComponentRegistry] Tentativa ${attempts + 1}/${MAX_LOAD_ATTEMPTS} para carregar '${type}'`,
        );
      }

      const component = await registration.factory();
      if (!component) {
        throw new Error(`Factory for '${type}' returned undefined`);
      }

      // Sucesso: resetar contadores e cachear
      registration.cached = component;
      registration.cachedAt = Date.now();
      registration.loadAttempts = 0;
      registration.lastError = undefined;

      // Log apenas na primeira vez que carrega (não em cache hits subsequentes)
      if (attempts === 0) {
        console.info(
          `[ComponentRegistry] ✅ Componente '${type}' carregado com sucesso`,
        );
      }
      return component as import('@angular/core').Type<T>;
    } catch (error) {
      registration.lastError = error as Error;
      console.error(
        `[ComponentRegistry] Erro na tentativa ${attempts + 1} para '${type}':`,
        error,
      );

      // Se não é a última tentativa, tentar novamente
      if (attempts + 1 < MAX_LOAD_ATTEMPTS) {
        return this.loadComponentWithRetry(registration, type);
      }

      return null;
    }
  }

  /**
   * Verifica se está em ambiente de produção
   */
  private isProduction(): boolean {
    // Em Angular, verificamos ngDevMode (disponível globalmente em dev)
    return typeof ngDevMode === 'undefined' || !ngDevMode;
  }

  /**
   * Utilitário para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
