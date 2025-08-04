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

    // Try to find matching enum value by string comparison
    const enumEntry = Object.entries(FieldControlTypeEnum).find(
      ([key, value]) =>
        value === type || key.toLowerCase() === String(type).toLowerCase(),
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
    // TextInputComponent para inputs genéricos
    const textInputFactory = () =>
      import('../../components/text-input/text-input.component').then(
        (m) => m.TextInputComponent,
      );

    // Specialized email input
    const emailInputFactory = () =>
      import('../../components/email-input/email-input.component').then(
        (m) => m.EmailInputComponent,
      );

    // Specialized password input
    const passwordInputFactory = () =>
      import('../../components/password-input/password-input.component').then(
        (m) => m.PasswordInputComponent,
      );

    // Specialized color input
    const colorInputFactory = () =>
      import('../../components/color-input/color-input.component').then(
        (m) => m.ColorInputComponent,
      );

    // Specialized date input
    const dateInputFactory = () =>
      import('../../components/date-input/date-input.component').then(
        (m) => m.DateInputComponent,
      );

    // Specialized datetime-local input
    const datetimeLocalInputFactory = () =>
      import(
        '../../components/datetime-local-input/datetime-local-input.component'
      ).then((m) => m.DatetimeLocalInputComponent);

    // Specialized month input
    const monthInputFactory = () =>
      import('../../components/month-input/month-input.component').then(
        (m) => m.MonthInputComponent,
      );

    // Specialized number input
    const numberInputFactory = () =>
      import('../../components/number-input/number-input.component').then(
        (m) => m.NumberInputComponent,
      );

    // Specialized search input
    const searchInputFactory = () =>
      import('../../components/search-input/search-input.component').then(
        (m) => m.SearchInputComponent,
      );

    // Specialized phone input
    const phoneInputFactory = () =>
      import('../../components/phone-input/phone-input.component').then(
        (m) => m.PhoneInputComponent,
      );

    // Specialized time input
    const timeInputFactory = () =>
      import('../../components/time-input/time-input.component').then(
        (m) => m.TimeInputComponent,
      );

    // HTML5 url input
    const urlInputFactory = () =>
      import('../../components/url-input/url-input.component').then(
        (m) => m.UrlInputComponent,
      );

    // HTML5 week input
    const weekInputFactory = () =>
      import('../../components/week-input/week-input.component').then(
        (m) => m.WeekInputComponent,
      );

    // Input básico
    this.register(FieldControlTypeEnum.INPUT, textInputFactory);

    // Variantes de input especializadas
    this.register(FieldControlTypeEnum.EMAIL_INPUT, emailInputFactory);
    this.register(FieldControlTypeEnum.PASSWORD, passwordInputFactory);
    this.register(FieldControlTypeEnum.NUMERIC_TEXT_BOX, numberInputFactory);
    this.register(FieldControlTypeEnum.SEARCH_INPUT, searchInputFactory);
    this.register(FieldControlTypeEnum.PHONE, phoneInputFactory);
    this.register(FieldControlTypeEnum.TIME_INPUT, timeInputFactory);
    this.register(FieldControlTypeEnum.URL_INPUT, urlInputFactory);
    this.register(FieldControlTypeEnum.WEEK_INPUT, weekInputFactory);

    // HTML5 color input
    this.register(FieldControlTypeEnum.COLOR_INPUT, colorInputFactory);

    // HTML5 date input
    this.register(FieldControlTypeEnum.DATE_INPUT, dateInputFactory);

    // HTML5 datetime-local input
    this.register(
      FieldControlTypeEnum.DATETIME_LOCAL_INPUT,
      datetimeLocalInputFactory,
    );

    // HTML5 month input
    this.register(FieldControlTypeEnum.MONTH_INPUT, monthInputFactory);

    // Mapeamentos para controlTypes do JSON Schema/OpenAPI
    this.register('numericTextBox' as FieldControlType, numberInputFactory);
    this.register('phone' as FieldControlType, phoneInputFactory);
    this.register('date' as FieldControlType, dateInputFactory);
    this.register('checkbox' as FieldControlType, textInputFactory);

    // Textarea
    this.register(FieldControlTypeEnum.TEXTAREA, () =>
      import(
        '../../components/material-textarea/material-textarea.component'
      ).then((m) => m.MaterialTextareaComponent),
    );
    const selectFactory = () =>
      import('../../components/material-select/material-select.component').then(
        (m) => m.MaterialSelectComponent,
      );
    this.register(FieldControlTypeEnum.SELECT, selectFactory);

    const multiSelectFactory = () =>
      import(
        '../../components/material-multi-select/material-multi-select.component'
      ).then((m) => m.MaterialMultiSelectComponent);
    this.register(FieldControlTypeEnum.MULTI_SELECT, multiSelectFactory);

    const searchableSelectFactory = () =>
      import(
        '../../components/material-searchable-select/material-searchable-select.component'
      ).then((m) => m.MaterialSearchableSelectComponent);
    this.register(
      'searchable-select' as FieldControlType,
      searchableSelectFactory,
    );

    const asyncSelectFactory = () =>
      import(
        '../../components/material-async-select/material-async-select.component'
      ).then((m) => m.MaterialAsyncSelectComponent);
    this.register('async-select' as FieldControlType, asyncSelectFactory);

    const radioGroupFactory = () =>
      import(
        '../../components/material-radio-group/material-radio-group.component'
      ).then((m) => m.MaterialRadioGroupComponent);
    this.register(FieldControlTypeEnum.RADIO, radioGroupFactory);

    const checkboxGroupFactory = () =>
      import(
        '../../components/material-checkbox-group/material-checkbox-group.component'
      ).then((m) => m.MaterialCheckboxGroupComponent);
    this.register(FieldControlTypeEnum.CHECKBOX, checkboxGroupFactory);

    // // Checkbox
    // this.register(
    //   FieldControlTypeEnum.CHECKBOX,
    //   () => import('../../components/material-checkbox/material-checkbox.component').then(m => m.MaterialCheckboxComponent)
    // );
    //
    // // Radio
    // this.register(
    //   FieldControlTypeEnum.RADIO,
    //   () => import('../../components/material-radio/material-radio.component').then(m => m.MaterialRadioComponent)
    // );
    //
    // // Date
    // this.register(
    //   FieldControlTypeEnum.DATE_PICKER,
    //   () => import('../../components/material-date-picker/material-date-picker.component').then(m => m.MaterialDatePickerComponent)
    // );
    //
    // // Currency Input (componente especializado)
    // this.register(
    //   FieldControlTypeEnum.CURRENCY_INPUT,
    //   () => import('../../components/material-currency/material-currency.component').then(m => m.MaterialCurrencyComponent)
    // );
    //
    // // Email Input
    // this.register(
    //   FieldControlTypeEnum.EMAIL_INPUT,
    //   () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    // );
    //
    // // Password
    // this.register(
    //   FieldControlTypeEnum.PASSWORD,
    //   () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    // );
    //
    // // Numeric TextBox
    // this.register(
    //   FieldControlTypeEnum.NUMERIC_TEXT_BOX,
    //   () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    // );
    //
    // // Multi Select
    // this.register(
    //   FieldControlTypeEnum.MULTI_SELECT,
    //   () => import('../../components/material-select/material-select.component').then(m => m.MaterialSelectComponent)
    // );
    //
    // // Auto Complete
    // this.register(
    //   FieldControlTypeEnum.AUTO_COMPLETE,
    //   () => import('../../components/material-select/material-select.component').then(m => m.MaterialSelectComponent)
    // );
    //
    // // Date Time Picker
    // this.register(
    //   FieldControlTypeEnum.DATE_TIME_PICKER,
    //   () => import('../../components/material-date-picker/material-date-picker.component').then(m => m.MaterialDatePickerComponent)
    // );
    //
    // // Date Range
    // this.register(
    //   FieldControlTypeEnum.DATE_RANGE,
    //   () => import('../../components/material-date-range/material-date-range.component').then(m => m.MaterialDateRangeComponent)
    // );
    //
    // // Button
    // this.register(
    //   FieldControlTypeEnum.BUTTON,
    //   () => import('../../components/material-button/material-button.component').then(m => m.MaterialButtonComponent)
    // );
    //
    // // File Upload
    // this.register(
    //   FieldControlTypeEnum.FILE_UPLOAD,
    //   () => import('../../components/material-button/material-button.component').then(m => m.MaterialButtonComponent)
    // );
    //
    // // Toggle
    // this.register(
    //   FieldControlTypeEnum.TOGGLE,
    //   () => import('../../components/material-toggle/material-toggle.component').then(m => m.MaterialToggleComponent)
    // );
    //
    // // Slider
    // this.register(
    //   FieldControlTypeEnum.SLIDER,
    //   () => import('../../components/material-slider/material-slider.component').then(m => m.MaterialSliderComponent)
    // );
    //
    // // Time Picker
    // this.register(
    //   FieldControlTypeEnum.TIME_PICKER,
    //   () => import('../../components/material-timepicker/material-timepicker.component').then(m => m.MaterialTimepickerComponent)
    // );
    //
    // // Rating
    // this.register(
    //   FieldControlTypeEnum.RATING,
    //   () => import('../../components/material-rating/material-rating.component').then(m => m.MaterialRatingComponent)
    // );
    //
    // // Color Picker
    // this.register(
    //   FieldControlTypeEnum.COLOR_PICKER,
    //   () => import('../../components/material-colorpicker/material-colorpicker.component').then(m => m.MaterialColorPickerComponent)
    // );
    //
    // // Array Input - using textarea as fallback for now
    // this.register(
    //   'array' as FieldControlType,
    //   () => import('../../components/material-textarea/material-textarea.component').then(m => m.MaterialTextareaComponent)
    // );

    // COMPONENTES PLANEJADOS PARA IMPLEMENTAÇÃO FUTURA

    // Rating (futura implementação)
    // this.register(
    //   FieldControlTypeEnum.RATING,
    //   () => import('../../components/material-rating/material-rating.component').then(m => m.MaterialRatingComponent)
    // );

    // Color Picker (futura implementação)
    // this.register(
    //   FieldControlTypeEnum.COLOR_PICKER,
    //   () => import('../../components/material-color-picker/material-color-picker.component').then(m => m.MaterialColorPickerComponent)
    // );
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
