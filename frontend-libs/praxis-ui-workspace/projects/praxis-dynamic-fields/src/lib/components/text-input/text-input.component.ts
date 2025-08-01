import { Component, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pdx-text-input',
  standalone: true,
  template: `
    <label>
      {{ metadata()?.label || 'Text' }}
      <input
        type="text"
        [value]="value"
        [required]="metadata()?.required || false"
        (input)="onInput($event)"
      />
    </label>
  `,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent implements ControlValueAccessor {
  value = '';
  metadata = signal<any>(null);

  private onChange = (value: any) => {};
  private onTouched = () => {};

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // no-op for now
  }
}
