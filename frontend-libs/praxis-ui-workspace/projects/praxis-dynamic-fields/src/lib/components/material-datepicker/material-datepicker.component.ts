import { Component, forwardRef, output, computed } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDatepickerModule,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MaterialDatepickerMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Specialized component using Angular Material Datepicker.
 *
 * Renders a `<mat-form-field>` with an `<input>` bound to a
 * `mat-datepicker`. Includes toggle button, hint and error support
 * following the same pattern used by other dynamic field components.
 */
@Component({
  selector: 'pdx-material-datepicker',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Date' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [matDatepicker]="picker"
        [matDatepickerFilter]="metadata()?.dateFilter"
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [min]="minDate()"
        [max]="maxDate()"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
        (dateChange)="onDateChange($event)"
      />

      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>

      @if (metadata()?.suffixIcon) {
        <mat-icon matSuffix>{{ metadata()!.suffixIcon }}</mat-icon>
      }

      <mat-datepicker
        #picker
        [startView]="metadata()?.startView || 'month'"
        [startAt]="startAt()"
        [touchUi]="metadata()?.touchUi || false"
        [color]="materialColor()"
        [disabled]="metadata()?.disabled || false"
      ></mat-datepicker>

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
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialDatepickerComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"date"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialDatepickerComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  readonly minDate = computed(() => {
    const md = this.metadata()?.minDate;
    return typeof md === 'string' ? new Date(md) : md;
  });

  readonly maxDate = computed(() => {
    const md = this.metadata()?.maxDate;
    return typeof md === 'string' ? new Date(md) : md;
  });

  readonly startAt = computed(() => {
    const sa = this.metadata()?.startAt;
    return typeof sa === 'string' ? new Date(sa) : (sa ?? null);
  });

  onDateChange(event: MatDatepickerInputEvent<Date | null>): void {
    this.setValue(event.value ?? null);
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-datepicker'];
  }

  /** Applies component metadata with strong typing. */
  setDatepickerMetadata(metadata: MaterialDatepickerMetadata): void {
    this.setMetadata(metadata);
  }
}
