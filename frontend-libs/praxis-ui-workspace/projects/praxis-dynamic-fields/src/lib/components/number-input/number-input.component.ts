import { Component, forwardRef, output } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { MaterialNumericMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Specialized input component for HTML number inputs.
 *
 * Renders a `<mat-form-field>` containing an `<input type="number">` element
 * with basic validation and hint support. Built on top of the
 * `SimpleBaseInputComponent` to leverage common functionality such as
 * reactive forms integration and error handling.
 */
@Component({
  selector: 'pdx-number-input',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ label }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [attr.placeholder]="
          shouldShowPlaceholder && placeholder ? placeholder : null
        "
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [type]="inputType()"
        [min]="metadata()?.min ?? null"
        [max]="metadata()?.max ?? null"
        [step]="metadata()?.step ?? null"
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
    </mat-form-field>
  `,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"numericTextBox"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class NumberInputComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  override ngOnInit(): void {
    this.internalControl.addValidators(Validators.pattern(/^\d*(\.\d+)?$/));
    const min = this.metadata()?.min;
    const max = this.metadata()?.max;
    if (min !== undefined) {
      this.internalControl.addValidators(Validators.min(min));
    }
    if (max !== undefined) {
      this.internalControl.addValidators(Validators.max(max));
    }
    super.ngOnInit();
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-number-input'];
  }

  /** Applies component metadata with strong typing. */
  setInputMetadata(metadata: MaterialNumericMetadata): void {
    this.setMetadata(metadata);
  }
}
