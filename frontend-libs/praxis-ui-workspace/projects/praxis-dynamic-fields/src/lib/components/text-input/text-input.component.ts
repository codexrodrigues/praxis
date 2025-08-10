import { Component, forwardRef, computed, output } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { MaterialInputMetadata, ComponentMetadata } from '@praxis/core';
import {
  SimpleBaseInputComponent,
  BaseValidationConfig,
} from '../../base/simple-base-input.component';

// =============================================================================
// INTERFACES ESPECÍFICAS DO TEXT-INPUT (herda BaseValidationConfig)
// =============================================================================

@Component({
  selector: 'pdx-text-input',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      floatLabel="auto"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ label }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [placeholder]="shouldShowPlaceholder ? placeholder : null"
        [required]="metadata()?.required || false"
        [type]="inputType()"
        [autocomplete]="metadata()?.autocomplete || 'off'"
        [spellcheck]="metadata()?.spellcheck ?? true"
        [readonly]="metadata()?.readonly || false"
        [maxlength]="metadata()?.maxLength || null"
        [minlength]="metadata()?.minLength || null"
        [attr.aria-label]="!label && placeholder ? placeholder : null"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
      />

      @if (metadata()?.suffixIcon) {
        <mat-icon matSuffix>{{ metadata()!.suffixIcon }}</mat-icon>
      }

      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }

      @if (metadata()?.hint && !hasValidationError()) {
        <mat-hint [align]="metadata()?.hintAlign || 'start'">{{
          metadata()!.hint
        }}</mat-hint>
      }

      @if (metadata()?.showCharacterCount && metadata()?.maxLength) {
        <mat-hint align="end">
          {{ (internalControl.value || '').length }} /
          {{ metadata()!.maxLength }}
        </mat-hint>
      }
    </mat-form-field>
  `,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
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
    '[attr.data-field-type]': '"input"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class TextInputComponent extends SimpleBaseInputComponent {
  // =============================================================================
  // OUTPUTS ESPECÍFICOS
  // =============================================================================

  readonly validationChange = output<ValidationErrors | null>();

  // =============================================================================
  // COMPUTED PROPERTIES (validação e classes herdadas da base)
  // =============================================================================

  // Todas as computed properties (CSS classes, validação, Material Design) estão na base class

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  override ngOnInit(): void {
    super.ngOnInit(); // Chama a inicialização da classe base (já inclui setupValidators)

    try {
      this.log('debug', 'TextInput initialized');
    } catch (error) {
      this.log('error', 'TextInput initialization failed', { error });
    }
  }

  override onComponentInit(): void {
    // Inicialização específica do text-input
    const meta = this.metadata();
    if (meta) {
      // Inicializar valor padrão se definido
      if (
        meta.defaultValue !== undefined &&
        this.internalControl.value == null
      ) {
        this.internalControl.setValue(meta.defaultValue, { emitEvent: false });
      }
    }
  }

  /**
   * Adiciona classes CSS específicas do text-input
   */
  protected override getSpecificCssClasses(): string[] {
    return ['pdx-text-input'];
  }

  // =============================================================================
  // EVENT HANDLERS (inherited from base, pode ser customizado se necessário)
  // =============================================================================

  // =============================================================================
  // MÉTODOS PÚBLICOS ESPECÍFICOS
  // =============================================================================

  /**
   * Reset do campo
   */
  override resetField(): void {
    const meta = this.metadata();
    const defaultValue = meta?.defaultValue ?? null;

    this.setValue(defaultValue, { emitEvent: false });

    // Reset estados via base class
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
   * Força validação do campo (override para emitir evento)
   */
  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  /**
   * Define metadata e aplica configurações
   */
  setInputMetadata(metadata: MaterialInputMetadata): void {
    this.setMetadata(metadata); // Base class já reaplica validators
  }
}
