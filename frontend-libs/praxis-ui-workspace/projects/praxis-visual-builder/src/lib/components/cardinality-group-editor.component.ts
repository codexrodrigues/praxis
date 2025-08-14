import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CardinalityConfig } from '../models/rule-builder.model';

@Component({
  selector: 'praxis-cardinality-group-editor',
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
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    DragDropModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="cardinalityForm" class="cardinality-group-form">
      <!-- Cardinality Type Selection -->
      <div class="form-section">
        <h4 class="section-title">
          <mat-icon>filter_list</mat-icon>
          Cardinality Type
        </h4>
        
        <div class="cardinality-type-selection">
          <mat-form-field appearance="outline" class="type-select">
            <mat-label>Cardinality Rule</mat-label>
            <mat-select formControlName="cardinalityType"
                       (selectionChange)="onCardinalityTypeChanged($event)">
              <mat-option value="atLeast">
                <div class="cardinality-option">
                  <mat-icon>filter_list</mat-icon>
                  <div class="option-content">
                    <span class="option-name">At Least</span>
                    <span class="option-desc">Minimum number of conditions must be true</span>
                  </div>
                </div>
              </mat-option>
              
              <mat-option value="exactly">
                <div class="cardinality-option">
                  <mat-icon>looks_one</mat-icon>
                  <div class="option-content">
                    <span class="option-name">Exactly</span>
                    <span class="option-desc">Exact number of conditions must be true</span>
                  </div>
                </div>
              </mat-option>
            </mat-select>
            <mat-hint>{{ getCardinalityHint() }}</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <!-- Count Configuration -->
      <div class="form-section" *ngIf="selectedCardinalityType">
        <h4 class="section-title">
          <mat-icon>pin</mat-icon>
          Count Configuration
        </h4>
        
        <div class="count-configuration">
          <!-- Slider for count -->
          <div class="count-slider">
            <mat-slider 
              [min]="1" 
              [max]="getMaxCount()"
              [step]="1"
              [displayWith]="formatCountLabel"
              class="cardinality-slider">
              <input matSliderThumb 
                     formControlName="count"
                     (input)="onCountChanged($event)">
            </mat-slider>
          </div>
          
          <!-- Count input -->
          <mat-form-field appearance="outline" class="count-input">
            <mat-label>{{ getCountLabel() }}</mat-label>
            <input matInput 
                   type="number"
                   min="1"
                   [max]="getMaxCount()"
                   formControlName="count"
                   (input)="onCountChanged($event)">
            <mat-hint>{{ getCountHint() }}</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <!-- Conditions Management -->
      <div class="form-section" *ngIf="selectedCardinalityType">
        <h4 class="section-title">
          <mat-icon>rule</mat-icon>
          Child Conditions
          <span class="conditions-count">{{ getConditionsArray().length }}</span>
        </h4>
        
        <div class="conditions-management">
          <!-- Add Condition Button -->
          <div class="add-condition-section">
            <button mat-raised-button 
                    color="primary"
                    (click)="addCondition()"
                    class="add-condition-button">
              <mat-icon>add</mat-icon>
              Add Condition
            </button>
            
            <div class="quick-add-buttons">
              <button mat-stroked-button 
                      size="small"
                      (click)="addMultipleConditions(3)"
                      matTooltip="Add 3 conditions quickly">
                +3
              </button>
              <button mat-stroked-button 
                      size="small"
                      (click)="addMultipleConditions(5)"
                      matTooltip="Add 5 conditions quickly">
                +5
              </button>
            </div>
          </div>

          <!-- Conditions List -->
          <div class="conditions-list" 
               cdkDropList 
               (cdkDropListDropped)="onConditionDrop($event)"
               *ngIf="getConditionsArray().length > 0">
            
            <div *ngFor="let conditionId of getConditionsArray().controls; let i = index"
                 class="condition-item"
                 cdkDrag>
              
              <mat-card class="condition-card">
                <div class="condition-header">
                  <div class="condition-info">
                    <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                    <span class="condition-number">Condition {{ i + 1 }}</span>
                  </div>
                  
                  <div class="condition-actions">
                    <button mat-icon-button 
                            size="small"
                            (click)="editCondition(i)"
                            matTooltip="Edit condition">
                      <mat-icon>edit</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            size="small"
                            color="warn"
                            (click)="removeCondition(i)"
                            matTooltip="Remove condition">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div class="condition-content">
                  <div class="condition-placeholder">
                    <mat-icon>help_outline</mat-icon>
                    <span>Click edit to configure this condition</span>
                  </div>
                </div>
              </mat-card>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-conditions" *ngIf="getConditionsArray().length === 0">
            <div class="empty-state-content">
              <mat-icon class="empty-icon">rule</mat-icon>
              <h5>No Conditions Added</h5>
              <p>Add conditions to define the cardinality rule</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cardinality Preview -->
      <div class="form-section" *ngIf="selectedCardinalityType && getConditionsArray().length > 0">
        <h4 class="section-title">
          <mat-icon>preview</mat-icon>
          Cardinality Preview
        </h4>
        
        <mat-card class="cardinality-preview">
          <div class="preview-content">
            <div class="cardinality-visual">
              <div class="cardinality-expression">
                <span class="cardinality-type">{{ getCardinalityDisplayName() }}</span>
                <span class="cardinality-count">{{ currentCount }}</span>
                <span class="cardinality-of">of</span>
                <span class="total-conditions">{{ getConditionsArray().length }}</span>
                <span class="cardinality-conditions">condition(s)</span>
              </div>
              
              <div class="visual-representation">
                <div class="condition-boxes">
                  <div *ngFor="let condition of getConditionsArray().controls; let i = index"
                       class="condition-box"
                       [class.required]="isConditionRequired(i)"
                       [class.optional]="!isConditionRequired(i)">
                    {{ i + 1 }}
                  </div>
                </div>
              </div>
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

      <!-- Configuration Summary -->
      <div class="form-section" *ngIf="isValid()">
        <h4 class="section-title">
          <mat-icon>summarize</mat-icon>
          Configuration Summary
        </h4>
        
        <mat-card class="config-summary">
          <div class="summary-content">
            <div class="summary-expression">
              <code>{{ getConfigSummary() }}</code>
            </div>
            
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ getCardinalityDisplayName() }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Required:</span>
                <span class="detail-value">{{ currentCount }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Total:</span>
                <span class="detail-value">{{ getConditionsArray().length }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Success Rate:</span>
                <span class="detail-value">{{ getSuccessRateRange() }}</span>
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
    .cardinality-group-form {
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

    .conditions-count {
      background: var(--mdc-theme-primary);
      color: var(--mdc-theme-on-primary);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      margin-left: auto;
    }

    .cardinality-type-selection {
      width: 100%;
    }

    .type-select {
      width: 100%;
    }

    .cardinality-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .option-name {
      font-weight: 500;
      font-size: 14px;
    }

    .option-desc {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .count-configuration {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .count-slider {
      width: 100%;
    }

    .cardinality-slider {
      width: 100%;
    }

    .count-input {
      width: 120px;
    }

    .conditions-management {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .add-condition-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 2px dashed var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .add-condition-button {
      flex-shrink: 0;
    }

    .quick-add-buttons {
      display: flex;
      gap: 6px;
    }

    .conditions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .condition-item {
      position: relative;
    }

    .condition-card {
      background: var(--mdc-theme-surface-container);
      border: 1px solid var(--mdc-theme-outline);
      transition: all 0.2s ease;
    }

    .condition-card:hover {
      border-color: var(--mdc-theme-primary);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .condition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--mdc-theme-outline);
      background: var(--mdc-theme-surface-variant);
    }

    .condition-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .drag-handle {
      color: var(--mdc-theme-on-surface-variant);
      cursor: grab;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .condition-number {
      font-weight: 500;
      font-size: 14px;
    }

    .condition-actions {
      display: flex;
      gap: 4px;
    }

    .condition-content {
      padding: 16px;
    }

    .condition-placeholder {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mdc-theme-on-surface-variant);
      font-style: italic;
      justify-content: center;
      padding: 20px;
    }

    .empty-conditions {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      border: 2px dashed var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .empty-state-content {
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mdc-theme-on-surface-variant);
      margin-bottom: 16px;
    }

    .empty-state-content h5 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-on-surface);
    }

    .empty-state-content p {
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
    }

    .cardinality-preview {
      background: var(--mdc-theme-surface-container);
    }

    .preview-content {
      padding: 16px;
    }

    .cardinality-visual {
      margin-bottom: 16px;
    }

    .cardinality-expression {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 16px;
    }

    .cardinality-type {
      font-weight: 600;
      color: var(--mdc-theme-primary);
    }

    .cardinality-count {
      font-weight: 700;
      font-size: 18px;
      color: var(--mdc-theme-secondary);
      background: var(--mdc-theme-secondary-container);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .cardinality-of {
      color: var(--mdc-theme-on-surface-variant);
    }

    .total-conditions {
      font-weight: 600;
      color: var(--mdc-theme-tertiary);
    }

    .cardinality-conditions {
      color: var(--mdc-theme-on-surface-variant);
    }

    .visual-representation {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .condition-boxes {
      display: flex;
      gap: 6px;
    }

    .condition-box {
      width: 32px;
      height: 32px;
      border: 2px solid var(--mdc-theme-outline);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      background: var(--mdc-theme-surface);
    }

    .condition-box.required {
      border-color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
    }

    .condition-box.optional {
      border-color: var(--mdc-theme-outline);
      background: var(--mdc-theme-surface-variant);
      color: var(--mdc-theme-on-surface-variant);
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

    .config-summary {
      background: var(--mdc-theme-primary-container);
    }

    .summary-content {
      padding: 16px;
    }

    .summary-expression {
      text-align: center;
      margin-bottom: 16px;
    }

    .summary-expression code {
      font-family: monospace;
      font-size: 14px;
      background: var(--mdc-theme-surface);
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
    }

    .summary-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      font-size: 12px;
      color: var(--mdc-theme-on-primary-container);
      font-weight: 500;
    }

    .detail-value {
      font-size: 13px;
      color: var(--mdc-theme-on-primary-container);
      font-weight: 600;
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

    /* Drag and drop styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .conditions-list.cdk-drop-list-dragging .condition-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class CardinalityGroupEditorComponent implements OnInit, OnChanges {
  @Input() config: CardinalityConfig | null = null;
  @Input() availableConditions: string[] = [];
  
  @Output() configChanged = new EventEmitter<CardinalityConfig>();
  @Output() editCondition = new EventEmitter<number>();

  private destroy$ = new Subject<void>();

  cardinalityForm: FormGroup;
  selectedCardinalityType: string | null = null;
  currentCount: number = 1;

  constructor(private fb: FormBuilder) {
    this.cardinalityForm = this.createForm();
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
      cardinalityType: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      conditions: this.fb.array([])
    });
  }

  private setupFormSubscriptions(): void {
    this.cardinalityForm.valueChanges
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

    this.selectedCardinalityType = this.config.cardinalityType;
    this.currentCount = this.config.count;

    this.cardinalityForm.patchValue({
      cardinalityType: this.config.cardinalityType,
      count: this.config.count
    });

    if (this.config.conditions) {
      this.loadConditions(this.config.conditions);
    }
  }

  private loadConditions(conditions: string[]): void {
    const conditionsArray = this.getConditionsArray();
    conditionsArray.clear();

    conditions.forEach(conditionId => {
      conditionsArray.push(this.fb.control(conditionId));
    });
  }

  private emitConfigChange(): void {
    if (!this.cardinalityForm.valid) return;

    const formValue = this.cardinalityForm.value;
    const config: CardinalityConfig = {
      type: 'cardinality',
      cardinalityType: formValue.cardinalityType,
      count: formValue.count,
      conditions: formValue.conditions || []
    };

    this.configChanged.emit(config);
  }

  get conditions(): FormArray {
    return this.cardinalityForm.get('conditions') as FormArray;
  }

  getConditionsArray(): FormArray {
    return this.cardinalityForm.get('conditions') as FormArray;
  }

  formatCountLabel = (value: number): string => {
    return `${value}`;
  };

  // Template methods
  getCardinalityHint(): string {
    const hints: Record<string, string> = {
      'atLeast': 'At least this many conditions must be true',
      'exactly': 'Exactly this many conditions must be true'
    };
    return hints[this.selectedCardinalityType || ''] || '';
  }

  getCountLabel(): string {
    const labels: Record<string, string> = {
      'atLeast': 'Minimum Required',
      'exactly': 'Exact Required'
    };
    return labels[this.selectedCardinalityType || ''] || 'Count';
  }

  getCountHint(): string {
    const totalConditions = this.getConditionsArray().length;
    
    if (totalConditions === 0) {
      return 'Add conditions first';
    }
    
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        return `At least ${this.currentCount} of ${totalConditions} conditions must be true`;
      case 'exactly':
        return `Exactly ${this.currentCount} of ${totalConditions} conditions must be true`;
      default:
        return '';
    }
  }

  getMaxCount(): number {
    return Math.max(this.getConditionsArray().length, 10);
  }

  getCardinalityDisplayName(): string {
    const names: Record<string, string> = {
      'atLeast': 'At Least',
      'exactly': 'Exactly'
    };
    return names[this.selectedCardinalityType || ''] || 'Unknown';
  }

  getPreviewDescription(): string {
    const totalConditions = this.getConditionsArray().length;
    
    if (totalConditions === 0) {
      return 'Add conditions to see the cardinality rule preview';
    }
    
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        return `The rule passes when at least ${this.currentCount} out of ${totalConditions} conditions evaluate to true.`;
      case 'exactly':
        return `The rule passes when exactly ${this.currentCount} out of ${totalConditions} conditions evaluate to true.`;
      default:
        return '';
    }
  }

  getExampleScenarios(): { description: string; result: boolean }[] {
    const totalConditions = this.getConditionsArray().length;
    
    if (totalConditions === 0 || !this.selectedCardinalityType) {
      return [];
    }
    
    const scenarios = [];
    
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        scenarios.push(
          { 
            description: `${this.currentCount} conditions true → Pass`, 
            result: true 
          },
          { 
            description: `${Math.max(this.currentCount - 1, 0)} conditions true → Fail`, 
            result: false 
          },
          { 
            description: `All ${totalConditions} conditions true → Pass`, 
            result: true 
          }
        );
        break;
      case 'exactly':
        scenarios.push(
          { 
            description: `${this.currentCount} conditions true → Pass`, 
            result: true 
          },
          { 
            description: `${this.currentCount + 1} conditions true → Fail`, 
            result: false 
          },
          { 
            description: `${Math.max(this.currentCount - 1, 0)} conditions true → Fail`, 
            result: false 
          }
        );
        break;
    }
    
    return scenarios;
  }

  getConfigSummary(): string {
    const totalConditions = this.getConditionsArray().length;
    
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        return `atLeast(${this.currentCount}, [${totalConditions} conditions])`;
      case 'exactly':
        return `exactly(${this.currentCount}, [${totalConditions} conditions])`;
      default:
        return 'Incomplete configuration';
    }
  }

  getSuccessRateRange(): string {
    const totalConditions = this.getConditionsArray().length;
    
    if (totalConditions === 0) return 'N/A';
    
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        const minPercent = Math.round((this.currentCount / totalConditions) * 100);
        return `${minPercent}% - 100%`;
      case 'exactly':
        const exactPercent = Math.round((this.currentCount / totalConditions) * 100);
        return `${exactPercent}%`;
      default:
        return 'N/A';
    }
  }

  isConditionRequired(index: number): boolean {
    switch (this.selectedCardinalityType) {
      case 'atLeast':
        return index < this.currentCount;
      case 'exactly':
        return index < this.currentCount;
      default:
        return false;
    }
  }

  // Event handlers
  onCardinalityTypeChanged(event: MatSelectChange): void {
    this.selectedCardinalityType = event.value as 'atLeast' | 'exactly';
    
    // Reset count to 1 when type changes
    this.cardinalityForm.patchValue({ count: 1 });
    this.currentCount = 1;
  }

  onCountChanged(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value) || 1;
    this.currentCount = Math.max(1, Math.min(value, this.getMaxCount()));
    
    // Update the form control if the value was clamped
    if (this.currentCount !== value) {
      this.cardinalityForm.patchValue({ count: this.currentCount });
    }
  }

  addCondition(): void {
    const conditionsArray = this.getConditionsArray();
    const newConditionId = `condition_${Date.now()}`;
    conditionsArray.push(this.fb.control(newConditionId));
  }

  addMultipleConditions(count: number): void {
    for (let i = 0; i < count; i++) {
      this.addCondition();
    }
  }

  removeCondition(index: number): void {
    const conditionsArray = this.getConditionsArray();
    conditionsArray.removeAt(index);
    
    // Adjust count if it exceeds the new total
    const newTotal = conditionsArray.length;
    if (this.currentCount > newTotal && newTotal > 0) {
      this.currentCount = newTotal;
      this.cardinalityForm.patchValue({ count: this.currentCount });
    }
  }

  editCondition(index: number): void {
    this.editCondition.emit(index);
  }

  onConditionDrop(event: CdkDragDrop<string[]>): void {
    const conditionsArray = this.getConditionsArray();
    const conditions = conditionsArray.value;
    
    moveItemInArray(conditions, event.previousIndex, event.currentIndex);
    
    // Rebuild the FormArray with reordered items
    conditionsArray.clear();
    conditions.forEach((condition: string) => {
      conditionsArray.push(this.fb.control(condition));
    });
  }

  // Validation methods
  hasValidationErrors(): boolean {
    return this.getValidationErrors().length > 0;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.cardinalityForm.get('cardinalityType')?.value) {
      errors.push('Cardinality type is required');
    }
    
    if (!this.cardinalityForm.get('count')?.value || this.cardinalityForm.get('count')?.value < 1) {
      errors.push('Count must be at least 1');
    }
    
    const totalConditions = this.getConditionsArray().length;
    
    if (totalConditions === 0) {
      errors.push('At least one condition is required');
    }
    
    if (this.currentCount > totalConditions) {
      errors.push(`Count (${this.currentCount}) cannot exceed total conditions (${totalConditions})`);
    }
    
    return errors;
  }

  isValid(): boolean {
    return this.cardinalityForm.valid && !this.hasValidationErrors();
  }
}