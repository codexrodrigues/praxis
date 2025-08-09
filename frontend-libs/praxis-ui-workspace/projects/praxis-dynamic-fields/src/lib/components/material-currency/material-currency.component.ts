import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  computed,
  output,
  inject,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData,
} from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

registerLocaleData(localePt, 'pt');

import { MaterialCurrencyMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Input component for currency values with basic formatting support.
 *
 * Displays a currency symbol as prefix or suffix and validates numeric input.
 */
@Component({
  selector: 'pdx-material-currency',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Amount' }}</mat-label>

      @if (metadata()?.prefixIcon) {
        <mat-icon matPrefix>{{ metadata()!.prefixIcon }}</mat-icon>
      }

      @if (currencyPosition() === 'before') {
        <span matPrefix class="currency-symbol">{{ currencySymbol() }}</span>
      }

      <input
        matInput
        #currencyInput
        type="text"
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />

      @if (currencyPosition() === 'after') {
        <span matSuffix class="currency-symbol">{{ currencySymbol() }}</span>
      }

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
    CurrencyPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialCurrencyComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"currency"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialCurrencyComponent extends SimpleBaseInputComponent {
  /** Emits whenever validation state changes. */
  readonly validationChange = output<ValidationErrors | null>();

  private readonly currencyPipe = inject(CurrencyPipe);

  @ViewChild('currencyInput', { static: true })
  private readonly inputRef!: ElementRef<HTMLInputElement>;

  /** Currency code used for formatting. */
  readonly currencyCode = computed(
    () =>
      (this.metadata() as MaterialCurrencyMetadata | null)?.currency || 'USD',
  );

  /** Position of the currency symbol relative to the input. */
  readonly currencyPosition = computed(
    () =>
      (this.metadata() as MaterialCurrencyMetadata | null)?.currencyPosition ||
      'before',
  );

  /** Decimal places used for formatting. */
  readonly decimalPlaces = computed(
    () =>
      (this.metadata() as MaterialCurrencyMetadata | null)?.decimalPlaces ?? 2,
  );

  override ngOnInit(): void {
    const allowNegative =
      (this.metadata() as MaterialCurrencyMetadata | null)?.allowNegative ??
      false;
    const pattern = allowNegative ? /^-?\d*(\.\d*)?$/ : /^\d*(\.\d*)?$/;
    this.internalControl.addValidators(Validators.pattern(pattern));
    if (!allowNegative) {
      this.internalControl.addValidators(Validators.min(0));
    }
    super.ngOnInit();
    // Format default value if provided
    queueMicrotask(() => this.onBlur());
  }

  /** Handles raw input and keeps numeric value in the control. */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const number = Number(input.value.replace(/[^0-9.-]+/g, ''));
    this.setValue(isNaN(number) ? null : number);
  }

  /** Removes formatting when focusing for easier editing. */
  onFocus(): void {
    this.handleFocus();
    const value = this.internalControl.value;
    this.inputRef.nativeElement.value = value === null ? '' : String(value);
  }

  /** Formats the current value using CurrencyPipe on blur. */
  onBlur(): void {
    this.handleBlur();
    const value = this.internalControl.value;
    if (value === null || value === undefined || value === '') {
      return;
    }
    const formatted =
      this.currencyPipe.transform(
        value,
        this.currencyCode(),
        '',
        `1.0-${this.decimalPlaces()}`,
      ) ?? String(value);
    this.inputRef.nativeElement.value = formatted;
  }

  /** Extracts the symbol for the configured currency. */
  protected currencySymbol(): string {
    const formatted = this.currencyPipe.transform(
      0,
      this.currencyCode(),
      '',
      `1.0-0`,
    );
    return formatted ? formatted.replace(/[0]/g, '').trim() : '$';
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-currency'];
  }

  /** Applies component metadata with strong typing. */
  setInputMetadata(metadata: MaterialCurrencyMetadata): void {
    this.setMetadata(metadata);
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }
}
