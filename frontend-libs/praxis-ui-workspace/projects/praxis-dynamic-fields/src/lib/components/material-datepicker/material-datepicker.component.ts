/**
 * @fileoverview Componente Material Datepicker dinâmico
 * 
 * Datepicker avançado com suporte a:
 * ✅ Seleção de data, datetime e timepicker
 * ✅ Validação de datas min/max
 * ✅ Filtros de data customizados
 * ✅ Formatação de data configurável
 * ✅ Touch UI para dispositivos móveis
 * ✅ Integração com formulários reativos
 * ✅ Acessibilidade WCAG 2.1 AA
 */

import {
  Component,
  forwardRef,
  computed,
  signal,
  inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialDatepickerMetadata, DateRangeValue, DateRangePreset, ComponentMetadata } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedDatepickerMetadata extends ComponentMetadata {
  touchUi?: boolean;
  showClearButton?: boolean;
  timePicker?: boolean;
  disableWeekends?: boolean;
  startPlaceholder?: string;
  endPlaceholder?: string;
  controlType?: 'date' | 'dateRange' | 'datepicker' | 'datetime' | 'timepicker' | 'daterange';
  rangePresets?: {
    enabled?: boolean;
    presets?: any[];
    customPresets?: any[];
    displayStyle?: string;
    defaultPreset?: string;
  };
  rangeValidation?: any;
  disabledDates?: any[];
  highlightedDates?: any[];
}

function safeDatepickerMetadata(metadata: ComponentMetadata | null | undefined): ExtendedDatepickerMetadata {
  return (metadata || {}) as ExtendedDatepickerMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO DATEPICKER
// =============================================================================

interface DatepickerState {
  selectedDate: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  isPickerOpen: boolean;
  // Range specific state
  selectedRange: DateRangeValue | null;
  isRangePickerOpen: boolean;
  activePreset: string | null;
}

/** Internal preset configuration for easier management */
interface InternalPreset {
  id: string;
  label: string;
  icon?: string;
  category: 'standard' | 'fiscal' | 'custom' | 'comparison';
  calculateRange: () => DateRangeValue;
  isPopular?: boolean;
  description?: string;
  order?: number;
}

// =============================================================================
// COMPONENTE MATERIAL DATEPICKER
// =============================================================================

@Component({
  selector: 'pdx-material-datepicker',
  standalone: true,
  templateUrl: './material-datepicker.component.html',
  styleUrls: ['./material-datepicker.component.scss'],
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
    MatChipsModule,
    MatSelectModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialDatepickerComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': 'metadata()?.controlType || "datepicker"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialDatepickerComponent 
  extends BaseDynamicFieldComponent<MaterialDatepickerMetadata> {

  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly dateAdapter = inject(DateAdapter);

  @ViewChild('labelEditor', { static: false })
  private labelEditor?: ElementRef<HTMLInputElement>;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO DATEPICKER
  // =============================================================================

  /** Estado específico do datepicker (single + range) */
  protected readonly datepickerState = signal<DatepickerState>({
    selectedDate: null,
    minDate: null,
    maxDate: null,
    isPickerOpen: false,
    // Range specific state
    selectedRange: null,
    isRangePickerOpen: false,
    activePreset: null
  });
  
  /** FormGroup para date range (quando controlType = 'daterange') */
  protected readonly rangeFormGroup = signal<FormGroup>(new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  }));

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Configuração da aparência do Material */
  readonly materialAppearance = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    return materialDesign?.appearance || 'outline';
  });

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    return materialDesign?.color || 'primary';
  });

  /** Comportamento do float label */
  readonly floatLabelBehavior = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    const label = materialDesign?.floatLabel;
    return label === 'never' ? 'auto' : (label ?? 'auto');
  });

  /** Data mínima permitida */
  readonly minDate = computed(() => {
    const metadata = this.metadata();
    const state = this.datepickerState();
    
    if (state.minDate) return state.minDate;
    if (metadata?.minDate) {
      if (metadata.minDate instanceof Date) return metadata.minDate;
      return this.parseDate(metadata.minDate);
    }
    return null;
  });

  /** Data máxima permitida */
  readonly maxDate = computed(() => {
    const metadata = this.metadata();
    const state = this.datepickerState();
    
    if (state.maxDate) return state.maxDate;
    if (metadata?.maxDate) {
      if (metadata.maxDate instanceof Date) return metadata.maxDate;
      return this.parseDate(metadata.maxDate);
    }
    return null;
  });

  /** View inicial do calendar */
  readonly startView = computed(() => {
    const metadata = this.metadata();
    return metadata?.startView || 'month';
  });

  /** Deve usar Touch UI */
  readonly shouldUseTouchUi = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.touchUi || false;
  });

  /** Formato de data para exibição */
  readonly dateFormat = computed(() => {
    const metadata = this.metadata();
    return metadata?.dateFormat || this.getDefaultDateFormat();
  });

  /** Deve mostrar botão clear */
  readonly shouldShowClearButton = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.showClearButton !== false;
  });

  /** Label being edited */
  readonly editingLabel = computed(() => {
    const editState = this.labelEditingState();
    return editState.isEditing ? editState.currentLabel : '';
  });

  /** Tipo do controle (datepicker, datetime, timepicker, daterange) */
  readonly dateControlType = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.controlType || 'datepicker';
  });
  
  /** Indica se é um componente de range */
  readonly isRangeMode = computed(() => {
    return this.dateControlType() === 'daterange';
  });

  /** Configuração do time picker */
  readonly timePickerConfig = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.timePicker || { enabled: false };
  });

  /** Deve desabilitar fins de semana */
  readonly shouldDisableWeekends = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.disableWeekends || false;
  });

  /** Data selecionada atual (single date mode) */
  readonly selectedDate = computed(() => {
    return this.datepickerState().selectedDate;
  });
  
  /** Range selecionado atual (range mode) */
  readonly selectedRange = computed(() => {
    return this.datepickerState().selectedRange;
  });
  
  /** Preset ativo atual */
  readonly activePreset = computed(() => {
    return this.datepickerState().activePreset;
  });

  /** Details of the active preset */
  readonly activePresetInfo = computed(() => {
    const presetId = this.activePreset();
    return this.rangePresets().find(p => p.id === presetId) || null;
  });

  /** CSS classes específicas do datepicker */
  readonly datepickerSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();
    
    classes.push('pdx-datepicker');
    classes.push(`pdx-datepicker-type-${this.dateControlType()}`);
    
    if (this.isRangeMode()) {
      classes.push('pdx-datepicker-range');
      if (this.activePreset()) {
        classes.push('pdx-datepicker-with-preset');
      }
    }
    
    if (this.shouldUseTouchUi()) {
      classes.push('pdx-datepicker-touch');
    }
    
    if (this.shouldShowClearButton()) {
      classes.push('pdx-datepicker-with-clear');
    }
    
    if (metadata?.required) {
      classes.push('pdx-datepicker-required');
    }
    
    return classes.join(' ');
  });

  /** Placeholder do input */
  readonly inputPlaceholder = computed(() => {
    const metadata = this.metadata();
    const controlType = this.dateControlType();
    
    if (metadata?.placeholder) return metadata.placeholder;
    
    switch (controlType as string) {
      case 'datetime':
        return 'dd/mm/aaaa hh:mm';
      case 'timepicker':
        return 'hh:mm';
      case 'daterange':
        return 'Selecione período';
      default:
        return 'dd/mm/aaaa';
    }
  });
  
  /** Placeholder para data inicial (range mode) */
  readonly startDatePlaceholder = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.startPlaceholder || 'Data inicial';
  });
  
  /** Placeholder para data final (range mode) */
  readonly endDatePlaceholder = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.endPlaceholder || 'Data final';
  });

  // =============================================================================
  // RANGE SPECIFIC COMPUTED PROPERTIES
  // =============================================================================
  
  /** Configuração de presets corporativos */
  readonly rangePresets = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    if (!this.isRangeMode() || !metadata?.rangePresets?.enabled) {
      return [];
    }
    
    const presets: InternalPreset[] = [];
    
    // Built-in presets
    if (metadata.rangePresets?.presets) {
      presets.push(...this.createBuiltInPresets(metadata.rangePresets.presets));
    }
    
    // Custom presets
    if (metadata.rangePresets?.customPresets) {
      presets.push(...this.createCustomPresets(metadata.rangePresets.customPresets));
    }
    
    return presets.sort((a, b) => (a.order || 999) - (b.order || 999));
  });
  
  /** Estilo de exibição dos presets */
  readonly presetDisplayStyle = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.rangePresets?.displayStyle || 'buttons';
  });
  
  /** Validação de range habilitada */
  readonly rangeValidationEnabled = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return this.isRangeMode() && !!metadata?.rangeValidation;
  });
  
  /** Configuração de validação de range */
  readonly rangeValidationConfig = computed(() => {
    const metadata = safeDatepickerMetadata(this.metadata());
    return metadata?.rangeValidation || {};
  });
  
  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeDatepickerState();
    
    if (this.isRangeMode()) {
      this.initializeRangeMode();
    }
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - SINGLE DATE
  // =============================================================================

  /**
   * Abre o datepicker
   */
  openPicker(): void {
    this.updateDatepickerState({ isPickerOpen: true });
  }

  /**
   * Fecha o datepicker
   */
  closePicker(): void {
    this.updateDatepickerState({ isPickerOpen: false });
  }

  /**
   * Limpa a data selecionada
   */
  clearDate(): void {
    this.updateDatepickerState({ selectedDate: null });
    this.setValue(null);
    this.log('debug', 'Date cleared');
  }

  /**
   * Define uma data específica
   */
  selectDate(date: Date | null): void {
    this.updateDatepickerState({ selectedDate: date });
    this.setValue(date);
    this.log('debug', 'Date selected', { date });
  }

  /**
   * Verifica se uma data está desabilitada
   */
  isDateDisabled = (date: Date | null): boolean => {
    if (!date) return false;
    
    const metadata = this.metadata();
    
    // Verificar fins de semana
    if (this.shouldDisableWeekends()) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return true; // Domingo = 0, Sábado = 6
    }
    
    // Verificar datas desabilitadas específicas
    const safeMetadata = safeDatepickerMetadata(metadata);
    if (safeMetadata?.disabledDates) {
      return safeMetadata.disabledDates.some((disabledDate: any) => {
        const parsedDate = typeof disabledDate === 'string' 
          ? this.parseDate(disabledDate) 
          : disabledDate as Date;
        return parsedDate && this.isSameDate(date, parsedDate);
      });
    }
    
    return false;
  }

  /**
   * Verifica se uma data deve ser destacada
   */
  isDateHighlighted(date: Date): boolean {
    const metadata = safeDatepickerMetadata(this.metadata());
    if (!metadata?.highlightedDates) return false;
    
    return metadata.highlightedDates.some((highlightedDate: any) => {
      const parsedDate = typeof highlightedDate === 'string' 
        ? this.parseDate(highlightedDate) 
        : highlightedDate as Date;
      return parsedDate && this.isSameDate(date, parsedDate);
    });
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - DATE RANGE
  // =============================================================================
  
  /**
   * Aplica um preset de range
   */
  applyPreset(presetId: string): void {
    const preset = this.rangePresets().find(p => p.id === presetId);
    if (!preset) {
      this.log('warn', 'Preset not found', { presetId });
      return;
    }
    
    const range = preset.calculateRange();
    this.selectDateRange(range);
    this.updateDatepickerState({ activePreset: presetId });
    this.log('debug', 'Preset applied', { presetId, range });
  }
  
  /**
   * Limpa o preset ativo
   */
  clearPreset(): void {
    this.updateDatepickerState({ activePreset: null });
    this.log('debug', 'Preset cleared');
  }
  
  /**
   * Define um range de datas
   */
  selectDateRange(range: DateRangeValue): void {
    if (!this.isRangeMode()) return;
    
    // Validar o range se configurado
    if (this.rangeValidationEnabled()) {
      const validationResult = this.validateDateRange(range);
      if (!validationResult.isValid) {
        this.log('warn', 'Invalid date range', { range, errors: validationResult.errors });
        return;
      }
    }
    
    // Atualizar estado
    this.updateDatepickerState({ selectedRange: range });
    
    // Atualizar FormGroup
    const formGroup = this.rangeFormGroup();
    formGroup.patchValue({
      start: range.startDate,
      end: range.endDate
    });
    
    // Atualizar valor do form control principal
    this.setValue(range);
    
    this.log('debug', 'Date range selected', { range });
  }
  
  /**
   * Limpa o range selecionado
   */
  clearDateRange(): void {
    const emptyRange: DateRangeValue = {
      startDate: null,
      endDate: null
    };
    
    this.selectDateRange(emptyRange);
    this.clearPreset();
    this.log('debug', 'Date range cleared');
  }
  
  /**
   * Abre o range picker
   */
  openRangePicker(): void {
    this.updateDatepickerState({ isRangePickerOpen: true });
  }
  
  /**
   * Fecha o range picker
   */
  closeRangePicker(): void {
    this.updateDatepickerState({ isRangePickerOpen: false });
  }
  
  // =============================================================================
  // EVENTOS DO DATEPICKER
  // =============================================================================

  onDateChange(date: Date | null): void {
    if (this.isRangeMode()) {
      this.log('warn', 'onDateChange called in range mode');
      return;
    }
    this.selectDate(date);
  }

  onDateInput(event: MatDatepickerInputEvent<Date>): void {
    const dateValue = event.value;
    
    if (!dateValue) {
      this.clearDate();
      return;
    }
    
    if (dateValue && !isNaN(dateValue.getTime())) {
      this.selectDate(dateValue);
    }
  }

  onPickerOpened(): void {
    this.updateDatepickerState({ isPickerOpen: true });
    this.focus();
  }

  onPickerClosed(): void {
    this.updateDatepickerState({ isPickerOpen: false });
    this.blur();
  }
  
  // =============================================================================
  // EVENTOS DO RANGE PICKER
  // =============================================================================
  
  onRangePickerOpened(): void {
    this.updateDatepickerState({ isRangePickerOpen: true });
    this.focus();
  }
  
  onRangePickerClosed(): void {
    this.updateDatepickerState({ isRangePickerOpen: false });
    this.blur();
  }
  
  onRangeStartDateChange(startDate: Date | null): void {
    const currentRange = this.selectedRange() || { startDate: null, endDate: null };
    const newRange: DateRangeValue = {
      ...currentRange,
      startDate,
      preset: undefined // Clear preset when manually changed
    };
    
    this.selectDateRange(newRange);
    this.clearPreset();
  }
  
  onRangeEndDateChange(endDate: Date | null): void {
    const currentRange = this.selectedRange() || { startDate: null, endDate: null };
    const newRange: DateRangeValue = {
      ...currentRange,
      endDate,
      preset: undefined // Clear preset when manually changed
    };

    this.selectDateRange(newRange);
    this.clearPreset();
  }

  // ===========================================================================
  // EVENTOS DE LABEL
  // ===========================================================================

  onLabelDoubleClick(): void {
    if (!this.componentState().disabled) {
      this.startLabelEditing();

      setTimeout(() => {
        if (this.labelEditor) {
          this.labelEditor.nativeElement.focus();
          this.labelEditor.nativeElement.select();
        }
      });
    }
  }

  onLabelEditorBlur(): void {
    this.finishLabelEditing();
  }

  onLabelEditorKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishLabelEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelLabelEditing();
    }
  }

  updateLabelText(event: Event): void {
    const target = event.target as HTMLInputElement;
    const editState = this.labelEditingState();

    this.labelEditingState.set({
      ...editState,
      currentLabel: target.value
    });
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeDatepickerState(): void {
    const fieldValue = this.fieldValue();
    
    if (this.isRangeMode()) {
      // Initialize range mode
      const selectedRange = this.parseRangeValue(fieldValue);
      this.updateDatepickerState({
        selectedRange,
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        isRangePickerOpen: false,
        activePreset: selectedRange?.preset || null
      });
    } else {
      // Initialize single date mode
      const selectedDate = fieldValue ? this.parseDate(fieldValue) : null;
      this.updateDatepickerState({
        selectedDate,
        minDate: this.minDate(),
        maxDate: this.maxDate(),
        isPickerOpen: false
      });
    }
  }
  
  private initializeRangeMode(): void {
    const metadata = safeDatepickerMetadata(this.metadata());
    
    // Apply default preset if configured
    if (metadata?.rangePresets?.defaultPreset) {
      this.applyPreset(metadata.rangePresets.defaultPreset);
    }
    
    // Setup range form group validation
    this.setupRangeValidation();
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    
    try {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getDefaultDateFormat(): string {
    const controlType = this.dateControlType();
    
    switch (controlType) {
      case 'datetime':
        return 'dd/MM/yyyy HH:mm';
      case 'timepicker':
        return 'HH:mm';
      default:
        return 'dd/MM/yyyy';
    }
  }

  private updateDatepickerState(changes: Partial<DatepickerState>): void {
    const current = this.datepickerState();
    this.datepickerState.set({ ...current, ...changes });
  }
  
  // =============================================================================
  // MÉTODOS PRIVADOS - RANGE SUPPORT
  // =============================================================================
  
  private parseRangeValue(value: any): DateRangeValue | null {
    if (!value) return null;
    
    // Se já é um DateRangeValue
    if (typeof value === 'object' && 'startDate' in value && 'endDate' in value) {
      return {
        startDate: value.startDate ? this.parseDate(value.startDate) : null,
        endDate: value.endDate ? this.parseDate(value.endDate) : null,
        preset: value.preset,
        timezone: value.timezone,
        label: value.label,
        isComparison: value.isComparison
      };
    }
    
    return null;
  }
  
  private validateDateRange(range: DateRangeValue): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.rangeValidationConfig();
    
    if (!range.startDate || !range.endDate) {
      if (config.requireBothDates) {
        errors.push('Both start and end dates are required');
      }
      return { isValid: errors.length === 0, errors };
    }
    
    const startTime = range.startDate.getTime();
    const endTime = range.endDate.getTime();
    
    // Validate date order
    if (startTime > endTime) {
      errors.push('Start date must be before end date');
      return { isValid: false, errors };
    }
    
    // Validate same date allowance
    if (startTime === endTime && !config.allowSameDate) {
      errors.push('Start and end dates cannot be the same');
    }
    
    // Validate range duration
    const diffDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
    
    if (config.maxRangeDays && diffDays > config.maxRangeDays) {
      errors.push(`Range cannot exceed ${config.maxRangeDays} days`);
    }
    
    if (config.minRangeDays && diffDays < config.minRangeDays) {
      errors.push(`Range must be at least ${config.minRangeDays} days`);
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  private setupRangeValidation(): void {
    const formGroup = this.rangeFormGroup();
    
    // Add custom validators to the form group
    formGroup.addValidators((control) => {
      const value = control.value;
      if (!value || (!value.start && !value.end)) return null;
      
      const range: DateRangeValue = {
        startDate: value.start,
        endDate: value.end
      };
      
      const validation = this.validateDateRange(range);
      return validation.isValid ? null : { rangeInvalid: validation.errors };
    });
  }
  
  private createBuiltInPresets(presetTypes: string[]): InternalPreset[] {
    const presets: InternalPreset[] = [];
    
    presetTypes.forEach((type, index) => {
      const preset = this.getBuiltInPreset(type);
      if (preset) {
        preset.order = index;
        presets.push(preset);
      }
    });
    
    return presets;
  }
  
  private createCustomPresets(customPresets: any[]): InternalPreset[] {
    return customPresets.map((custom, index) => ({
      id: `custom_${index}`,
      label: custom.label,
      icon: custom.icon,
      category: 'custom' as const,
      calculateRange: () => ({
        startDate: this.parseDate(custom.startDate),
        endDate: this.parseDate(custom.endDate),
        preset: `custom_${index}`,
        label: custom.label
      }),
      order: 1000 + index,
      description: `Custom range: ${custom.label}`
    }));
  }
  
  private getBuiltInPreset(type: string): InternalPreset | null {
    const today = new Date();
    const now = new Date();
    
    switch (type) {
      case 'today':
        return {
          id: 'today',
          label: 'Hoje',
          icon: 'today',
          category: 'standard',
          calculateRange: () => ({
            startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            preset: 'today',
            label: 'Hoje'
          }),
          isPopular: true
        };
        
      case 'yesterday':
        return {
          id: 'yesterday',
          label: 'Ontem',
          icon: 'event',
          category: 'standard',
          calculateRange: () => {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return {
              startDate: yesterday,
              endDate: yesterday,
              preset: 'yesterday',
              label: 'Ontem'
            };
          }
        };
        
      case 'thisWeek':
        return {
          id: 'thisWeek',
          label: 'Esta Semana',
          icon: 'date_range',
          category: 'standard',
          calculateRange: () => {
            const startOfWeek = new Date(today);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day;
            startOfWeek.setDate(diff);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            return {
              startDate: startOfWeek,
              endDate: endOfWeek,
              preset: 'thisWeek',
              label: 'Esta Semana'
            };
          }
        };
        
      case 'thisMonth':
        return {
          id: 'thisMonth',
          label: 'Este Mês',
          icon: 'calendar_month',
          category: 'standard',
          calculateRange: () => ({
            startDate: new Date(today.getFullYear(), today.getMonth(), 1),
            endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            preset: 'thisMonth',
            label: 'Este Mês'
          }),
          isPopular: true
        };
        
      case 'thisQuarter':
        return {
          id: 'thisQuarter',
          label: 'Este Trimestre',
          icon: 'calendar_view_month',
          category: 'fiscal',
          calculateRange: () => {
            const quarter = Math.floor(today.getMonth() / 3);
            const startMonth = quarter * 3;
            return {
              startDate: new Date(today.getFullYear(), startMonth, 1),
              endDate: new Date(today.getFullYear(), startMonth + 3, 0),
              preset: 'thisQuarter',
              label: 'Este Trimestre'
            };
          },
          isPopular: true
        };
        
      case 'thisYear':
        return {
          id: 'thisYear',
          label: 'Este Ano',
          icon: 'calendar_view_year',
          category: 'fiscal',
          calculateRange: () => ({
            startDate: new Date(today.getFullYear(), 0, 1),
            endDate: new Date(today.getFullYear(), 11, 31),
            preset: 'thisYear',
            label: 'Este Ano'
          }),
          isPopular: true
        };
        
      case 'last30Days':
        return {
          id: 'last30Days',
          label: 'Últimos 30 Dias',
          icon: 'date_range',
          category: 'standard',
          calculateRange: () => {
            const endDate = new Date(today);
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 29);
            return {
              startDate,
              endDate,
              preset: 'last30Days',
              label: 'Últimos 30 Dias'
            };
          },
          isPopular: true
        };
        
      default:
        return null;
    }
  }
}