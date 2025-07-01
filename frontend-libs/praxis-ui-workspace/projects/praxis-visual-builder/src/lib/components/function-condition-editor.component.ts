import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { debounceTime, distinctUntilChanged, takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { FunctionCallConfig, FunctionParameter } from '../models/rule-builder.model';
import { FieldSchema, FieldType, CustomFunction } from '../models/field-schema.model';

@Component({
  selector: 'praxis-function-condition-editor',
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
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="functionForm" class="function-condition-form">
      <!-- Function Selection -->
      <div class="form-section">
        <h4 class="section-title">
          <mat-icon>functions</mat-icon>
          Function Selection
        </h4>
        
        <mat-form-field appearance="outline" class="function-select">
          <mat-label>Function</mat-label>
          <mat-select formControlName="functionName" 
                     (selectionChange)="onFunctionChanged($event.value)">
            <mat-optgroup *ngFor="let category of functionCategories" [label]="category.name">
              <mat-option *ngFor="let func of category.functions" [value]="func.name">
                <div class="function-option">
                  <mat-icon class="function-icon">{{ getFunctionIcon(func) }}</mat-icon>
                  <div class="function-content">
                    <span class="function-name">{{ func.label }}</span>
                    <span class="function-desc">{{ func.description }}</span>
                  </div>
                  <span class="return-type">→ {{ func.returnType }}</span>
                </div>
              </mat-option>
            </mat-optgroup>
          </mat-select>
          <mat-hint *ngIf="selectedFunction?.description">
            {{ selectedFunction.description }}
          </mat-hint>
        </mat-form-field>
      </div>

      <!-- Function Documentation -->
      <div class="form-section" *ngIf="selectedFunction">
        <mat-expansion-panel class="function-docs">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>help_outline</mat-icon>
              Function Documentation
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="function-documentation">
            <div class="doc-section">
              <h5>Description</h5>
              <p>{{ selectedFunction.description }}</p>
            </div>
            
            <div class="doc-section" *ngIf="selectedFunction.parameters.length > 0">
              <h5>Parameters</h5>
              <div class="parameter-docs">
                <div *ngFor="let param of selectedFunction.parameters" class="param-doc">
                  <div class="param-header">
                    <span class="param-name">{{ param.name }}</span>
                    <span class="param-type">{{ param.type }}</span>
                    <span *ngIf="param.required" class="param-required">required</span>
                  </div>
                  <div class="param-description" *ngIf="param.description">
                    {{ param.description }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="doc-section">
              <h5>Returns</h5>
              <span class="return-type">{{ selectedFunction.returnType }}</span>
            </div>
            
            <div class="doc-section" *ngIf="selectedFunction.example">
              <h5>Example</h5>
              <code class="function-example">{{ selectedFunction.example }}</code>
            </div>
          </div>
        </mat-expansion-panel>
      </div>

      <!-- Function Parameters -->
      <div class="form-section" *ngIf="selectedFunction && selectedFunction.parameters.length > 0">
        <h4 class="section-title">
          <mat-icon>tune</mat-icon>
          Parameters
        </h4>
        
        <div formArrayName="parameters" class="parameters-list">
          <div *ngFor="let paramGroup of parametersArray.controls; let i = index" 
               [formGroupName]="i" 
               class="parameter-item">
            
            <mat-card class="parameter-card">
              <div class="parameter-header">
                <div class="parameter-info">
                  <span class="parameter-name">{{ getParameterName(i) }}</span>
                  <span class="parameter-type">{{ getParameterType(i) }}</span>
                  <span *ngIf="isParameterRequired(i)" class="parameter-required">*</span>
                </div>
                
                <div class="parameter-actions">
                  <mat-icon *ngIf="hasParameterError(i)" 
                           class="error-icon"
                           matTooltip="Parameter has validation errors">
                    error
                  </mat-icon>
                </div>
              </div>
              
              <div class="parameter-content">
                <!-- Value Type Selection -->
                <mat-form-field appearance="outline" class="value-type-select">
                  <mat-label>Value Type</mat-label>
                  <mat-select formControlName="valueType"
                             (selectionChange)="onParameterValueTypeChanged(i, $event.value)">
                    <mat-option value="literal">Literal Value</mat-option>
                    <mat-option value="field">Field Reference</mat-option>
                    <mat-option value="context">Context Variable</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Literal Value Input -->
                <div *ngIf="getParameterValueType(i) === 'literal'" class="literal-value">
                  <!-- String Input -->
                  <mat-form-field *ngIf="isStringParameter(i)" appearance="outline" class="value-input">
                    <mat-label>{{ getParameterName(i) }}</mat-label>
                    <input matInput 
                           formControlName="value"
                           [placeholder]="getParameterPlaceholder(i)">
                  </mat-form-field>

                  <!-- Number Input -->
                  <mat-form-field *ngIf="isNumberParameter(i)" appearance="outline" class="value-input">
                    <mat-label>{{ getParameterName(i) }}</mat-label>
                    <input matInput 
                           type="number"
                           formControlName="value"
                           [placeholder]="getParameterPlaceholder(i)">
                  </mat-form-field>

                  <!-- Boolean Input -->
                  <div *ngIf="isBooleanParameter(i)" class="boolean-input">
                    <mat-checkbox formControlName="value">
                      {{ getParameterName(i) }}
                    </mat-checkbox>
                  </div>

                  <!-- Date Input -->
                  <mat-form-field *ngIf="isDateParameter(i)" appearance="outline" class="value-input">
                    <mat-label>{{ getParameterName(i) }}</mat-label>
                    <input matInput 
                           [matDatepicker]="datePicker"
                           formControlName="value">
                    <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                    <mat-datepicker #datePicker></mat-datepicker>
                  </mat-form-field>
                </div>

                <!-- Field Reference Input -->
                <mat-form-field *ngIf="getParameterValueType(i) === 'field'" 
                               appearance="outline" 
                               class="value-input">
                  <mat-label>Field</mat-label>
                  <mat-select formControlName="fieldName">
                    <mat-option *ngFor="let field of getCompatibleFields(i)" [value]="field.name">
                      <div class="field-option">
                        <mat-icon class="field-icon">{{ getFieldIcon(field.type) }}</mat-icon>
                        <span class="field-label">{{ field.label }}</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Context Variable Input -->
                <mat-form-field *ngIf="getParameterValueType(i) === 'context'" 
                               appearance="outline" 
                               class="value-input">
                  <mat-label>Context Variable</mat-label>
                  <mat-select formControlName="contextVariable">
                    <mat-option *ngFor="let variable of getCompatibleContextVariables(i)" 
                               [value]="variable.name">
                      <div class="context-option">
                        <span class="variable-name">\${{ variable.name }}</span>
                        <span class="variable-type">{{ variable.type }}</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Parameter Description -->
                <div *ngIf="getParameterDescription(i)" class="parameter-description">
                  {{ getParameterDescription(i) }}
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Function Preview -->
      <div class="form-section" *ngIf="selectedFunction">
        <h4 class="section-title">
          <mat-icon>preview</mat-icon>
          Function Call Preview
        </h4>
        
        <mat-card class="function-preview">
          <div class="preview-content">
            <div class="function-signature">
              <span class="function-name">{{ selectedFunction.name }}</span>
              <span class="signature-params">({{ getFunctionSignature() }})</span>
              <span class="return-indicator">→</span>
              <span class="return-type">{{ selectedFunction.returnType }}</span>
            </div>
            
            <div class="preview-call">
              <code>{{ getPreviewCall() }}</code>
            </div>
            
            <div *ngIf="getValidationErrors().length === 0" class="preview-status success">
              <mat-icon>check_circle</mat-icon>
              <span>Function call is valid</span>
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
    .function-condition-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 400px;
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

    .function-select {
      width: 100%;
    }

    .function-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      width: 100%;
    }

    .function-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mdc-theme-tertiary);
    }

    .function-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .function-name {
      font-weight: 500;
      font-size: 14px;
    }

    .function-desc {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 250px;
    }

    .return-type {
      font-size: 11px;
      color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .function-docs {
      margin: 8px 0;
    }

    .function-documentation {
      padding: 16px 0;
    }

    .doc-section {
      margin-bottom: 16px;
    }

    .doc-section h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--mdc-theme-primary);
    }

    .parameter-docs {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .param-doc {
      border-left: 3px solid var(--mdc-theme-outline);
      padding-left: 12px;
    }

    .param-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .param-name {
      font-weight: 500;
      font-family: monospace;
    }

    .param-type {
      font-size: 11px;
      color: var(--mdc-theme-secondary);
      background: var(--mdc-theme-secondary-container);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .param-required {
      font-size: 10px;
      color: var(--mdc-theme-error);
      background: var(--mdc-theme-error-container);
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: 600;
    }

    .param-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      font-style: italic;
    }

    .function-example {
      display: block;
      background: var(--mdc-theme-surface-variant);
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      border: 1px solid var(--mdc-theme-outline);
    }

    .parameters-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .parameter-item {
      width: 100%;
    }

    .parameter-card {
      background: var(--mdc-theme-surface-container);
    }

    .parameter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--mdc-theme-outline);
      background: var(--mdc-theme-surface-variant);
    }

    .parameter-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .parameter-name {
      font-weight: 500;
      font-family: monospace;
    }

    .parameter-type {
      font-size: 11px;
      color: var(--mdc-theme-secondary);
      background: var(--mdc-theme-secondary-container);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .parameter-required {
      color: var(--mdc-theme-error);
      font-weight: bold;
    }

    .error-icon {
      color: var(--mdc-theme-error);
      font-size: 18px;
    }

    .parameter-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .value-type-select {
      width: 200px;
    }

    .value-input {
      width: 100%;
    }

    .field-option,
    .context-option {
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

    .boolean-input {
      display: flex;
      align-items: center;
      padding: 12px 0;
    }

    .parameter-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      font-style: italic;
      padding: 8px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 4px;
      border-left: 3px solid var(--mdc-theme-outline);
    }

    .function-preview {
      background: var(--mdc-theme-surface-container);
    }

    .preview-content {
      padding: 16px;
    }

    .function-signature {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-family: monospace;
      font-size: 14px;
    }

    .function-name {
      color: var(--mdc-theme-tertiary);
      font-weight: 600;
    }

    .signature-params {
      color: var(--mdc-theme-on-surface);
    }

    .return-indicator {
      color: var(--mdc-theme-outline);
    }

    .preview-call {
      background: var(--mdc-theme-surface);
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .preview-call code {
      font-family: monospace;
      font-size: 13px;
      color: var(--mdc-theme-on-surface);
    }

    .preview-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .preview-status.success {
      color: var(--mdc-theme-tertiary);
    }

    .preview-status mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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
  `]
})
export class FunctionConditionEditorComponent implements OnInit, OnChanges {
  @Input() config: FunctionCallConfig | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};
  @Input() customFunctions: CustomFunction[] = [];
  @Input() contextVariables: any[] = [];
  
  @Output() configChanged = new EventEmitter<FunctionCallConfig>();

  private destroy$ = new Subject<void>();

  functionForm: FormGroup;
  selectedFunction: CustomFunction | null = null;
  functionCategories: { name: string; functions: CustomFunction[] }[] = [];

  constructor(private fb: FormBuilder) {
    this.functionForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFunctionCategories();
    this.setupFormSubscriptions();
    this.loadInitialConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.loadInitialConfig();
    }
    
    if (changes['customFunctions'] && !changes['customFunctions'].firstChange) {
      this.setupFunctionCategories();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      functionName: ['', Validators.required],
      parameters: this.fb.array([])
    });
  }

  private setupFormSubscriptions(): void {
    this.functionForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitConfigChange();
      });
  }

  private setupFunctionCategories(): void {
    const functionsByCategory: Record<string, CustomFunction[]> = {};
    
    this.customFunctions.forEach(func => {
      const category = 'Functions'; // Could be extended to support categories
      if (!functionsByCategory[category]) {
        functionsByCategory[category] = [];
      }
      functionsByCategory[category].push(func);
    });

    this.functionCategories = Object.entries(functionsByCategory)
      .map(([name, functions]) => ({
        name,
        functions: functions.sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private loadInitialConfig(): void {
    if (!this.config) return;

    this.functionForm.patchValue({
      functionName: this.config.functionName || ''
    });

    if (this.config.functionName) {
      this.onFunctionChanged(this.config.functionName);
    }

    if (this.config.parameters) {
      this.loadParameters(this.config.parameters);
    }
  }

  private loadParameters(parameters: FunctionParameter[]): void {
    const parametersArray = this.parametersArray;
    parametersArray.clear();

    parameters.forEach(param => {
      const paramGroup = this.fb.group({
        name: [param.name],
        value: [param.value],
        valueType: [param.valueType || 'literal'],
        fieldName: [param.fieldName || ''],
        contextVariable: [param.contextVariable || '']
      });
      
      parametersArray.push(paramGroup);
    });
  }

  private emitConfigChange(): void {
    if (!this.functionForm.valid || !this.selectedFunction) return;

    const formValue = this.functionForm.value;
    const parameters: FunctionParameter[] = formValue.parameters.map((param: any, index: number) => ({
      name: this.selectedFunction!.parameters[index].name,
      value: param.value,
      valueType: param.valueType,
      fieldName: param.fieldName,
      contextVariable: param.contextVariable
    }));

    const config: FunctionCallConfig = {
      type: 'functionCall',
      functionName: formValue.functionName,
      parameters
    };

    this.configChanged.emit(config);
  }

  get parametersArray(): FormArray {
    return this.functionForm.get('parameters') as FormArray;
  }

  // Template methods
  getFunctionIcon(func: CustomFunction): string {
    // Could be extended to support different function types
    return 'functions';
  }

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

  getParameterName(index: number): string {
    return this.selectedFunction?.parameters[index]?.name || `param${index}`;
  }

  getParameterType(index: number): string {
    return this.selectedFunction?.parameters[index]?.type || 'string';
  }

  getParameterDescription(index: number): string {
    return this.selectedFunction?.parameters[index]?.description || '';
  }

  isParameterRequired(index: number): boolean {
    return this.selectedFunction?.parameters[index]?.required || false;
  }

  getParameterValueType(index: number): string {
    const paramGroup = this.parametersArray.at(index);
    return paramGroup?.get('valueType')?.value || 'literal';
  }

  getParameterPlaceholder(index: number): string {
    const param = this.selectedFunction?.parameters[index];
    if (!param) return 'Enter value';
    
    switch (param.type) {
      case FieldType.STRING:
        return 'Enter text value';
      case FieldType.NUMBER:
      case FieldType.INTEGER:
        return 'Enter number';
      case FieldType.BOOLEAN:
        return 'true/false';
      default:
        return 'Enter value';
    }
  }

  isStringParameter(index: number): boolean {
    const type = this.getParameterType(index);
    return type === FieldType.STRING || type === FieldType.EMAIL || type === FieldType.URL;
  }

  isNumberParameter(index: number): boolean {
    const type = this.getParameterType(index);
    return type === FieldType.NUMBER || type === FieldType.INTEGER;
  }

  isBooleanParameter(index: number): boolean {
    return this.getParameterType(index) === FieldType.BOOLEAN;
  }

  isDateParameter(index: number): boolean {
    const type = this.getParameterType(index);
    return type === FieldType.DATE || type === FieldType.DATETIME;
  }

  getCompatibleFields(index: number): FieldSchema[] {
    const paramType = this.getParameterType(index);
    return Object.values(this.fieldSchemas).filter(field => 
      field.type === paramType
    );
  }

  getCompatibleContextVariables(index: number): any[] {
    const paramType = this.getParameterType(index);
    return this.contextVariables.filter(variable => 
      variable.type === paramType
    );
  }

  getFunctionSignature(): string {
    if (!this.selectedFunction) return '';
    
    return this.selectedFunction.parameters
      .map(param => `${param.name}: ${param.type}${param.required ? '' : '?'}`)
      .join(', ');
  }

  getPreviewCall(): string {
    if (!this.selectedFunction) return '';
    
    const params = this.parametersArray.controls.map((control, index) => {
      const valueType = control.get('valueType')?.value;
      const value = control.get('value')?.value;
      const fieldName = control.get('fieldName')?.value;
      const contextVariable = control.get('contextVariable')?.value;
      
      switch (valueType) {
        case 'field':
          return fieldName || '<field>';
        case 'context':
          return `\$${contextVariable || '<variable>'}`;
        case 'literal':
        default:
          return this.formatValueForPreview(value, this.getParameterType(index));
      }
    });
    
    return `${this.selectedFunction.name}(${params.join(', ')})`;
  }

  private formatValueForPreview(value: any, type: string): string {
    if (value === null || value === undefined || value === '') return '<value>';
    
    switch (type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.URL:
        return `"${value}"`;
      case FieldType.BOOLEAN:
        return String(value);
      default:
        return String(value);
    }
  }

  hasParameterError(index: number): boolean {
    const paramGroup = this.parametersArray.at(index);
    return paramGroup ? paramGroup.invalid : false;
  }

  // Event handlers
  onFunctionChanged(functionName: string): void {
    this.selectedFunction = this.customFunctions.find(f => f.name === functionName) || null;
    
    if (this.selectedFunction) {
      this.setupParametersForFunction();
    } else {
      this.parametersArray.clear();
    }
  }

  onParameterValueTypeChanged(index: number, valueType: string): void {
    const paramGroup = this.parametersArray.at(index);
    if (paramGroup) {
      paramGroup.patchValue({
        value: '',
        fieldName: '',
        contextVariable: ''
      });
    }
  }

  private setupParametersForFunction(): void {
    if (!this.selectedFunction) return;
    
    const parametersArray = this.parametersArray;
    parametersArray.clear();
    
    this.selectedFunction.parameters.forEach(param => {
      const paramGroup = this.fb.group({
        name: [param.name],
        value: ['', param.required ? Validators.required : []],
        valueType: ['literal'],
        fieldName: [''],
        contextVariable: ['']
      });
      
      parametersArray.push(paramGroup);
    });
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.functionForm.get('functionName')?.value) {
      errors.push('Function is required');
    }
    
    if (this.selectedFunction) {
      this.selectedFunction.parameters.forEach((param, index) => {
        const paramGroup = this.parametersArray.at(index);
        if (!paramGroup) return;
        
        const valueType = paramGroup.get('valueType')?.value;
        const value = paramGroup.get('value')?.value;
        const fieldName = paramGroup.get('fieldName')?.value;
        const contextVariable = paramGroup.get('contextVariable')?.value;
        
        if (param.required) {
          switch (valueType) {
            case 'literal':
              if (!value) {
                errors.push(`Parameter '${param.name}' is required`);
              }
              break;
            case 'field':
              if (!fieldName) {
                errors.push(`Field reference for parameter '${param.name}' is required`);
              }
              break;
            case 'context':
              if (!contextVariable) {
                errors.push(`Context variable for parameter '${param.name}' is required`);
              }
              break;
          }
        }
      });
    }
    
    return errors;
  }

  isValid(): boolean {
    return this.functionForm.valid && !this.hasValidationErrors();
  }
}