/**
 * Serviço ultra-simplificado de registro de componentes
 * Focado no essencial: registro, carregamento e cache básico
 */

import { Injectable } from '@angular/core';
import { FieldControlType as FieldControlTypeEnum, type FieldControlType } from '@praxis/core';
import { 
  IComponentRegistry, 
  ComponentRegistration,
  RegistryStats,
  ComponentLoadResult,
  CACHE_TTL,
  MAX_LOAD_ATTEMPTS,
  RETRY_DELAY
} from './component-registry.interface';

@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService implements IComponentRegistry {
  
  /**
   * Registro interno de componentes
   */
  private readonly registry = new Map<FieldControlType, ComponentRegistration>();

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
    factory: () => Promise<import('@angular/core').Type<T>>
  ): void {
    this.registry.set(type, { factory });
  }

  /**
   * Obtém um componente registrado com cache inteligente
   * Handles both string literals and enum values for backward compatibility
   */
  async getComponent<T>(type: FieldControlType | string): Promise<import('@angular/core').Type<T> | null> {
    // Normalize the type - convert string literals to enum values if needed
    const normalizedType = this.normalizeControlType(type);
    
    const registration = this.registry.get(normalizedType);
    if (!registration) {
      console.warn(`[ComponentRegistry] Componente '${type}' (normalized: '${normalizedType}') não registrado`);
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

  // =============================================================================
  // MÉTODOS UTILITÁRIOS ESSENCIAIS
  // =============================================================================

  /**
   * Obtém estatísticas do registro
   */
  getStats(): RegistryStats {
    const cachedCount = Array.from(this.registry.values())
      .filter(reg => reg.cached).length;

    return {
      registeredComponents: this.registry.size,
      cachedComponents: cachedCount,
      registeredTypes: this.getRegisteredTypes()
    };
  }

  /**
   * Limpa cache de componentes
   */
  clearCache(type?: FieldControlType): void {
    if (type) {
      const registration = this.registry.get(type);
      if (registration) {
        delete registration.cached;
      }
    } else {
      this.registry.forEach(registration => {
        delete registration.cached;
      });
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
          success: !!component
        });
      } catch (error) {
        results.push({
          component: null,
          success: false,
          error: error as Error
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
  private normalizeControlType(type: FieldControlType | string): FieldControlType {
    // If it's already a valid enum value, return as-is
    if (Object.values(FieldControlTypeEnum).includes(type as FieldControlType)) {
      return type as FieldControlType;
    }

    // Try to find matching enum value by string comparison
    const enumEntry = Object.entries(FieldControlTypeEnum).find(([key, value]) => 
      value === type || key.toLowerCase() === String(type).toLowerCase()
    );

    if (enumEntry) {
      return enumEntry[1] as FieldControlType;
    }

    // Fallback: return the original type (might cause issues but maintains compatibility)
    console.warn(`[ComponentRegistry] Could not normalize control type: '${type}'`);
    return type as FieldControlType;
  }

  // =============================================================================
  // INICIALIZAÇÃO DE COMPONENTES PADRÃO
  // =============================================================================

  /**
   * Registra componentes Material Design padrão
   */
  private initializeDefaultComponents(): void {
    // Input
    this.register(
      FieldControlTypeEnum.INPUT,
      () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    );

    // Textarea
    this.register(
      FieldControlTypeEnum.TEXTAREA,
      () => import('../../components/material-textarea/material-textarea.component').then(m => m.MaterialTextareaComponent)
    );

    // Select
    this.register(
      FieldControlTypeEnum.SELECT,
      () => import('../../components/material-select/material-select.component').then(m => m.MaterialSelectComponent)
    );

    // Checkbox
    this.register(
      FieldControlTypeEnum.CHECKBOX,
      () => import('../../components/material-checkbox/material-checkbox.component').then(m => m.MaterialCheckboxComponent)
    );

    // Radio
    this.register(
      FieldControlTypeEnum.RADIO,
      () => import('../../components/material-radio/material-radio.component').then(m => m.MaterialRadioComponent)
    );

    // Date
    this.register(
      FieldControlTypeEnum.DATE_PICKER,
      () => import('../../components/material-date-picker/material-date-picker.component').then(m => m.MaterialDatePickerComponent)
    );

    // Currency Input (componente especializado)
    this.register(
      FieldControlTypeEnum.CURRENCY_INPUT,
      () => import('../../components/material-currency/material-currency.component').then(m => m.MaterialCurrencyComponent)
    );

    // Email Input
    this.register(
      FieldControlTypeEnum.EMAIL_INPUT,
      () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    );

    // Password
    this.register(
      FieldControlTypeEnum.PASSWORD,
      () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    );

    // Numeric TextBox
    this.register(
      FieldControlTypeEnum.NUMERIC_TEXT_BOX,
      () => import('../../components/material-input/material-input.component').then(m => m.MaterialInputComponent)
    );

    // Multi Select
    this.register(
      FieldControlTypeEnum.MULTI_SELECT,
      () => import('../../components/material-select/material-select.component').then(m => m.MaterialSelectComponent)
    );

    // Auto Complete
    this.register(
      FieldControlTypeEnum.AUTO_COMPLETE,
      () => import('../../components/material-select/material-select.component').then(m => m.MaterialSelectComponent)
    );

    // Date Time Picker
    this.register(
      FieldControlTypeEnum.DATE_TIME_PICKER,
      () => import('../../components/material-date-picker/material-date-picker.component').then(m => m.MaterialDatePickerComponent)
    );

    // Date Range
    this.register(
      FieldControlTypeEnum.DATE_RANGE,
      () => import('../../components/material-date-range/material-date-range.component').then(m => m.MaterialDateRangeComponent)
    );

    // Button
    this.register(
      FieldControlTypeEnum.BUTTON,
      () => import('../../components/material-button/material-button.component').then(m => m.MaterialButtonComponent)
    );

    // File Upload
    this.register(
      FieldControlTypeEnum.FILE_UPLOAD,
      () => import('../../components/material-button/material-button.component').then(m => m.MaterialButtonComponent)
    );

    // Toggle
    this.register(
      FieldControlTypeEnum.TOGGLE,
      () => import('../../components/material-toggle/material-toggle.component').then(m => m.MaterialToggleComponent)
    );

    // Slider
    this.register(
      FieldControlTypeEnum.SLIDER,
      () => import('../../components/material-slider/material-slider.component').then(m => m.MaterialSliderComponent)
    );

    // Time Picker
    this.register(
      FieldControlTypeEnum.TIME_PICKER,
      () => import('../../components/material-timepicker/material-timepicker.component').then(m => m.MaterialTimepickerComponent)
    );

    // Rating
    this.register(
      FieldControlTypeEnum.RATING,
      () => import('../../components/material-rating/material-rating.component').then(m => m.MaterialRatingComponent)
    );

    // Color Picker
    this.register(
      FieldControlTypeEnum.COLOR_PICKER,
      () => import('../../components/material-colorpicker/material-colorpicker.component').then(m => m.MaterialColorPickerComponent)
    );

    // Array Input - using textarea as fallback for now
    this.register(
      'array' as FieldControlType,
      () => import('../../components/material-textarea/material-textarea.component').then(m => m.MaterialTextareaComponent)
    );

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
  private async loadComponentWithRetry<T>(registration: ComponentRegistration, type: string): Promise<import('@angular/core').Type<T> | null> {
    const attempts = registration.loadAttempts || 0;
    
    if (attempts >= MAX_LOAD_ATTEMPTS) {
      console.error(`[ComponentRegistry] Máximo de tentativas atingido para '${type}'. Último erro:`, registration.lastError);
      return null;
    }

    try {
      // Incrementar contador de tentativas
      registration.loadAttempts = attempts + 1;
      
      // Delay entre tentativas (exceto primeira)
      if (attempts > 0) {
        await this.delay(RETRY_DELAY * attempts);
        console.warn(`[ComponentRegistry] Tentativa ${attempts + 1}/${MAX_LOAD_ATTEMPTS} para carregar '${type}'`);
      }

      const component = await registration.factory();
      
      // Sucesso: resetar contadores e cachear
      registration.cached = component;
      registration.cachedAt = Date.now();
      registration.loadAttempts = 0;
      registration.lastError = undefined;
      
      console.debug(`[ComponentRegistry] Componente '${type}' carregado e cacheado com sucesso`);
      return component as import('@angular/core').Type<T>;
      
    } catch (error) {
      registration.lastError = error as Error;
      console.error(`[ComponentRegistry] Erro na tentativa ${attempts + 1} para '${type}':`, error);
      
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}