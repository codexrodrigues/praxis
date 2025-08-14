import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FieldToFieldConfig } from '../models/rule-builder.model';
import { FieldSchema, FieldType, FIELD_TYPE_OPERATORS, OPERATOR_LABELS } from '../models/field-schema.model';

@Component({
  selector: 'praxis-field-to-field-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="fieldToFieldForm" class="field-to-field-form">
      <!-- Left Field Selection -->
      <div class="form-section">
        <h4 class="section-title">
          <mat-icon>compare_arrows</mat-icon>
          Field Comparison
        </h4>
        
        <div class="comparison-layout">
          <!-- Left Field -->
          <div class="field-section left-field">
            <mat-form-field appearance="outline" class="field-select">
              <mat-label>Left Field</mat-label>
              <mat-select formControlName="leftField"
                         (selectionChange)="onLeftFieldChanged($event)">
                <mat-optgroup *ngFor="let category of fieldCategories" [label]="category.name">
                  <mat-option *ngFor="let field of category.fields" 
                             [value]="field.name">
                    <div class="field-option">
                      <mat-icon class="field-icon">{{ getFieldIcon(field.type) }}</mat-icon>
                      <span class="field-label">{{ field.label }}</span>
                      <span class="field-type">{{ field.type }}</span>
                    </div>
                  </mat-option>
                </mat-optgroup>
              </mat-select>
              <mat-hint *ngIf="leftFieldSchema?.description">
                {{ leftFieldSchema.description }}
              </mat-hint>
            </mat-form-field>

            <!-- Left Field Transforms -->
            <div class="field-transforms" *ngIf="leftFieldSchema">
              <mat-expansion-panel class="transforms-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>transform</mat-icon>
                    Field Transforms
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getLeftTransformsDescription() }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="transforms-content">
                  <div class="available-transforms">
                    <div *ngFor="let transform of getAvailableTransforms(leftFieldSchema)" 
                         class="transform-option">
                      <mat-checkbox [checked]="isTransformSelected('left', transform.name)"
                                   (change)="onTransformToggle('left', transform.name, $event)">
                        {{ transform.label }}
                      </mat-checkbox>
                      <div class="transform-description">{{ transform.description }}</div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </div>

          <!-- Operator -->
          <div class="operator-section">
            <mat-form-field appearance="outline" class="operator-select">
              <mat-label>Operator</mat-label>
              <mat-select formControlName="operator"
                         (selectionChange)="onOperatorChanged($event)">
                <mat-option *ngFor="let op of availableOperators" [value]="op">
                  {{ getOperatorLabel(op) }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <div class="operator-visual">
              <mat-icon class="operator-icon">{{ getOperatorIcon() }}</mat-icon>
            </div>
          </div>

          <!-- Right Field -->
          <div class="field-section right-field">
            <mat-form-field appearance="outline" class="field-select">
              <mat-label>Right Field</mat-label>
              <mat-select formControlName="rightField"
                         (selectionChange)="onRightFieldChanged($event)">
                <mat-optgroup *ngFor="let category of fieldCategories" [label]="category.name">
                  <mat-option *ngFor="let field of getCompatibleRightFields()" 
                             [value]="field.name">
                    <div class="field-option">
                      <mat-icon class="field-icon">{{ getFieldIcon(field.type) }}</mat-icon>
                      <span class="field-label">{{ field.label }}</span>
                      <span class="field-type">{{ field.type }}</span>
                    </div>
                  </mat-option>
                </mat-optgroup>
              </mat-select>
              <mat-hint *ngIf="rightFieldSchema?.description">
                {{ rightFieldSchema.description }}
              </mat-hint>
            </mat-form-field>

            <!-- Right Field Transforms -->
            <div class="field-transforms" *ngIf="rightFieldSchema">
              <mat-expansion-panel class="transforms-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>transform</mat-icon>
                    Field Transforms
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getRightTransformsDescription() }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="transforms-content">
                  <div class="available-transforms">
                    <div *ngFor="let transform of getAvailableTransforms(rightFieldSchema)" 
                         class="transform-option">
                      <mat-checkbox [checked]="isTransformSelected('right', transform.name)"
                                   (change)="onTransformToggle('right', transform.name, $event)">
                        {{ transform.label }}
                      </mat-checkbox>
                      <div class="transform-description">{{ transform.description }}</div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </div>
        </div>
      </div>

      <!-- Type Compatibility Check -->
      <div class="form-section" *ngIf="leftFieldSchema && rightFieldSchema">
        <h4 class="section-title">
          <mat-icon>verified</mat-icon>
          Type Compatibility
        </h4>
        
        <mat-card class="compatibility-check">
          <div class="compatibility-content">
            <div class="type-comparison">
              <div class="type-info left">
                <span class="type-label">{{ leftFieldSchema.type }}</span>
                <span class="field-name">{{ leftFieldSchema.label }}</span>
              </div>
              
              <div class="compatibility-status">
                <mat-icon *ngIf="areTypesCompatible()" 
                         class="compatible">
                  check_circle
                </mat-icon>
                <mat-icon *ngIf="!areTypesCompatible()" 
                         class="incompatible">
                  error
                </mat-icon>
              </div>
              
              <div class="type-info right">
                <span class="type-label">{{ rightFieldSchema.type }}</span>
                <span class="field-name">{{ rightFieldSchema.label }}</span>
              </div>
            </div>
            
            <div class="compatibility-message">
              {{ getCompatibilityMessage() }}
            </div>
            
            <!-- Auto-transform suggestions -->
            <div *ngIf="!areTypesCompatible() && getAutoTransformSuggestions().length > 0" 
                 class="transform-suggestions">
              <div class="suggestions-title">Suggested transforms to make compatible:</div>
              <div class="suggestion-list">
                <button *ngFor="let suggestion of getAutoTransformSuggestions()"
                        mat-stroked-button 
                        size="small"
                        (click)="applyTransformSuggestion(suggestion)"
                        class="suggestion-button">
                  <mat-icon>auto_fix_high</mat-icon>
                  {{ suggestion.description }}
                </button>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Comparison Preview -->
      <div class="form-section" *ngIf="isValid()">
        <h4 class="section-title">
          <mat-icon>preview</mat-icon>
          Comparison Preview
        </h4>
        
        <mat-card class="comparison-preview">
          <div class="preview-content">
            <div class="comparison-expression">
              <span class="field-expression left">{{ getLeftFieldExpression() }}</span>
              <span class="operator-text">{{ getOperatorLabel(selectedOperator) }}</span>
              <span class="field-expression right">{{ getRightFieldExpression() }}</span>
            </div>
            
            <div class="preview-description">
              {{ getPreviewDescription() }}
            </div>
            
            <!-- Example scenarios -->
            <div class="example-scenarios" *ngIf="getExampleScenarios().length > 0">
              <div class="examples-label">Example scenarios:</div>
              <div class="scenario-list">
                <div *ngFor="let scenario of getExampleScenarios()" 
                     class="scenario-item">
                  <mat-icon class="scenario-icon" 
                           [class.true]="scenario.result" 
                           [class.false]="!scenario.result">
                    {{ scenario.result ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span class="scenario-text">{{ scenario.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Validation Messages -->
      <div class="validation-messages" *ngIf="hasValidationErrors()">
        <div *ngFor="let error of getValidationErrors()" 
             class="validation-error">
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .field-to-field-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 500px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .comparison-layout {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 24px;
      align-items: start;
    }

    .field-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-select {
      width: 100%;
    }

    .field-option {
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

    .operator-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 150px;
    }

    .operator-select {
      width: 100%;
    }

    .operator-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border: 2px solid var(--mdc-theme-primary);
      border-radius: 50%;
      background: var(--mdc-theme-primary-container);
    }

    .operator-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--mdc-theme-primary);
    }

    .field-transforms {
      margin-top: 8px;
    }

    .transforms-panel {
      background: var(--mdc-theme-surface-variant);
    }

    .transforms-content {
      padding: 12px 0;
    }

    .available-transforms {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transform-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transform-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      margin-left: 32px;
      font-style: italic;
    }

    .compatibility-check {
      background: var(--mdc-theme-surface-container);
    }

    .compatibility-content {
      padding: 16px;
    }

    .type-comparison {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .type-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .type-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .field-name {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .compatibility-status {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .compatibility-status mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .compatibility-status .compatible {
      color: var(--mdc-theme-tertiary);
    }

    .compatibility-status .incompatible {
      color: var(--mdc-theme-error);
    }

    .compatibility-message {
      text-align: center;
      font-size: 13px;
      color: var(--mdc-theme-on-surface);
      margin-bottom: 12px;
    }

    .transform-suggestions {
      border-top: 1px solid var(--mdc-theme-outline);
      padding-top: 12px;
    }

    .suggestions-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface-variant);
      margin-bottom: 8px;
    }

    .suggestion-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .suggestion-button {
      font-size: 11px;
    }

    .comparison-preview {
      background: var(--mdc-theme-surface-container);
    }

    .preview-content {
      padding: 16px;
    }

    .comparison-expression {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
      font-family: monospace;
      font-size: 14px;
    }

    .field-expression {
      background: var(--mdc-theme-surface);
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 4px;
      padding: 8px 12px;
      min-width: 120px;
      text-align: center;
    }

    .field-expression.left {
      color: var(--mdc-theme-primary);
    }

    .field-expression.right {
      color: var(--mdc-theme-secondary);
    }

    .operator-text {
      font-weight: 600;
      color: var(--mdc-theme-tertiary);
      background: var(--mdc-theme-tertiary-container);
      padding: 6px 12px;
      border-radius: 4px;
    }

    .preview-description {
      text-align: center;
      font-size: 13px;
      color: var(--mdc-theme-on-surface);
      margin-bottom: 16px;
    }

    .example-scenarios {
      border-top: 1px solid var(--mdc-theme-outline);
      padding-top: 12px;
    }

    .examples-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface-variant);
      margin-bottom: 8px;
    }

    .scenario-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .scenario-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .scenario-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .scenario-icon.true {
      color: var(--mdc-theme-tertiary);
    }

    .scenario-icon.false {
      color: var(--mdc-theme-error);
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

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .comparison-layout {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .operator-section {
        order: 2;
      }
      
      .right-field {
        order: 3;
      }
    }
  `]
})
export class FieldToFieldEditorComponent implements OnInit, OnChanges {
  @Input() config: FieldToFieldConfig | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};
  
  @Output() configChanged = new EventEmitter<FieldToFieldConfig>();

  private destroy$ = new Subject<void>();

  fieldToFieldForm: FormGroup;
  fieldCategories: { name: string; fields: FieldSchema[] }[] = [];
  
  leftFieldSchema: FieldSchema | null = null;
  rightFieldSchema: FieldSchema | null = null;
  selectedOperator: string | null = null;
  availableOperators: string[] = [];
  
  leftTransforms: string[] = [];
  rightTransforms: string[] = [];

  constructor(private fb: FormBuilder) {
    this.fieldToFieldForm = this.createForm();
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
      leftField: ['', Validators.required],
      operator: ['', Validators.required],
      rightField: ['', Validators.required]
    });
  }

  private setupFormSubscriptions(): void {
    this.fieldToFieldForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitConfigChange();
      });
  }

  private setupFieldCategories(): void {
    const fieldsByCategory: Record<string, FieldSchema[]> = {};
    
    Object.values(this.fieldSchemas).forEach(field => {
      const category = field.uiConfig?.category || 'Other';
      if (!fieldsByCategory[category]) {
        fieldsByCategory[category] = [];
      }
      fieldsByCategory[category].push(field);
    });

    this.fieldCategories = Object.entries(fieldsByCategory)
      .map(([name, fields]) => ({
        name,
        fields: fields.sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private loadInitialConfig(): void {
    if (!this.config) return;

    this.fieldToFieldForm.patchValue({
      leftField: this.config.leftField || '',
      operator: this.config.operator || '',
      rightField: this.config.rightField || ''
    });

    this.leftTransforms = this.config.leftTransforms || [];
    this.rightTransforms = this.config.rightTransforms || [];

    if (this.config.leftField) {
      this.onLeftFieldChanged(this.config.leftField);
    }
    
    if (this.config.rightField) {
      this.onRightFieldChanged(this.config.rightField);
    }
  }

  private emitConfigChange(): void {
    if (!this.fieldToFieldForm.valid) return;

    const formValue = this.fieldToFieldForm.value;
    const config: FieldToFieldConfig = {
      type: 'fieldToField',
      leftField: formValue.leftField,
      operator: formValue.operator,
      rightField: formValue.rightField,
      leftTransforms: this.leftTransforms.length > 0 ? this.leftTransforms : undefined,
      rightTransforms: this.rightTransforms.length > 0 ? this.rightTransforms : undefined
    };

    this.configChanged.emit(config);
  }

  // Template methods
  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      'string': 'text_fields',
      'number': 'pin',
      'integer': 'pin',
      'boolean': 'toggle_on',
      'date': 'event',
      'datetime': 'schedule',
      'time': 'access_time',
      'email': 'email',
      'url': 'link',
      'phone': 'phone',
      'array': 'list',
      'object': 'data_object',
      'enum': 'list',
      'uuid': 'fingerprint',
      'json': 'data_object'
    };
    
    return icons[type] || 'text_fields';
  }

  getOperatorLabel(operator: string): string {
    return OPERATOR_LABELS[operator] || operator;
  }

  getOperatorIcon(): string {
    const icons: Record<string, string> = {
      'equals': 'drag_handle',
      'notEquals': 'not_equal',
      'greaterThan': 'keyboard_arrow_right',
      'greaterThanOrEqual': 'keyboard_double_arrow_right',
      'lessThan': 'keyboard_arrow_left',
      'lessThanOrEqual': 'keyboard_double_arrow_left',
      'contains': 'search',
      'startsWith': 'start',
      'endsWith': 'end'
    };
    
    return icons[this.selectedOperator || ''] || 'compare_arrows';
  }

  getCompatibleRightFields(): FieldSchema[] {
    if (!this.leftFieldSchema) return Object.values(this.fieldSchemas);
    
    return Object.values(this.fieldSchemas).filter(field => 
      field.name !== this.leftFieldSchema?.name && 
      this.areFieldTypesCompatible(this.leftFieldSchema, field)
    );
  }

  getAvailableTransforms(field: FieldSchema | null): { name: string; label: string; description: string }[] {
    if (!field) return [];
    
    const transforms = [];
    
    switch (field.type) {
      case FieldType.STRING:
        transforms.push(
          { name: 'toLowerCase', label: 'To Lower Case', description: 'Convert to lowercase' },
          { name: 'toUpperCase', label: 'To Upper Case', description: 'Convert to uppercase' },
          { name: 'trim', label: 'Trim', description: 'Remove leading/trailing spaces' },
          { name: 'length', label: 'Length', description: 'Get string length' }
        );
        break;
      case FieldType.NUMBER:
      case FieldType.INTEGER:
        transforms.push(
          { name: 'abs', label: 'Absolute', description: 'Get absolute value' },
          { name: 'round', label: 'Round', description: 'Round to nearest integer' },
          { name: 'floor', label: 'Floor', description: 'Round down' },
          { name: 'ceil', label: 'Ceiling', description: 'Round up' }
        );
        break;
      case FieldType.DATE:
      case FieldType.DATETIME:
        transforms.push(
          { name: 'year', label: 'Year', description: 'Extract year' },
          { name: 'month', label: 'Month', description: 'Extract month' },
          { name: 'day', label: 'Day', description: 'Extract day' },
          { name: 'dayOfWeek', label: 'Day of Week', description: 'Get day of week' }
        );
        break;
      case FieldType.ARRAY:
        transforms.push(
          { name: 'length', label: 'Length', description: 'Get array length' },
          { name: 'first', label: 'First', description: 'Get first element' },
          { name: 'last', label: 'Last', description: 'Get last element' }
        );
        break;
    }
    
    return transforms;
  }

  getLeftTransformsDescription(): string {
    if (this.leftTransforms.length === 0) return 'No transforms applied';
    return `${this.leftTransforms.length} transform(s) applied`;
  }

  getRightTransformsDescription(): string {
    if (this.rightTransforms.length === 0) return 'No transforms applied';
    return `${this.rightTransforms.length} transform(s) applied`;
  }

  getLeftFieldExpression(): string {
    if (!this.leftFieldSchema) return '<left-field>';
    
    let expression = this.leftFieldSchema.name;
    if (this.leftTransforms.length > 0) {
      expression = this.leftTransforms.reduce((expr, transform) => `${transform}(${expr})`, expression);
    }
    return expression;
  }

  getRightFieldExpression(): string {
    if (!this.rightFieldSchema) return '<right-field>';
    
    let expression = this.rightFieldSchema.name;
    if (this.rightTransforms.length > 0) {
      expression = this.rightTransforms.reduce((expr, transform) => `${transform}(${expr})`, expression);
    }
    return expression;
  }

  getPreviewDescription(): string {
    if (!this.leftFieldSchema || !this.rightFieldSchema || !this.selectedOperator) {
      return 'Complete the field comparison to see preview';
    }
    
    const leftName = this.leftFieldSchema.label;
    const rightName = this.rightFieldSchema.label;
    const operatorText = this.getOperatorLabel(this.selectedOperator);
    
    return `Compare ${leftName} ${operatorText} ${rightName}`;
  }

  getExampleScenarios(): { description: string; result: boolean }[] {
    if (!this.leftFieldSchema || !this.rightFieldSchema || !this.selectedOperator) {
      return [];
    }
    
    const leftType = this.leftFieldSchema.type;
    const rightType = this.rightFieldSchema.type;
    
    if (leftType === FieldType.NUMBER && rightType === FieldType.NUMBER) {
      switch (this.selectedOperator) {
        case 'equals':
          return [
            { description: '10 equals 10 → true', result: true },
            { description: '10 equals 5 → false', result: false }
          ];
        case 'greaterThan':
          return [
            { description: '10 > 5 → true', result: true },
            { description: '5 > 10 → false', result: false }
          ];
      }
    } else if (leftType === FieldType.STRING && rightType === FieldType.STRING) {
      switch (this.selectedOperator) {
        case 'equals':
          return [
            { description: '"hello" equals "hello" → true', result: true },
            { description: '"hello" equals "world" → false', result: false }
          ];
        case 'contains':
          return [
            { description: '"hello world" contains "world" → true', result: true },
            { description: '"hello" contains "world" → false', result: false }
          ];
      }
    }
    
    return [];
  }

  areTypesCompatible(): boolean {
    if (!this.leftFieldSchema || !this.rightFieldSchema) return false;
    return this.areFieldTypesCompatible(this.leftFieldSchema, this.rightFieldSchema);
  }

  private areFieldTypesCompatible(left: FieldSchema, right: FieldSchema): boolean {
    // Same types are always compatible
    if (left.type === right.type) return true;
    
    // Number types are compatible with each other
    const numberTypes = [FieldType.NUMBER, FieldType.INTEGER];
    if (numberTypes.includes(left.type) && numberTypes.includes(right.type)) {
      return true;
    }
    
    // String-like types are compatible
    const stringTypes = [FieldType.STRING, FieldType.EMAIL, FieldType.URL, FieldType.PHONE];
    if (stringTypes.includes(left.type) && stringTypes.includes(right.type)) {
      return true;
    }
    
    // Date types are compatible
    const dateTypes = [FieldType.DATE, FieldType.DATETIME];
    if (dateTypes.includes(left.type) && dateTypes.includes(right.type)) {
      return true;
    }
    
    return false;
  }

  getCompatibilityMessage(): string {
    if (!this.leftFieldSchema || !this.rightFieldSchema) {
      return 'Select both fields to check compatibility';
    }
    
    if (this.areTypesCompatible()) {
      return 'Field types are compatible for comparison';
    } else {
      return 'Field types are not compatible. Consider using transforms to make them compatible.';
    }
  }

  getAutoTransformSuggestions(): { field: 'left' | 'right'; transform: string; description: string }[] {
    if (!this.leftFieldSchema || !this.rightFieldSchema || this.areTypesCompatible()) {
      return [];
    }
    
    const suggestions = [];
    
    // String to number conversions
    if (this.leftFieldSchema.type === FieldType.STRING && 
        [FieldType.NUMBER, FieldType.INTEGER].includes(this.rightFieldSchema.type)) {
      suggestions.push({
        field: 'left' as const,
        transform: 'length',
        description: 'Compare string length to number'
      });
    }
    
    if ([FieldType.NUMBER, FieldType.INTEGER].includes(this.leftFieldSchema.type) && 
        this.rightFieldSchema.type === FieldType.STRING) {
      suggestions.push({
        field: 'right' as const,
        transform: 'length',
        description: 'Compare number to string length'
      });
    }
    
    return suggestions;
  }

  isTransformSelected(side: 'left' | 'right', transformName: string): boolean {
    return side === 'left' ? 
      this.leftTransforms.includes(transformName) : 
      this.rightTransforms.includes(transformName);
  }

  // Event handlers
  onLeftFieldChanged(event: string | MatSelectChange): void {
    const fieldName = typeof event === 'string' ? event : event.value;
    this.leftFieldSchema = this.fieldSchemas[fieldName] || null;
    this.updateAvailableOperators();
    
    // Reset right field if incompatible
    const currentRightField = this.fieldToFieldForm.get('rightField')?.value;
    if (currentRightField && this.rightFieldSchema && 
        !this.areFieldTypesCompatible(this.leftFieldSchema!, this.rightFieldSchema)) {
      this.fieldToFieldForm.patchValue({ rightField: '', operator: '' });
      this.rightFieldSchema = null;
      this.selectedOperator = null;
    }
  }

  onRightFieldChanged(event: string | MatSelectChange): void {
    const fieldName = typeof event === 'string' ? event : event.value;
    this.rightFieldSchema = this.fieldSchemas[fieldName] || null;
    this.updateAvailableOperators();
  }

  onOperatorChanged(event: string | MatSelectChange): void {
    const operator = typeof event === 'string' ? event : event.value;
    this.selectedOperator = operator;
  }

  onTransformToggle(side: 'left' | 'right', transformName: string, change: boolean | MatCheckboxChange): void {
    const checked = typeof change === 'boolean' ? change : change.checked;
    const transforms = side === 'left' ? this.leftTransforms : this.rightTransforms;

    if (checked) {
      if (!transforms.includes(transformName)) {
        transforms.push(transformName);
      }
    } else {
      const index = transforms.indexOf(transformName);
      if (index > -1) {
        transforms.splice(index, 1);
      }
    }

    // Update the form to trigger change detection
    this.emitConfigChange();
  }

  applyTransformSuggestion(suggestion: { field: 'left' | 'right'; transform: string; description: string }): void {
    this.onTransformToggle(suggestion.field, suggestion.transform, true);
  }

  private updateAvailableOperators(): void {
    if (!this.leftFieldSchema) {
      this.availableOperators = [];
      return;
    }
    
    this.availableOperators = FIELD_TYPE_OPERATORS[this.leftFieldSchema.type] || [];
    
    // Reset operator if not compatible
    const currentOperator = this.fieldToFieldForm.get('operator')?.value;
    if (currentOperator && !this.availableOperators.includes(currentOperator)) {
      this.fieldToFieldForm.patchValue({ operator: '' });
      this.selectedOperator = null;
    }
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.fieldToFieldForm.get('leftField')?.value) {
      errors.push('Left field is required');
    }
    
    if (!this.fieldToFieldForm.get('rightField')?.value) {
      errors.push('Right field is required');
    }
    
    if (!this.fieldToFieldForm.get('operator')?.value) {
      errors.push('Operator is required');
    }
    
    if (this.leftFieldSchema && this.rightFieldSchema && !this.areTypesCompatible()) {
      errors.push('Field types are not compatible for comparison');
    }
    
    return errors;
  }

  isValid(): boolean {
    return this.fieldToFieldForm.valid && !this.hasValidationErrors();
  }
}