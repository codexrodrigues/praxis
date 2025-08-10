import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  computed,
  output,
  inject,
  Input,
  LOCALE_ID,
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
  getCurrencySymbol,
} from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
registerLocaleData(localePt);
registerLocaleData(localePt, 'pt-BR');

import { MaterialCurrencyMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

// Register Portuguese locale data for both generic 'pt' and region-specific 'pt-BR'
registerLocaleData(localePt);
registerLocaleData(localePt, 'pt-BR');

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
      <mat-label>{{ label }}</mat-label>

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
        [placeholder]="shouldShowPlaceholder ? placeholder : null"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [attr.aria-label]="!label && placeholder ? placeholder : null"
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
  private readonly defaultLocale =
    inject(LOCALE_ID, { optional: true }) || 'en-US';

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

  /** Locale used for formatting and parsing. */
  readonly locale = computed(
    () =>
      (this.metadata() as MaterialCurrencyMetadata | null)?.locale ||
      this.defaultLocale,
  );

  /** Thousands separator based on locale or metadata. */
  readonly thousandsSeparator = computed(() => {
    const md = this.metadata() as MaterialCurrencyMetadata | null;
    if (md?.thousandsSeparator) {
      return md.thousandsSeparator;
    }
    const formatted = new Intl.NumberFormat(this.locale()).format(1111);
    return formatted.replace(/1/g, '') || ',';
  });

  /** Decimal separator based on locale or metadata. */
  readonly decimalSeparator = computed(() => {
    const md = this.metadata() as MaterialCurrencyMetadata | null;
    if (md?.decimalSeparator) {
      return md.decimalSeparator;
    }
    const formatted = new Intl.NumberFormat(this.locale()).format(1.1);
    return formatted.replace(/1/g, '') || '.';
  });

  override ngOnInit(): void {
    const allowNegative =
      (this.metadata() as MaterialCurrencyMetadata | null)?.allowNegative ??
      false;
    const escapedDecimal = this.escapeRegex(this.decimalSeparator());
    const pattern = allowNegative
      ? new RegExp(`^-?\\d*(?:${escapedDecimal}\\d*)?$`)
      : new RegExp(`^\\d*(?:${escapedDecimal}\\d*)?$`);
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
    const raw = input.value
      .replace(new RegExp(this.escapeRegex(this.thousandsSeparator()), 'g'), '')
      .replace(this.decimalSeparator(), '.')
      .replace(/[^0-9.-]/g, '');
    const number = Number(raw);
    this.setValue(isNaN(number) ? null : number);
  }

  /** Removes formatting when focusing for easier editing. */
  onFocus(): void {
    this.handleFocus();
    const value = this.internalControl.value;
    this.inputRef.nativeElement.value =
      value === null || value === undefined
        ? ''
        : String(value).replace('.', this.decimalSeparator());
  }

  /** Formats the current value using CurrencyPipe on blur. */
  onBlur(): void {
    this.handleBlur();
    const value = this.internalControl.value;
    if (value === null || value === undefined || value === '') {
      return;
    }
    let formatted: string;
    try {
      formatted =
        this.currencyPipe.transform(
          value,
          this.currencyCode(),
          '',
          `1.0-${this.decimalPlaces()}`,
          this.locale(),
        ) ?? String(value);
    } catch {
      formatted = new Intl.NumberFormat(this.locale() || 'en-US', {
        style: 'currency',
        currency: this.currencyCode(),
        minimumFractionDigits: 0,
        maximumFractionDigits: this.decimalPlaces(),
      }).format(value);
    }
    this.inputRef.nativeElement.value = formatted;
  }

  /** Extracts the symbol for the configured currency. */
  protected currencySymbol(): string {
    const formatted = this.currencyPipe.transform(
      0,
      this.currencyCode(),
      '',
      `1.0-0`,
      this.locale(),
    );
    return formatted ? formatted.replace(/[0]/g, '').trim() : '$';
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-currency'];
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Applies component metadata with strong typing. */
  @Input({ alias: 'metadata', required: true })
  set metadataInput(metadata: MaterialCurrencyMetadata) {
    this.setInputMetadata(metadata);
  }

  setInputMetadata(metadata: MaterialCurrencyMetadata): void {
    this.setMetadata(metadata);
  }

  override async validateField(): Promise<ValidationErrors | null> {
    const errors = await super.validateField();
    this.validationChange.emit(errors);
    return errors;
  }
}
