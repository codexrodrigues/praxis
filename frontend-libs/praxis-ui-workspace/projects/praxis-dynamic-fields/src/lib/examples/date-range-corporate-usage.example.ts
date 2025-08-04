/**
 * @fileoverview Corporate-oriented examples for MaterialDateRangeComponent
 *
 * Demonstrates typical enterprise scenarios like financial reporting and
 * vacation approval while leveraging available component features.
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialDateRangeMetadata } from '@praxis/core';
import { MaterialDateRangeComponent } from '../components/material-date-range/material-date-range.component';

// Financial report period with strict year bounds
export const FINANCIAL_REPORT_PERIOD: MaterialDateRangeMetadata = {
  name: 'financialPeriod',
  label: 'Período do Relatório Financeiro',
  controlType: 'dateRange',
  required: true,
  minDate: '2024-01-01',
  maxDate: '2024-12-31',
  startPlaceholder: 'Início',
  endPlaceholder: 'Fim',
  startAriaLabel: 'Data inicial do relatório',
  endAriaLabel: 'Data final do relatório',
};

// Vacation approval period with weekend filter and touch UI
export const VACATION_APPROVAL_PERIOD: MaterialDateRangeMetadata = {
  name: 'vacation',
  label: 'Período de Férias',
  controlType: 'dateRange',
  touchUi: true,
  dateFilter: (d: Date | null) => !!d && d.getDay() !== 0 && d.getDay() !== 6,
  startPlaceholder: 'Saída',
  endPlaceholder: 'Retorno',
  startAriaLabel: 'Data de saída',
  endAriaLabel: 'Data de retorno',
};

@Component({
  selector: 'date-range-corporate-usage-example',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialDateRangeComponent],
  template: `
    <form [formGroup]="form">
      <pdx-material-date-range
        [metadata]="financialMetadata"
        formControlName="financialPeriod"
      ></pdx-material-date-range>

      <pdx-material-date-range
        [metadata]="vacationMetadata"
        formControlName="vacation"
      ></pdx-material-date-range>
    </form>
    <pre>{{ form.value | json }}</pre>
  `,
})
export class DateRangeCorporateUsageExample {
  readonly financialMetadata = FINANCIAL_REPORT_PERIOD;
  readonly vacationMetadata = VACATION_APPROVAL_PERIOD;

  readonly form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      financialPeriod: null,
      vacation: null,
    });
  }
}
