import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';
import { ComponentMetadata } from '@praxis/core';

/**
 * Placeholder component for file upload fields.
 *
 * Currently provides a simple `<input type="file">` element and basic
 * ControlValueAccessor integration. A full-featured implementation will
 * be provided in future iterations.
 */
@Component({
  selector: 'pdx-material-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pdx-file-upload">
      <label [attr.for]="componentId()">{{
        metadata()?.label || 'Upload'
      }}</label>
      <input
        [attr.id]="componentId()"
        type="file"
        (change)="onFileSelected($event)"
        [disabled]="metadata()?.disabled || false"
      />
      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <div class="error">{{ errorMessage() }}</div>
      }
      @if (metadata()?.hint && !hasValidationError()) {
        <div class="hint">{{ metadata()!.hint }}</div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialFileUploadComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"file-upload"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialFileUploadComponent extends SimpleBaseInputComponent {
  /**
   * Updates the control value when the user selects a file.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.setValue(file);
  }

  /**
   * Exposes metadata setter for integration with dynamic form loader.
   */
  setFileUploadMetadata(metadata: ComponentMetadata): void {
    this.setMetadata(metadata);
  }

  /**
   * CSS classes specific to the file upload wrapper.
   */
  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-file-upload'];
  }
}
