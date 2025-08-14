import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FieldConditionConfig } from '../models/rule-builder.model';
import {
  FieldSchema,
  FieldType,
  FIELD_TYPE_OPERATORS,
  OPERATOR_LABELS,
} from '../models/field-schema.model';

@Component({
  selector: 'praxis-field-condition-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="conditionForm" class="field-condition-form">
      <!-- Field Selection -->
      <div class="form-row">
        <mat-form-field appearance="outline" class="field-select">
          <mat-label>Field</mat-label>
          <mat-select
            formControlName="fieldName"
            (selectionChange)="onFieldChanged($event)"
          >
            <mat-optgroup
              *ngFor="let category of fieldCategories"
              [label]="category.name"
            >
              <mat-option
                *ngFor="let field of category.fields"
                [value]="field.name"
              >
                <div class="field-option">
                  <mat-icon class="field-icon">{{
                    getFieldIcon(field.type)
                  }}</mat-icon>
                  <span class="field-label">{{ field.label }}</span>
                  <span class="field-type">{{ field.type }}</span>
                </div>
              </mat-option>
            </mat-optgroup>
          </mat-select>
          <mat-hint *ngIf="selectedField?.description">
            {{ selectedField?.description }}
          </mat-hint>
        </mat-form-field>
      </div>

      <!-- Operator Selection -->
      <div class="form-row" *ngIf="selectedField">
        <mat-form-field appearance="outline" class="operator-select">
          <mat-label>Operator</mat-label>
          <mat-select
            formControlName="operator"
            (selectionChange)="onOperatorChanged($event)"
          >
            <mat-option *ngFor="let op of availableOperators" [value]="op">
              {{ getOperatorLabel(op) }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Value Input -->
      <div
        class="form-row"
        *ngIf="selectedField && selectedOperator && needsValue()"
      >
        <div class="value-input-container">
          <!-- Value Type Selector -->
          <mat-form-field appearance="outline" class="value-type-select">
            <mat-label>Value Type</mat-label>
            <mat-select
              formControlName="valueType"
              (selectionChange)="onValueTypeChanged($event)"
            >
              <mat-option value="literal">Literal Value</mat-option>
              <mat-option value="field">Field Reference</mat-option>
              <mat-option value="context">Context Variable</mat-option>
              <mat-option value="function">Function Call</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Literal Value Input -->
          <div *ngIf="valueType === 'literal'" class="literal-value-input">
            <!-- String Input -->
            <mat-form-field
              *ngIf="isStringField()"
              appearance="outline"
              class="value-input"
            >
              <mat-label>Value</mat-label>
              <input
                matInput
                formControlName="value"
                [placeholder]="getValuePlaceholder()"
              />
              <mat-hint>{{ getValueHint() }}</mat-hint>
            </mat-form-field>

            <!-- Number Input -->
            <mat-form-field
              *ngIf="isNumberField()"
              appearance="outline"
              class="value-input"
            >
              <mat-label>Value</mat-label>
              <input
                matInput
                type="number"
                formControlName="value"
                [placeholder]="getValuePlaceholder()"
              />
              <mat-hint>{{ getValueHint() }}</mat-hint>
            </mat-form-field>

            <!-- Boolean Input -->
            <div *ngIf="isBooleanField()" class="boolean-input">
              <mat-checkbox formControlName="value">
                {{ getBooleanLabel() }}
              </mat-checkbox>
            </div>

            <!-- Date Input -->
            <mat-form-field
              *ngIf="isDateField()"
              appearance="outline"
              class="value-input"
            >
              <mat-label>Date</mat-label>
              <input
                matInput
                [matDatepicker]="datePicker"
                formControlName="value"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="datePicker"
              ></mat-datepicker-toggle>
              <mat-datepicker #datePicker></mat-datepicker>
            </mat-form-field>

            <!-- Enum/Select Input -->
            <mat-form-field
              *ngIf="isEnumField()"
              appearance="outline"
              class="value-input"
            >
              <mat-label>Value</mat-label>
              <mat-select formControlName="value">
                <mat-option
                  *ngFor="let option of selectedField.allowedValues"
                  [value]="option.value"
                >
                  {{ option.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Array Input (for 'in' operators) -->
            <div *ngIf="isArrayOperator()" class="array-input">
              <mat-form-field appearance="outline" class="value-input">
                <mat-label>Values (comma separated)</mat-label>
                <input
                  matInput
                  formControlName="value"
                  placeholder="value1, value2, value3"
                />
                <mat-hint>Enter multiple values separated by commas</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- Field Reference Input -->
          <mat-form-field
            *ngIf="valueType === 'field'"
            appearance="outline"
            class="value-input"
          >
            <mat-label>Compare to Field</mat-label>
            <mat-select formControlName="compareToField">
              <mat-option
                *ngFor="let field of getCompatibleFields()"
                [value]="field.name"
              >
                <div class="field-option">
                  <mat-icon class="field-icon">{{
                    getFieldIcon(field.type)
                  }}</mat-icon>
                  <span class="field-label">{{ field.label }}</span>
                </div>
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Context Variable Input -->
          <mat-form-field
            *ngIf="valueType === 'context'"
            appearance="outline"
            class="value-input"
          >
            <mat-label>Context Variable</mat-label>
            <mat-select formControlName="contextVariable">
              <mat-option
                *ngFor="let variable of contextVariables"
                [value]="variable.name"
              >
                <div class="context-option">
                  <span class="variable-name">\${{ variable.name }}</span>
                  <span class="variable-type">{{ variable.type }}</span>
                </div>
              </mat-option>
            </mat-select>
            <mat-hint>Select a dynamic context variable</mat-hint>
          </mat-form-field>

          <!-- Function Call Input -->
          <div *ngIf="valueType === 'function'" class="function-input">
            <mat-form-field appearance="outline" class="function-select">
              <mat-label>Function</mat-label>
              <mat-select formControlName="functionName">
                <mat-option
                  *ngFor="let func of customFunctions"
                  [value]="func.name"
                >
                  <div class="function-option">
                    <span class="function-name">{{ func.label }}</span>
                    <span class="function-desc">{{ func.description }}</span>
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>
            <!-- Function parameters would be added here -->
          </div>
        </div>
      </div>

      <!-- Validation Messages -->
      <div class="validation-messages" *ngIf="hasValidationErrors()">
        <div
          *ngFor="let error of getValidationErrors()"
          class="validation-error"
        >
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Preview -->
      <div class="condition-preview" *ngIf="isValid()">
        <div class="preview-label">Preview:</div>
        <div class="preview-text">{{ getPreviewText() }}</div>
      </div>
    </form>
  `,
  styles: [
    `
      .field-condition-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 300px;
      }

      .form-row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .field-select,
      .operator-select,
      .value-type-select {
        flex: 1;
        min-width: 150px;
      }

      .value-input-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 2;
      }

      .value-input {
        width: 100%;
      }

      .field-option,
      .context-option,
      .function-option {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .field-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--mdc-theme-primary);
      }

      .field-label {
        flex: 1;
        font-weight: 500;
      }

      .field-type {
        font-size: 11px;
        color: var(--mdc-theme-on-surface-variant);
        background: var(--mdc-theme-surface-variant);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .variable-name {
        font-family: monospace;
        font-weight: 500;
        color: var(--mdc-theme-secondary);
      }

      .variable-type {
        font-size: 11px;
        color: var(--mdc-theme-on-surface-variant);
        background: var(--mdc-theme-surface-variant);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .function-name {
        font-weight: 500;
        color: var(--mdc-theme-tertiary);
      }

      .function-desc {
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
        font-style: italic;
      }

      .boolean-input {
        display: flex;
        align-items: center;
        padding: 12px 0;
      }

      .array-input {
        width: 100%;
      }

      .function-input {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .function-select {
        width: 100%;
      }

      .validation-messages {
        background: var(--mdc-theme-error-container);
        border-radius: 4px;
        padding: 8px 12px;
      }

      .validation-error {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--mdc-theme-on-error-container);
        font-size: 12px;
        margin-bottom: 4px;
      }

      .validation-error:last-child {
        margin-bottom: 0;
      }

      .validation-error mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .condition-preview {
        background: var(--mdc-theme-surface-variant);
        border-radius: 8px;
        padding: 12px;
        border-left: 4px solid var(--mdc-theme-primary);
      }

      .preview-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface-variant);
        margin-bottom: 4px;
      }

      .preview-text {
        font-family: monospace;
        font-size: 14px;
        color: var(--mdc-theme-on-surface);
        background: var(--mdc-theme-surface);
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--mdc-theme-outline);
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .field-select,
        .operator-select,
        .value-type-select {
          width: 100%;
        }
      }
    `,
  ],
})
export class FieldConditionEditorComponent implements OnInit, OnChanges {
  @Input() config: FieldConditionConfig | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};

  @Output() configChanged = new EventEmitter<FieldConditionConfig>();

  private destroy$ = new Subject<void>();

  conditionForm: FormGroup;
  fieldCategories: { name: string; fields: FieldSchema[] }[] = [];
  contextVariables: any[] = [];
  customFunctions: any[] = [];

  selectedField: FieldSchema | null = null;
  selectedOperator: string | null = null;
  valueType: string = 'literal';
  availableOperators: string[] = [];

  constructor(private fb: FormBuilder) {
    this.conditionForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFieldCategories();
    this.setupFormSubscriptions();
    this.loadInitialConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.loadInitialConfig();
    }

    if (changes['fieldSchemas'] && !changes['fieldSchemas'].firstChange) {
      this.setupFieldCategories();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fieldName: ['', Validators.required],
      operator: ['', Validators.required],
      value: [''],
      valueType: ['literal'],
      compareToField: [''],
      contextVariable: [''],
      functionName: [''],
    });
  }

  private setupFormSubscriptions(): void {
    this.conditionForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitConfigChange();
      });
  }

  private setupFieldCategories(): void {
    const fieldsByCategory: Record<string, FieldSchema[]> = {};

    Object.values(this.fieldSchemas).forEach((field) => {
      const category = field.uiConfig?.category || 'Other';
      if (!fieldsByCategory[category]) {
        fieldsByCategory[category] = [];
      }
      fieldsByCategory[category].push(field);
    });

    this.fieldCategories = Object.entries(fieldsByCategory)
      .map(([name, fields]) => ({
        name,
        fields: fields.sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private loadInitialConfig(): void {
    if (!this.config) return;

    this.conditionForm.patchValue({
      fieldName: this.config.fieldName || '',
      operator: this.config.operator || '',
      value: this.config.value || '',
      valueType: this.config.valueType || 'literal',
      compareToField: this.config.compareToField || '',
      contextVariable: this.config.contextVariable || '',
    });

    if (this.config.fieldName) {
      this.onFieldChanged(this.config.fieldName);
    }
  }

  private emitConfigChange(): void {
    if (!this.conditionForm.valid) return;

    const formValue = this.conditionForm.value;
    const config: FieldConditionConfig = {
      type: 'fieldCondition',
      fieldName: formValue.fieldName,
      operator: formValue.operator,
      value: this.processValue(formValue.value),
      valueType: formValue.valueType,
      compareToField: formValue.compareToField,
      contextVariable: formValue.contextVariable,
    };

    this.configChanged.emit(config);
  }

  private processValue(value: any): any {
    if (!value) return null;

    // Handle array operators (in, notIn)
    if (this.isArrayOperator() && typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }

    // Handle number conversion
    if (this.isNumberField() && typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }

    return value;
  }

  // Template methods
  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      string: 'text_fields',
      number: 'pin',
      integer: 'pin',
      boolean: 'toggle_on',
      date: 'event',
      datetime: 'schedule',
      time: 'access_time',
      email: 'email',
      url: 'link',
      phone: 'phone',
      array: 'list',
      object: 'data_object',
      enum: 'list',
      uuid: 'fingerprint',
      json: 'data_object',
    };

    return icons[type] || 'text_fields';
  }

  getOperatorLabel(operator: string): string {
    return OPERATOR_LABELS[operator] || operator;
  }

  getValuePlaceholder(): string {
    if (!this.selectedField) return 'Enter value';

    switch (this.selectedField.type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.URL:
        return 'Enter text value';
      case FieldType.NUMBER:
      case FieldType.INTEGER:
        return 'Enter number';
      case FieldType.PHONE:
        return '+1234567890';
      default:
        return 'Enter value';
    }
  }

  getValueHint(): string {
    if (!this.selectedField || !this.selectedOperator) return '';

    if (this.selectedOperator === 'matches') {
      return 'Enter a regular expression pattern';
    }

    if (this.selectedField.format) {
      if (this.selectedField.format.minimum !== undefined) {
        return `Minimum: ${this.selectedField.format.minimum}`;
      }
    }

    return '';
  }

  getBooleanLabel(): string {
    return this.selectedOperator === 'isTrue' ? 'True' : 'Value';
  }

  getCompatibleFields(): FieldSchema[] {
    if (!this.selectedField) return [];

    return Object.values(this.fieldSchemas).filter(
      (field) =>
        field.type === this.selectedField?.type &&
        field.name !== this.selectedField?.name,
    );
  }

  getPreviewText(): string {
    const formValue = this.conditionForm.value;

    if (!formValue.fieldName || !formValue.operator) {
      return 'Incomplete condition';
    }

    let valueText = '';

    if (this.needsValue()) {
      switch (formValue.valueType) {
        case 'literal':
          valueText = this.formatValueForPreview(formValue.value);
          break;
        case 'field':
          valueText = formValue.compareToField || '<field>';
          break;
        case 'context':
          valueText = `\$${formValue.contextVariable || '<variable>'}`;
          break;
        case 'function':
          valueText = `${formValue.functionName || '<function>'}()`;
          break;
      }
    }

    const operatorText = this.getOperatorLabel(formValue.operator);

    if (valueText) {
      return `${formValue.fieldName} ${operatorText} ${valueText}`;
    } else {
      return `${formValue.fieldName} ${operatorText}`;
    }
  }

  private formatValueForPreview(value: any): string {
    if (value === null || value === undefined) return '<value>';
    if (Array.isArray(value)) return `[${value.join(', ')}]`;
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  }

  // Type checking methods
  isStringField(): boolean {
    return (
      this.selectedField?.type === FieldType.STRING ||
      this.selectedField?.type === FieldType.EMAIL ||
      this.selectedField?.type === FieldType.URL ||
      this.selectedField?.type === FieldType.PHONE ||
      this.selectedField?.type === FieldType.UUID
    );
  }

  isNumberField(): boolean {
    return (
      this.selectedField?.type === FieldType.NUMBER ||
      this.selectedField?.type === FieldType.INTEGER
    );
  }

  isBooleanField(): boolean {
    return this.selectedField?.type === FieldType.BOOLEAN;
  }

  isDateField(): boolean {
    return (
      this.selectedField?.type === FieldType.DATE ||
      this.selectedField?.type === FieldType.DATETIME ||
      this.selectedField?.type === FieldType.TIME
    );
  }

  isEnumField(): boolean {
    return (
      this.selectedField?.type === FieldType.ENUM ||
      (this.selectedField?.allowedValues?.length ?? 0) > 0
    );
  }

  isArrayOperator(): boolean {
    return this.selectedOperator === 'in' || this.selectedOperator === 'notIn';
  }

  needsValue(): boolean {
    const noValueOperators = [
      'isEmpty',
      'isNotEmpty',
      'isNull',
      'isNotNull',
      'isTrue',
      'isFalse',
    ];
    return this.selectedOperator
      ? !noValueOperators.includes(this.selectedOperator)
      : true;
  }

  // Event handlers
  onFieldChanged(event: string | MatSelectChange): void {
    const fieldName = typeof event === 'string' ? event : event.value;
    this.selectedField = this.fieldSchemas[fieldName] || null;

    if (this.selectedField) {
      this.availableOperators =
        FIELD_TYPE_OPERATORS[this.selectedField.type] || [];

      // Reset operator if not compatible
      const currentOperator = this.conditionForm.get('operator')?.value;
      if (
        currentOperator &&
        !this.availableOperators.includes(currentOperator)
      ) {
        this.conditionForm.patchValue({ operator: '', value: '' });
        this.selectedOperator = null;
      }
    } else {
      this.availableOperators = [];
    }
  }

  onOperatorChanged(event: MatSelectChange): void {
    this.selectedOperator = event.value;

    // Reset value when operator changes
    this.conditionForm.patchValue({ value: '' });
  }

  onValueTypeChanged(event: MatSelectChange): void {
    this.valueType = event.value;

    // Reset related fields
    this.conditionForm.patchValue({
      value: '',
      compareToField: '',
      contextVariable: '',
      functionName: '',
    });
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.conditionForm.get('fieldName')?.value) {
      errors.push('Field is required');
    }

    if (!this.conditionForm.get('operator')?.value) {
      errors.push('Operator is required');
    }

    if (this.needsValue()) {
      const valueType = this.conditionForm.get('valueType')?.value;

      switch (valueType) {
        case 'literal':
          if (!this.conditionForm.get('value')?.value) {
            errors.push('Value is required');
          }
          break;
        case 'field':
          if (!this.conditionForm.get('compareToField')?.value) {
            errors.push('Comparison field is required');
          }
          break;
        case 'context':
          if (!this.conditionForm.get('contextVariable')?.value) {
            errors.push('Context variable is required');
          }
          break;
        case 'function':
          if (!this.conditionForm.get('functionName')?.value) {
            errors.push('Function is required');
          }
          break;
      }
    }

    return errors;
  }

  isValid(): boolean {
    return this.conditionForm.valid && !this.hasValidationErrors();
  }
}
