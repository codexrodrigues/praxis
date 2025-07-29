/**
 * @fileoverview Componente Material Time Picker dinâmico
 *
 * Implementa um seletor de tempo simplificado com:
 * ✅ Formato 12h/24h configurável
 * ✅ Validação básica de range de tempo
 * ✅ Input manual e seletor em diálogo
 */

import { Component, forwardRef, computed, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialTimePickerMetadata } from '@praxis/core';

interface TimePickerState {
  isOpen: boolean;
  tempValue: string;
}

@Component({
  selector: 'pdx-material-timepicker',
  standalone: true,
  templateUrl: './material-timepicker.component.html',
  styleUrls: ['./material-timepicker.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialTimepickerComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"timepicker"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialTimepickerComponent
  extends BaseDynamicFieldComponent<MaterialTimePickerMetadata> {

  private readonly pickerState = signal<TimePickerState>({
    isOpen: false,
    tempValue: ''
  });

  readonly timeFormat = computed(() => this.metadata()?.timeFormat || 24);
  readonly isPickerOpen = computed(() => this.pickerState().isOpen);
  readonly tempValue = computed(() => this.pickerState().tempValue);

  getTimePlaceholder(): string {
    return this.metadata()?.showSeconds ? 'hh:mm:ss' : 'hh:mm';
  }

  getAriaDescribedBy(): string {
    const parts: string[] = [];
    if (this.metadata()?.hint) {
      parts.push(`${this.componentId()}-hint`);
    }
    if (this.hasValidationError()) {
      parts.push(`${this.componentId()}-error`);
    }
    return parts.join(' ');
  }

  openTimePicker(): void {
    const current = this.fieldValue() || this.metadata()?.defaultTime || '';
    this.pickerState.set({ isOpen: true, tempValue: current });
  }

  closeTimePicker(): void {
    this.pickerState.set({ ...this.pickerState(), isOpen: false });
  }

  confirmTime(): void {
    const value = this.pickerState().tempValue;
    this.setValue(value);
    this.closeTimePicker();
  }

  onTempInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pickerState.set({ ...this.pickerState(), tempValue: value });
  }

  onTimeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setValue(value);
  }

  onInputFocus(): void {
    this.focus();
  }

  onInputBlur(): void {
    this.blur();
  }
}
