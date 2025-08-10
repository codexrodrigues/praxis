import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GenericCrudService, MaterialSelectMetadata } from '@praxis/core';
import { SimpleBaseSelectComponent } from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-async-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
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
        (openedChange)="onOpened($event)"
      >
        <mat-option *ngIf="loading()" disabled>
          <mat-progress-spinner diameter="20" mode="indeterminate" />
        </mat-option>
        <ng-container *ngIf="!loading()">
          <mat-option *ngIf="error()" (click)="retry()" [value]="null">
            {{ error() }} - Retry
          </mat-option>
          <mat-option
            *ngFor="let option of options(); trackBy: trackByOption"
            [value]="option.value"
            [disabled]="option.disabled"
            (click)="selectOption(option)"
          >
            {{ option.label }}
          </mat-option>
        </ng-container>
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
      useExisting: forwardRef(() => MaterialAsyncSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"async-select"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialAsyncSelectComponent extends SimpleBaseSelectComponent {
  override setSelectMetadata(metadata: any): void {
    const source = metadata.selectOptions ?? metadata.options;
    const mappedOptions = source?.map((o: any) => ({
      label: o.label ?? o.text,
      value: o.value,
      disabled: o.disabled,
    }));

    super.setSelectMetadata({
      ...metadata,
      options: mappedOptions,
      multiple: metadata.multiple,
      searchable: false,
      resourcePath: metadata.resourcePath ?? metadata.endpoint,
      filterCriteria: metadata.filterCriteria ?? metadata.filter,
      optionLabelKey: metadata.optionLabelKey ?? metadata.displayField,
      optionValueKey: metadata.optionValueKey ?? metadata.valueField,
    });
  }

  onOpened(opened: boolean): void {
    if (
      opened &&
      this.resourcePath() &&
      this.options().length === 0 &&
      !this.loading()
    ) {
      this.loadOptions();
    }
  }

  retry(): void {
    if (this.resourcePath()) {
      this.loadOptions();
    }
  }
}
