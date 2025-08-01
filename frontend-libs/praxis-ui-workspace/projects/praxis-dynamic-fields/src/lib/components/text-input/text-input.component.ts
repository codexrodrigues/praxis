import {
  Component,
  forwardRef,
  signal,
  OnInit,
  OnDestroy,
  computed,
  inject,
  DestroyRef,
  ElementRef,
  ChangeDetectorRef,
  output
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  ReactiveFormsModule,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MaterialInputMetadata } from '@praxis/core';

// =============================================================================
// INTERFACES LOCAIS
// =============================================================================

interface ComponentState {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  dirty: boolean;
  touched: boolean;
  focused: boolean;
  disabled: boolean;
}

interface FieldState {
  value: any;
  pristine: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  pending: boolean;
  errors: ValidationErrors | null;
  focused: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  lastUpdateTime: number;
  changeCount: number;
}

interface ValidationState {
  isValidating: boolean;
  lastValidationTime: number;
  validationCount: number;
}

interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  announce?: boolean;
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// Interface para configuração de validação
interface TextInputValidationConfig {
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

@Component({
  selector: 'pdx-text-input',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()">

      <mat-label>{{ metadata()?.label || 'Text' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
        [type]="inputType()"
        [autocomplete]="metadata()?.autocomplete || 'off'"
        [spellcheck]="metadata()?.spellcheck ?? true"
        [readonly]="metadata()?.readonly || false"
        [maxlength]="metadata()?.maxLength || null"
        [minlength]="metadata()?.minLength || null"
        [attr.aria-label]="accessibilityAttributes()['aria-label']"
        [attr.aria-describedby]="accessibilityAttributes()['aria-describedby']"
        [attr.aria-invalid]="accessibilityAttributes()['aria-invalid']"
        [attr.aria-required]="accessibilityAttributes()['aria-required']"
        (focus)="handleFocus()"
        (blur)="handleBlur()"
        (input)="handleInput($event)"
      />

      @if (metadata()?.suffixIcon) {
        <mat-icon matSuffix>{{ metadata()!.suffixIcon }}</mat-icon>
      }

      @if (errorMessage() && internalControl.invalid && (internalControl.dirty || internalControl.touched)) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }

      @if (metadata()?.hint && !hasValidationError()) {
        <mat-hint [align]="metadata()?.hintAlign || 'start'">{{ metadata()!.hint }}</mat-hint>
      }

      @if (metadata()?.showCharacterCount && metadata()?.maxLength) {
        <mat-hint align="end">
          {{ (internalControl.value || '').length }} / {{ metadata()!.maxLength }}
        </mat-hint>
      }

    </mat-form-field>
  `,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"text-input"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()'
  }
})
export class TextInputComponent implements ControlValueAccessor, OnInit, OnDestroy {

  // =============================================================================
  // DEPENDENCY INJECTION (MODERNO ANGULAR 19+)
  // =============================================================================

  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // =============================================================================
  // SIGNALS REACTIVOS
  // =============================================================================

  /** Metadata do componente */
  readonly metadata = signal<MaterialInputMetadata | null>(null);

  /** Estado do componente */
  private readonly componentState = signal<ComponentState>({
    initialized: false,
    loading: false,
    error: null,
    dirty: false,
    touched: false,
    focused: false,
    disabled: false
  });

  /** Estado específico do campo */
  private readonly fieldState = signal<FieldState>({
    value: null,
    pristine: true,
    dirty: false,
    touched: false,
    valid: true,
    pending: false,
    errors: null,
    focused: false
  });

  /** Métricas de performance */
  private readonly performanceMetrics = signal<PerformanceMetrics>({
    renderTime: 0,
    lastUpdateTime: 0,
    changeCount: 0
  });

  /** Estado de validação */
  private readonly validationState = signal<ValidationState>({
    isValidating: false,
    lastValidationTime: 0,
    validationCount: 0
  });

  /** Configuração de acessibilidade */
  private readonly accessibilityConfig = signal<AccessibilityConfig>({});

  /** Nível de log */
  private readonly logLevel = signal<LogLevel>('info');

  /** ID único do componente */
  readonly componentId = signal<string>('');

  // =============================================================================
  // FORM CONTROL E CONTROLE DE VALOR
  // =============================================================================

  readonly internalControl = new FormControl();

  /** FormControl signal para compatibilidade com DynamicFieldLoader */
  readonly formControl = signal<FormControl | null>(null);

  private onChange = (value: any) => {};
  private onTouched = () => {};
  private destroy$ = new Subject<void>();
  private syncInProgress = false;

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  readonly valueChange = output<any>();
  readonly validationChange = output<ValidationErrors | null>();
  readonly focusChange = output<boolean>();
  readonly stateChange = output<FieldState>();

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  // Computed para configuração de validação baseada no metadata
  private readonly validationConfig = computed(() => {
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
        minlength: meta.validators?.minLengthMessage || `Mínimo {requiredLength} caracteres`,
        maxlength: meta.validators?.maxLengthMessage || `Máximo {requiredLength} caracteres`,
        pattern: meta.validators?.patternMessage || 'Formato inválido',
        custom: 'Valor inválido'
      },
      validateOnBlur: meta.validators?.validationTrigger === 'blur',
      debounceTime: meta.validators?.validationDebounce ?? 300
    } as TextInputValidationConfig;
  });

  // Computed para exibir erros
  readonly errorMessage = computed(() => {
    const errors = this.internalControl.errors;
    const config = this.validationConfig();

    if (!errors || !config) return '';

    const messages = config.messages || {};

    if (errors['required']) return messages.required || 'Campo obrigatório';
    if (errors['minlength']) {
      return messages.minlength?.replace('{requiredLength}', errors['minlength'].requiredLength) ||
             `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return messages.maxlength?.replace('{requiredLength}', errors['maxlength'].requiredLength) ||
             `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) return messages.pattern || 'Formato inválido';
    if (errors['custom']) return messages.custom || errors['custom'];

    return '';
  });

  /** CSS classes do componente */
  readonly componentCssClasses = computed(() => {
    const state = this.componentState();
    const fieldState = this.fieldState();
    const classes: string[] = ['pdx-text-input'];

    // Estados do componente
    if (state.loading) classes.push('pdx-loading');
    if (state.error) classes.push('pdx-error');
    if (state.dirty) classes.push('pdx-dirty');
    if (state.touched) classes.push('pdx-touched');
    if (state.focused) classes.push('pdx-focused');
    if (state.disabled) classes.push('pdx-disabled');

    // Estados do campo
    if (fieldState.pristine) classes.push('pdx-pristine');
    if (fieldState.valid) classes.push('pdx-valid');
    if (!fieldState.valid) classes.push('pdx-invalid');
    if (fieldState.pending) classes.push('pdx-pending');

    return classes.join(' ');
  });

  /** Verifica se há erro de validação */
  readonly hasValidationError = computed(() => {
    const state = this.fieldState();
    return !state.valid && (state.dirty || state.touched) && state.errors !== null;
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

  /** Atributos de acessibilidade */
  readonly accessibilityAttributes = computed(() => {
    const config = this.accessibilityConfig();
    const meta = this.metadata();
    const hasError = this.hasValidationError();

    return {
      'aria-label': config.ariaLabel || meta?.ariaLabel || meta?.label || '',
      'aria-describedby': this.buildAriaDescribedBy(),
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-required': meta?.required ? 'true' : 'false'
    };
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    try {
      // Gerar ID único
      this.componentId.set(this.generateUniqueId());

      // Setup simples sem injection context
      this.setupFormControlIntegration();
      this.setupValidators();
      this.setupAccessibilityFeatures();
      this.setupPerformanceMonitoring();

      // Marcar como inicializado
      this.updateComponentState({ initialized: true });

      this.log('debug', 'Component initialized', {
        id: this.componentId()
      });

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.log('debug', 'Component destroyed', { id: this.componentId() });
  }

  // =============================================================================
  // CONTROLVVALUEACCESSOR IMPLEMENTATION
  // =============================================================================

  writeValue(value: any): void {
    if (value !== this.internalControl.value && !this.syncInProgress) {
      this.syncInProgress = true;

      try {
        this.internalControl.setValue(value, { emitEvent: false });
        this.updateFieldState({ value });
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
    this.updateComponentState({ disabled: isDisabled });

    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
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
        this.updateFieldState({
          value,
          dirty: true,
          pristine: false
        });
        this.markAsDirty();
      } finally {
        this.syncInProgress = false;
      }
    }
  }

  handleFocus(): void {
    this.updateComponentState({ focused: true });
    this.updateFieldState({ focused: true });
    this.focusChange.emit(true);
    this.log('debug', 'Component focused');
  }

  handleBlur(): void {
    this.updateComponentState({ focused: false });
    this.updateFieldState({ focused: false });
    this.focusChange.emit(false);
    this.onTouched();
    this.markAsTouched();
    this.log('debug', 'Component blurred');
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Define o valor do campo
   */
  setValue(value: any, options?: { emitEvent?: boolean }): void {
    if (this.syncInProgress) return;

    const opts = { emitEvent: true, ...options };

    this.syncInProgress = true;

    try {
      this.internalControl.setValue(value, { emitEvent: false });

      if (opts.emitEvent) {
        this.onChange(value);
        this.valueChange.emit(value);
      }

      this.updateFieldState({
        value,
        dirty: true,
        pristine: false
      });
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
    this.updateComponentState({ touched: true });
    this.updateFieldState({ touched: true });
  }

  /**
   * Marca o campo como sujo
   */
  markAsDirty(): void {
    this.updateComponentState({ dirty: true });
    this.updateFieldState({ dirty: true, pristine: false });
  }

  /**
   * Reset do campo
   */
  resetField(): void {
    const meta = this.metadata();
    const defaultValue = meta?.defaultValue ?? null;

    this.setValue(defaultValue, { emitEvent: false });
    this.updateFieldState({
      pristine: true,
      dirty: false,
      touched: false,
      errors: null,
      valid: true
    });

    this.internalControl.markAsPristine();
    this.internalControl.markAsUntouched();
  }

  /**
   * Força validação do campo
   */
  async validateField(): Promise<ValidationErrors | null> {
    this.updateValidationState({ isValidating: true });

    try {
      this.internalControl.updateValueAndValidity();
      const errors = this.internalControl.errors;

      this.updateFieldState({
        errors,
        valid: !errors
      });

      this.updateValidationState({
        isValidating: false,
        lastValidationTime: Date.now(),
        validationCount: this.validationState().validationCount + 1
      });

      this.validationChange.emit(errors);
      return errors;

    } catch (error) {
      this.updateValidationState({ isValidating: false });
      this.log('error', 'Validation failed', { error });
      return { validationError: { message: 'Validation failed' } };
    }
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

  /**
   * Lifecycle hook chamado pela diretiva após inicialização
   */
  onComponentInit(): void {
    // Inicialização adicional específica pode ser adicionada aqui
    // Este método é chamado pelo DynamicFieldLoader
    this.log('debug', 'onComponentInit called by DynamicFieldLoader');

    // Garantir que metadata foi configurada
    const meta = this.metadata();
    if (meta) {
      // Inicializar valor padrão se definido
      if (meta.defaultValue !== undefined && this.internalControl.value == null) {
        this.internalControl.setValue(meta.defaultValue, { emitEvent: false });
      }
    }
  }

  // =============================================================================
  // MÉTODOS PRIVADOS - SETUP E CONFIGURAÇÃO
  // =============================================================================

  private setupFormControlIntegration(): void {
    // Setup simples do FormControl interno
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.updateFieldState({
          value,
          dirty: true,
          pristine: false
        });
      });

    // Sincronizar status do FormControl
    this.internalControl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => {
        this.updateFieldState({
          valid: status === 'VALID',
          pending: status === 'PENDING',
          errors: this.internalControl.errors
        });
      });
  }

  private setupValidators(): void {
    // Setup simples de validadores
    const config = this.validationConfig();
    if (config) {
      this.applyValidators(config);
    }
  }

  private setupAccessibilityFeatures(): void {
    // Setup simples de acessibilidade
    const meta = this.metadata();
    if (meta) {
      this.accessibilityConfig.set({
        ariaLabel: meta.ariaLabel || meta.label || '',
        role: 'textbox',
        announce: true
      });
    }
  }

  private setupPerformanceMonitoring(): void {
    // Setup simples de métricas
    this.updatePerformanceMetrics({
      lastUpdateTime: Date.now(),
      changeCount: 0
    });
  }

  private applyValidators(config: TextInputValidationConfig): void {
    const validators: ValidatorFn[] = [];

    // Validadores básicos
    if (config.required) validators.push(Validators.required);
    if (config.minLength) validators.push(Validators.minLength(config.minLength));
    if (config.maxLength) validators.push(Validators.maxLength(config.maxLength));
    if (config.pattern) validators.push(Validators.pattern(config.pattern));

    // Validador customizado
    if (config.customValidator) {
      validators.push(this.createCustomValidator(config.customValidator));
    }

    this.internalControl.setValidators(validators);
    this.internalControl.updateValueAndValidity();
  }

  private createCustomValidator(validatorFn: (value: any) => string | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = validatorFn(control.value);
      return result ? { custom: result } : null;
    };
  }

  // =============================================================================
  // MÉTODOS PRIVADOS - HELPERS
  // =============================================================================

  private updateComponentState(stateChanges: Partial<ComponentState>): void {
    const currentState = this.componentState();
    const newState = { ...currentState, ...stateChanges };
    this.componentState.set(newState);
  }

  private updateFieldState(stateChanges: Partial<FieldState>): void {
    const currentState = this.fieldState();
    const newState = { ...currentState, ...stateChanges };
    this.fieldState.set(newState);
    this.stateChange.emit(newState);
  }

  private updatePerformanceMetrics(metricsChanges: Partial<PerformanceMetrics>): void {
    const currentMetrics = this.performanceMetrics();
    const newMetrics = { ...currentMetrics, ...metricsChanges };
    this.performanceMetrics.set(newMetrics);
  }

  private updateValidationState(stateChanges: Partial<ValidationState>): void {
    const currentState = this.validationState();
    this.validationState.set({ ...currentState, ...stateChanges });
  }

  private generateUniqueId(): string {
    return `pdx-text-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildAriaDescribedBy(): string {
    const meta = this.metadata();
    const parts: string[] = [];

    if (meta?.hint) {
      parts.push(`${this.componentId()}-hint`);
    }

    if (this.hasValidationError()) {
      parts.push(`${this.componentId()}-error`);
    }

    return parts.join(' ');
  }

  private handleError(error: Error): void {
    this.updateComponentState({ error });
    this.log('error', 'Component error', { error: error.message });
  }

  /**
   * Sistema de logging integrado
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const currentLevel = this.logLevel();
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];

    if (levels.indexOf(level) >= levels.indexOf(currentLevel)) {
      const logEntry = {
        level,
        message: `[${this.componentId()}] ${message}`,
        timestamp: new Date().toISOString(),
        data
      };

      // Log no console baseado no nível
      const consoleFn = level === 'error' ? console.error :
                       level === 'warn' ? console.warn :
                       level === 'debug' ? console.debug : console.log;

      consoleFn(logEntry.message, data || '');
    }
  }
}
