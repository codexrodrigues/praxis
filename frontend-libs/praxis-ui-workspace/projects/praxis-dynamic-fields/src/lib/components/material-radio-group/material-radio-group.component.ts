import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';

import { MaterialRadioMetadata, GenericCrudService } from '@praxis/core';
import {
  SimpleBaseSelectComponent,
  SimpleSelectMetadata,
} from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatRadioModule],
  template: `
    <div class="pdx-radio-group-wrapper">
      @if (metadata()?.label) {
        <label class="pdx-radio-label">{{ metadata()!.label }}</label>
      }
      <mat-radio-group
        [formControl]="internalControl"
        [color]="metadata()?.color"
        [labelPosition]="metadata()?.labelPosition || 'after'"
        [class.pdx-radio-horizontal]="metadata()?.layout === 'horizontal'"
      >
        <mat-radio-button
          *ngFor="let option of options(); trackBy: trackByOption"
          [value]="option.value"
          [disabled]="option.disabled"
          (change)="selectOption(option)"
        >
          {{ option.label }}
        </mat-radio-button>
      </mat-radio-group>
      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <div class="pdx-error">{{ errorMessage() }}</div>
      }
      @if (metadata()?.hint && !hasValidationError()) {
        <div class="pdx-hint">{{ metadata()!.hint }}</div>
      }
    </div>
  `,
  providers: [
    GenericCrudService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"radio"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialRadioGroupComponent extends SimpleBaseSelectComponent {
  override setSelectMetadata(metadata: SimpleSelectMetadata<any>): void {
    const matMetadata = metadata as MaterialRadioMetadata;
    const source = matMetadata.radioOptions ?? (matMetadata as any).options;
    const mappedOptions = source?.map((o: any) => ({
      label: o.label ?? o.text,
      value: o.value,
      disabled: o.disabled,
    }));

    super.setSelectMetadata({
      ...matMetadata,
      options: mappedOptions,
      multiple: false,
      resourcePath: matMetadata.resourcePath ?? (matMetadata as any).endpoint,
      filterCriteria: matMetadata.filterCriteria ?? (matMetadata as any).filter,
      optionLabelKey:
        matMetadata.optionLabelKey ?? (matMetadata as any).displayField,
      optionValueKey:
        matMetadata.optionValueKey ?? (matMetadata as any).valueField,
    });
  }

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-simple-select', 'pdx-material-radio-group'];
  }
}
