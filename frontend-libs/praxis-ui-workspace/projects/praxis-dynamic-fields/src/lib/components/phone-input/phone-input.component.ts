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

import { MaterialPhoneMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Specialized input component for telephone numbers.
 *
 * Renders a `<mat-form-field>` wrapping an `<input type="tel">` element with
 * Material styling. Built on top of `SimpleBaseInputComponent` to leverage
 * reactive forms integration, hint/error messaging and validation hooks.
 */
@Component({
  selector: 'pdx-phone-input',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Phone' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [autocomplete]="metadata()?.autocomplete || 'tel'"
        [type]="inputType()"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
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
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"phone"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class PhoneInputComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  override ngOnInit(): void {
    this.internalControl.addValidators(Validators.pattern(/^[0-9()+\-\s]*$/));
    super.ngOnInit();
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-phone-input'];
  }

  /** Applies strongly typed metadata to the component. */
  setInputMetadata(metadata: MaterialPhoneMetadata): void {
    this.setMetadata(metadata);
  }
}
