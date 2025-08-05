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
import {
  MatTimepickerModule,
  MatTimepicker,
} from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

import { MaterialTimepickerMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Angular Material timepicker component used in dynamic forms.
 *
 * Provides a form field with an input connected to `mat-timepicker`, allowing
 * users to select a time of day. Built on top of the `SimpleBaseInputComponent`
 * to reuse control value accessor integration and validation handling.
 */
@Component({
  selector: 'pdx-material-timepicker',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Time' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      <input
        matInput
        [formControl]="internalControl"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [matTimepicker]="picker"
        [matTimepickerMin]="metadata()?.min || null"
        [matTimepickerMax]="metadata()?.max || null"
        [matTimepickerOpenOnClick]="metadata()?.openOnClick ?? true"
        [matTimepickerFilter]="timeFilterFn"
        [step]="stepAttribute()"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
      />

      <mat-timepicker-toggle matSuffix [for]="picker"></mat-timepicker-toggle>

      <mat-timepicker
        #picker
        [interval]="metadata()?.interval || null"
        [touchUi]="metadata()?.touchUi || false"
        [format]="metadata()?.format || '24h'"
        [showSeconds]="metadata()?.showSeconds || false"
        [timeOptions]="metadata()?.timeOptions || null"
        [disabled]="internalControl.disabled"
      ></mat-timepicker>

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
    MatTimepickerModule,
    MatIconModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialTimepickerComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"timePicker"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialTimepickerComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  /** Optional function used to filter selectable times. */
  timeFilterFn?: (time: string) => boolean;

  override ngOnInit(): void {
    const meta = this.metadata();

    // Accept times in HH:mm or HH:mm:ss formats.
    this.internalControl.addValidators(
      Validators.pattern(/^\d{2}:\d{2}(?::\d{2})?$/),
    );

    if (meta?.stepMinute) {
      this.internalControl.addValidators((control) => {
        const value = control.value as string | null;
        if (!value) return null;
        const minute = Number(value.split(':')[1]);
        return minute % meta.stepMinute! === 0 ? null : { stepMinute: true };
      });
    }

    if (meta?.showSeconds && meta.stepSecond) {
      this.internalControl.addValidators((control) => {
        const value = control.value as string | null;
        if (!value) return null;
        const second = Number(value.split(':')[2] || 0);
        return second % meta.stepSecond! === 0 ? null : { stepSecond: true };
      });
    }

    this.timeFilterFn = this.resolveTimeFilter(meta?.timeFilter);
    if (this.timeFilterFn) {
      this.internalControl.addValidators((control) => {
        const value = control.value as string | null;
        if (!value) return null;
        return this.timeFilterFn!(value) ? null : { timeFilter: true };
      });
    }
    super.ngOnInit();
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    const classes = ['pdx-material-timepicker'];
    const meta = this.metadata();
    if (meta?.cssClass) classes.push(meta.cssClass);
    if (meta?.touchUi) classes.push('pdx-touch-ui');
    return classes;
  }

  /** Applies component metadata with strong typing. */
  setInputMetadata(metadata: MaterialTimepickerMetadata): void {
    this.setMetadata(metadata);
  }

  /** Calculates step attribute (seconds) based on metadata. */
  stepAttribute(): number | null {
    const meta = this.metadata();
    if (meta?.showSeconds && meta.stepSecond) {
      return meta.stepSecond;
    }
    if (meta?.stepMinute) {
      return meta.stepMinute * 60;
    }
    return null;
  }

  /** Resolves a filter function by name on the component instance. */
  private resolveTimeFilter(
    name?: string,
  ): ((time: string) => boolean) | undefined {
    if (!name) return undefined;
    const candidate = (this as any)[name];
    return typeof candidate === 'function' ? candidate.bind(this) : undefined;
  }
}
