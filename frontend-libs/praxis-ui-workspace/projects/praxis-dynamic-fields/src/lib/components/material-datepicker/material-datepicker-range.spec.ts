/**
 * @fileoverview Testes unitários para cenários corporativos de date range
 * 
 * Testa especificamente:
 * ✅ Funcionalidade de presets corporativos
 * ✅ Validação de ranges (max/min dias)
 * ✅ Integração com mat-date-range-input
 * ✅ Casos de uso empresariais (trimestres, anos fiscais)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { MaterialDatepickerComponent } from './material-datepicker.component';
import { MaterialDateMetadata, DateRangeValue } from '@praxis/core';

describe('MaterialDatepickerComponent - Corporate Date Range Scenarios', () => {
  let component: MaterialDatepickerComponent;
  let fixture: ComponentFixture<MaterialDatepickerComponent>;

  // =============================================================================
  // SETUP & CONFIGURATION
  // =============================================================================

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialDatepickerComponent,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialDatepickerComponent);
    component = fixture.componentInstance;
  });

  // =============================================================================
  // CORPORATE PRESET TESTS
  // =============================================================================

  describe('Corporate Presets', () => {
    beforeEach(() => {
      // Configure range mode with corporate presets
      const rangeMetadata: MaterialDateMetadata = {
        name: 'reportPeriod',
        label: 'Período do Relatório',
        controlType: 'daterange',
        required: false,
        rangePresets: {
          enabled: true,
          displayStyle: 'buttons',
          presets: ['thisMonth', 'thisQuarter', 'thisYear', 'last30Days'],
          customPresets: [{
            label: 'Ano Fiscal 2024',
            startDate: '2024-04-01',
            endDate: '2025-03-31',
            icon: 'account_balance',
            group: 'fiscal'
          }]
        }
      };

      component.setMetadata(rangeMetadata);
      component.setFormControl(new FormControl());
      fixture.detectChanges();
    });

    it('should display preset buttons when range mode is enabled', () => {
      expect(component.isRangeMode()).toBe(true);
      expect(component.rangePresets().length).toBeGreaterThan(0);
      
      const presetButtons = fixture.debugElement.queryAll(By.css('.pdx-preset-button'));
      expect(presetButtons.length).toBeGreaterThan(3); // thisMonth, thisQuarter, thisYear, last30Days + custom
    });

    it('should apply "thisMonth" preset correctly', () => {
      const thisMonthPreset = component.rangePresets().find(p => p.id === 'thisMonth');
      expect(thisMonthPreset).toBeDefined();

      component.applyPreset('thisMonth');
      
      const selectedRange = component.selectedRange();
      expect(selectedRange).toBeDefined();
      expect(selectedRange?.startDate?.getDate()).toBe(1); // First day of current month
      expect(selectedRange?.preset).toBe('thisMonth');
      expect(component.activePreset()).toBe('thisMonth');
    });

    it('should apply "thisQuarter" preset correctly', () => {
      component.applyPreset('thisQuarter');
      
      const selectedRange = component.selectedRange();
      const today = new Date();
      const expectedQuarter = Math.floor(today.getMonth() / 3);
      const expectedStartMonth = expectedQuarter * 3;
      
      expect(selectedRange?.startDate?.getMonth()).toBe(expectedStartMonth);
      expect(selectedRange?.startDate?.getDate()).toBe(1);
      expect(selectedRange?.preset).toBe('thisQuarter');
    });

    it('should apply custom fiscal year preset correctly', () => {
      component.applyPreset('custom_0'); // First custom preset
      
      const selectedRange = component.selectedRange();
      expect(selectedRange?.startDate?.getFullYear()).toBe(2024);
      expect(selectedRange?.startDate?.getMonth()).toBe(3); // April (0-indexed)
      expect(selectedRange?.startDate?.getDate()).toBe(1);
      
      expect(selectedRange?.endDate?.getFullYear()).toBe(2025);
      expect(selectedRange?.endDate?.getMonth()).toBe(2); // March (0-indexed)
      expect(selectedRange?.endDate?.getDate()).toBe(31);
    });

    it('should clear preset when dates are manually changed', () => {
      // Apply preset first
      component.applyPreset('thisMonth');
      expect(component.activePreset()).toBe('thisMonth');
      
      // Manually change start date
      const newStartDate = new Date(2024, 0, 15); // Jan 15, 2024
      component.onRangeStartDateChange(newStartDate);
      
      // Preset should be cleared
      expect(component.activePreset()).toBeNull();
    });

    it('should display preset chip when active', async () => {
      component.applyPreset('thisMonth');
      fixture.detectChanges();
      await fixture.whenStable();
      
      const presetChip = fixture.debugElement.query(By.css('.pdx-preset-chip'));
      expect(presetChip).toBeDefined();
      expect(presetChip.nativeElement.textContent).toContain('Este Mês');
    });
  });

  // =============================================================================
  // RANGE VALIDATION TESTS
  // =============================================================================

  describe('Range Validation', () => {
    beforeEach(() => {
      const rangeMetadata: MaterialDateMetadata = {
        name: 'restrictedRange',
        label: 'Período Restrito',
        controlType: 'daterange',
        required: true,
        rangeValidation: {
          maxRangeDays: 90,
          minRangeDays: 7,
          allowSameDate: false,
          requireBothDates: true,
          validationMessage: 'Range deve ter entre 7 e 90 dias'
        }
      };

      component.setMetadata(rangeMetadata);
      component.setFormControl(new FormControl());
      fixture.detectChanges();
    });

    it('should validate maximum range days', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 3, 1); // 91 days later (exceeds 90 day limit)
      
      const range: DateRangeValue = { startDate, endDate };
      const validation = component['validateDateRange'](range);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Range cannot exceed 90 days');
    });

    it('should validate minimum range days', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 3); // 2 days (less than 7 day minimum)
      
      const range: DateRangeValue = { startDate, endDate };
      const validation = component['validateDateRange'](range);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Range must be at least 7 days');
    });

    it('should reject same start and end dates when not allowed', () => {
      const sameDate = new Date(2024, 0, 1);
      
      const range: DateRangeValue = { 
        startDate: sameDate, 
        endDate: sameDate 
      };
      const validation = component['validateDateRange'](range);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Start and end dates cannot be the same');
    });

    it('should validate correct range within limits', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 15); // 14 days (within 7-90 range)
      
      const range: DateRangeValue = { startDate, endDate };
      const validation = component['validateDateRange'](range);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should require both dates when configured', () => {
      const range: DateRangeValue = { 
        startDate: new Date(2024, 0, 1), 
        endDate: null 
      };
      const validation = component['validateDateRange'](range);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Both start and end dates are required');
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('mat-date-range-input Integration', () => {
    beforeEach(() => {
      const rangeMetadata: MaterialDateMetadata = {
        name: 'integrationTest',
        label: 'Integration Test',
        controlType: 'daterange',
        startPlaceholder: 'Data início',
        endPlaceholder: 'Data fim'
      };

      component.setMetadata(rangeMetadata);
      component.setFormControl(new FormControl());
      fixture.detectChanges();
    });

    it('should render mat-date-range-input in range mode', () => {
      const rangeInput = fixture.debugElement.query(By.css('mat-date-range-input'));
      expect(rangeInput).toBeDefined();
      
      const startInput = fixture.debugElement.query(By.css('input[matStartDate]'));
      const endInput = fixture.debugElement.query(By.css('input[matEndDate]'));
      
      expect(startInput).toBeDefined();
      expect(endInput).toBeDefined();
    });

    it('should use correct placeholders for start and end dates', () => {
      const startInput = fixture.debugElement.query(By.css('input[matStartDate]'));
      const endInput = fixture.debugElement.query(By.css('input[matEndDate]'));
      
      expect(startInput.nativeElement.placeholder).toBe('Data início');
      expect(endInput.nativeElement.placeholder).toBe('Data fim');
    });

    it('should update range when individual dates change', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);
      
      component.onRangeStartDateChange(startDate);
      component.onRangeEndDateChange(endDate);
      
      const selectedRange = component.selectedRange();
      expect(selectedRange?.startDate).toEqual(startDate);
      expect(selectedRange?.endDate).toEqual(endDate);
    });

    it('should update form control value when range changes', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);
      
      const range: DateRangeValue = { startDate, endDate };
      component.selectDateRange(range);
      
      const controlValue = component.formControl.value;
      expect(controlValue.startDate).toEqual(startDate);
      expect(controlValue.endDate).toEqual(endDate);
    });
  });

  // =============================================================================
  // CORPORATE USE CASES
  // =============================================================================

  describe('Corporate Use Cases', () => {
    it('should handle quarterly reporting scenario', () => {
      const quarterlyMetadata: MaterialDateMetadata = {
        name: 'quarterlyReport',
        label: 'Relatório Trimestral',
        controlType: 'daterange',
        rangePresets: {
          enabled: true,
          presets: ['thisQuarter', 'lastQuarter'],
          defaultPreset: 'thisQuarter'
        },
        rangeValidation: {
          maxRangeDays: 100, // Allow slightly more than a quarter
          minRangeDays: 80   // Ensure it's roughly quarterly
        }
      };

      component.setMetadata(quarterlyMetadata);
      component.setFormControl(new FormControl());
      component.ngAfterViewInit();
      fixture.detectChanges();
      
      // Should auto-apply default preset
      expect(component.activePreset()).toBe('thisQuarter');
      
      const range = component.selectedRange();
      expect(range?.startDate).toBeDefined();
      expect(range?.endDate).toBeDefined();
      
      // Validate it's roughly quarterly (80-100 days)
      const diffDays = Math.ceil((range!.endDate!.getTime() - range!.startDate!.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(80);
      expect(diffDays).toBeLessThanOrEqual(100);
    });

    it('should handle financial audit scenario with strict validation', () => {
      const auditMetadata: MaterialDateMetadata = {
        name: 'auditPeriod',
        label: 'Período de Auditoria',
        controlType: 'daterange',
        required: true,
        rangeValidation: {
          maxRangeDays: 31,  // Maximum one month
          minRangeDays: 1,   // At least one day
          allowSameDate: false,
          requireBothDates: true
        },
        rangePresets: {
          enabled: true,
          presets: ['thisMonth', 'lastMonth']
        }
      };

      component.setMetadata(auditMetadata);
      component.setFormControl(new FormControl());
      fixture.detectChanges();
      
      // Try to set an invalid range (too long)
      const invalidRange: DateRangeValue = {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 1, 15) // 45 days (exceeds 31)
      };
      
      component.selectDateRange(invalidRange);
      
      // Should not accept invalid range
      const validation = component['validateDateRange'](invalidRange);
      expect(validation.isValid).toBe(false);
    });

    it('should support multiple display styles for presets', async () => {
      const dropdownMetadata: MaterialDateMetadata = {
        name: 'flexibleRange',
        label: 'Período Flexível',
        controlType: 'daterange',
        rangePresets: {
          enabled: true,
          displayStyle: 'dropdown',
          presets: ['thisMonth', 'thisQuarter', 'thisYear']
        }
      };

      component.setMetadata(dropdownMetadata);
      component.setFormControl(new FormControl());
      fixture.detectChanges();
      await fixture.whenStable();
      
      expect(component.presetDisplayStyle()).toBe('dropdown');
      
      // Dropdown should be rendered instead of buttons
      const dropdown = fixture.debugElement.query(By.css('.pdx-date-presets-dropdown'));
      const buttons = fixture.debugElement.query(By.css('.pdx-preset-buttons'));
      
      expect(dropdown).toBeDefined();
      expect(buttons).toBeNull();
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle invalid preset IDs gracefully', () => {
      const metadata: MaterialDateMetadata = {
        name: 'test',
        label: 'Test',
        controlType: 'daterange'
      };

      component.setMetadata(metadata);
      component.setFormControl(new FormControl());
      
      // Try to apply non-existent preset
      spyOn(component, 'log');
      component.applyPreset('nonExistentPreset');
      
      expect(component.log).toHaveBeenCalledWith('warn', 'Preset not found', { presetId: 'nonExistentPreset' });
      expect(component.activePreset()).toBeNull();
    });

    it('should not process range operations in single date mode', () => {
      const singleDateMetadata: MaterialDateMetadata = {
        name: 'singleDate',
        label: 'Single Date',
        controlType: 'datepicker' // Not daterange
      };

      component.setMetadata(singleDateMetadata);
      component.setFormControl(new FormControl());
      
      const range: DateRangeValue = {
        startDate: new Date(),
        endDate: new Date()
      };
      
      // Should not process range in single date mode
      component.selectDateRange(range);
      expect(component.selectedRange()).toBeNull();
    });
  });
});