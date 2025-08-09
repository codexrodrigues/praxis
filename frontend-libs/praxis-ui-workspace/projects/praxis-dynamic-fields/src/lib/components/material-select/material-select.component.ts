import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { MaterialSelectMetadata, GenericCrudService } from '@praxis/core';
import {
  SimpleBaseSelectComponent,
  SimpleSelectMetadata,
} from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-select',
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
        [formControl]="internalControl"
        [placeholder]="metadata()?.placeholder || ''"
        [required]="metadata()?.required || false"
      >
        <mat-option
          *ngFor="let option of options(); trackBy: trackByOption"
          [value]="option.value"
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
      useExisting: forwardRef(() => MaterialSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"select"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialSelectComponent extends SimpleBaseSelectComponent {
  override setSelectMetadata(metadata: SimpleSelectMetadata<any>): void {
    const matMetadata = metadata as MaterialSelectMetadata;
    const source = matMetadata.selectOptions ?? (matMetadata as any).options;
    const mappedOptions = source?.map((o: any) => ({
      label: o.label ?? o.text,
      value: o.value,
    }));

    super.setSelectMetadata({
      ...matMetadata,
      options: mappedOptions,
      multiple: false,
      searchable: matMetadata.searchable,
      resourcePath: matMetadata.resourcePath ?? (matMetadata as any).endpoint,
      filterCriteria: matMetadata.filterCriteria ?? (matMetadata as any).filter,
      optionLabelKey:
        matMetadata.optionLabelKey ?? (matMetadata as any).displayField,
      optionValueKey:
        matMetadata.optionValueKey ?? (matMetadata as any).valueField,
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    const disabled = this.metadata()?.disabled;
    if (disabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }
}
