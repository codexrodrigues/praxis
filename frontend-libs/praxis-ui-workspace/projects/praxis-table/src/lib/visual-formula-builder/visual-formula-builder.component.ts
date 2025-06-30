import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import {
  FormulaDefinition,
  FieldSchema,
  FormulaType,
  FORMULA_TEMPLATES,
  FormulaTemplate,
  FormulaParameterSchema
} from './formula-types';
import { FormulaGeneratorService } from './formula-generator.service';

@Component({
  selector: 'visual-formula-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="visual-formula-builder">
      <!-- Formula Type Selection -->
      <mat-card class="formula-type-card">
        <mat-card-header class="compact-header">
          <mat-icon mat-card-avatar class="formula-icon">functions</mat-icon>
          <mat-card-title>Construtor de Fórmulas</mat-card-title>
          <mat-card-subtitle>Configure como o valor da coluna será calculado</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="formula-type-select">
            <mat-label>Tipo de Fórmula</mat-label>
            <mat-select [(ngModel)]="selectedFormulaType" (ngModelChange)="onFormulaTypeChange($event)">
              <mat-option *ngFor="let template of formulaTemplates" [value]="template.type">
                <div class="formula-option">
                  <mat-icon class="option-icon">{{ template.icon }}</mat-icon>
                  <div class="option-content">
                    <span class="option-label">{{ template.label }}</span>
                    <span class="option-description">{{ template.description }}</span>
                  </div>
                </div>
              </mat-option>
            </mat-select>
            <mat-hint>Selecione como o valor será calculado</mat-hint>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Dynamic Parameter Builder -->
      <mat-card *ngIf="selectedTemplate && selectedTemplate.type !== 'none'" class="parameters-card">
        <mat-card-header class="compact-header">
          <mat-icon mat-card-avatar class="params-icon">{{ selectedTemplate.icon }}</mat-icon>
          <mat-card-title>{{ selectedTemplate.label }}</mat-card-title>
          <mat-card-subtitle>{{ selectedTemplate.description }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form class="parameters-form">
            <div *ngFor="let paramSchema of selectedTemplate.parameterSchema" class="parameter-field">

              <!-- Field Selector -->
              <mat-form-field *ngIf="paramSchema.type === 'field'" appearance="outline" class="full-width">
                <mat-label>{{ paramSchema.label }}</mat-label>
                <mat-select
                  [(ngModel)]="currentParams[paramSchema.key]"
                  [name]="paramSchema.key"
                  [multiple]="isMultiSelectField(paramSchema.key)"
                  (ngModelChange)="onParameterChange()">
                  <mat-option *ngFor="let field of availableDataSchema" [value]="field.name">
                    <div class="field-option">
                      <mat-icon class="field-type-icon">{{ getFieldTypeIcon(field.type) }}</mat-icon>
                      <div class="field-info">
                        <span class="field-label">{{ field.label }}</span>
                        <span class="field-name">{{ field.name }}</span>
                      </div>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-hint>{{ paramSchema.hint }}</mat-hint>
              </mat-form-field>

              <!-- Text Input -->
              <mat-form-field *ngIf="paramSchema.type === 'text'" appearance="outline" class="full-width">
                <mat-label>{{ paramSchema.label }}</mat-label>
                <input
                  matInput
                  [(ngModel)]="currentParams[paramSchema.key]"
                  [name]="paramSchema.key"
                  [placeholder]="paramSchema.placeholder || ''"
                  (ngModelChange)="onParameterChange()">
                <mat-hint>{{ paramSchema.hint }}</mat-hint>
              </mat-form-field>

              <!-- Number Input -->
              <mat-form-field *ngIf="paramSchema.type === 'number'" appearance="outline" class="full-width">
                <mat-label>{{ paramSchema.label }}</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="currentParams[paramSchema.key]"
                  [name]="paramSchema.key"
                  [placeholder]="paramSchema.placeholder || ''"
                  (ngModelChange)="onParameterChange()">
                <mat-hint>{{ paramSchema.hint }}</mat-hint>
              </mat-form-field>

              <!-- Boolean Checkbox -->
              <div *ngIf="paramSchema.type === 'boolean'" class="checkbox-field">
                <mat-checkbox
                  [(ngModel)]="currentParams[paramSchema.key]"
                  [name]="paramSchema.key"
                  (ngModelChange)="onParameterChange()">
                  {{ paramSchema.label }}
                </mat-checkbox>
                <div class="checkbox-hint">{{ paramSchema.hint }}</div>
              </div>

              <!-- Select Dropdown -->
              <mat-form-field *ngIf="paramSchema.type === 'select'" appearance="outline" class="full-width">
                <mat-label>{{ paramSchema.label }}</mat-label>
                <mat-select
                  [(ngModel)]="currentParams[paramSchema.key]"
                  [name]="paramSchema.key"
                  (ngModelChange)="onParameterChange()">
                  <mat-option *ngFor="let option of paramSchema.options" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
                <mat-hint>{{ paramSchema.hint }}</mat-hint>
              </mat-form-field>

            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Generated Expression Preview -->
      <mat-card *ngIf="generatedExpressionChange" class="expression-preview-card">
        <mat-card-header class="compact-header">
          <mat-icon mat-card-avatar class="preview-icon">code</mat-icon>
          <mat-card-title>Expressão Gerada</mat-card-title>
          <mat-card-subtitle>Código JavaScript que será executado</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Expressão JavaScript</mat-label>
            <textarea
              matInput
              [value]="generatedExpressionChange"
              readonly
              rows="3"
              class="expression-textarea">
            </textarea>
            <mat-hint>Esta expressão será avaliada para cada linha da tabela</mat-hint>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Formula Testing -->
      <mat-expansion-panel *ngIf="generatedExpressionChange" class="test-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>science</mat-icon>
            Testar Fórmula
          </mat-panel-title>
          <mat-panel-description>
            Teste a fórmula com dados de exemplo
          </mat-panel-description>
        </mat-expansion-panel-header>

        <div class="test-content">
          <div class="test-actions">
            <button mat-raised-button color="primary" (click)="testFormula()">
              <mat-icon>play_arrow</mat-icon>
              Executar Teste
            </button>
            <button mat-button (click)="showSampleData = !showSampleData">
              <mat-icon>data_object</mat-icon>
              {{ showSampleData ? 'Ocultar' : 'Ver' }} Dados de Teste
            </button>
          </div>

          <mat-divider></mat-divider>

          <!-- Sample Data Display -->
          <div *ngIf="showSampleData" class="sample-data-section">
            <h4>Dados de Exemplo:</h4>
            <pre class="sample-data">{{ sampleDataJson }}</pre>
          </div>

          <!-- Test Result -->
          <div *ngIf="testResult" class="test-result">
            <h4>Resultado do Teste:</h4>
            <div *ngIf="testResult.success" class="success-result">
              <mat-icon class="result-icon success">check_circle</mat-icon>
              <span class="result-value">{{ formatTestResult(testResult.result) }}</span>
            </div>
            <div *ngIf="!testResult.success" class="error-result">
              <mat-icon class="result-icon error">error</mat-icon>
              <span class="error-message">{{ testResult.error }}</span>
            </div>
          </div>

          <!-- Validation Errors -->
          <div *ngIf="validationErrors.length > 0" class="validation-errors">
            <h4>Erros de Validação:</h4>
            <mat-chip-set>
              <mat-chip *ngFor="let error of validationErrors" class="error-chip">
                <mat-icon matChipAvatar>error</mat-icon>
                {{ error }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .visual-formula-builder {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .formula-type-card,
    .parameters-card,
    .expression-preview-card {
      background-color: var(--mat-sys-surface-container-low);
    }

    .compact-header {
      padding-bottom: 8px;
    }

    .compact-header .mat-mdc-card-title {
      font-size: 1.1rem;
      margin-bottom: 4px;
    }

    .compact-header .mat-mdc-card-subtitle {
      font-size: 0.875rem;
    }

    .formula-icon,
    .params-icon,
    .preview-icon {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .formula-type-select {
      width: 100%;
    }

    .formula-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .option-icon {
      color: var(--mat-sys-primary);
      font-size: 20px;
    }

    .option-content {
      display: flex;
      flex-direction: column;
    }

    .option-label {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .option-description {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .parameters-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .parameter-field {
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    .field-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-type-icon {
      font-size: 16px;
      color: var(--mat-sys-outline);
    }

    .field-info {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .field-name {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      font-family: monospace;
    }

    .checkbox-field {
      padding: 8px 0;
    }

    .checkbox-hint {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
      margin-left: 32px;
    }

    .expression-textarea {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
    }

    .test-panel {
      margin-top: 8px;
    }

    .test-content {
      padding: 16px 0;
    }

    .test-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .sample-data-section {
      margin: 16px 0;
    }

    .sample-data {
      background-color: var(--mat-sys-surface-container);
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
    }

    .test-result {
      margin: 16px 0;
    }

    .success-result,
    .error-result {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 4px;
    }

    .success-result {
      background-color: rgba(76, 175, 80, 0.1);
      color: var(--mat-sys-primary);
    }

    .error-result {
      background-color: rgba(244, 67, 54, 0.1);
      color: var(--mat-sys-error);
    }

    .result-icon.success {
      color: var(--mat-sys-primary);
    }

    .result-icon.error {
      color: var(--mat-sys-error);
    }

    .result-value {
      font-weight: 500;
      font-family: monospace;
    }

    .validation-errors {
      margin: 16px 0;
    }

    .error-chip {
      background-color: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .test-actions {
        flex-direction: column;
      }

      .sample-data {
        font-size: 10px;
      }
    }
  `]
})
export class VisualFormulaBuilderComponent implements OnInit, OnChanges {

  @Input() availableDataSchema: FieldSchema[] = [];
  @Input() currentFormula?: FormulaDefinition;

  @Output() formulaChange = new EventEmitter<FormulaDefinition>();
  @Output() generatedExpressionChange = new EventEmitter<string>();

  // Component state
  formulaTemplates = FORMULA_TEMPLATES;
  selectedFormulaType: FormulaType = 'none';
  selectedTemplate?: FormulaTemplate;
  currentParams: any = {};
  generatedExpressionValue = '';
  validationErrors: string[] = [];

  // Testing
  showSampleData = false;
  testResult?: { success: boolean; result?: any; error?: string };
  sampleDataJson = '';

  constructor(
    private formulaGenerator: FormulaGeneratorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sampleDataJson = JSON.stringify(this.formulaGenerator.getSampleData(), null, 2);
    this.initializeFromCurrentFormula();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFormula'] && !changes['currentFormula'].firstChange) {
      this.initializeFromCurrentFormula();
    }
    if (changes['availableDataSchema']) {
      this.cdr.markForCheck();
    }
  }

  private initializeFromCurrentFormula(): void {
    if (this.currentFormula) {
      this.selectedFormulaType = this.currentFormula.type;
      this.currentParams = { ...this.currentFormula.params };
      this.updateSelectedTemplate();
      this.generateAndEmitExpression();
    }
  }

  onFormulaTypeChange(formulaType: FormulaType): void {
    this.selectedFormulaType = formulaType;
    this.currentParams = {};
    this.updateSelectedTemplate();
    this.generateAndEmitExpression();
  }

  private updateSelectedTemplate(): void {
    this.selectedTemplate = this.formulaTemplates.find(t => t.type === this.selectedFormulaType);
    this.cdr.markForCheck();
  }

  onParameterChange(): void {
    this.generateAndEmitExpression();
  }

  private generateAndEmitExpression(): void {
    const formula: FormulaDefinition = {
      type: this.selectedFormulaType,
      params: { ...this.currentParams }
    };

    // Validate formula
    const validation = this.formulaGenerator.validateFormula(formula);
    this.validationErrors = validation.errors;

    // Generate expression
    this.generatedExpressionValue = validation.valid
      ? this.formulaGenerator.generateExpression(formula)
      : '';

    // Emit changes
    this.formulaChange.emit(formula);
    this.generatedExpressionChange.emit(this.generatedExpressionValue);

    this.cdr.markForCheck();
  }

  get generatedExpression(): string {
    return this.generatedExpressionValue;
  }

  isMultiSelectField(paramKey: string): boolean {
    return paramKey === 'fields'; // Only 'fields' parameter supports multiple selection
  }

  getFieldTypeIcon(fieldType: string): string {
    switch (fieldType) {
      case 'string': return 'text_fields';
      case 'number': return 'numbers';
      case 'boolean': return 'toggle_on';
      case 'date': return 'calendar_today';
      case 'object': return 'data_object';
      case 'array': return 'data_array';
      default: return 'help';
    }
  }

  testFormula(): void {
    if (!this.generatedExpressionValue) {
      return;
    }

    const formula: FormulaDefinition = {
      type: this.selectedFormulaType,
      params: { ...this.currentParams }
    };

    this.testResult = this.formulaGenerator.testFormula(formula);
    this.cdr.markForCheck();
  }

  formatTestResult(result: any): string {
    if (result === null || result === undefined) {
      return 'null';
    }
    if (typeof result === 'string') {
      return `"${result}"`;
    }
    return String(result);
  }
}
