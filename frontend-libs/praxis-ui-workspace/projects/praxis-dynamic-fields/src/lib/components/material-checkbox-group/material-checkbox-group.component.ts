import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MaterialCheckboxMetadata, GenericCrudService } from '@praxis/core';
import {
  SimpleBaseSelectComponent,
  SimpleSelectMetadata,
  SelectOption,
} from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-checkbox-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  template: `
    <div class="pdx-checkbox-group-wrapper">
      @if (label) {
        <label class="pdx-checkbox-label">{{ label }}</label>
      }
      @if (selectAll()) {
        <mat-checkbox
          [checked]="isAllSelected()"
          (change)="toggleSelectAll()"
          [color]="metadata()?.color"
          [labelPosition]="metadata()?.labelPosition || 'after'"
        >
          Selecionar todos
        </mat-checkbox>
      }
      <div
        class="pdx-checkbox-options"
        [class.pdx-checkbox-horizontal]="metadata()?.layout === 'horizontal'"
      >
        <mat-checkbox
          *ngFor="let option of options(); trackBy: trackByOption"
          [checked]="isSelected(option.value)"
          [disabled]="isOptionDisabled(option)"
          (change)="selectOption(option)"
          [color]="metadata()?.color"
          [labelPosition]="metadata()?.labelPosition || 'after'"
        >
          {{ option.label }}
        </mat-checkbox>
      </div>
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
      useExisting: forwardRef(() => MaterialCheckboxGroupComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"checkbox"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialCheckboxGroupComponent extends SimpleBaseSelectComponent {
  override setSelectMetadata(metadata: SimpleSelectMetadata<any>): void {
    const matMetadata = metadata as MaterialCheckboxMetadata;
    const source = matMetadata.checkboxOptions ?? (matMetadata as any).options;
    const mappedOptions = source?.map((o: any) => ({
      label: o.label ?? o.text,
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
      resourcePath: matMetadata.resourcePath ?? (matMetadata as any).endpoint,
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

  protected override getSpecificCssClasses(): string[] {
    return ['pdx-simple-select', 'pdx-material-checkbox-group'];
  }
}
