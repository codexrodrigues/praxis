import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subject, BehaviorSubject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { DslParser, DslValidator, ValidationIssue } from '@praxis/specification';
import { FieldSchema } from '../models/field-schema.model';
import { SpecificationBridgeService } from '../services/specification-bridge.service';

/**
 * Autocomplete suggestion for DSL editor
 */
export interface DslSuggestion {
  /** Text to insert */
  text: string;
  /** Display label */
  label: string;
  /** Suggestion type */
  type: 'field' | 'function' | 'operator' | 'variable' | 'keyword' | 'value';
  /** Description for tooltip */
  description?: string;
  /** Additional info like function signature */
  detail?: string;
  /** Insert position offset */
  insertOffset?: number;
}

/**
 * Expression validation result
 */
export interface ExpressionValidationResult {
  /** Whether the expression is valid */
  isValid: boolean;
  /** Validation issues */
  issues: ValidationIssue[];
  /** Parsed specification (if valid) */
  specification?: any;
  /** Performance metrics */
  metrics?: {
    parseTime: number;
    complexity: number;
  };
}

/**
 * Context variable for suggestions
 */
export interface ContextVariable {
  /** Variable name */
  name: string;
  /** Variable type */
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  /** Variable scope */
  scope: 'user' | 'session' | 'env' | 'global';
  /** Description */
  description?: string;
  /** Example value */
  example?: string;
}

@Component({
  selector: 'praxis-expression-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="expression-editor">
      <!-- Editor Header -->
      <div class="editor-header">
        <div class="header-title">
          <mat-icon>code</mat-icon>
          <span>Expression Editor</span>
        </div>
        <div class="header-actions">
          <button mat-icon-button 
                  matTooltip="Format Expression"
                  (click)="formatExpression()">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          <button mat-icon-button 
                  matTooltip="Validate Expression"
                  (click)="validateExpression()">
            <mat-icon>check_circle</mat-icon>
          </button>
          <button mat-icon-button 
                  [matMenuTriggerFor]="helpMenu"
                  matTooltip="Help & Examples">
            <mat-icon>help</mat-icon>
          </button>
        </div>
      </div>

      <!-- Main Editor Area -->
      <div class="editor-content">
        <!-- Expression Input -->
        <div class="expression-input-container">
          <mat-form-field appearance="outline" class="expression-field">
            <mat-label>DSL Expression</mat-label>
            <textarea matInput
                      #expressionTextarea
                      [formControl]="expressionControl"
                      [placeholder]="placeholder"
                      rows="4"
                      spellcheck="false"
                      autocomplete="off"
                      (keydown)="onKeyDown($event)"
                      (keyup)="onKeyUp($event)"
                      (click)="onCursorChange($event)"
                      (blur)="hideSuggestions()"
                      class="expression-textarea"></textarea>
            <mat-hint>{{ getExpressionHint() }}</mat-hint>
            <mat-error *ngIf="validationResult && !validationResult.isValid">
              {{ getFirstError() }}
            </mat-error>
          </mat-form-field>

          <!-- Syntax Highlighting Overlay -->
          <div class="syntax-overlay" 
               [innerHTML]="highlightedExpression"
               *ngIf="enableSyntaxHighlighting">
          </div>
        </div>

        <!-- Autocomplete Suggestions -->
        <div class="suggestions-panel" 
             *ngIf="showSuggestions && suggestions.length > 0"
             [style.top.px]="suggestionPosition.top"
             [style.left.px]="suggestionPosition.left">
          <mat-list class="suggestions-list">
            <mat-list-item *ngFor="let suggestion of suggestions; let i = index"
                          [class.selected]="i === selectedSuggestionIndex"
                          (click)="applySuggestion(suggestion)"
                          class="suggestion-item">
              <mat-icon matListIcon [class]="'suggestion-icon-' + suggestion.type">
                {{ getSuggestionIcon(suggestion.type) }}
              </mat-icon>
              <div matLine class="suggestion-text">
                <span class="suggestion-label">{{ suggestion.label }}</span>
                <span class="suggestion-detail" *ngIf="suggestion.detail">{{ suggestion.detail }}</span>
              </div>
              <div matLine class="suggestion-description" *ngIf="suggestion.description">
                {{ suggestion.description }}
              </div>
            </mat-list-item>
          </mat-list>
        </div>
      </div>

      <!-- Validation Results -->
      <div class="validation-panel" *ngIf="validationResult">
        <mat-expansion-panel [expanded]="!validationResult.isValid || showValidationDetails">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon [color]="validationResult.isValid ? 'primary' : 'warn'">
                {{ validationResult.isValid ? 'check_circle' : 'error' }}
              </mat-icon>
              <span>Validation Results</span>
            </mat-panel-title>
            <mat-panel-description>
              {{ getValidationSummary() }}
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="validation-content">
            <!-- Validation Issues -->
            <div class="validation-issues" *ngIf="validationResult.issues.length > 0">
              <h4>Issues:</h4>
              <div *ngFor="let issue of validationResult.issues" 
                   class="validation-issue"
                   [class]="'issue-' + issue.severity">
                <mat-icon>{{ getIssueIcon(issue.severity) }}</mat-icon>
                <div class="issue-content">
                  <div class="issue-message">{{ issue.message }}</div>
                  <div class="issue-location" *ngIf="issue.position">
                    Line {{ issue.position.line }}, Column {{ issue.position.column }}
                  </div>
                  <div class="issue-suggestion" *ngIf="issue.suggestion">
                    <strong>Suggestion:</strong> {{ issue.suggestion }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-metrics" *ngIf="validationResult.metrics">
              <h4>Performance:</h4>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span class="metric-label">Parse Time:</span>
                  <span class="metric-value">{{ validationResult.metrics.parseTime }}ms</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Complexity:</span>
                  <span class="metric-value">{{ validationResult.metrics.complexity }}</span>
                </div>
              </div>
            </div>

            <!-- Generated Specification Preview -->
            <div class="specification-preview" *ngIf="validationResult.specification">
              <h4>Generated Specification:</h4>
              <pre class="spec-json">{{ getSpecificationPreview() }}</pre>
            </div>
          </div>
        </mat-expansion-panel>
      </div>

      <!-- Quick Reference Panel -->
      <div class="quick-reference" *ngIf="showQuickReference">
        <mat-card class="reference-card">
          <mat-card-header>
            <mat-card-title>Quick Reference</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-tab-group>
              <!-- Operators Tab -->
              <mat-tab label="Operators">
                <div class="reference-content">
                  <div class="operator-group" *ngFor="let group of operatorGroups">
                    <h5>{{ group.name }}</h5>
                    <mat-chip-listbox>
                      <mat-chip-option *ngFor="let op of group.operators" 
                               (click)="insertAtCursor(op.symbol)"
                               class="clickable-chip">
                        {{ op.symbol }} - {{ op.description }}
                      </mat-chip-option>
                    </mat-chip-listbox>
                  </div>
                </div>
              </mat-tab>

              <!-- Functions Tab -->
              <mat-tab label="Functions">
                <div class="reference-content">
                  <div class="function-group" *ngFor="let group of functionGroups">
                    <h5>{{ group.name }}</h5>
                    <div class="function-list">
                      <div *ngFor="let func of group.functions" 
                           class="function-item"
                           (click)="insertFunction(func)">
                        <code>{{ func.signature }}</code>
                        <p>{{ func.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- Variables Tab -->
              <mat-tab label="Variables">
                <div class="reference-content">
                  <div class="variable-group" *ngFor="let group of contextVariableGroups">
                    <h5>{{ group.scope | titlecase }} Variables</h5>
                    <div class="variable-list">
                      <div *ngFor="let variable of group.variables" 
                           class="variable-item"
                           (click)="insertVariable(variable)">
                        <code>\${{ variable.name }}</code>
                        <span class="variable-type">{{ variable.type }}</span>
                        <p>{{ variable.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Help Menu -->
      <mat-menu #helpMenu="matMenu">
        <button mat-menu-item (click)="showQuickReference = !showQuickReference">
          <mat-icon>library_books</mat-icon>
          Toggle Quick Reference
        </button>
        <button mat-menu-item (click)="showExamples()">
          <mat-icon>lightbulb</mat-icon>
          Show Examples
        </button>
        <button mat-menu-item (click)="openDocumentation()">
          <mat-icon>help_outline</mat-icon>
          Documentation
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .expression-editor {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--mdc-theme-outline);
      margin-bottom: 16px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
      color: var(--mdc-theme-primary);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .editor-content {
      position: relative;
      margin-bottom: 24px;
    }

    .expression-input-container {
      position: relative;
    }

    .expression-field {
      width: 100%;
    }

    .expression-textarea {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
      tab-size: 2;
    }

    .syntax-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
      padding: 16px;
      color: transparent;
      background: transparent;
      z-index: 1;
    }

    .suggestions-panel {
      position: absolute;
      background: white;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      max-width: 400px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
    }

    .suggestions-list {
      padding: 0;
    }

    .suggestion-item {
      cursor: pointer;
      padding: 8px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .suggestion-item:hover,
    .suggestion-item.selected {
      background: var(--mdc-theme-primary-container);
    }

    .suggestion-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .suggestion-label {
      font-weight: 500;
    }

    .suggestion-detail {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      font-family: monospace;
    }

    .suggestion-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      margin-top: 4px;
    }

    .suggestion-icon-field { color: #2196F3; }
    .suggestion-icon-function { color: #FF9800; }
    .suggestion-icon-operator { color: #4CAF50; }
    .suggestion-icon-variable { color: #9C27B0; }
    .suggestion-icon-keyword { color: #F44336; }
    .suggestion-icon-value { color: #607D8B; }

    .validation-panel {
      margin-bottom: 24px;
    }

    .validation-content {
      padding: 16px 0;
    }

    .validation-issues h4,
    .performance-metrics h4,
    .specification-preview h4 {
      margin: 0 0 12px 0;
      color: var(--mdc-theme-primary);
      font-size: 14px;
      font-weight: 500;
    }

    .validation-issue {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .validation-issue.issue-error {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .validation-issue.issue-warning {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .validation-issue.issue-info {
      background: var(--mdc-theme-secondary-container);
      color: var(--mdc-theme-on-secondary-container);
    }

    .issue-content {
      flex: 1;
    }

    .issue-message {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .issue-location {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .issue-suggestion {
      font-size: 12px;
      font-style: italic;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 4px;
    }

    .metric-label {
      font-weight: 500;
    }

    .metric-value {
      color: var(--mdc-theme-primary);
      font-family: monospace;
    }

    .spec-json {
      background: var(--mdc-theme-surface-variant);
      padding: 16px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
    }

    .quick-reference {
      margin-top: 24px;
    }

    .reference-card {
      max-height: 500px;
    }

    .reference-content {
      padding: 16px 0;
      max-height: 350px;
      overflow-y: auto;
    }

    .operator-group,
    .function-group,
    .variable-group {
      margin-bottom: 20px;
    }

    .operator-group h5,
    .function-group h5,
    .variable-group h5 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-primary);
      font-size: 14px;
    }

    .clickable-chip {
      cursor: pointer;
      margin: 2px;
    }

    .clickable-chip:hover {
      background: var(--mdc-theme-primary-container);
    }

    .function-item,
    .variable-item {
      padding: 8px;
      margin: 4px 0;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 4px;
      cursor: pointer;
    }

    .function-item:hover,
    .variable-item:hover {
      background: var(--mdc-theme-surface-variant);
    }

    .function-item code,
    .variable-item code {
      font-weight: 600;
      color: var(--mdc-theme-primary);
    }

    .function-item p,
    .variable-item p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .variable-type {
      background: var(--mdc-theme-secondary-container);
      color: var(--mdc-theme-on-secondary-container);
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 10px;
      margin-left: 8px;
    }

    /* Syntax Highlighting */
    ::ng-deep .syntax-keyword { color: #0000FF; font-weight: bold; }
    ::ng-deep .syntax-operator { color: #FF0000; }
    ::ng-deep .syntax-function { color: #FF8C00; font-weight: bold; }
    ::ng-deep .syntax-field { color: #008000; }
    ::ng-deep .syntax-variable { color: #800080; }
    ::ng-deep .syntax-string { color: #A31515; }
    ::ng-deep .syntax-number { color: #098658; }
    ::ng-deep .syntax-comment { color: #008000; font-style: italic; }
    ::ng-deep .syntax-error { background: #FFE6E6; text-decoration: underline wavy red; }

    /* Responsive Design */
    @media (max-width: 768px) {
      .expression-editor {
        padding: 8px;
      }

      .suggestions-panel {
        max-width: calc(100vw - 32px);
        left: 16px !important;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExpressionEditorComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Enter DSL expression (e.g., ${age} > 18 && status == "active")';
  @Input() fieldSchemas: FieldSchema[] = [];
  @Input() contextVariables: ContextVariable[] = [];
  @Input() enableSyntaxHighlighting = true;
  @Input() enableAutocomplete = true;
  @Input() showQuickReference = false;
  @Input() showValidationDetails = false;
  @Input() initialExpression = '';

  @Output() expressionChanged = new EventEmitter<string>();
  @Output() validationChanged = new EventEmitter<ExpressionValidationResult>();
  @Output() specificationGenerated = new EventEmitter<any>();

  @ViewChild('expressionTextarea', { static: false }) 
  private textareaRef!: ElementRef<HTMLTextAreaElement>;

  // Form controls
  expressionControl = new FormControl('');

  // State management
  private destroy$ = new Subject<void>();
  private parser: DslParser;
  private validator: DslValidator;

  // Suggestion system
  suggestions: DslSuggestion[] = [];
  showSuggestions = false;
  selectedSuggestionIndex = 0;
  suggestionPosition = { top: 0, left: 0 };
  private currentWord = '';
  private cursorPosition = 0;

  // Validation
  validationResult: ExpressionValidationResult | null = null;
  highlightedExpression = '';

  // Reference data
  operatorGroups = [
    {
      name: 'Logical Operators',
      operators: [
        { symbol: '&&', description: 'Logical AND' },
        { symbol: '||', description: 'Logical OR' },
        { symbol: '!', description: 'Logical NOT' },
        { symbol: 'xor', description: 'Exclusive OR' },
        { symbol: 'implies', description: 'Logical implication' }
      ]
    },
    {
      name: 'Comparison Operators',
      operators: [
        { symbol: '==', description: 'Equal to' },
        { symbol: '!=', description: 'Not equal to' },
        { symbol: '<', description: 'Less than' },
        { symbol: '<=', description: 'Less than or equal' },
        { symbol: '>', description: 'Greater than' },
        { symbol: '>=', description: 'Greater than or equal' },
        { symbol: 'in', description: 'Contains value' }
      ]
    }
  ];

  functionGroups = [
    {
      name: 'String Functions',
      functions: [
        { signature: 'contains(field, value)', description: 'Check if field contains value' },
        { signature: 'startsWith(field, prefix)', description: 'Check if field starts with prefix' },
        { signature: 'endsWith(field, suffix)', description: 'Check if field ends with suffix' }
      ]
    },
    {
      name: 'Collection Functions',
      functions: [
        { signature: 'forEach(collection, spec)', description: 'All items must satisfy specification' },
        { signature: 'uniqueBy(collection, field)', description: 'Items must be unique by field' },
        { signature: 'minLength(collection, min)', description: 'Collection minimum length' },
        { signature: 'maxLength(collection, max)', description: 'Collection maximum length' }
      ]
    },
    {
      name: 'Conditional Functions',
      functions: [
        { signature: 'requiredIf(field, condition)', description: 'Field required when condition is true' },
        { signature: 'visibleIf(field, condition)', description: 'Field visible when condition is true' },
        { signature: 'disabledIf(field, condition)', description: 'Field disabled when condition is true' },
        { signature: 'readonlyIf(field, condition)', description: 'Field readonly when condition is true' }
      ]
    }
  ];

  contextVariableGroups: Array<{ scope: string; variables: ContextVariable[] }> = [];

  constructor(
    private bridgeService: SpecificationBridgeService,
    private cdr: ChangeDetectorRef
  ) {
    this.parser = new DslParser();
    this.validator = new DslValidator();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.setupContextVariableGroups();
    this.loadInitialExpression();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormSubscriptions(): void {
    this.expressionControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.onExpressionChange(value || '');
    });
  }

  private setupContextVariableGroups(): void {
    // Group context variables by scope
    const groups = new Map<string, ContextVariable[]>();
    
    this.contextVariables.forEach(variable => {
      if (!groups.has(variable.scope)) {
        groups.set(variable.scope, []);
      }
      groups.get(variable.scope)!.push(variable);
    });

    this.contextVariableGroups = Array.from(groups.entries()).map(([scope, variables]) => ({
      scope,
      variables
    }));
  }

  private loadInitialExpression(): void {
    if (this.initialExpression) {
      this.expressionControl.setValue(this.initialExpression);
    }
  }

  // Expression handling
  private onExpressionChange(expression: string): void {
    this.expressionChanged.emit(expression);
    this.updateSyntaxHighlighting(expression);
    this.validateExpressionDebounced(expression);
  }

  private updateSyntaxHighlighting(expression: string): void {
    if (!this.enableSyntaxHighlighting) {
      this.highlightedExpression = '';
      return;
    }

    // Simple syntax highlighting implementation
    let highlighted = expression
      .replace(/\b(and|or|not|xor|implies|true|false|null)\b/g, '<span class="syntax-keyword">$1</span>')
      .replace(/(\|\||&&|==|!=|<=|>=|<|>|!)/g, '<span class="syntax-operator">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="syntax-function">$1</span>(')
      .replace(/\$\{([^}]+)\}/g, '<span class="syntax-variable">${$1}</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, '<span class="syntax-field">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="syntax-string">"$1"</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>');

    this.highlightedExpression = highlighted;
  }

  private validateExpressionDebounced(expression: string): void {
    if (!expression.trim()) {
      this.validationResult = null;
      this.validationChanged.emit(this.validationResult!);
      return;
    }

    const startTime = performance.now();
    
    try {
      // Validate with DSL validator
      const issues = this.validator.validate(expression);
      const parseTime = performance.now() - startTime;
      
      if (issues.length === 0) {
        // Try to parse if validation passed
        try {
          const specification = this.parser.parse(expression);
          const complexity = this.calculateComplexity(expression);
          
          this.validationResult = {
            isValid: true,
            issues: [],
            specification,
            metrics: {
              parseTime,
              complexity
            }
          };
          
          this.specificationGenerated.emit(specification);
        } catch (parseError) {
          this.validationResult = {
            isValid: false,
            issues: [{
              type: 'SYNTAX_ERROR' as any,
              severity: 'error' as any,
              message: parseError instanceof Error ? parseError.message : 'Parse error',
              position: { start: 0, end: 0, line: 1, column: 1 }
            }],
            metrics: { parseTime, complexity: 0 }
          };
        }
      } else {
        this.validationResult = {
          isValid: false,
          issues,
          metrics: { parseTime, complexity: 0 }
        };
      }
      
    } catch (error) {
      this.validationResult = {
        isValid: false,
        issues: [{
          type: 'VALIDATION_ERROR' as any,
          severity: 'error' as any,
          message: error instanceof Error ? error.message : 'Validation error',
          position: { start: 0, end: 0, line: 1, column: 1 }
        }],
        metrics: { parseTime: performance.now() - startTime, complexity: 0 }
      };
    }

    this.validationChanged.emit(this.validationResult || undefined);
    this.cdr.detectChanges();
  }

  private calculateComplexity(expression: string): number {
    // Simple complexity calculation based on operators and nesting
    const operators = (expression.match(/(\|\||&&|xor|implies|==|!=|<=|>=|<|>)/g) || []).length;
    const functions = (expression.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g) || []).length;
    const nesting = (expression.match(/\(/g) || []).length;
    
    return operators + (functions * 2) + nesting;
  }

  // Autocomplete system
  onKeyDown(event: KeyboardEvent): void {
    if (this.showSuggestions) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.selectedSuggestionIndex = Math.max(0, this.selectedSuggestionIndex - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.selectedSuggestionIndex = Math.min(this.suggestions.length - 1, this.selectedSuggestionIndex + 1);
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          if (this.suggestions[this.selectedSuggestionIndex]) {
            this.applySuggestion(this.suggestions[this.selectedSuggestionIndex]);
          }
          break;
        case 'Escape':
          this.hideSuggestions();
          break;
      }
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
      return;
    }

    this.updateCursorPosition();
    if (this.enableAutocomplete) {
      this.updateSuggestions();
    }
  }

  onCursorChange(event: Event): void {
    this.updateCursorPosition();
    if (this.enableAutocomplete) {
      this.updateSuggestions();
    }
  }

  private updateCursorPosition(): void {
    if (this.textareaRef) {
      this.cursorPosition = this.textareaRef.nativeElement.selectionStart || 0;
    }
  }

  private updateSuggestions(): void {
    const expression = this.expressionControl.value || '';
    const beforeCursor = expression.substring(0, this.cursorPosition);
    
    // Find current word being typed
    const wordMatch = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_.$]*$/);
    this.currentWord = wordMatch ? wordMatch[0] : '';

    if (this.currentWord.length < 1) {
      this.hideSuggestions();
      return;
    }

    this.suggestions = this.generateSuggestions(this.currentWord);
    
    if (this.suggestions.length > 0) {
      this.selectedSuggestionIndex = 0;
      this.updateSuggestionPosition();
      this.showSuggestions = true;
    } else {
      this.hideSuggestions();
    }

    this.cdr.detectChanges();
  }

  private generateSuggestions(query: string): DslSuggestion[] {
    const suggestions: DslSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Field suggestions
    this.fieldSchemas.forEach(field => {
      if (field.name.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: field.name,
          label: field.name,
          type: 'field',
          description: field.label || field.description,
          detail: field.type
        });
      }
    });

    // Function suggestions
    this.functionGroups.forEach(group => {
      group.functions.forEach(func => {
        const funcName = func.signature.split('(')[0];
        if (funcName.toLowerCase().includes(lowerQuery)) {
          suggestions.push({
            text: func.signature,
            label: funcName,
            type: 'function',
            description: func.description,
            detail: func.signature
          });
        }
      });
    });

    // Operator suggestions
    const operators = ['&&', '||', '!', 'xor', 'implies', '==', '!=', '<', '<=', '>', '>=', 'in'];
    operators.forEach(op => {
      if (op.includes(lowerQuery)) {
        suggestions.push({
          text: op,
          label: op,
          type: 'operator',
          description: `${op} operator`
        });
      }
    });

    // Context variable suggestions
    this.contextVariables.forEach(variable => {
      const varName = `\${${variable.name}}`;
      if (variable.name.toLowerCase().includes(lowerQuery) || varName.includes(query)) {
        suggestions.push({
          text: varName,
          label: variable.name,
          type: 'variable',
          description: variable.description,
          detail: `${variable.scope}.${variable.type}`
        });
      }
    });

    // Keyword suggestions
    const keywords = ['true', 'false', 'null', 'and', 'or', 'not'];
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: keyword,
          label: keyword,
          type: 'keyword',
          description: `${keyword} keyword`
        });
      }
    });

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  private updateSuggestionPosition(): void {
    if (!this.textareaRef) return;

    const textarea = this.textareaRef.nativeElement;
    const rect = textarea.getBoundingClientRect();
    
    // Approximate position based on cursor
    const lineHeight = 20; // Approximate line height
    const charWidth = 8; // Approximate character width
    
    const lines = textarea.value.substring(0, this.cursorPosition).split('\n');
    const currentLine = lines.length - 1;
    const currentColumn = lines[lines.length - 1].length;
    
    this.suggestionPosition = {
      top: rect.top + (currentLine * lineHeight) + lineHeight + 5,
      left: rect.left + (currentColumn * charWidth)
    };
  }

  applySuggestion(suggestion: DslSuggestion): void {
    if (!this.textareaRef) return;

    const textarea = this.textareaRef.nativeElement;
    const currentValue = this.expressionControl.value || '';
    
    // Replace current word with suggestion
    const beforeWord = currentValue.substring(0, this.cursorPosition - this.currentWord.length);
    const afterCursor = currentValue.substring(this.cursorPosition);
    
    const newValue = beforeWord + suggestion.text + afterCursor;
    const newCursorPos = beforeWord.length + suggestion.text.length;
    
    this.expressionControl.setValue(newValue);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    this.hideSuggestions();
  }

  hideSuggestions(): void {
    this.showSuggestions = false;
    this.suggestions = [];
    this.cdr.detectChanges();
  }

  // Utility methods
  getSuggestionIcon(type: string): string {
    const icons: Record<string, string> = {
      field: 'text_fields',
      function: 'functions',
      operator: 'calculate',
      variable: 'data_object',
      keyword: 'code',
      value: 'pin'
    };
    return icons[type] || 'help';
  }

  getExpressionHint(): string {
    const expression = this.expressionControl.value || '';
    if (!expression) {
      return 'Start typing to see suggestions...';
    }
    
    if (this.validationResult) {
      if (this.validationResult.isValid) {
        return `✓ Valid expression (${this.validationResult.metrics?.complexity || 0} complexity)`;
      } else {
        return `✗ ${this.validationResult.issues.length} issue(s) found`;
      }
    }
    
    return 'Validating...';
  }

  getFirstError(): string {
    if (this.validationResult && this.validationResult.issues.length > 0) {
      return this.validationResult.issues[0].message;
    }
    return '';
  }

  getValidationSummary(): string {
    if (!this.validationResult) return '';
    
    if (this.validationResult.isValid) {
      return 'Expression is valid and ready to use';
    } else {
      const errors = this.validationResult.issues.filter(i => i.severity === 'error').length;
      const warnings = this.validationResult.issues.filter(i => i.severity === 'warning').length;
      return `${errors} error(s), ${warnings} warning(s)`;
    }
  }

  getIssueIcon(severity: string): string {
    const icons: Record<string, string> = {
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[severity] || 'help';
  }

  getSpecificationPreview(): string {
    if (this.validationResult?.specification) {
      return JSON.stringify(this.validationResult.specification.toJSON?.() || this.validationResult.specification, null, 2);
    }
    return '';
  }

  // Action methods
  formatExpression(): void {
    const expression = this.expressionControl.value || '';
    if (!expression.trim()) return;

    // Simple formatting - add spaces around operators
    const formatted = expression
      .replace(/([<>=!]+)/g, ' $1 ')
      .replace(/(\|\||&&)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();

    this.expressionControl.setValue(formatted);
  }

  validateExpression(): void {
    const expression = this.expressionControl.value || '';
    this.validateExpressionDebounced(expression);
  }

  insertAtCursor(text: string): void {
    if (!this.textareaRef) return;

    const textarea = this.textareaRef.nativeElement;
    const currentValue = this.expressionControl.value || '';
    const cursorPos = textarea.selectionStart || 0;
    
    const newValue = currentValue.substring(0, cursorPos) + text + currentValue.substring(cursorPos);
    this.expressionControl.setValue(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = cursorPos + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  insertFunction(func: { signature: string; description: string }): void {
    const funcText = func.signature.replace(/[a-zA-Z_][a-zA-Z0-9_]*/, '').replace(/\(.*\)/, '()');
    this.insertAtCursor(func.signature.split('(')[0] + funcText);
  }

  insertVariable(variable: ContextVariable): void {
    this.insertAtCursor(`\${${variable.name}}`);
  }

  showExamples(): void {
    const examples = [
      '${age} > 18',
      '${user.role} == "admin"',
      '${startDate} < ${endDate} && status == "active"',
      'contains(email, "@") && length(password) >= 8',
      'requiredIf(isMarried, spouse != null)'
    ];
    
    // Cycle through examples
    const currentValue = this.expressionControl.value || '';
    const currentIndex = examples.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % examples.length;
    
    this.expressionControl.setValue(examples[nextIndex]);
  }

  openDocumentation(): void {
    // In a real implementation, this would open documentation
    window.open('https://docs.praxis-platform.org/dsl-reference', '_blank');
  }
}