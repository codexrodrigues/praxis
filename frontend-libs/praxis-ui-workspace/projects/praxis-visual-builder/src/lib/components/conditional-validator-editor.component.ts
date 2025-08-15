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
import {
  MatButtonToggleModule,
  MatButtonToggleChange,
} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {
  ConditionalValidatorConfig,
  ConditionalValidatorType,
  ConditionalValidatorPreview,
  RuleNode,
  RuleNodeType,
} from '../models/rule-builder.model';
import { FieldSchema } from '../models/field-schema.model';
import { FieldConditionEditorComponent } from './field-condition-editor.component';

@Component({
  selector: 'praxis-conditional-validator-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    FieldConditionEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="validatorForm" class="conditional-validator-form">
      <!-- Validator Type Selection -->
      <div class="form-row">
        <mat-form-field appearance="outline" class="validator-type-select">
          <mat-label>Validator Type</mat-label>
          <mat-select
            formControlName="validatorType"
            (selectionChange)="onValidatorTypeChanged($event)"
          >
            <mat-option value="requiredIf">
              <div class="validator-option">
                <mat-icon>star</mat-icon>
                <span>Required If</span>
                <small>Field is required when condition is met</small>
              </div>
            </mat-option>
            <mat-option value="visibleIf">
              <div class="validator-option">
                <mat-icon>visibility</mat-icon>
                <span>Visible If</span>
                <small>Field is visible when condition is met</small>
              </div>
            </mat-option>
            <mat-option value="disabledIf">
              <div class="validator-option">
                <mat-icon>block</mat-icon>
                <span>Disabled If</span>
                <small>Field is disabled when condition is met</small>
              </div>
            </mat-option>
            <mat-option value="readonlyIf">
              <div class="validator-option">
                <mat-icon>lock</mat-icon>
                <span>Readonly If</span>
                <small>Field is readonly when condition is met</small>
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Target Field Selection -->
      <div class="form-row" *ngIf="validatorType">
        <mat-form-field appearance="outline" class="target-field-select">
          <mat-label>Target Field</mat-label>
          <mat-select
            formControlName="targetField"
            (selectionChange)="onTargetFieldChanged($event)"
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
          <mat-hint>Select the field this validator applies to</mat-hint>
        </mat-form-field>
      </div>

      <!-- Condition Configuration -->
      <div class="form-section" *ngIf="validatorType && targetField">
        <h4 class="section-title">
          <mat-icon>settings</mat-icon>
          Condition Configuration
        </h4>

        <div class="condition-mode-selector">
          <mat-button-toggle-group
            formControlName="conditionMode"
            (change)="onConditionModeChanged($event)"
          >
            <mat-button-toggle value="simple">
              <mat-icon>compare_arrows</mat-icon>
              Simple Condition
            </mat-button-toggle>
            <mat-button-toggle value="advanced">
              <mat-icon>account_tree</mat-icon>
              Advanced Logic
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <!-- Simple Condition -->
        <div *ngIf="conditionMode === 'simple'" class="simple-condition">
          <praxis-field-condition-editor
            [config]="getSimpleConditionConfig()"
            [fieldSchemas]="fieldSchemas"
            (configChanged)="onSimpleConditionChanged($event)"
          >
          </praxis-field-condition-editor>
        </div>

        <!-- Advanced Logic -->
        <div *ngIf="conditionMode === 'advanced'" class="advanced-condition">
          <div class="logic-builder">
            <mat-form-field appearance="outline" class="logic-operator">
              <mat-label>Logic Operator</mat-label>
              <mat-select formControlName="logicOperator">
                <mat-option value="and"
                  >AND - All conditions must be true</mat-option
                >
                <mat-option value="or"
                  >OR - Any condition can be true</mat-option
                >
                <mat-option value="not"
                  >NOT - Condition must be false</mat-option
                >
                <mat-option value="xor"
                  >XOR - Only one condition can be true</mat-option
                >
              </mat-select>
            </mat-form-field>

            <div class="conditions-list">
              <div
                *ngFor="
                  let condition of advancedConditions;
                  let i = index;
                  trackBy: trackByIndex
                "
                class="condition-item"
              >
                <div class="condition-header">
                  <span class="condition-number">{{ i + 1 }}</span>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="removeCondition(i)"
                    [disabled]="advancedConditions.length <= 1"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <praxis-field-condition-editor
                  [config]="condition"
                  [fieldSchemas]="fieldSchemas"
                  (configChanged)="updateAdvancedCondition(i, $event)"
                >
                </praxis-field-condition-editor>
              </div>

              <button
                mat-stroked-button
                color="primary"
                (click)="addCondition()"
                class="add-condition-button"
              >
                <mat-icon>add</mat-icon>
                Add Condition
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Settings -->
      <div class="form-section" *ngIf="validatorType === 'requiredIf'">
        <h4 class="section-title">
          <mat-icon>tune</mat-icon>
          Validation Settings
        </h4>

        <div class="validation-settings">
          <mat-form-field appearance="outline" class="error-message-input">
            <mat-label>Custom Error Message</mat-label>
            <input
              matInput
              formControlName="errorMessage"
              placeholder="This field is required"
            />
            <mat-hint>Override the default validation message</mat-hint>
          </mat-form-field>

          <div class="validation-options">
            <mat-checkbox formControlName="validateOnChange">
              Validate on field change
            </mat-checkbox>

            <mat-checkbox formControlName="validateOnBlur">
              Validate on field blur
            </mat-checkbox>

            <mat-checkbox formControlName="showErrorImmediately">
              Show error immediately when condition is met
            </mat-checkbox>
          </div>
        </div>
      </div>

      <!-- UI Behavior Settings -->
      <div
        class="form-section"
        *ngIf="validatorType && validatorType !== 'requiredIf'"
      >
        <h4 class="section-title">
          <mat-icon>visibility</mat-icon>
          UI Behavior Settings
        </h4>

        <div class="ui-settings">
          <div
            *ngIf="validatorType === 'visibleIf'"
            class="visibility-settings"
          >
            <mat-form-field appearance="outline" class="animation-select">
              <mat-label>Hide/Show Animation</mat-label>
              <mat-select formControlName="animation">
                <mat-option value="none">No animation</mat-option>
                <mat-option value="fade">Fade in/out</mat-option>
                <mat-option value="slide">Slide up/down</mat-option>
                <mat-option value="scale">Scale in/out</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="hideLabel">
              Hide field label when hidden
            </mat-checkbox>

            <mat-checkbox formControlName="preserveSpace">
              Preserve space when hidden
            </mat-checkbox>
          </div>

          <div *ngIf="validatorType === 'disabledIf'" class="disabled-settings">
            <mat-form-field appearance="outline" class="disabled-style-select">
              <mat-label>Disabled Style</mat-label>
              <mat-select formControlName="disabledStyle">
                <mat-option value="default">Default (grayed out)</mat-option>
                <mat-option value="faded">Faded appearance</mat-option>
                <mat-option value="hidden">Hide completely</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="clearOnDisable">
              Clear field value when disabled
            </mat-checkbox>

            <mat-checkbox formControlName="showDisabledMessage">
              Show custom disabled message
            </mat-checkbox>

            <mat-form-field
              *ngIf="showDisabledMessage"
              appearance="outline"
              class="disabled-message-input"
            >
              <mat-label>Disabled Message</mat-label>
              <input
                matInput
                formControlName="disabledMessage"
                placeholder="This field is currently disabled"
              />
            </mat-form-field>
          </div>

          <div *ngIf="validatorType === 'readonlyIf'" class="readonly-settings">
            <mat-form-field appearance="outline" class="readonly-style-select">
              <mat-label>Readonly Style</mat-label>
              <mat-select formControlName="readonlyStyle">
                <mat-option value="default">Default (non-editable)</mat-option>
                <mat-option value="display">Display value only</mat-option>
                <mat-option value="bordered">Bordered display</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="showReadonlyIndicator">
              Show readonly indicator icon
            </mat-checkbox>
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

          <div class="preview-logic" *ngIf="conditionMode === 'advanced'">
            <strong>Logic:</strong> {{ getLogicPreview() }}
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
    </form>
  `,
  styles: [
    `
      .conditional-validator-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 800px;
      }

      .form-row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .validator-type-select,
      .target-field-select {
        flex: 1;
        min-width: 200px;
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

      .condition-mode-selector {
        margin-bottom: 16px;
      }

      .simple-condition {
        background: var(--mdc-theme-surface);
        border-radius: 8px;
        padding: 16px;
      }

      .advanced-condition {
        background: var(--mdc-theme-surface);
        border-radius: 8px;
        padding: 16px;
      }

      .logic-operator {
        width: 100%;
        margin-bottom: 16px;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .condition-item {
        border: 1px solid var(--mdc-theme-outline);
        border-radius: 8px;
        padding: 12px;
        background: var(--mdc-theme-surface-variant);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .condition-number {
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

      .add-condition-button {
        align-self: flex-start;
      }

      .validation-settings,
      .ui-settings {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .validation-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .error-message-input,
      .animation-select,
      .disabled-style-select,
      .readonly-style-select,
      .disabled-message-input {
        width: 100%;
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

      .preview-logic {
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
      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .validator-type-select,
        .target-field-select {
          width: 100%;
        }
      }
    `,
  ],
})
export class ConditionalValidatorEditorComponent implements OnInit, OnChanges {
  @Input() config: ConditionalValidatorConfig | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};

  @Output() configChanged = new EventEmitter<ConditionalValidatorConfig>();

  private destroy$ = new Subject<void>();

  validatorForm: FormGroup;
  fieldCategories: { name: string; fields: FieldSchema[] }[] = [];
  advancedConditions: any[] = [];

  validatorType: string = '';
  targetField: string = '';
  conditionMode: string = 'simple';

  get showDisabledMessage(): boolean {
    return this.validatorForm.get('showDisabledMessage')?.value || false;
  }

  constructor(private fb: FormBuilder) {
    this.validatorForm = this.createForm();
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
      targetField: ['', Validators.required],
      conditionMode: ['simple'],
      logicOperator: ['and'],
      errorMessage: [''],
      validateOnChange: [true],
      validateOnBlur: [true],
      showErrorImmediately: [false],
      animation: ['fade'],
      hideLabel: [false],
      preserveSpace: [false],
      disabledStyle: ['default'],
      clearOnDisable: [false],
      showDisabledMessage: [false],
      disabledMessage: [''],
      readonlyStyle: ['default'],
      showReadonlyIndicator: [true],
    });
  }

  private setupFormSubscriptions(): void {
    this.validatorForm.valueChanges
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

    this.validatorType = this.mapRuleTypeToValidatorType(this.config.type);
    this.targetField = this.config.targetField || '';
    this.conditionMode =
      this.config.conditions && this.config.conditions.length > 1
        ? 'advanced'
        : 'simple';

    this.validatorForm.patchValue({
      validatorType: this.validatorType,
      targetField: this.targetField,
      conditionMode: this.conditionMode,
      logicOperator: this.config.logicOperator || 'and',
      errorMessage: this.config.errorMessage || '',
      validateOnChange: this.config.validateOnChange !== false,
      validateOnBlur: this.config.validateOnBlur !== false,
      showErrorImmediately: this.config.showErrorImmediately || false,
      animation: this.config.animation || 'fade',
      hideLabel: this.config.hideLabel || false,
      preserveSpace: this.config.preserveSpace || false,
      disabledStyle: this.config.disabledStyle || 'default',
      clearOnDisable: this.config.clearOnDisable || false,
      showDisabledMessage: this.config.showDisabledMessage || false,
      disabledMessage: this.config.disabledMessage || '',
      readonlyStyle: this.config.readonlyStyle || 'default',
      showReadonlyIndicator: this.config.showReadonlyIndicator !== false,
    });

    if (this.config.conditions && this.config.conditions.length > 0) {
      this.advancedConditions = [...this.config.conditions];
    } else {
      this.advancedConditions = [this.createEmptyCondition()];
    }
  }

  private emitConfigChange(): void {
    if (!this.validatorForm.valid) return;

    const formValue = this.validatorForm.value;
    const config: ConditionalValidatorConfig = {
      type: this.mapValidatorTypeToRuleType(formValue.validatorType),
      validatorType: this.mapValidatorTypeToRuleType(formValue.validatorType),
      targetField: formValue.targetField,
      conditions:
        this.conditionMode === 'simple'
          ? [this.getSimpleConditionConfig()]
          : this.advancedConditions,
      logicOperator: formValue.logicOperator,
      errorMessage: formValue.errorMessage || undefined,
      validateOnChange: formValue.validateOnChange,
      validateOnBlur: formValue.validateOnBlur,
      showErrorImmediately: formValue.showErrorImmediately,
      animation: formValue.animation || undefined,
      hideLabel: formValue.hideLabel || undefined,
      preserveSpace: formValue.preserveSpace || undefined,
      disabledStyle: formValue.disabledStyle || undefined,
      clearOnDisable: formValue.clearOnDisable || undefined,
      showDisabledMessage: formValue.showDisabledMessage || undefined,
      disabledMessage: formValue.disabledMessage || undefined,
      readonlyStyle: formValue.readonlyStyle || undefined,
      showReadonlyIndicator: formValue.showReadonlyIndicator,
    };

    this.configChanged.emit(config);
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

  trackByIndex(index: number): number {
    return index;
  }

  getSimpleConditionConfig(): any {
    return this.advancedConditions[0] || this.createEmptyCondition();
  }

  getPreviewText(): string {
    const formValue = this.validatorForm.value;

    if (!formValue.validatorType || !formValue.targetField) {
      return 'Incomplete validator configuration';
    }

    const targetFieldSchema = this.fieldSchemas[formValue.targetField];
    const targetFieldLabel = targetFieldSchema?.label || formValue.targetField;

    let actionText = '';
    switch (formValue.validatorType) {
      case 'requiredIf':
        actionText = 'is required';
        break;
      case 'visibleIf':
        actionText = 'is visible';
        break;
      case 'disabledIf':
        actionText = 'is disabled';
        break;
      case 'readonlyIf':
        actionText = 'is readonly';
        break;
    }

    const conditionText =
      this.conditionMode === 'simple'
        ? 'when condition is met'
        : `when ${formValue.logicOperator.toUpperCase()} conditions are met`;

    return `${targetFieldLabel} ${actionText} ${conditionText}`;
  }

  getLogicPreview(): string {
    const formValue = this.validatorForm.value;
    const operator = formValue.logicOperator?.toUpperCase() || 'AND';
    const conditionCount = this.advancedConditions.length;

    return `${operator} logic with ${conditionCount} condition${conditionCount !== 1 ? 's' : ''}`;
  }

  // Event handlers
  onValidatorTypeChanged(event: MatSelectChange): void {
    this.validatorType = event.value;
  }

  onTargetFieldChanged(event: MatSelectChange): void {
    this.targetField = event.value;
  }

  onConditionModeChanged(event: MatButtonToggleChange): void {
    const mode = event.value as 'simple' | 'advanced';
    this.conditionMode = mode;

    if (mode === 'simple' && this.advancedConditions.length === 0) {
      this.advancedConditions = [this.createEmptyCondition()];
    }
  }

  onSimpleConditionChanged(condition: any): void {
    this.advancedConditions[0] = condition;
    this.emitConfigChange();
  }

  updateAdvancedCondition(index: number, condition: any): void {
    this.advancedConditions[index] = condition;
    this.emitConfigChange();
  }

  addCondition(): void {
    this.advancedConditions.push(this.createEmptyCondition());
  }

  removeCondition(index: number): void {
    if (this.advancedConditions.length > 1) {
      this.advancedConditions.splice(index, 1);
      this.emitConfigChange();
    }
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.validatorForm.get('validatorType')?.value) {
      errors.push('Validator type is required');
    }

    if (!this.validatorForm.get('targetField')?.value) {
      errors.push('Target field is required');
    }

    if (this.advancedConditions.length === 0) {
      errors.push('At least one condition is required');
    }

    return errors;
  }

  isValid(): boolean {
    return this.validatorForm.valid && !this.hasValidationErrors();
  }

  // Helper methods
  private createEmptyCondition(): any {
    return {
      type: 'fieldCondition',
      fieldName: '',
      operator: 'equals',
      value: null,
    };
  }

  private mapRuleTypeToValidatorType(ruleType: string): string {
    const mapping: Record<string, string> = {
      'requiredIf': 'requiredIf',
      'visibleIf': 'visibleIf',
      'disabledIf': 'disabledIf',
      'readonlyIf': 'readonlyIf',
    };

    return mapping[ruleType] || 'requiredIf';
  }

  private mapValidatorTypeToRuleType(validatorType: string): 'requiredIf' | 'visibleIf' | 'disabledIf' | 'readonlyIf' {
    const mapping: Record<string, 'requiredIf' | 'visibleIf' | 'disabledIf' | 'readonlyIf'> = {
      'requiredIf': 'requiredIf',
      'visibleIf': 'visibleIf',
      'disabledIf': 'disabledIf',
      'readonlyIf': 'readonlyIf',
    };

    return mapping[validatorType] || 'requiredIf';
  }
}
