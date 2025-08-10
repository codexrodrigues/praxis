import { Component, forwardRef, output, computed, OnInit } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDatepickerModule,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MaterialDateRangeMetadata, DateRangeValue } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Specialized component using Angular Material Date Range picker.
 *
 * Renders a `<mat-form-field>` with a `mat-date-range-input` bound to
 * an internal `FormGroup`. Integrates toggle button, hint and error support
 * following the same pattern used by other dynamic field components.
 */
@Component({
  selector: 'pdx-material-date-range',
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

      <mat-date-range-input
        [formGroup]="rangeGroup"
        [rangePicker]="picker"
        [min]="minDate()"
        [max]="maxDate()"
        [dateFilter]="metadata()?.dateFilter"
        [required]="metadata()?.required || false"
      >
        <input
          matStartDate
          formControlName="start"
          [attr.placeholder]="
            metadata()?.startPlaceholder &&
            metadata()?.startPlaceholder.trim() !== (label ?? '').trim()
              ? metadata()!.startPlaceholder
              : null
          "
          [readonly]="metadata()?.readonly || false"
          [attr.aria-label]="
            metadata()?.startAriaLabel ||
            (!label && metadata()?.startPlaceholder
              ? metadata()?.startPlaceholder
              : null)
          "
        />
        <input
          matEndDate
          formControlName="end"
          [attr.placeholder]="
            metadata()?.endPlaceholder &&
            metadata()?.endPlaceholder.trim() !== (label ?? '').trim()
              ? metadata()!.endPlaceholder
              : null
          "
          [readonly]="metadata()?.readonly || false"
          [attr.aria-label]="
            metadata()?.endAriaLabel ||
            (!label && metadata()?.endPlaceholder
              ? metadata()?.endPlaceholder
              : null)
          "
        />
      </mat-date-range-input>

      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>

      @if (metadata()?.suffixIcon) {
        <mat-icon matSuffix>{{ metadata()!.suffixIcon }}</mat-icon>
      }

      <mat-date-range-picker
        #picker
        [startView]="metadata()?.startView || 'month'"
        [startAt]="startAt()"
        [touchUi]="metadata()?.touchUi || false"
        [color]="materialColor()"
      ></mat-date-range-picker>

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
      useExisting: forwardRef(() => MaterialDateRangeComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"dateRange"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialDateRangeComponent
  extends SimpleBaseInputComponent
  implements OnInit
{
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  readonly rangeGroup = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

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

  override ngOnInit(): void {
    this.rangeGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ start, end }) => {
        const value: DateRangeValue = {
          startDate: start ?? null,
          endDate: end ?? null,
        };
        this.setValue(value);
      });

    this.rangeGroup.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const errors = this.rangeGroup.errors;
        this.internalControl.setErrors(errors);
      });

    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: DateRangeValue | null) => {
        this.rangeGroup.patchValue(
          { start: val?.startDate ?? null, end: val?.endDate ?? null },
          { emitEvent: false },
        );
      });

    super.ngOnInit();
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-date-range'];
  }

  /** Applies component metadata with strong typing. */
  setDateRangeMetadata(metadata: MaterialDateRangeMetadata): void {
    this.setMetadata(metadata);
  }
}
