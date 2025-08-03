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

import { MaterialWeekInputMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Specialized input component for HTML week inputs.
 *
 * Renders a `<mat-form-field>` containing an `<input type="week">` element
 * with optional min/max constraints, basic validation and hint support.
 * Built on top of the `SimpleBaseInputComponent` to reuse core features
 * like reactive forms integration and error handling.
 */
@Component({
  selector: 'pdx-week-input',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Week' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [type]="inputType()"
        [min]="metadata()?.min || null"
        [max]="metadata()?.max || null"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
        (focus)="handleFocus()"
        (blur)="handleBlur()"
        (input)="handleInput($event)"
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
        <mat-hint [align]="metadata()?.hintAlign || 'start'">
          {{ metadata()!.hint }}
        </mat-hint>
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
      useExisting: forwardRef(() => WeekInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"week"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class WeekInputComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  override ngOnInit(): void {
    this.internalControl.addValidators(Validators.pattern(/^\d{4}-W\d{2}$/));
    super.ngOnInit();
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-week-input'];
  }

  /** Applies component metadata with strong typing. */
  setInputMetadata(metadata: MaterialWeekInputMetadata): void {
    this.setMetadata(metadata);
  }
}
