import { Component, forwardRef, computed, OnInit, output } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  MaterialPriceRangeMetadata,
  PriceRangeValue,
  FieldControlType,
  MaterialCurrencyMetadata,
} from '@praxis/core';
import { MaterialCurrencyComponent } from '../material-currency/material-currency.component';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Component for selecting a price range using two currency inputs.
 *
 * Reuses `MaterialCurrencyComponent` for both the minimum and maximum
 * values, keeping formatting and validation consistent.
 */
@Component({
  selector: 'pdx-material-price-range',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialCurrencyComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialPriceRangeComponent),
      multi: true,
    },
  ],
  template: `
    <div class="price-range-container">
      <label class="range-label">{{
        metadata()?.label || 'Price range'
      }}</label>
      <div class="range-inputs" [formGroup]="rangeGroup">
        <pdx-material-currency
          formControlName="minPrice"
          [metadata]="startCurrencyMetadata()"
        ></pdx-material-currency>
        <pdx-material-currency
          formControlName="maxPrice"
          [metadata]="endCurrencyMetadata()"
        ></pdx-material-currency>
      </div>

      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <div class="mat-error">{{ errorMessage() }}</div>
      }

      @if (metadata()?.hint && !hasValidationError()) {
        <div class="mat-hint">{{ metadata()!.hint }}</div>
      }
    </div>
  `,
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"priceRange"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialPriceRangeComponent
  extends SimpleBaseInputComponent
  implements OnInit
{
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  readonly rangeGroup = new FormGroup({
    minPrice: new FormControl<number | null>(null),
    maxPrice: new FormControl<number | null>(null),
  });

  readonly startCurrencyMetadata = computed(() => {
    const md = this.metadata() as MaterialPriceRangeMetadata | null;
    if (!md) return null;
    const meta: MaterialCurrencyMetadata = {
      controlType: FieldControlType.CURRENCY_INPUT,
      name: `${md.name}_min`,
      label: md.startLabel || 'Min',
      inputType: 'text',
      currency: md.currency,
      currencyPosition: md.currencyPosition,
      decimalPlaces: md.decimalPlaces,
      allowNegative: md.allowNegative,
      placeholder: md.startPlaceholder,
      required: md.required,
    };
    return meta;
  });

  readonly endCurrencyMetadata = computed(() => {
    const md = this.metadata() as MaterialPriceRangeMetadata | null;
    if (!md) return null;
    const meta: MaterialCurrencyMetadata = {
      controlType: FieldControlType.CURRENCY_INPUT,
      name: `${md.name}_max`,
      label: md.endLabel || 'Max',
      inputType: 'text',
      currency: md.currency,
      currencyPosition: md.currencyPosition,
      decimalPlaces: md.decimalPlaces,
      allowNegative: md.allowNegative,
      placeholder: md.endPlaceholder,
      required: md.required,
    };
    return meta;
  });

  /** Custom error messages for range-specific validations */
  override readonly errorMessage = computed(() => {
    const errors = this.internalControl.errors;
    const md = this.metadata() as MaterialPriceRangeMetadata | null;
    if (!errors) return '';

    if (errors['rangeOrder']) {
      return 'O valor inicial deve ser menor ou igual ao final';
    }
    if (errors['minValue'] && md?.min != null) {
      return `Valor mínimo permitido é ${md.min}`;
    }
    if (errors['maxValue'] && md?.max != null) {
      return `Valor máximo permitido é ${md.max}`;
    }

    return '';
  });

  override ngOnInit(): void {
    const md = this.metadata() as MaterialPriceRangeMetadata | null;
    if (md) {
      this.rangeGroup.addValidators((group) => {
        const val = group.value as PriceRangeValue;
        const start = val.minPrice;
        const end = val.maxPrice;
        if (start != null && end != null && start > end) {
          return { rangeOrder: true };
        }
        if (
          md.min != null &&
          ((start != null && start < md.min) || (end != null && end < md.min))
        ) {
          return { minValue: true };
        }
        if (
          md.max != null &&
          ((start != null && start > md.max) || (end != null && end > md.max))
        ) {
          return { maxValue: true };
        }
        return null;
      });
    }

    this.rangeGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ minPrice, maxPrice }) => {
        const value: PriceRangeValue = {
          minPrice: minPrice ?? null,
          maxPrice: maxPrice ?? null,
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
      .subscribe((val: PriceRangeValue | null) => {
        this.rangeGroup.patchValue(
          {
            minPrice: val?.minPrice ?? null,
            maxPrice: val?.maxPrice ?? null,
          },
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
    return ['pdx-material-price-range'];
  }

  /** Applies component metadata with strong typing. */
  setPriceRangeMetadata(metadata: MaterialPriceRangeMetadata): void {
    this.setMetadata(metadata);
  }
}
