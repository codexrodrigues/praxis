import { Component, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MaterialColorPickerMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Basic color picker component leveraging the native input type="color".
 *
 * Renders a text field displaying the selected color value and a palette
 * icon that opens the browser's color picker. This acts as a starting point
 * for a more advanced color selection experience.
 */
@Component({
  selector: 'pdx-material-colorpicker',
  standalone: true,
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Color' }}</mat-label>

      <span
        matPrefix
        class="pdx-color-preview"
        [style.background]="internalControl.value || '#000000'"
        aria-hidden="true"
      ></span>

      <input
        matInput
        [formControl]="internalControl"
        [required]="metadata()?.required || false"
        [readonly]="metadata()?.readonly || false"
        [attr.aria-label]="metadata()?.ariaLabel || metadata()?.label"
        [attr.aria-required]="metadata()?.required ? 'true' : 'false'"
      />

      <button
        mat-icon-button
        matSuffix
        type="button"
        (click)="openPicker()"
        [disabled]="internalControl.disabled || metadata()?.readonly || false"
        [attr.aria-label]="metadata()?.ariaLabel ? metadata()!.ariaLabel + ' color palette' : 'Open color palette'"
      >
        <mat-icon>palette</mat-icon>
      </button>

      <input
        #picker
        type="color"
        class="pdx-hidden-input"
        (change)="onNativeColorChange($event)"
      />

      <mat-error
        *ngIf="
          errorMessage() &&
          internalControl.invalid &&
          (internalControl.dirty || internalControl.touched)
        "
        >
        {{ errorMessage() }}
      </mat-error>

      <mat-hint
        *ngIf="metadata()?.hint && !hasValidationError()"
        [align]="metadata()?.hintAlign || 'start'"
        >
        {{ metadata()!.hint }}
      </mat-hint>
    </mat-form-field>
  `,
  styles: [
    `
      .pdx-color-preview {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid #ccc;
        display: inline-block;
        margin-right: 8px;
      }
      .pdx-hidden-input {
        display: none;
      }
    `,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialColorPickerComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"colorPicker"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialColorPickerComponent extends SimpleBaseInputComponent {
  @ViewChild('picker') private pickerRef!: ElementRef<HTMLInputElement>;

  /** Applies component metadata with strong typing. */
  setInputMetadata(metadata: MaterialColorPickerMetadata): void {
    this.setMetadata(metadata);
    if (metadata.disabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }

  /** Opens the native color picker dialog. */
  openPicker(): void {
    if (
      this.pickerRef &&
      !this.metadata()?.readonly &&
      !this.internalControl.disabled
    ) {
      this.pickerRef.nativeElement.value =
        this.internalControl.value || '#000000';
      this.pickerRef.nativeElement.click();
    }
  }

  /** Handles color selection from the native input. */
  onNativeColorChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setValue(value);
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-colorpicker'];
  }
}
