import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MaterialSelectMetadata, GenericCrudService } from '@praxis/core';
import {
  SimpleBaseSelectComponent,
  SelectOption,
  SimpleSelectMetadata,
} from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <mat-form-field
      [appearance]="materialAppearance()"
      [color]="materialColor()"
      [class]="componentCssClasses()"
    >
      <mat-label>{{ metadata()?.label || 'Select' }}</mat-label>
      <mat-select
        [multiple]="multiple()"
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
        [disabled]="metadata()?.disabled || false"
      >
        @if (selectAll()) {
          <mat-option
            (click)="$event.stopPropagation(); toggleSelectAll()"
            [value]="null"
          >
            {{ isAllSelected() ? '✓ ' : '' }}Selecionar todos
          </mat-option>
        }
        <mat-option
          *ngFor="let option of options(); trackBy: trackByOption"
          [value]="option.value"
          [disabled]="isOptionDisabled(option)"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </mat-option>
      </mat-select>
      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }
      @if (metadata()?.hint && !hasValidationError()) {
        <mat-hint>{{ metadata()!.hint }}</mat-hint>
      }
    </mat-form-field>
  `,
  providers: [
    GenericCrudService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialMultiSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"multi-select"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialMultiSelectComponent extends SimpleBaseSelectComponent {
  override setSelectMetadata(metadata: SimpleSelectMetadata<any>): void {
    const matMetadata = metadata as MaterialSelectMetadata;
    const source:
      | Array<{ label?: string; text?: string; value: any; disabled?: boolean }>
      | undefined = matMetadata.selectOptions ?? (matMetadata as any).options;
    const mappedOptions = source?.map((o) => ({
      label: o.label ?? o.text ?? '',
      value: o.value,
      disabled: o.disabled,
    }));

    super.setSelectMetadata({
      ...matMetadata,
      options: mappedOptions,
      multiple: true,
      searchable: matMetadata.searchable,
      selectAll: matMetadata.selectAll,
      maxSelections: matMetadata.maxSelections,
      resourcePath: matMetadata.resourcePath ?? matMetadata.endpoint,
      filterCriteria: matMetadata.filterCriteria ?? (matMetadata as any).filter,
      optionLabelKey:
        matMetadata.optionLabelKey ?? (matMetadata as any).displayField,
      optionValueKey:
        matMetadata.optionValueKey ?? (matMetadata as any).valueField,
    });
  }

  /** Disables options when maxSelections reached */
  isOptionDisabled(option: SelectOption<any>): boolean {
    if (option.disabled) return true;
    if (!this.maxSelections()) return false;
    const current = Array.isArray(this.internalControl.value)
      ? this.internalControl.value
      : [];
    const isSelected = current.includes(option.value);
    return !isSelected && current.length >= this.maxSelections()!;
  }
}
