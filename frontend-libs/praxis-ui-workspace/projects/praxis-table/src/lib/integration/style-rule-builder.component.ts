import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
// MatColorPickerModule não está disponível, usando input type="color"
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { Subject, takeUntil, debounceTime } from 'rxjs';

import { ColumnDefinition } from '@praxis/core';
// import { RuleBuilderService, RuleEditorComponent, FieldSchema, RuleBuilderConfig } from '@praxis/visual-builder';
// Simulando interfaces até integração completa
interface FieldSchema {
  name: string;
  label: string;
  type: string;
  required: boolean;
  metadata?: any;
}

interface RuleBuilderConfig {
  fieldSchemas: FieldSchema[];
  allowedRuleTypes?: string[];
  contextVariables?: any;
}
import { 
  TableRuleEngineService, 
  ConditionalStyle, 
  CellStyles, 
  VisualRule,
  ValidationResult
} from './table-rule-engine.service';

@Component({
  selector: 'style-rule-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    // MatColorPickerModule não disponível
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressBarModule,
    DragDropModule,
    // RuleEditorComponent - temporarily disabled
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="style-rule-builder">
      <!-- Header Section -->
      <div class="header-section">
        <div class="title-area">
          <h3>
            <mat-icon>palette</mat-icon>
            Formatação Condicional
          </h3>
          <p class="subtitle">Configure estilos que mudam baseado nos valores das células</p>
        </div>
        
        <div class="header-actions">
          <button mat-raised-button 
                  color="primary" 
                  (click)="addNewRule()"
                  [disabled]="isCreatingRule">
            <mat-icon>add</mat-icon>
            Nova Regra
          </button>
          
          <button mat-button 
                  (click)="openTemplateGallery()">
            <mat-icon>collections</mat-icon>
            Templates
          </button>
          
          <button mat-icon-button 
                  [matTooltip]="showPreview ? 'Ocultar Preview' : 'Mostrar Preview'"
                  (click)="togglePreview()">
            <mat-icon>{{ showPreview ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Preview Section -->
      <div *ngIf="showPreview" class="preview-section">
        <mat-card class="preview-card">
          <mat-card-header>
            <mat-card-title>Preview das Regras</mat-card-title>
            <mat-card-subtitle>Veja como suas regras são aplicadas</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="preview-placeholder">
              <p>Preview será implementado na próxima fase</p>
              <p>{{ conditionalStyles.length }} regra(s) definida(s)</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Rules List -->
      <div class="rules-section">
        <div *ngIf="conditionalStyles.length === 0" class="empty-state">
          <mat-icon class="empty-icon">palette</mat-icon>
          <h4>Nenhuma regra de estilo configurada</h4>
          <p>Adicione regras para aplicar formatação condicional baseada nos dados</p>
          <button mat-raised-button color="primary" (click)="addNewRule()">
            <mat-icon>add</mat-icon>
            Criar Primeira Regra
          </button>
        </div>

        <div *ngIf="conditionalStyles.length > 0" 
             class="rules-list"
             cdkDropList
             (cdkDropListDropped)="onRuleReorder($event)">
          
          <mat-expansion-panel 
            *ngFor="let rule of conditionalStyles; trackBy: trackByRuleId"
            class="rule-panel"
            [class.rule-disabled]="!rule.enabled"
            [expanded]="rule.id === expandedRuleId"
            (opened)="onRuleExpanded(rule.id)"
            (closed)="onRuleClosed()"
            cdkDrag>
            
            <mat-expansion-panel-header>
              <mat-panel-title>
                <div class="rule-header">
                  <div class="rule-info">
                    <mat-icon class="drag-handle" cdkDragHandle>drag_indicator</mat-icon>
                    <span class="rule-name">{{ rule.name }}</span>
                    <mat-chip 
                      class="priority-chip" 
                      [class]="'priority-' + getPriorityLevel(rule.priority)">
                      P{{ rule.priority }}
                    </mat-chip>
                  </div>
                  
                  <div class="rule-preview" [style]="getStylePreview(rule.styles)">
                    <span class="preview-text">Amostra</span>
                  </div>
                </div>
              </mat-panel-title>
              
              <mat-panel-description>
                <div class="rule-description">
                  <span>{{ rule.description || 'Sem descrição' }}</span>
                  <div class="rule-actions" (click)="$event.stopPropagation()">
                    <mat-slide-toggle
                      [checked]="rule.enabled"
                      (change)="toggleRule(rule, $event)"
                      matTooltip="Ativar/Desativar regra">
                    </mat-slide-toggle>
                  </div>
                </div>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <!-- Rule Editor Content -->
            <div class="rule-content">
              <mat-tab-group>
                <!-- Condition Tab -->
                <mat-tab label="Condição">
                  <div class="condition-editor">
                    <mat-form-field appearance="outline" class="rule-name-field">
                      <mat-label>Nome da Regra</mat-label>
                      <input matInput 
                             [(ngModel)]="rule.name"
                             (blur)="onRuleUpdated(rule)"
                             placeholder="Ex: Destacar valores altos">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="rule-description-field">
                      <mat-label>Descrição (opcional)</mat-label>
                      <textarea matInput 
                                [(ngModel)]="rule.description"
                                (blur)="onRuleUpdated(rule)"
                                placeholder="Descreva quando esta regra deve ser aplicada"
                                rows="2">
                      </textarea>
                    </mat-form-field>

                    <div class="visual-rule-editor">
                      <h4>Condição para Aplicar o Estilo</h4>
                      <div class="simple-condition-editor">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Condição (DSL)</mat-label>
                          <textarea matInput 
                                    [(ngModel)]="rule.condition.dsl"
                                    [ngModelOptions]="{standalone: true}"
                                    (change)="onConditionDslChanged(rule, rule.condition.dsl)"
                                    placeholder="Ex: value > 100 && status === 'active'"
                                    rows="3">
                          </textarea>
                          <mat-hint>Use JavaScript para definir quando aplicar o estilo</mat-hint>
                        </mat-form-field>
                      </div>
                    </div>

                    <!-- Rule Validation -->
                    <div *ngIf="ruleValidations[rule.id]" class="rule-validation">
                      <mat-progress-bar 
                        *ngIf="ruleValidations[rule.id].isValidating" 
                        mode="indeterminate">
                      </mat-progress-bar>
                      
                      <div *ngIf="!ruleValidations[rule.id].isValidating" class="validation-results">
                        <div class="validation-stats">
                          <mat-chip *ngIf="ruleValidations[rule.id].result" [class]="getValidationClass(ruleValidations[rule.id].result!)">
                            <mat-icon>{{ getValidationIcon(ruleValidations[rule.id].result!) }}</mat-icon>
                            {{ ruleValidations[rule.id].result!.coverage.toFixed(0) }}% dos dados
                          </mat-chip>
                          
                          <mat-chip *ngIf="ruleValidations[rule.id].result" class="performance-chip">
                            <mat-icon>speed</mat-icon>
                            {{ ruleValidations[rule.id].result!.performance.toFixed(1) }}ms
                          </mat-chip>
                        </div>
                        
                        <div *ngIf="ruleValidations[rule.id].result && ruleValidations[rule.id].result!.errors.length > 0" class="validation-errors">
                          <mat-icon color="warn">error</mat-icon>
                          <span>{{ ruleValidations[rule.id].result!.errors.length }} erro(s) encontrado(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-tab>

                <!-- Style Tab -->
                <mat-tab label="Estilo">
                  <div class="style-editor">
                    <!-- Style Designer será implementado como formulário simples -->
                    <div class="simple-style-editor">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Cor de Fundo</mat-label>
                        <input matInput 
                               type="color" 
                               [(ngModel)]="rule.styles.backgroundColor"
                               [ngModelOptions]="{standalone: true}"
                               (change)="onStylesChanged(rule, rule.styles)">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Cor do Texto</mat-label>
                        <input matInput 
                               type="color" 
                               [(ngModel)]="rule.styles.textColor"
                               [ngModelOptions]="{standalone: true}"
                               (change)="onStylesChanged(rule, rule.styles)">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Peso da Fonte</mat-label>
                        <mat-select [(value)]="rule.styles.fontWeight" 
                                   (selectionChange)="onStylesChanged(rule, rule.styles)">
                          <mat-option value="normal">Normal</mat-option>
                          <mat-option value="bold">Negrito</mat-option>
                          <mat-option value="bolder">Mais Negrito</mat-option>
                          <mat-option value="lighter">Mais Leve</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </div>
                </mat-tab>

                <!-- Advanced Tab -->
                <mat-tab label="Avançado">
                  <div class="advanced-settings">
                    <mat-form-field appearance="outline">
                      <mat-label>Prioridade</mat-label>
                      <mat-select [(value)]="rule.priority" (selectionChange)="onRuleUpdated(rule)">
                        <mat-option value="1">1 - Mais Baixa</mat-option>
                        <mat-option value="2">2 - Baixa</mat-option>
                        <mat-option value="3">3 - Normal</mat-option>
                        <mat-option value="4">4 - Alta</mat-option>
                        <mat-option value="5">5 - Mais Alta</mat-option>
                      </mat-select>
                      <mat-hint>Regras com prioridade maior são aplicadas primeiro</mat-hint>
                    </mat-form-field>

                    <div class="rule-metadata">
                      <p><strong>Criada em:</strong> {{ rule.createdAt | date:'medium' }}</p>
                      <p><strong>Modificada em:</strong> {{ rule.modifiedAt | date:'medium' }}</p>
                      <p><strong>Campos utilizados:</strong></p>
                      <div class="field-dependencies-chips">
                        <mat-chip *ngFor="let field of rule.condition.fieldDependencies">
                          {{ field }}
                        </mat-chip>
                      </div>
                    </div>

                    <div class="rule-actions-advanced">
                      <button mat-button color="primary" (click)="duplicateRule(rule)">
                        <mat-icon>content_copy</mat-icon>
                        Duplicar Regra
                      </button>
                      
                      <button mat-button (click)="exportRule(rule)">
                        <mat-icon>download</mat-icon>
                        Exportar
                      </button>
                      
                      <button mat-button color="warn" (click)="deleteRule(rule)">
                        <mat-icon>delete</mat-icon>
                        Excluir
                      </button>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </div>
          </mat-expansion-panel>
        </div>
      </div>

      <!-- Quick Actions -->
      <div *ngIf="conditionalStyles.length > 0" class="quick-actions">
        <button mat-button (click)="enableAllRules()">
          <mat-icon>visibility</mat-icon>
          Ativar Todas
        </button>
        
        <button mat-button (click)="disableAllRules()">
          <mat-icon>visibility_off</mat-icon>
          Desativar Todas
        </button>
        
        <button mat-button (click)="validateAllRules()">
          <mat-icon>check_circle</mat-icon>
          Validar Todas
        </button>
        
        <button mat-button (click)="clearAllRules()">
          <mat-icon>clear_all</mat-icon>
          Limpar Todas
        </button>
      </div>
    </div>
  `,
  styles: [`
    .style-rule-builder {
      padding: 16px;
      max-height: 600px;
      overflow-y: auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
    }

    .title-area h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: var(--mdc-theme-primary);
    }

    .subtitle {
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .preview-section {
      margin-bottom: 24px;
    }

    .preview-card {
      border: 1px solid var(--mdc-theme-outline-variant);
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mdc-theme-outline);
      margin-bottom: 16px;
    }

    .rules-section {
      min-height: 200px;
    }

    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rule-panel {
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .rule-panel:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .rule-panel.rule-disabled {
      opacity: 0.6;
      background: var(--mdc-theme-surface-variant);
    }

    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .rule-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .drag-handle {
      cursor: grab;
      color: var(--mdc-theme-outline);
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .rule-name {
      font-weight: 500;
    }

    .priority-chip {
      font-size: 11px;
      min-height: 20px;
    }

    .priority-chip.priority-high {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .priority-chip.priority-medium {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
    }

    .priority-chip.priority-low {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .rule-preview {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
      min-width: 80px;
      justify-content: center;
    }

    .preview-text {
      font-size: 12px;
      font-weight: 500;
    }

    .rule-description {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .rule-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .rule-content {
      padding: 16px 0;
    }

    .condition-editor {
      padding: 16px 0;
    }

    .rule-name-field,
    .rule-description-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .visual-rule-editor {
      margin: 24px 0;
      padding: 16px;
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .visual-rule-editor h4 {
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .rule-validation {
      margin-top: 16px;
      padding: 12px;
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 4px;
      background: var(--mdc-theme-surface-variant);
    }

    .validation-stats {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .validation-stats mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .validation-stats .success {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .validation-stats .warning {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
    }

    .validation-stats .error {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .performance-chip {
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
    }

    .validation-errors {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mdc-theme-error);
      font-size: 14px;
    }

    .style-editor {
      padding: 16px 0;
    }

    .advanced-settings {
      padding: 16px 0;
    }

    .rule-metadata {
      margin: 24px 0;
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 4px;
    }

    .rule-metadata p {
      margin: 8px 0;
      font-size: 14px;
    }

    .rule-actions-advanced {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--mdc-theme-outline-variant);
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--mdc-theme-outline-variant);
    }

    .field-dependencies-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    /* CDK Drag & Drop Styles */
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

    .cdk-drop-list-dragging .rule-panel:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class StyleRuleBuilderComponent implements OnInit, OnDestroy {
  @Input() column!: ColumnDefinition;
  @Input() fieldSchemas: FieldSchema[] = [];
  @Input() sampleData: any[] = [];
  
  @Output() stylesChanged = new EventEmitter<ConditionalStyle[]>();
  @Output() ruleValidated = new EventEmitter<{ ruleId: string; result: ValidationResult }>();

  private destroy$ = new Subject<void>();
  private validationDebounce$ = new Subject<{ rule: ConditionalStyle; immediate?: boolean }>();

  conditionalStyles: ConditionalStyle[] = [];
  expandedRuleId: string | null = null;
  showPreview = true;
  isCreatingRule = false;

  ruleValidations: { [ruleId: string]: { isValidating: boolean; result?: ValidationResult } } = {};
  
  ruleBuilderConfig: RuleBuilderConfig = {
    fieldSchemas: [],
    allowedRuleTypes: ['field-condition', 'boolean-group', 'function-call'],
    contextVariables: {
      _cellValue: 'any',
      _rowIndex: 'number',
      _columnIndex: 'number',
      _now: 'date'
    }
  };

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private tableRuleEngine: TableRuleEngineService
  ) {}

  ngOnInit(): void {
    this.setupRuleBuilderConfig();
    this.setupValidationDebouncing();
    this.loadExistingRules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRuleBuilderConfig(): void {
    this.ruleBuilderConfig = {
      ...this.ruleBuilderConfig,
      fieldSchemas: this.fieldSchemas
    };
  }

  private setupValidationDebouncing(): void {
    this.validationDebounce$.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(({ rule, immediate }) => {
      this.validateRule(rule);
    });
  }

  private loadExistingRules(): void {
    const extendedColumn = this.column as any;
    if (extendedColumn?.conditionalStyles) {
      this.conditionalStyles = [...extendedColumn.conditionalStyles];
    }
  }

  // Rule Management
  addNewRule(): void {
    if (this.isCreatingRule) return;

    this.isCreatingRule = true;

    const newRule: ConditionalStyle = {
      id: this.generateRuleId(),
      name: `Regra ${this.conditionalStyles.length + 1}`,
      description: '',
      condition: {
        specification: null,
        dsl: '',
        description: '',
        fieldDependencies: []
      },
      styles: {
        backgroundColor: '#e3f2fd',
        textColor: '#1976d2'
      },
      priority: 3,
      enabled: true,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    this.conditionalStyles.push(newRule);
    this.expandedRuleId = newRule.id;
    this.isCreatingRule = false;
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  duplicateRule(rule: ConditionalStyle): void {
    const duplicatedRule: ConditionalStyle = {
      ...rule,
      id: this.generateRuleId(),
      name: `${rule.name} (Cópia)`,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    this.conditionalStyles.push(duplicatedRule);
    this.expandedRuleId = duplicatedRule.id;
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  deleteRule(rule: ConditionalStyle): void {
    if (confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) {
      this.conditionalStyles = this.conditionalStyles.filter(r => r.id !== rule.id);
      
      if (this.expandedRuleId === rule.id) {
        this.expandedRuleId = null;
      }
      
      delete this.ruleValidations[rule.id];
      
      this.emitStylesChanged();
      this.cdr.detectChanges();
    }
  }

  toggleRule(rule: ConditionalStyle, change: MatSlideToggleChange): void {
    rule.enabled = change.checked;
    rule.modifiedAt = new Date();
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  onRuleExpanded(ruleId: string): void {
    this.expandedRuleId = ruleId;
  }

  onRuleClosed(): void {
    this.expandedRuleId = null;
  }

  onRuleReorder(event: CdkDragDrop<ConditionalStyle[]>): void {
    // Move rule in array
    const rule = this.conditionalStyles[event.previousIndex];
    this.conditionalStyles.splice(event.previousIndex, 1);
    this.conditionalStyles.splice(event.currentIndex, 0, rule);
    
    // Update priorities based on new order
    this.conditionalStyles.forEach((rule, index) => {
      rule.priority = this.conditionalStyles.length - index;
      rule.modifiedAt = new Date();
    });
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  // Rule Configuration
  onConditionChanged(rule: ConditionalStyle, specification: any): void {
    try {
      // Convert specification to DSL (simplified version)
      const dsl = specification ? JSON.stringify(specification) : '';
      
      rule.condition = {
        specification,
        dsl,
        description: this.generateRuleDescription(specification),
        fieldDependencies: this.extractFieldDependencies(specification)
      };
      
      rule.modifiedAt = new Date();
      
      // Trigger validation
      this.validationDebounce$.next({ rule });
      
      this.emitStylesChanged();
    } catch (error) {
      console.error('Error updating rule condition:', error);
      this.snackBar.open('Erro ao atualizar condição da regra', 'Fechar', { duration: 3000 });
    }
  }

  onConditionDslChanged(rule: ConditionalStyle, dsl: string): void {
    try {
      rule.condition = {
        specification: null, // Will be parsed from DSL
        dsl,
        description: this.generateRuleDescription(dsl),
        fieldDependencies: this.extractFieldDependencies(dsl)
      };
      
      rule.modifiedAt = new Date();
      
      // Trigger validation
      this.validationDebounce$.next({ rule });
      
      this.emitStylesChanged();
    } catch (error) {
      console.error('Error updating rule condition DSL:', error);
      this.snackBar.open('Erro ao atualizar condição da regra', 'Fechar', { duration: 3000 });
    }
  }

  onStylesChanged(rule: ConditionalStyle, styles: CellStyles): void {
    rule.styles = { ...styles };
    rule.modifiedAt = new Date();
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  onRuleUpdated(rule: ConditionalStyle): void {
    rule.modifiedAt = new Date();
    this.emitStylesChanged();
  }

  // Preview and Validation
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onPreviewStyleClicked(event: any): void {
    // Method for handling preview style clicks - placeholder
    console.log('Preview style clicked:', event);
  }

  private validateRule(rule: ConditionalStyle): void {
    if (!rule.condition.specification || !this.sampleData.length) {
      return;
    }

    this.ruleValidations[rule.id] = { isValidating: true };
    this.cdr.detectChanges();

    try {
      const result = this.tableRuleEngine.validateRule(rule.condition, this.sampleData);
      
      this.ruleValidations[rule.id] = {
        isValidating: false,
        result
      };
      
      this.ruleValidated.emit({ ruleId: rule.id, result });
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error validating rule:', error);
      this.ruleValidations[rule.id] = { isValidating: false };
      this.cdr.detectChanges();
    }
  }

  validateAllRules(): void {
    this.conditionalStyles.forEach(rule => {
      if (rule.enabled && rule.condition.specification) {
        this.validationDebounce$.next({ rule, immediate: true });
      }
    });
  }

  // Bulk Actions
  enableAllRules(): void {
    this.conditionalStyles.forEach(rule => {
      rule.enabled = true;
      rule.modifiedAt = new Date();
    });
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  disableAllRules(): void {
    this.conditionalStyles.forEach(rule => {
      rule.enabled = false;
      rule.modifiedAt = new Date();
    });
    
    this.emitStylesChanged();
    this.cdr.detectChanges();
  }

  clearAllRules(): void {
    if (confirm('Tem certeza que deseja remover todas as regras de estilo?')) {
      this.conditionalStyles = [];
      this.ruleValidations = {};
      this.expandedRuleId = null;
      
      this.emitStylesChanged();
      this.cdr.detectChanges();
    }
  }

  // Template and Export
  openTemplateGallery(): void {
    // Implementation for template gallery dialog
    console.log('Open template gallery');
  }

  exportRule(rule: ConditionalStyle): void {
    const exportData = {
      rule,
      exportDate: new Date(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-rule-${rule.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Utility Methods
  trackByRuleId(index: number, rule: ConditionalStyle): string {
    return rule.id;
  }

  getPriorityLevel(priority: number): string {
    if (priority >= 4) return 'high';
    if (priority >= 3) return 'medium';
    return 'low';
  }

  getStylePreview(styles: CellStyles): any {
    return {
      'background-color': styles.backgroundColor,
      'color': styles.textColor,
      'font-weight': styles.fontWeight,
      'font-style': styles.fontStyle,
      'text-decoration': styles.textDecoration,
      'border': styles.border ? `${styles.border.width} ${styles.border.style} ${styles.border.color}` : undefined,
      'border-radius': styles.borderRadius,
      'opacity': styles.opacity
    };
  }

  getPreviewDataForRule(rule: ConditionalStyle): any[] {
    // Return sample data that would match this rule for preview
    return this.sampleData.slice(0, 3);
  }

  getValidationClass(result: ValidationResult): string {
    if (!result.isValid || result.errors.length > 0) return 'error';
    if (result.warnings.length > 0) return 'warning';
    return 'success';
  }

  getValidationIcon(result: ValidationResult): string {
    if (!result.isValid || result.errors.length > 0) return 'error';
    if (result.warnings.length > 0) return 'warning';
    return 'check_circle';
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleDescription(specification: any): string {
    // Generate human-readable description from specification
    if (!specification) return '';
    
    try {
      // This would integrate with the specification bridge to generate descriptions
      return 'Regra personalizada'; // Placeholder
    } catch (error) {
      return 'Descrição não disponível';
    }
  }

  private extractFieldDependencies(specification: any): string[] {
    // Extract field names referenced in the specification
    if (!specification) return [];
    
    try {
      // This would analyze the specification to find field references
      return []; // Placeholder
    } catch (error) {
      return [];
    }
  }

  private emitStylesChanged(): void {
    this.stylesChanged.emit([...this.conditionalStyles]);
  }
}