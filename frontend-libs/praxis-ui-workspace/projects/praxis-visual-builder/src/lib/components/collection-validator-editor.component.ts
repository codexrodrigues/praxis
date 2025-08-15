import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CollectionValidatorConfig, RuleNodeType } from '../models/rule-builder.model';
import { FieldSchema, FieldType } from '../models/field-schema.model';
import { FieldConditionEditorComponent } from './field-condition-editor.component';

@Component({
  selector: 'praxis-collection-validator-editor',
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
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    MatSliderModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="collectionForm" class="collection-validator-form">
      <!-- Validator Type Selection -->
      <div class="form-row">
        <mat-form-field appearance="outline" class="validator-type-select">
          <mat-label>Collection Validator Type</mat-label>
          <mat-select formControlName="validatorType"
                     (selectionChange)="onValidatorTypeChanged($event)">
            <mat-option value="forEach">
              <div class="validator-option">
                <mat-icon>repeat</mat-icon>
                <span>For Each</span>
                <small>Apply validation to each item in collection</small>
              </div>
            </mat-option>
            <mat-option value="uniqueBy">
              <div class="validator-option">
                <mat-icon>fingerprint</mat-icon>
                <span>Unique By</span>
                <small>Ensure items are unique by specified field(s)</small>
              </div>
            </mat-option>
            <mat-option value="minLength">
              <div class="validator-option">
                <mat-icon>height</mat-icon>
                <span>Minimum Length</span>
                <small>Collection must have minimum number of items</small>
              </div>
            </mat-option>
            <mat-option value="maxLength">
              <div class="validator-option">
                <mat-icon>height</mat-icon>
                <span>Maximum Length</span>
                <small>Collection must not exceed maximum number of items</small>
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Target Collection Selection -->
      <div class="form-row" *ngIf="validatorType">
        <mat-form-field appearance="outline" class="target-collection-select">
          <mat-label>Target Collection</mat-label>
          <mat-select formControlName="targetCollection"
                     (selectionChange)="onTargetCollectionChanged($event)">
            <mat-optgroup *ngFor="let category of collectionFieldCategories" [label]="category.name">
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
          <mat-hint>Select the array/collection field this validator applies to</mat-hint>
        </mat-form-field>
      </div>

      <!-- For Each Configuration -->
      <div class="form-section" *ngIf="validatorType === 'forEach' && targetCollection">
        <h4 class="section-title">
          <mat-icon>repeat</mat-icon>
          For Each Item Validation
        </h4>
        
        <div class="foreach-config">
          <div class="item-schema-info">
            <mat-form-field appearance="outline" class="item-variable-input">
              <mat-label>Item Variable Name</mat-label>
              <input matInput 
                     formControlName="itemVariable"
                     placeholder="item">
              <mat-hint>Variable name to reference each item (e.g., 'item', 'record')</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="index-variable-input">
              <mat-label>Index Variable Name</mat-label>
              <input matInput 
                     formControlName="indexVariable"
                     placeholder="index">
              <mat-hint>Variable name to reference item index (optional)</mat-hint>
            </mat-form-field>
          </div>

          <div class="validation-rules">
            <h5>Item Validation Rules</h5>
            
            <div formArrayName="itemValidationRules">
              <div *ngFor="let rule of itemValidationRules.controls; let i = index"
                   class="validation-rule-item"
                   [formGroupName]="i">
                
                <div class="rule-header">
                  <span class="rule-number">{{ i + 1 }}</span>
                  <button mat-icon-button 
                          color="warn"
                          (click)="removeItemValidationRule(i)"
                          [disabled]="itemValidationRules.length <= 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div class="rule-config">
                  <mat-form-field appearance="outline" class="rule-type-select">
                    <mat-label>Rule Type</mat-label>
                    <mat-select formControlName="ruleType">
                      <mat-option value="required">Required Field</mat-option>
                      <mat-option value="condition">Custom Condition</mat-option>
                      <mat-option value="format">Format Validation</mat-option>
                      <mat-option value="cross-item">Cross-Item Validation</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-path-input">
                    <mat-label>Field Path</mat-label>
                    <input matInput 
                           formControlName="fieldPath"
                           placeholder="item.propertyName">
                    <mat-hint>Path to the field within each item</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="rule-message-input">
                    <mat-label>Error Message</mat-label>
                    <input matInput 
                           formControlName="errorMessage"
                           placeholder="Custom validation message">
                  </mat-form-field>
                </div>
              </div>
            </div>

            <button mat-stroked-button 
                    color="primary"
                    (click)="addItemValidationRule()"
                    class="add-rule-button">
              <mat-icon>add</mat-icon>
              Add Validation Rule
            </button>
          </div>
        </div>
      </div>

      <!-- Unique By Configuration -->
      <div class="form-section" *ngIf="validatorType === 'uniqueBy' && targetCollection">
        <h4 class="section-title">
          <mat-icon>fingerprint</mat-icon>
          Uniqueness Configuration
        </h4>
        
        <div class="unique-config">
          <div class="unique-fields">
            <h5>Unique By Fields</h5>
            
            <div formArrayName="uniqueByFields">
              <div *ngFor="let field of uniqueByFields.controls; let i = index"
                   class="unique-field-item">
                
                <mat-form-field appearance="outline" class="field-path-input">
                  <mat-label>Field Path {{ i + 1 }}</mat-label>
                  <input matInput 
                         [formControlName]="i"
                         placeholder="item.propertyName">
                </mat-form-field>

                <button mat-icon-button 
                        color="warn"
                        (click)="removeUniqueField(i)"
                        [disabled]="uniqueByFields.length <= 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <button mat-stroked-button 
                    color="primary"
                    (click)="addUniqueField()"
                    class="add-field-button">
              <mat-icon>add</mat-icon>
              Add Field
            </button>
          </div>

          <div class="unique-options">
            <mat-checkbox formControlName="caseSensitive">
              Case-sensitive comparison
            </mat-checkbox>
            
            <mat-checkbox formControlName="ignoreEmpty">
              Ignore empty values
            </mat-checkbox>
            
            <mat-form-field appearance="outline" class="unique-error-message">
              <mat-label>Duplicate Error Message</mat-label>
              <input matInput 
                     formControlName="duplicateErrorMessage"
                     placeholder="Duplicate items are not allowed">
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Length Configuration -->
      <div class="form-section" *ngIf="(validatorType === 'minLength' || validatorType === 'maxLength') && targetCollection">
        <h4 class="section-title">
          <mat-icon>height</mat-icon>
          Length Constraints
        </h4>
        
        <div class="length-config">
          <div class="length-inputs">
            <mat-form-field *ngIf="validatorType === 'minLength'" appearance="outline" class="length-input">
              <mat-label>Minimum Items</mat-label>
              <input matInput 
                     type="number"
                     formControlName="minItems"
                     min="0"
                     placeholder="0">
              <mat-hint>Minimum number of items required</mat-hint>
            </mat-form-field>

            <mat-form-field *ngIf="validatorType === 'maxLength'" appearance="outline" class="length-input">
              <mat-label>Maximum Items</mat-label>
              <input matInput 
                     type="number"
                     formControlName="maxItems"
                     min="1"
                     placeholder="100">
              <mat-hint>Maximum number of items allowed</mat-hint>
            </mat-form-field>
          </div>

          <div class="length-slider" *ngIf="validatorType === 'minLength'">
            <label>Minimum Items: {{ minItems }}</label>
            <mat-slider 
              [min]="0" 
              [max]="100" 
              [step]="1">
              <input matSliderThumb formControlName="minItems">
            </mat-slider>
          </div>

          <div class="length-slider" *ngIf="validatorType === 'maxLength'">
            <label>Maximum Items: {{ maxItems }}</label>
            <mat-slider 
              [min]="1" 
              [max]="1000" 
              [step]="1">
              <input matSliderThumb formControlName="maxItems">
            </mat-slider>
          </div>

          <div class="length-options">
            <mat-form-field appearance="outline" class="length-error-message">
              <mat-label>Length Error Message</mat-label>
              <input matInput 
                     formControlName="lengthErrorMessage"
                     [placeholder]="getLengthErrorPlaceholder()">
            </mat-form-field>

            <mat-checkbox formControlName="showItemCount">
              Show current item count to user
            </mat-checkbox>
            
            <mat-checkbox formControlName="preventExcess">
              Prevent adding items beyond limit
            </mat-checkbox>
          </div>
        </div>
      </div>

      <!-- Advanced Options -->
      <div class="form-section advanced-options" *ngIf="validatorType && targetCollection">
        <h4 class="section-title">
          <mat-icon>tune</mat-icon>
          Advanced Options
        </h4>
        
        <div class="advanced-config">
          <div class="validation-timing">
            <h5>Validation Timing</h5>
            
            <mat-checkbox formControlName="validateOnAdd">
              Validate when items are added
            </mat-checkbox>
            
            <mat-checkbox formControlName="validateOnRemove">
              Validate when items are removed
            </mat-checkbox>
            
            <mat-checkbox formControlName="validateOnChange">
              Validate when items are modified
            </mat-checkbox>
            
            <mat-checkbox formControlName="validateOnSubmit">
              Validate on form submission
            </mat-checkbox>
          </div>

          <div class="error-handling">
            <h5>Error Handling</h5>
            
            <mat-form-field appearance="outline" class="error-strategy-select">
              <mat-label>Error Display Strategy</mat-label>
              <mat-select formControlName="errorStrategy">
                <mat-option value="summary">Show summary at collection level</mat-option>
                <mat-option value="inline">Show errors inline with items</mat-option>
                <mat-option value="both">Show both summary and inline errors</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="stopOnFirstError">
              Stop validation on first error
            </mat-checkbox>
            
            <mat-checkbox formControlName="highlightErrorItems">
              Highlight items with errors
            </mat-checkbox>
          </div>

          <div class="performance-options">
            <h5>Performance</h5>
            
            <mat-form-field appearance="outline" class="batch-size-input">
              <mat-label>Validation Batch Size</mat-label>
              <input matInput 
                     type="number"
                     formControlName="batchSize"
                     min="1"
                     max="1000"
                     placeholder="50">
              <mat-hint>Number of items to validate at once</mat-hint>
            </mat-form-field>

            <mat-checkbox formControlName="debounceValidation">
              Debounce validation (reduce frequency)
            </mat-checkbox>
            
            <mat-form-field *ngIf="debounceValidation" appearance="outline" class="debounce-delay-input">
              <mat-label>Debounce Delay (ms)</mat-label>
              <input matInput 
                     type="number"
                     formControlName="debounceDelay"
                     min="100"
                     max="5000"
                     placeholder="300">
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="form-section preview-section" *ngIf="isValid()">
        <h4 class="section-title">
          <mat-icon>preview</mat-icon>
          Preview
        </h4>
        
        <div class="preview-content">
          <div class="preview-text">{{ getPreviewText() }}</div>
          
          <div class="preview-details">
            <div *ngIf="validatorType === 'forEach'" class="foreach-preview">
              <strong>Rules:</strong> {{ getForEachRulesPreview() }}
            </div>
            
            <div *ngIf="validatorType === 'uniqueBy'" class="unique-preview">
              <strong>Unique Fields:</strong> {{ getUniqueFieldsPreview() }}
            </div>
            
            <div *ngIf="validatorType === 'minLength' || validatorType === 'maxLength'" class="length-preview">
              <strong>Constraints:</strong> {{ getLengthConstraintsPreview() }}
            </div>
          </div>
        </div>
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
    .collection-validator-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 900px;
    }

    .form-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .validator-type-select,
    .target-collection-select {
      flex: 1;
      min-width: 250px;
    }

    .validator-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .validator-option mat-icon {
      align-self: flex-start;
      color: var(--mdc-theme-primary);
    }

    .validator-option small {
      color: var(--mdc-theme-on-surface-variant);
      font-size: 11px;
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

    .form-section {
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .section-title h5 {
      margin: 16px 0 8px 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--mdc-theme-primary);
    }

    .foreach-config,
    .unique-config,
    .length-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-schema-info {
      display: flex;
      gap: 12px;
    }

    .item-variable-input,
    .index-variable-input {
      flex: 1;
    }

    .validation-rules {
      background: var(--mdc-theme-surface);
      border-radius: 8px;
      padding: 16px;
    }

    .validation-rule-item,
    .unique-field-item {
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      background: var(--mdc-theme-surface-variant);
    }

    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .rule-number {
      background: var(--mdc-theme-primary);
      color: var(--mdc-theme-on-primary);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .rule-config {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .unique-field-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-path-input {
      flex: 1;
    }

    .length-inputs {
      display: flex;
      gap: 12px;
    }

    .length-input {
      flex: 1;
    }

    .length-slider {
      margin: 16px 0;
    }

    .length-slider label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
    }

    .length-options,
    .unique-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .advanced-options {
      background: var(--mdc-theme-secondary-container);
      border-color: var(--mdc-theme-secondary);
    }

    .advanced-config {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .validation-timing,
    .error-handling,
    .performance-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .validation-timing h5,
    .error-handling h5,
    .performance-options h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--mdc-theme-secondary);
      text-transform: uppercase;
    }

    .add-rule-button,
    .add-field-button {
      align-self: flex-start;
    }

    .preview-section {
      background: var(--mdc-theme-primary-container);
      border-color: var(--mdc-theme-primary);
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-text {
      font-family: monospace;
      font-size: 14px;
      background: var(--mdc-theme-surface);
      padding: 12px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
    }

    .preview-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
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
    @media (max-width: 1024px) {
      .advanced-config {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
      
      .validator-type-select,
      .target-collection-select {
        width: 100%;
      }
      
      .item-schema-info {
        flex-direction: column;
      }
      
      .length-inputs {
        flex-direction: column;
      }
      
      .advanced-config {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CollectionValidatorEditorComponent implements OnInit, OnChanges {
  @Input() config: CollectionValidatorConfig | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};
  
  @Output() configChanged = new EventEmitter<CollectionValidatorConfig>();

  private destroy$ = new Subject<void>();

  collectionForm: FormGroup;
  collectionFieldCategories: { name: string; fields: FieldSchema[] }[] = [];

  validatorType: string = '';
  targetCollection: string = '';

  get itemValidationRules(): FormArray {
    return this.collectionForm.get('itemValidationRules') as FormArray;
  }

  get uniqueByFields(): FormArray {
    return this.collectionForm.get('uniqueByFields') as FormArray;
  }

  get minItems(): number {
    return this.collectionForm.get('minItems')?.value || 0;
  }

  get maxItems(): number {
    return this.collectionForm.get('maxItems')?.value || 100;
  }

  get debounceValidation(): boolean {
    return this.collectionForm.get('debounceValidation')?.value || false;
  }

  constructor(private fb: FormBuilder) {
    this.collectionForm = this.createForm();
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
      validatorType: ['', Validators.required],
      targetCollection: ['', Validators.required],
      
      // For Each
      itemVariable: ['item'],
      indexVariable: ['index'],
      itemValidationRules: this.fb.array([]),
      
      // Unique By
      uniqueByFields: this.fb.array([]),
      caseSensitive: [true],
      ignoreEmpty: [true],
      duplicateErrorMessage: [''],
      
      // Length
      minItems: [0, [Validators.min(0)]],
      maxItems: [100, [Validators.min(1)]],
      lengthErrorMessage: [''],
      showItemCount: [true],
      preventExcess: [true],
      
      // Advanced
      validateOnAdd: [true],
      validateOnRemove: [true],
      validateOnChange: [true],
      validateOnSubmit: [true],
      errorStrategy: ['both'],
      stopOnFirstError: [false],
      highlightErrorItems: [true],
      batchSize: [50, [Validators.min(1), Validators.max(1000)]],
      debounceValidation: [true],
      debounceDelay: [300, [Validators.min(100), Validators.max(5000)]]
    });
  }

  private setupFormSubscriptions(): void {
    this.collectionForm.valueChanges
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
    const collectionFields = Object.values(this.fieldSchemas)
      .filter(field => field.type === FieldType.ARRAY || field.type === FieldType.OBJECT);

    const fieldsByCategory: Record<string, FieldSchema[]> = {};
    
    collectionFields.forEach(field => {
      const category = field.uiConfig?.category || 'Collections';
      if (!fieldsByCategory[category]) {
        fieldsByCategory[category] = [];
      }
      fieldsByCategory[category].push(field);
    });

    this.collectionFieldCategories = Object.entries(fieldsByCategory)
      .map(([name, fields]) => ({
        name,
        fields: fields.sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private loadInitialConfig(): void {
    if (!this.config) return;

    this.validatorType = this.mapRuleTypeToValidatorType(this.config.type);
    this.targetCollection = this.config.targetCollection || '';

    // Load form values
    this.collectionForm.patchValue({
      validatorType: this.validatorType,
      targetCollection: this.targetCollection,
      itemVariable: this.config.itemVariable || 'item',
      indexVariable: this.config.indexVariable || 'index',
      caseSensitive: this.config.caseSensitive !== false,
      ignoreEmpty: this.config.ignoreEmpty !== false,
      duplicateErrorMessage: this.config.duplicateErrorMessage || '',
      minItems: this.config.minItems || 0,
      maxItems: this.config.maxItems || 100,
      lengthErrorMessage: this.config.lengthErrorMessage || '',
      showItemCount: this.config.showItemCount !== false,
      preventExcess: this.config.preventExcess !== false,
      validateOnAdd: this.config.validateOnAdd !== false,
      validateOnRemove: this.config.validateOnRemove !== false,
      validateOnChange: this.config.validateOnChange !== false,
      validateOnSubmit: this.config.validateOnSubmit !== false,
      errorStrategy: this.config.errorStrategy || 'both',
      stopOnFirstError: this.config.stopOnFirstError || false,
      highlightErrorItems: this.config.highlightErrorItems !== false,
      batchSize: this.config.batchSize || 50,
      debounceValidation: this.config.debounceValidation !== false,
      debounceDelay: this.config.debounceDelay || 300
    });

    // Load arrays
    this.loadItemValidationRules(this.config.itemValidationRules || []);
    this.loadUniqueByFields(this.config.uniqueByFields || []);
  }

  private loadItemValidationRules(rules: any[]): void {
    this.itemValidationRules.clear();
    rules.forEach(rule => {
      this.itemValidationRules.push(this.fb.group({
        ruleType: [rule.ruleType || 'required'],
        fieldPath: [rule.fieldPath || ''],
        errorMessage: [rule.errorMessage || '']
      }));
    });
    
    if (this.itemValidationRules.length === 0) {
      this.addItemValidationRule();
    }
  }

  private loadUniqueByFields(fields: string[]): void {
    this.uniqueByFields.clear();
    fields.forEach(field => {
      this.uniqueByFields.push(this.fb.control(field));
    });
    
    if (this.uniqueByFields.length === 0) {
      this.addUniqueField();
    }
  }

  private emitConfigChange(): void {
    if (!this.collectionForm.valid) return;

    const formValue = this.collectionForm.value;
    const config: CollectionValidatorConfig = {
      type: this.mapValidatorTypeToRuleType(formValue.validatorType),
      targetCollection: formValue.targetCollection,
      itemVariable: formValue.itemVariable || undefined,
      indexVariable: formValue.indexVariable || undefined,
      itemValidationRules: this.getItemValidationRulesValue(),
      uniqueByFields: this.getUniqueByFieldsValue(),
      caseSensitive: formValue.caseSensitive,
      ignoreEmpty: formValue.ignoreEmpty,
      duplicateErrorMessage: formValue.duplicateErrorMessage || undefined,
      minItems: formValue.minItems || undefined,
      maxItems: formValue.maxItems || undefined,
      lengthErrorMessage: formValue.lengthErrorMessage || undefined,
      showItemCount: formValue.showItemCount,
      preventExcess: formValue.preventExcess,
      validateOnAdd: formValue.validateOnAdd,
      validateOnRemove: formValue.validateOnRemove,
      validateOnChange: formValue.validateOnChange,
      validateOnSubmit: formValue.validateOnSubmit,
      errorStrategy: formValue.errorStrategy,
      stopOnFirstError: formValue.stopOnFirstError,
      highlightErrorItems: formValue.highlightErrorItems,
      batchSize: formValue.batchSize,
      debounceValidation: formValue.debounceValidation,
      debounceDelay: formValue.debounceDelay
    };

    this.configChanged.emit(config);
  }

  private getItemValidationRulesValue(): any[] {
    return this.itemValidationRules.controls.map(control => control.value);
  }

  private getUniqueByFieldsValue(): string[] {
    return this.uniqueByFields.controls.map(control => control.value).filter(Boolean);
  }

  // Template methods
  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      'array': 'list',
      'object': 'data_object',
      'string': 'text_fields',
      'number': 'pin',
      'boolean': 'toggle_on'
    };
    
    return icons[type] || 'list';
  }

  getLengthErrorPlaceholder(): string {
    if (this.validatorType === 'minLength') {
      return 'At least {min} items are required';
    } else if (this.validatorType === 'maxLength') {
      return 'Maximum {max} items allowed';
    }
    return 'Invalid length';
  }

  getPreviewText(): string {
    const formValue = this.collectionForm.value;
    
    if (!formValue.validatorType || !formValue.targetCollection) {
      return 'Incomplete collection validator configuration';
    }

    const targetSchema = this.fieldSchemas[formValue.targetCollection];
    const targetLabel = targetSchema?.label || formValue.targetCollection;
    
    switch (formValue.validatorType) {
      case 'forEach':
        return `Validate each item in ${targetLabel} using ${this.itemValidationRules.length} rule(s)`;
      case 'uniqueBy':
        const uniqueFields = this.getUniqueByFieldsValue();
        return `Ensure items in ${targetLabel} are unique by: ${uniqueFields.join(', ')}`;
      case 'minLength':
        return `${targetLabel} must have at least ${formValue.minItems} item(s)`;
      case 'maxLength':
        return `${targetLabel} must have at most ${formValue.maxItems} item(s)`;
      default:
        return 'Collection validation rule';
    }
  }

  getForEachRulesPreview(): string {
    const rules = this.getItemValidationRulesValue();
    return rules.map(rule => `${rule.ruleType} on ${rule.fieldPath}`).join(', ');
  }

  getUniqueFieldsPreview(): string {
    const fields = this.getUniqueByFieldsValue();
    return fields.length > 0 ? fields.join(', ') : 'None specified';
  }

  getLengthConstraintsPreview(): string {
    const formValue = this.collectionForm.value;
    if (this.validatorType === 'minLength') {
      return `Minimum: ${formValue.minItems} items`;
    } else if (this.validatorType === 'maxLength') {
      return `Maximum: ${formValue.maxItems} items`;
    }
    return '';
  }

  // Event handlers
  onValidatorTypeChanged(event: MatSelectChange): void {
    const type = event.value as 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
    this.validatorType = type;
    
    // Initialize arrays based on type
    if (type === 'forEach' && this.itemValidationRules.length === 0) {
      this.addItemValidationRule();
    } else if (type === 'uniqueBy' && this.uniqueByFields.length === 0) {
      this.addUniqueField();
    }
  }

  onTargetCollectionChanged(event: MatSelectChange): void {
    this.targetCollection = event.value;
  }

  addItemValidationRule(): void {
    const rule = this.fb.group({
      ruleType: ['required'],
      fieldPath: [''],
      errorMessage: ['']
    });
    this.itemValidationRules.push(rule);
  }

  removeItemValidationRule(index: number): void {
    if (this.itemValidationRules.length > 1) {
      this.itemValidationRules.removeAt(index);
    }
  }

  addUniqueField(): void {
    this.uniqueByFields.push(this.fb.control(''));
  }

  removeUniqueField(index: number): void {
    if (this.uniqueByFields.length > 1) {
      this.uniqueByFields.removeAt(index);
    }
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.collectionForm.get('validatorType')?.value) {
      errors.push('Validator type is required');
    }
    
    if (!this.collectionForm.get('targetCollection')?.value) {
      errors.push('Target collection is required');
    }
    
    if (this.validatorType === 'forEach' && this.itemValidationRules.length === 0) {
      errors.push('At least one validation rule is required for forEach');
    }
    
    if (this.validatorType === 'uniqueBy' && this.getUniqueByFieldsValue().length === 0) {
      errors.push('At least one unique field is required');
    }
    
    return errors;
  }

  isValid(): boolean {
    return this.collectionForm.valid && !this.hasValidationErrors();
  }

  // Helper methods
  private mapRuleTypeToValidatorType(ruleType: string): string {
    const mapping: Record<string, string> = {
      'forEach': 'forEach',
      'uniqueBy': 'uniqueBy',
      'minLength': 'minLength',
      'maxLength': 'maxLength'
    };
    
    return mapping[ruleType] || 'forEach';
  }

  private mapValidatorTypeToRuleType(validatorType: string): 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength' {
    const mapping: Record<string, 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength'> = {
      'forEach': 'forEach',
      'uniqueBy': 'uniqueBy',
      'minLength': 'minLength',
      'maxLength': 'maxLength'
    };
    
    return mapping[validatorType] || 'forEach';
  }
}