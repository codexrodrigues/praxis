import { Component, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { MaterialSelectMetadata, GenericCrudService } from '@praxis/core';
import { SimpleBaseSelectComponent } from '../../base/simple-base-select.component';

@Component({
  selector: 'pdx-material-searchable-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
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
        <mat-option *ngIf="searchable()" disabled>
          <input
            #searchInput
            matInput
            type="text"
            (input)="onSearch($any($event.target).value)"
            (keydown)="$event.stopPropagation()"
            placeholder="Search..."
          />
        </mat-option>
        <mat-option
          *ngFor="let option of filteredOptions(); trackBy: trackByOption"
          [value]="option.value"
          [disabled]="option.disabled"
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
      useExisting: forwardRef(() => MaterialSearchableSelectComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"searchable-select"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialSearchableSelectComponent extends SimpleBaseSelectComponent {
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

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
      searchable: true,
      multiple: metadata.multiple,
      selectAll: metadata.selectAll,
      maxSelections: metadata.maxSelections,
      resourcePath: metadata.resourcePath ?? metadata.endpoint,
      filterCriteria: metadata.filterCriteria ?? metadata.filter,
      optionLabelKey: metadata.optionLabelKey ?? metadata.displayField,
      optionValueKey: metadata.optionValueKey ?? metadata.valueField,
    });
  }

  onOpened(opened: boolean): void {
    if (opened && this.searchable() && this.searchInput) {
      queueMicrotask(() => this.searchInput!.nativeElement.focus());
    }
  }
}
