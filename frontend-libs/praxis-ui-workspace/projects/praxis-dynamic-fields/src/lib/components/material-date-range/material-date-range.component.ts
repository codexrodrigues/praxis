import { Component, computed, forwardRef, inject, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialDatepickerMetadata, DateRangeValue } from '@praxis/core';
import { DateUtilsService } from '../../services/date-utils.service';

interface DateRangeState {
  selectedRange: DateRangeValue | null;
  activePreset: string | null;
}

interface InternalPreset {
  id: string;
  label: string;
  icon?: string;
  calculateRange: () => DateRangeValue;
  order?: number;
}

@Component({
  selector: 'pdx-material-date-range',
  standalone: true,
  templateUrl: './material-date-range.component.html',
  styleUrls: ['./material-date-range.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialDateRangeComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"daterange"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialDateRangeComponent extends BaseDynamicFieldComponent<MaterialDatepickerMetadata> {
  private readonly utils = inject(DateUtilsService);

  protected readonly rangeFormGroup = signal<FormGroup>(new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  }));

  private readonly state = signal<DateRangeState>({
    selectedRange: null,
    activePreset: null
  });

  readonly materialAppearance = computed(() => this.metadata()?.materialDesign?.appearance || 'outline');
  readonly materialColor = computed(() => this.metadata()?.materialDesign?.color || 'primary');
  readonly floatLabelBehavior = computed(() => {
    const label = this.metadata()?.materialDesign?.floatLabel;
    return label ?? 'auto';
  });

  readonly selectedRange = computed(() => this.state().selectedRange);
  readonly activePreset = computed(() => this.state().activePreset);

  readonly dateFormat = computed(() => this.metadata()?.dateFormat || this.utils.getDefaultDateFormat());

  readonly minDate = computed(() => this.metadata()?.minDate ? this.utils.parseDate(this.metadata()?.minDate) : null);
  readonly maxDate = computed(() => this.metadata()?.maxDate ? this.utils.parseDate(this.metadata()?.maxDate) : null);

  readonly rangePresets = computed(() => {
    const metadata = this.metadata();
    if (!metadata?.rangePresets?.enabled) return [];
    const presets: InternalPreset[] = [];
    if (metadata.rangePresets.presets) {
      presets.push(...this.createBuiltInPresets(metadata.rangePresets.presets));
    }
    if (metadata.rangePresets.customPresets) {
      presets.push(...this.createCustomPresets(metadata.rangePresets.customPresets));
    }
    return presets.sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  readonly presetDisplayStyle = computed(() => this.metadata()?.rangePresets?.displayStyle || 'buttons');

  readonly activePresetLabel = computed(() => {
    const activeId = this.activePreset();
    if (!activeId) return '';
    const preset = this.rangePresets().find(p => p.id === activeId);
    return preset?.label || '';
  });

  applyPreset(presetId: string): void {
    const preset = this.rangePresets().find(p => p.id === presetId);
    if (!preset) return;
    const range = preset.calculateRange();
    this.selectDateRange(range);
    this.state.set({ ...this.state(), activePreset: presetId });
  }

  clearPreset(): void {
    this.state.set({ ...this.state(), activePreset: null });
  }

  selectDateRange(range: DateRangeValue): void {
    this.state.set({ ...this.state(), selectedRange: range });
    const formGroup = this.rangeFormGroup();
    formGroup.patchValue({ start: range.startDate, end: range.endDate });
    this.setValue(range);
  }

  clearDateRange(): void {
    this.selectDateRange({ startDate: null, endDate: null });
    this.clearPreset();
  }

  onRangeStartDateChange(startDate: Date | null): void {
    const current = this.selectedRange() || { startDate: null, endDate: null };
    this.selectDateRange({ ...current, startDate, preset: undefined });
    this.clearPreset();
  }

  onRangeEndDateChange(endDate: Date | null): void {
    const current = this.selectedRange() || { startDate: null, endDate: null };
    this.selectDateRange({ ...current, endDate, preset: undefined });
    this.clearPreset();
  }

  protected override onComponentInit(): void {
    const value = this.fieldValue();
    const range = this.parseRangeValue(value);
    if (range) {
      this.selectDateRange(range);
      this.state.set({ ...this.state(), activePreset: range.preset || null });
    }
    if (this.metadata()?.rangePresets?.defaultPreset) {
      this.applyPreset(this.metadata()!.rangePresets!.defaultPreset!);
    }
    this.setupRangeValidation();
  }

  private updateState(ch: Partial<DateRangeState>): void {
    this.state.set({ ...this.state(), ...ch });
  }

  private parseRangeValue(value: any): DateRangeValue | null {
    if (!value) return null;
    if (typeof value === 'object' && 'startDate' in value && 'endDate' in value) {
      return {
        startDate: value.startDate ? this.utils.parseDate(value.startDate) : null,
        endDate: value.endDate ? this.utils.parseDate(value.endDate) : null,
        preset: value.preset
      };
    }
    return null;
  }

  private validateDateRange(range: DateRangeValue): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.metadata()?.rangeValidation || {};
    if (!range.startDate || !range.endDate) {
      if (config.requireBothDates) errors.push('Both start and end dates are required');
      return { isValid: errors.length === 0, errors };
    }
    const start = range.startDate.getTime();
    const end = range.endDate.getTime();
    if (start > end) errors.push('Start date must be before end date');
    if (start === end && !config.allowSameDate) errors.push('Start and end dates cannot be the same');
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (config.maxRangeDays && diff > config.maxRangeDays) errors.push(`Range cannot exceed ${config.maxRangeDays} days`);
    if (config.minRangeDays && diff < config.minRangeDays) errors.push(`Range must be at least ${config.minRangeDays} days`);
    return { isValid: errors.length === 0, errors };
  }

  private setupRangeValidation(): void {
    const fg = this.rangeFormGroup();
    fg.addValidators(ctrl => {
      const val = ctrl.value;
      if (!val || (!val.start && !val.end)) return null;
      const range: DateRangeValue = { startDate: val.start, endDate: val.end };
      const res = this.validateDateRange(range);
      return res.isValid ? null : { rangeInvalid: res.errors };
    });
  }

  private createBuiltInPresets(types: string[]): InternalPreset[] {
    const presets: InternalPreset[] = [];
    types.forEach((t, i) => {
      const p = this.getBuiltInPreset(t);
      if (p) { p.order = i; presets.push(p); }
    });
    return presets;
  }

  private createCustomPresets(custom: any[]): InternalPreset[] {
    return custom.map((c, i) => ({
      id: `custom_${i}`,
      label: c.label,
      icon: c.icon,
      calculateRange: () => ({
        startDate: this.utils.parseDate(c.startDate),
        endDate: this.utils.parseDate(c.endDate),
        preset: `custom_${i}`,
        label: c.label
      }),
      order: 1000 + i
    }));
  }

  private getBuiltInPreset(type: string): InternalPreset | null {
    const today = new Date();
    switch (type) {
      case 'thisMonth':
        return {
          id: 'thisMonth',
          label: 'Este Mês',
          calculateRange: () => ({
            startDate: new Date(today.getFullYear(), today.getMonth(), 1),
            endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            preset: 'thisMonth',
            label: 'Este Mês'
          })
        };
      case 'last30Days':
        return {
          id: 'last30Days',
          label: 'Últimos 30 Dias',
          calculateRange: () => {
            const end = new Date(today);
            const start = new Date(today);
            start.setDate(start.getDate() - 29);
            return { startDate: start, endDate: end, preset: 'last30Days', label: 'Últimos 30 Dias' };
          }
        };
      default:
        return null;
    }
  }
}
