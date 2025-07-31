import { Component, computed, forwardRef, inject, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialDatepickerMetadata } from '@praxis/core';
import { DateUtilsService } from '../../services/date-utils.service';

interface DatePickerState {
  selectedDate: Date | null;
  isOpen: boolean;
}

@Component({
  selector: 'pdx-material-date-picker',
  standalone: true,
  templateUrl: './material-date-picker.component.html',
  styleUrls: ['./material-date-picker.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialDatePickerComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"datepicker"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialDatePickerComponent extends BaseDynamicFieldComponent<MaterialDatepickerMetadata> {
  private readonly dateUtils = inject(DateUtilsService);

  private readonly state = signal<DatePickerState>({
    selectedDate: null,
    isOpen: false
  });

  readonly materialAppearance = computed(() => this.metadata()?.materialDesign?.appearance || 'outline');
  readonly materialColor = computed(() => this.metadata()?.materialDesign?.color || 'primary');
  readonly floatLabelBehavior = computed(() => this.metadata()?.materialDesign?.floatLabel || 'auto');

  readonly selectedDate = computed(() => this.state().selectedDate);
  readonly isPickerOpen = computed(() => this.state().isOpen);

  readonly dateFormat = computed(() => this.metadata()?.dateFormat || this.dateUtils.getDefaultDateFormat(this.metadata()?.controlType));

  readonly minDate = computed(() => this.metadata()?.minDate ? this.dateUtils.parseDate(this.metadata()?.minDate) : null);
  readonly maxDate = computed(() => this.metadata()?.maxDate ? this.dateUtils.parseDate(this.metadata()?.maxDate) : null);

  readonly inputPlaceholder = computed(() => this.metadata()?.placeholder || 'dd/mm/aaaa');

  readonly shouldShowClearButton = computed(() => {
    const hasValue = Boolean(this.selectedDate());
    return hasValue && !this.componentState().disabled;
  });

  openPicker(): void {
    this.updateState({ isOpen: true });
  }

  closePicker(): void {
    this.updateState({ isOpen: false });
  }

  clearDate(): void {
    this.updateState({ selectedDate: null });
    this.setValue(null);
  }

  selectDate(date: Date | null): void {
    this.updateState({ selectedDate: date });
    this.setValue(date);
  }

  onDateChange(date: Date | null): void {
    this.selectDate(date);
  }

  onDateInput(event: MatDatepickerInputEvent<Date>): void {
    const value = event.value;
    if (!value) {
      this.clearDate();
      return;
    }
    this.selectDate(value);
  }

  isDateDisabled = (date: Date | null): boolean => {
    if (!date) return false;
    const metadata = this.metadata();
    if (metadata?.minDate) {
      const min = this.dateUtils.parseDate(metadata.minDate);
      if (min && date < min) return true;
    }
    if (metadata?.maxDate) {
      const max = this.dateUtils.parseDate(metadata.maxDate);
      if (max && date > max) return true;
    }
    return false;
  };

  private updateState(changes: Partial<DatePickerState>): void {
    this.state.set({ ...this.state(), ...changes });
  }

  protected override onComponentInit(): void {
    const initial = this.fieldValue();
    const date = initial ? this.dateUtils.parseDate(initial) : null;
    this.updateState({ selectedDate: date });
  }
}
