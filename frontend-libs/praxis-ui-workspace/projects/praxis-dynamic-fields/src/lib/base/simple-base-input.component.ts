/**
 * @fileoverview Simple base component for input fields with basic ControlValueAccessor functionality
 *
 * This is a simplified base component that provides:
 * ✅ Basic ControlValueAccessor implementation
 * ✅ FormControl integration
 * ✅ Simple state management with signals
 * ✅ Basic event handling
 * ✅ Minimal logging system
 *
 * The goal is to start simple and gradually move functionality from text-input here.
 */

import {
  ControlValueAccessor,
  FormControl,
  ValidationErrors,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import {
  signal,
  computed,
  output,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ComponentMetadata } from '@praxis/core';
import { BehaviorSubject } from 'rxjs';
import {
  BaseDynamicFieldComponent,
  ComponentLifecycleEvent,
  ValueChangeOptions,
} from './base-dynamic-field-component.interface';

// =============================================================================
// BASIC INTERFACES
// =============================================================================

interface BasicComponentState {
  initialized: boolean;
  focused: boolean;
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
}

interface BasicFieldState {
  value: any;
  valid: boolean;
  errors: ValidationErrors | null;
}

export interface BaseValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  customValidator?: (value: any) => string | null;
  messages?: {
    required?: string;
    minlength?: string;
    maxlength?: string;
    pattern?: string;
    custom?: string;
  };
  validateOnBlur?: boolean;
  debounceTime?: number;
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// =============================================================================
// SIMPLE BASE INPUT COMPONENT
// =============================================================================

@Directive()
export abstract class SimpleBaseInputComponent
  implements
    ControlValueAccessor,
    OnInit,
    OnDestroy,
    AfterViewInit,
    BaseDynamicFieldComponent
{
  // =============================================================================
  // DEPENDENCY INJECTION
  // =============================================================================

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly elementRef = inject(ElementRef);
  protected readonly cdr = inject(ChangeDetectorRef);
  /** Subject para eventos de lifecycle */
  readonly lifecycleEvents$ =
    new BehaviorSubject<ComponentLifecycleEvent | null>(null);
  /** Native element registered by subclasses */
  protected nativeElement: HTMLElement | null = null;

  // =============================================================================
  // SIGNALS
  // =============================================================================

  /** Metadata do componente */
  readonly metadata = signal<ComponentMetadata | null>(null);

  /** Estado básico do componente */
  protected readonly componentState = signal<BasicComponentState>({
    initialized: false,
    focused: false,
    disabled: false,
    touched: false,
    dirty: false,
  });

  /** Estado básico do campo */
  protected readonly fieldState = signal<BasicFieldState>({
    value: null,
    valid: true,
    errors: null,
  });

  /** ID único do componente */
  readonly componentId = signal<string>('');

  // =============================================================================
  // FORM CONTROL
  // =============================================================================

  readonly internalControl = new FormControl();

  /** FormControl signal para interface BaseDynamicFieldComponent */
  readonly formControl = signal<AbstractControl | null>(null);

  // ControlValueAccessor callbacks
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private syncInProgress = false;

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  readonly valueChange = output<any>();
  readonly focusChange = output<boolean>();
  readonly nativeBlur = output<FocusEvent>();
  readonly nativeChange = output<Event>();

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Configuração de validação baseada no metadata */
  protected readonly validationConfig = computed(() => {
    const meta = this.metadata();
    if (!meta) return null;

    return {
      required: meta.required,
      minLength: meta.minLength,
      maxLength: meta.maxLength,
      pattern: meta.pattern,
      customValidator: meta.validators?.customValidator,
      messages: {
        required: meta.validators?.requiredMessage || 'Campo obrigatório',
        minlength:
          meta.validators?.minLengthMessage ||
          `Mínimo {requiredLength} caracteres`,
        maxlength:
          meta.validators?.maxLengthMessage ||
          `Máximo {requiredLength} caracteres`,
        pattern: meta.validators?.patternMessage || 'Formato inválido',
        custom: 'Valor inválido',
      },
      validateOnBlur: meta.validators?.validationTrigger === 'blur',
      debounceTime: meta.validators?.validationDebounce ?? 300,
    } as BaseValidationConfig;
  });

  /** Mensagem de erro atual */
  readonly errorMessage = computed(() => {
    const errors = this.internalControl.errors;
    const config = this.validationConfig();

    if (!errors || !config) return '';

    const messages = config.messages || {};

    if (errors['required']) return messages.required || 'Campo obrigatório';
    if (errors['minlength']) {
      return (
        messages.minlength?.replace(
          '{requiredLength}',
          errors['minlength'].requiredLength,
        ) || `Mínimo ${errors['minlength'].requiredLength} caracteres`
      );
    }
    if (errors['maxlength']) {
      return (
        messages.maxlength?.replace(
          '{requiredLength}',
          errors['maxlength'].requiredLength,
        ) || `Máximo ${errors['maxlength'].requiredLength} caracteres`
      );
    }
    if (errors['pattern']) return messages.pattern || 'Formato inválido';
    if (errors['custom']) return messages.custom || errors['custom'];

    return '';
  });

  /** Verifica se há erro de validação */
  readonly hasValidationError = computed(() => {
    const state = this.fieldState();
    const componentState = this.componentState();
    return (
      !state.valid &&
      (componentState.dirty || componentState.touched) &&
      state.errors !== null
    );
  });

  /** CSS classes básicas do componente */
  readonly baseCssClasses = computed(() => {
    const state = this.componentState();
    const fieldState = this.fieldState();
    const classes: string[] = [];

    // Estados do componente
    if (state.focused) classes.push('pdx-focused');
    if (state.disabled) classes.push('pdx-disabled');
    if (state.touched) classes.push('pdx-touched');
    if (state.dirty) classes.push('pdx-dirty');

    // Estados do campo
    if (fieldState.valid) classes.push('pdx-valid');
    if (!fieldState.valid) classes.push('pdx-invalid');

    return classes;
  });

  /** CSS classes completas do componente (extensível por subclasses) */
  readonly componentCssClasses = computed(() => {
    const baseClasses = this.baseCssClasses();
    const specificClasses = this.getSpecificCssClasses();

    return [...baseClasses, ...specificClasses].join(' ');
  });

  /** Tipo de input */
  readonly inputType = computed(() => {
    const meta = this.metadata();
    return meta?.inputType || 'text';
  });

  /** Aparência Material */
  readonly materialAppearance = computed(() => {
    const meta = this.metadata();
    return meta?.materialDesign?.appearance || 'outline';
  });

  /** Cor Material */
  readonly materialColor = computed(() => {
    const meta = this.metadata();
    return meta?.materialDesign?.color || 'primary';
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    this.componentId.set(this.generateUniqueId());
    this.formControl.set(this.internalControl); // Sincronizar FormControl signal
    this.setupFormControlIntegration();
    this.setupValidators();
    this.componentState.update((state) => ({ ...state, initialized: true }));
    this.emitLifecycleEvent('init');
    this.log('debug', 'Simple base component initialized');

    // Chamar hook após inicialização completa
    if (this.onComponentInit) {
      this.onComponentInit();
    }
    this.emitLifecycleEvent('afterInit');
  }

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement.querySelector(
      'input,textarea,select',
    ) as HTMLElement | null;
    if (el) {
      this.registerInputElement(el);
    }
  }

  ngOnDestroy(): void {
    this.emitLifecycleEvent('destroy');

    // Chamar hook antes da destruição
    if (this.onComponentDestroy) {
      this.onComponentDestroy();
    }

    this.log('debug', 'Simple base component destroyed');
  }

  // =============================================================================
  // CONTROLVVALUEACCESSOR IMPLEMENTATION
  // =============================================================================

  writeValue(value: any): void {
    if (value !== this.internalControl.value && !this.syncInProgress) {
      this.syncInProgress = true;
      try {
        this.internalControl.setValue(value, { emitEvent: false });
        this.fieldState.update((state) => ({ ...state, value }));
        this.log('debug', 'Value written from parent', { value });
      } finally {
        this.syncInProgress = false;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.componentState.update((state) => ({ ...state, disabled: isDisabled }));

    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }

    if (this.nativeElement) {
      if ('disabled' in this.nativeElement) {
        (this.nativeElement as any).disabled = isDisabled;
      } else {
        this.nativeElement.setAttribute('aria-disabled', String(isDisabled));
      }
    }
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!this.syncInProgress) {
      this.syncInProgress = true;
      try {
        this.onChange(value);
        this.valueChange.emit(value);
        this.fieldState.update((state) => ({ ...state, value }));
        this.markAsDirty();
      } finally {
        this.syncInProgress = false;
      }
    }
  }

  handleFocus(): void {
    this.componentState.update((state) => ({ ...state, focused: true }));
    this.focusChange.emit(true);
    this.log('debug', 'Component focused');
  }

  handleBlur(): void {
    this.componentState.update((state) => ({ ...state, focused: false }));
    this.focusChange.emit(false);
    this.onTouched();
    this.markAsTouched();
    this.log('debug', 'Component blurred');
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /**
   * Define o valor do campo (implementação da interface BaseDynamicFieldComponent)
   */
  setValue(value: any, options?: ValueChangeOptions): void {
    if (this.syncInProgress) return;

    const opts = { emitEvent: true, ...options };
    this.syncInProgress = true;

    try {
      this.internalControl.setValue(value, { emitEvent: false });

      if (opts.emitEvent) {
        this.onChange(value);
        this.valueChange.emit(value);
      }

      this.fieldState.update((state) => ({ ...state, value }));
      this.markAsDirty();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtém o valor do campo
   */
  getValue(): any {
    return this.internalControl.value;
  }

  /**
   * Marca o campo como tocado
   */
  markAsTouched(): void {
    this.componentState.update((state) => ({ ...state, touched: true }));
  }

  /**
   * Marca o campo como sujo
   */
  markAsDirty(): void {
    this.componentState.update((state) => ({ ...state, dirty: true }));
  }

  /**
   * Foca no elemento
   */
  focus(): void {
    const input = this.elementRef.nativeElement.querySelector('input');
    if (input) {
      input.focus();
    }
  }

  /**
   * Remove foco do elemento
   */
  blur(): void {
    const input = this.elementRef.nativeElement.querySelector('input');
    if (input) {
      input.blur();
    }
  }

  // =============================================================================
  // PROTECTED METHODS - PARA SUBCLASSES
  // =============================================================================

  /**
   * Define metadata do componente
   */
  protected setMetadata(metadata: ComponentMetadata): void {
    this.metadata.set(metadata);
    // Reaplica validators quando metadata muda
    this.setupValidators();
    this.applyNativeAttributes();
    if (metadata.disabled !== undefined) {
      this.setDisabledState(metadata.disabled);
    }
    this.emitLifecycleEvent('change');
  }

  /** Registra elemento nativo e aplica atributos/eventos */
  protected registerInputElement(el: HTMLElement): void {
    this.nativeElement = el;
    this.attachNativeEventHandlers();
    this.applyNativeAttributes();
  }

  /** Aplica atributos e ARIA com base no metadata */
  protected applyNativeAttributes(): void {
    if (!this.nativeElement) return;
    const meta = this.metadata();
    if (!meta) return;

    if (meta.name) this.nativeElement.setAttribute('name', meta.name);
    if (meta.id) this.nativeElement.id = meta.id;
    if (meta.placeholder)
      this.nativeElement.setAttribute('placeholder', meta.placeholder);
    if (meta.readonly) this.nativeElement.setAttribute('readonly', '');
    if (meta.autocomplete)
      this.nativeElement.setAttribute('autocomplete', meta.autocomplete);
    if (meta.inputMode)
      this.nativeElement.setAttribute('inputmode', meta.inputMode);
    if (meta.spellcheck !== undefined)
      this.nativeElement.setAttribute('spellcheck', String(meta.spellcheck));
    if (meta.tabIndex !== undefined)
      (this.nativeElement as any).tabIndex = meta.tabIndex;
    if (meta.maxLength !== undefined)
      (this.nativeElement as any).maxLength = meta.maxLength;
    if (meta.minLength !== undefined)
      (this.nativeElement as any).minLength = meta.minLength;
    if (meta.textTransform)
      (this.nativeElement as HTMLElement).style.textTransform =
        meta.textTransform;
    if (meta.ariaLabel)
      this.nativeElement.setAttribute('aria-label', meta.ariaLabel);
    if (meta.ariaDescribedby)
      this.nativeElement.setAttribute('aria-describedby', meta.ariaDescribedby);
    if (meta.ariaLabelledby)
      this.nativeElement.setAttribute('aria-labelledby', meta.ariaLabelledby);
    if (meta.required !== undefined) {
      this.nativeElement.setAttribute(
        'aria-required',
        meta.required ? 'true' : 'false',
      );
    }
    if (meta.dataAttributes) {
      for (const [key, value] of Object.entries(meta.dataAttributes)) {
        this.nativeElement.setAttribute(`data-${key}`, value);
      }
    }
    if (meta.autoFocus) {
      this.nativeElement.setAttribute('autofocus', '');
      setTimeout(() => this.nativeElement?.focus());
    }
  }

  /** Vincula handlers nativos de eventos */
  private attachNativeEventHandlers(): void {
    if (!this.nativeElement) return;
    const focusHandler = (event: FocusEvent) => {
      this.handleFocus();
    };
    const blurHandler = (event: FocusEvent) => {
      this.handleBlur();
      this.nativeBlur.emit(event);
    };
    const changeHandler = (event: Event) => {
      this.nativeChange.emit(event);
    };
    const inputHandler = (event: Event) => this.handleInput(event);

    this.nativeElement.addEventListener('focus', focusHandler);
    this.nativeElement.addEventListener('blur', blurHandler);
    this.nativeElement.addEventListener('change', changeHandler);
    this.nativeElement.addEventListener('input', inputHandler);

    this.destroyRef.onDestroy(() => {
      this.nativeElement?.removeEventListener('focus', focusHandler);
      this.nativeElement?.removeEventListener('blur', blurHandler);
      this.nativeElement?.removeEventListener('change', changeHandler);
      this.nativeElement?.removeEventListener('input', inputHandler);
    });
  }

  /**
   * Força validação do campo
   */
  async validateField(): Promise<ValidationErrors | null> {
    try {
      this.internalControl.updateValueAndValidity();
      const errors = this.internalControl.errors;

      this.fieldState.update((state) => ({
        ...state,
        errors,
        valid: !errors,
      }));

      return errors;
    } catch (error) {
      this.log('error', 'Validation failed', { error });
      return { validationError: { message: 'Validation failed' } };
    }
  }

  /**
   * Hook chamado após inicialização - implementação da interface BaseDynamicFieldComponent
   * Subclasses podem override para implementar comportamento específico
   */
  onComponentInit?(): void {
    // Default implementation - subclasses can override
  }

  /**
   * Hook chamado antes da destruição - implementação da interface BaseDynamicFieldComponent
   * Subclasses podem override para limpeza específica
   */
  onComponentDestroy?(): void {
    // Default implementation - subclasses can override
  }

  /**
   * Define estado de loading - implementação da interface BaseDynamicFieldComponent
   */
  setLoading?(loading: boolean): void {
    // Default implementation - subclasses can override para components com loading
    this.log('debug', `Loading state changed: ${loading}`);
  }

  /**
   * Define estado desabilitado - implementação da interface BaseDynamicFieldComponent
   */
  setDisabled?(disabled: boolean): void {
    this.setDisabledState(disabled);
  }

  /**
   * Reset do campo - implementação da interface BaseDynamicFieldComponent
   */
  resetField?(): void {
    const meta = this.metadata();
    const defaultValue = meta?.defaultValue ?? null;

    this.setValue(defaultValue, { emitEvent: false });

    this.componentState.update((state) => ({
      ...state,
      touched: false,
      dirty: false,
    }));

    this.fieldState.update((state) => ({
      ...state,
      value: defaultValue,
      valid: true,
      errors: null,
    }));

    this.internalControl.markAsPristine();
    this.internalControl.markAsUntouched();
  }

  /**
   * Retorna classes CSS específicas da subclasse
   * Subclasses devem implementar este método para adicionar suas próprias classes
   */
  protected getSpecificCssClasses(): string[] {
    return []; // Default implementation - subclasses can override
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private setupFormControlIntegration(): void {
    // Integração básica com FormControl
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.fieldState.update((state) => ({ ...state, value }));
      });

    // Sincronizar status do FormControl
    this.internalControl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.fieldState.update((state) => ({
          ...state,
          valid: status === 'VALID',
          errors: this.internalControl.errors,
        }));
      });
  }

  private setupValidators(): void {
    const config = this.validationConfig();
    if (config) {
      this.applyValidators(config);
    }
  }

  private applyValidators(config: BaseValidationConfig): void {
    const validators: ValidatorFn[] = [];

    // Validadores básicos
    if (config.required) validators.push(Validators.required);
    if (config.minLength)
      validators.push(Validators.minLength(config.minLength));
    if (config.maxLength)
      validators.push(Validators.maxLength(config.maxLength));
    if (config.pattern) validators.push(Validators.pattern(config.pattern));

    // Validador customizado
    if (config.customValidator) {
      validators.push(this.createCustomValidator(config.customValidator));
    }

    this.internalControl.setValidators(validators);
    this.internalControl.updateValueAndValidity();
  }

  private createCustomValidator(
    validatorFn: (value: any) => string | null,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = validatorFn(control.value);
      return result ? { custom: result } : null;
    };
  }

  private generateUniqueId(): string {
    return `pdx-simple-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sistema de logging básico
   */
  protected log(level: LogLevel, message: string, data?: any): void {
    if (level === 'error' || level === 'warn') {
      const logEntry = {
        level,
        message: `[${this.componentId()}] ${message}`,
        timestamp: new Date().toISOString(),
        data,
      };

      const consoleFn = level === 'error' ? console.error : console.warn;
      consoleFn(logEntry.message, data || '');
    }
    // Para debug/info, só logamos em desenvolvimento (simplificado)
    else if (level === 'debug') {
      console.debug(`[${this.componentId()}] ${message}`, data || '');
    }
  }

  private emitLifecycleEvent(phase: ComponentLifecycleEvent['phase']): void {
    const event: ComponentLifecycleEvent = {
      phase,
      timestamp: Date.now(),
      componentId: this.componentId(),
      metadata: this.metadata(),
    };

    this.lifecycleEvents$.next(event);
  }
}
