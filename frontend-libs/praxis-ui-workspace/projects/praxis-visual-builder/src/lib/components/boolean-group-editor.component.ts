import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BooleanGroupConfig } from '../models/rule-builder.model';

@Component({
  selector: 'praxis-boolean-group-editor',
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
    MatSliderModule,
    MatCheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="groupForm" class="boolean-group-form">
      <!-- Operator Selection -->
      <div class="form-section">
        <h4 class="section-title">
          <mat-icon>join_inner</mat-icon>
          Boolean Operator
        </h4>
        
        <div class="operator-selection">
          <mat-form-field appearance="outline" class="operator-select">
            <mat-label>Logic Operator</mat-label>
            <mat-select formControlName="operator" 
                       (selectionChange)="onOperatorChanged($event.value)">
              <mat-option value="and">
                <div class="operator-option">
                  <mat-icon>join_inner</mat-icon>
                  <div class="operator-content">
                    <span class="operator-name">AND</span>
                    <span class="operator-desc">All conditions must be true</span>
                  </div>
                </div>
              </mat-option>
              
              <mat-option value="or">
                <div class="operator-option">
                  <mat-icon>join_full</mat-icon>
                  <div class="operator-content">
                    <span class="operator-name">OR</span>
                    <span class="operator-desc">At least one condition must be true</span>
                  </div>
                </div>
              </mat-option>
              
              <mat-option value="not">
                <div class="operator-option">
                  <mat-icon>block</mat-icon>
                  <div class="operator-content">
                    <span class="operator-name">NOT</span>
                    <span class="operator-desc">Negates the child condition</span>
                  </div>
                </div>
              </mat-option>
              
              <mat-option value="xor">
                <div class="operator-option">
                  <mat-icon>join_left</mat-icon>
                  <div class="operator-content">
                    <span class="operator-name">XOR</span>
                    <span class="operator-desc">Exactly one condition must be true</span>
                  </div>
                </div>
              </mat-option>
              
              <mat-option value="implies">
                <div class="operator-option">
                  <mat-icon>arrow_forward</mat-icon>
                  <div class="operator-content">
                    <span class="operator-name">IMPLIES</span>
                    <span class="operator-desc">If first is true, then second must be true</span>
                  </div>
                </div>
              </mat-option>
            </mat-select>
            <mat-hint>{{ getOperatorHint() }}</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <!-- Cardinality Configuration (for advanced scenarios) -->
      <div class="form-section" *ngIf="showCardinalityConfig()">
        <h4 class="section-title">
          <mat-icon>filter_list</mat-icon>
          Cardinality Rules
        </h4>
        
        <!-- Minimum Required -->
        <div class="cardinality-option" *ngIf="selectedOperator === 'and' || selectedOperator === 'or'">
          <mat-checkbox formControlName="useMinimumRequired"
                        (change)="onUseMinimumRequiredChanged($event.checked)">
            Set minimum required conditions
          </mat-checkbox>
          
          <mat-form-field *ngIf="useMinimumRequired" 
                          appearance="outline" 
                          class="cardinality-input">
            <mat-label>Minimum Required</mat-label>
            <input matInput 
                   type="number"
                   min="1"
                   formControlName="minimumRequired"
                   placeholder="Number of conditions">
            <mat-hint>At least this many conditions must be true</mat-hint>
          </mat-form-field>
        </div>

        <!-- Exact Required -->
        <div class="cardinality-option" *ngIf="selectedOperator === 'or' || selectedOperator === 'xor'">
          <mat-checkbox formControlName="useExactRequired"
                        (change)="onUseExactRequiredChanged($event.checked)">
            Set exact number of conditions
          </mat-checkbox>
          
          <mat-form-field *ngIf="useExactRequired" 
                          appearance="outline" 
                          class="cardinality-input">
            <mat-label>Exact Required</mat-label>
            <input matInput 
                   type="number"
                   min="1"
                   formControlName="exactRequired"
                   placeholder="Number of conditions">
            <mat-hint>Exactly this many conditions must be true</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <!-- Operator Behavior Preview -->
      <div class="form-section">
        <h4 class="section-title">
          <mat-icon>preview</mat-icon>
          Behavior Preview
        </h4>
        
        <mat-card class="behavior-preview">
          <div class="preview-content">
            <div class="operator-visual">
              <mat-icon class="operator-icon">{{ getOperatorIcon() }}</mat-icon>
              <span class="operator-text">{{ getOperatorDisplayName() }}</span>
            </div>
            
            <div class="behavior-description">
              {{ getBehaviorDescription() }}
            </div>
            
            <!-- Example scenarios -->
            <div class="example-scenarios" *ngIf="getExampleScenarios().length > 0">
              <div class="examples-label">Examples:</div>
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

      <!-- Advanced Configuration -->
      <div class="form-section" *ngIf="showAdvancedConfig">
        <h4 class="section-title">
          <mat-icon>settings</mat-icon>
          Advanced Configuration
          <button mat-icon-button 
                  type="button"
                  (click)="toggleAdvancedConfig()"
                  class="toggle-button">
            <mat-icon>{{ showAdvancedConfig ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
        </h4>
        
        <div class="advanced-options">
          <!-- Short-circuit evaluation -->
          <div class="advanced-option">
            <mat-checkbox formControlName="enableShortCircuit">
              Enable short-circuit evaluation
            </mat-checkbox>
            <div class="option-description">
              Stop evaluating conditions once the result is determined
            </div>
          </div>
          
          <!-- Error handling -->
          <div class="advanced-option">
            <mat-form-field appearance="outline" class="error-handling">
              <mat-label>Error Handling</mat-label>
              <mat-select formControlName="errorHandling">
                <mat-option value="fail">Fail on first error</mat-option>
                <mat-option value="skip">Skip failed conditions</mat-option>
                <mat-option value="default">Use default value</mat-option>
              </mat-select>
            </mat-form-field>
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

      <!-- Configuration Summary -->
      <div class="config-summary" *ngIf="isValid()">
        <div class="summary-label">Configuration Summary:</div>
        <div class="summary-text">{{ getConfigSummary() }}</div>
      </div>
    </form>
  `,
  styles: [`
    .boolean-group-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 350px;
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

    .section-title .toggle-button {
      margin-left: auto;
    }

    .operator-selection {
      width: 100%;
    }

    .operator-select {
      width: 100%;
    }

    .operator-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .operator-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .operator-name {
      font-weight: 500;
      font-size: 14px;
    }

    .operator-desc {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .cardinality-option {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .cardinality-input {
      width: 200px;
    }

    .behavior-preview {
      background: var(--mdc-theme-surface-container);
    }

    .preview-content {
      padding: 16px;
    }

    .operator-visual {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .operator-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--mdc-theme-primary);
    }

    .operator-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--mdc-theme-primary);
    }

    .behavior-description {
      font-size: 14px;
      color: var(--mdc-theme-on-surface);
      margin-bottom: 16px;
      line-height: 1.4;
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

    .advanced-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 12px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .advanced-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .option-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      margin-left: 32px;
    }

    .error-handling {
      width: 200px;
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

    .config-summary {
      background: var(--mdc-theme-primary-container);
      border-radius: 8px;
      padding: 12px;
      border-left: 4px solid var(--mdc-theme-primary);
    }

    .summary-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--mdc-theme-on-primary-container);
      margin-bottom: 4px;
    }

    .summary-text {
      font-family: monospace;
      font-size: 14px;
      color: var(--mdc-theme-on-primary-container);
      background: var(--mdc-theme-surface);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
    }
  `]
})
export class BooleanGroupEditorComponent implements OnInit, OnChanges {
  @Input() config: BooleanGroupConfig | null = null;
  
  @Output() configChanged = new EventEmitter<BooleanGroupConfig>();

  private destroy$ = new Subject<void>();

  groupForm: FormGroup;
  selectedOperator: string = 'and';
  useMinimumRequired: boolean = false;
  useExactRequired: boolean = false;
  showAdvancedConfig: boolean = false;

  constructor(private fb: FormBuilder) {
    this.groupForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadInitialConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.loadInitialConfig();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      operator: ['and', Validators.required],
      useMinimumRequired: [false],
      minimumRequired: [{ value: 1, disabled: true }],
      useExactRequired: [false],
      exactRequired: [{ value: 1, disabled: true }],
      enableShortCircuit: [true],
      errorHandling: ['fail']
    });
  }

  private setupFormSubscriptions(): void {
    this.groupForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitConfigChange();
      });
  }

  private loadInitialConfig(): void {
    if (!this.config) return;

    this.selectedOperator = this.config.operator;
    this.useMinimumRequired = !!this.config.minimumRequired;
    this.useExactRequired = !!this.config.exactRequired;

    this.groupForm.patchValue({
      operator: this.config.operator,
      useMinimumRequired: this.useMinimumRequired,
      minimumRequired: this.config.minimumRequired || 1,
      useExactRequired: this.useExactRequired,
      exactRequired: this.config.exactRequired || 1,
      enableShortCircuit: true,
      errorHandling: 'fail'
    });

    this.updateCardinalityControls();
  }

  private emitConfigChange(): void {
    if (!this.groupForm.valid) return;

    const formValue = this.groupForm.value;
    const config: BooleanGroupConfig = {
      type: 'booleanGroup',
      operator: formValue.operator
    };

    if (formValue.useMinimumRequired && formValue.minimumRequired > 0) {
      config.minimumRequired = formValue.minimumRequired;
    }

    if (formValue.useExactRequired && formValue.exactRequired > 0) {
      config.exactRequired = formValue.exactRequired;
    }

    this.configChanged.emit(config);
  }

  private updateCardinalityControls(): void {
    const minimumControl = this.groupForm.get('minimumRequired');
    const exactControl = this.groupForm.get('exactRequired');

    if (this.useMinimumRequired) {
      minimumControl?.enable();
    } else {
      minimumControl?.disable();
    }

    if (this.useExactRequired) {
      exactControl?.enable();
    } else {
      exactControl?.disable();
    }
  }

  // Template methods
  getOperatorIcon(): string {
    const icons: Record<string, string> = {
      'and': 'join_inner',
      'or': 'join_full',
      'not': 'block',
      'xor': 'join_left',
      'implies': 'arrow_forward'
    };
    return icons[this.selectedOperator] || 'help';
  }

  getOperatorDisplayName(): string {
    const names: Record<string, string> = {
      'and': 'AND',
      'or': 'OR',
      'not': 'NOT',
      'xor': 'XOR',
      'implies': 'IMPLIES'
    };
    return names[this.selectedOperator] || 'UNKNOWN';
  }

  getOperatorHint(): string {
    const hints: Record<string, string> = {
      'and': 'All child conditions must evaluate to true',
      'or': 'At least one child condition must evaluate to true',
      'not': 'Negates the result of the child condition',
      'xor': 'Exactly one child condition must evaluate to true',
      'implies': 'If the first condition is true, the second must also be true'
    };
    return hints[this.selectedOperator] || '';
  }

  getBehaviorDescription(): string {
    const formValue = this.groupForm.value;
    
    let description = this.getOperatorHint();
    
    if (formValue.useMinimumRequired && formValue.minimumRequired > 0) {
      description += ` At least ${formValue.minimumRequired} condition(s) must be true.`;
    }
    
    if (formValue.useExactRequired && formValue.exactRequired > 0) {
      description += ` Exactly ${formValue.exactRequired} condition(s) must be true.`;
    }
    
    return description;
  }

  getExampleScenarios(): { description: string; result: boolean }[] {
    switch (this.selectedOperator) {
      case 'and':
        return [
          { description: 'All 3 conditions true → Result: true', result: true },
          { description: '2 of 3 conditions true → Result: false', result: false },
          { description: 'No conditions true → Result: false', result: false }
        ];
      case 'or':
        return [
          { description: 'All 3 conditions true → Result: true', result: true },
          { description: '1 of 3 conditions true → Result: true', result: true },
          { description: 'No conditions true → Result: false', result: false }
        ];
      case 'not':
        return [
          { description: 'Child condition true → Result: false', result: false },
          { description: 'Child condition false → Result: true', result: true }
        ];
      case 'xor':
        return [
          { description: 'Exactly 1 of 3 conditions true → Result: true', result: true },
          { description: '2 of 3 conditions true → Result: false', result: false },
          { description: 'All 3 conditions true → Result: false', result: false }
        ];
      case 'implies':
        return [
          { description: 'First true, second true → Result: true', result: true },
          { description: 'First true, second false → Result: false', result: false },
          { description: 'First false, second any → Result: true', result: true }
        ];
      default:
        return [];
    }
  }

  showCardinalityConfig(): boolean {
    return this.selectedOperator === 'and' || this.selectedOperator === 'or' || this.selectedOperator === 'xor';
  }

  getConfigSummary(): string {
    const formValue = this.groupForm.value;
    let summary = `operator: ${formValue.operator.toUpperCase()}`;
    
    if (formValue.useMinimumRequired) {
      summary += `, minRequired: ${formValue.minimumRequired}`;
    }
    
    if (formValue.useExactRequired) {
      summary += `, exactRequired: ${formValue.exactRequired}`;
    }
    
    return summary;
  }

  // Event handlers
  onOperatorChanged(operator: string): void {
    this.selectedOperator = operator;
    
    // Reset cardinality settings when operator changes
    this.groupForm.patchValue({
      useMinimumRequired: false,
      useExactRequired: false,
      minimumRequired: 1,
      exactRequired: 1
    });
    
    this.useMinimumRequired = false;
    this.useExactRequired = false;
    this.updateCardinalityControls();
  }

  onUseMinimumRequiredChanged(checked: boolean): void {
    this.useMinimumRequired = checked;
    this.updateCardinalityControls();
    
    if (checked && this.useExactRequired) {
      this.groupForm.patchValue({ useExactRequired: false });
      this.useExactRequired = false;
    }
  }

  onUseExactRequiredChanged(checked: boolean): void {
    this.useExactRequired = checked;
    this.updateCardinalityControls();
    
    if (checked && this.useMinimumRequired) {
      this.groupForm.patchValue({ useMinimumRequired: false });
      this.useMinimumRequired = false;
    }
  }

  toggleAdvancedConfig(): void {
    this.showAdvancedConfig = !this.showAdvancedConfig;
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.groupForm.get('operator')?.value) {
      errors.push('Operator is required');
    }
    
    const formValue = this.groupForm.value;
    
    if (formValue.useMinimumRequired && (!formValue.minimumRequired || formValue.minimumRequired < 1)) {
      errors.push('Minimum required must be at least 1');
    }
    
    if (formValue.useExactRequired && (!formValue.exactRequired || formValue.exactRequired < 1)) {
      errors.push('Exact required must be at least 1');
    }
    
    return errors;
  }

  isValid(): boolean {
    return this.groupForm.valid && !this.hasValidationErrors();
  }
}