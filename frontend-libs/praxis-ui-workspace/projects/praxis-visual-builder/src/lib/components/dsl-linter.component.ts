import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';

import { Subject, takeUntil, debounceTime, distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { RuleBuilderService } from '../services/rule-builder.service';
import { SpecificationBridgeService } from '../services/specification-bridge.service';

export interface DslLintError {
  id: string;
  line: number;
  column: number;
  length: number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  code: string;
  message: string;
  suggestion?: string;
  quickFix?: DslQuickFix;
  category: 'syntax' | 'semantic' | 'style' | 'performance' | 'best-practice';
  tags?: string[];
}

export interface DslQuickFix {
  title: string;
  description: string;
  edits: DslEdit[];
}

export interface DslEdit {
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  newText: string;
}

export interface DslLintStats {
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  totalHints: number;
  complexity: number;
  maintainabilityIndex: number;
  lastLintTime: Date;
  lintDuration: number;
}

export interface DslLintRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  enabled: boolean;
  configurable: boolean;
  config?: any;
}

@Component({
  selector: 'praxis-dsl-linter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dsl-linter-container">
      <!-- Header Toolbar -->
      <mat-toolbar class="linter-toolbar">
        <mat-toolbar-row>
          <span class="toolbar-title">
            <mat-icon>rule</mat-icon>
            DSL Linter
          </span>
          
          <span class="toolbar-spacer"></span>
          
          <!-- Stats Summary -->
          <div class="stats-summary">
            <mat-chip 
              [class]="stats.totalErrors > 0 ? 'error-chip' : 'success-chip'"
              [matBadge]="stats.totalErrors"
              [matBadgeHidden]="stats.totalErrors === 0"
              matBadgeColor="warn"
              matTooltip="Errors">
              <mat-icon>error</mat-icon>
              {{ stats.totalErrors }}
            </mat-chip>
            
            <mat-chip 
              [class]="stats.totalWarnings > 0 ? 'warning-chip' : 'neutral-chip'"
              [matBadge]="stats.totalWarnings"
              [matBadgeHidden]="stats.totalWarnings === 0"
              matBadgeColor="accent"
              matTooltip="Warnings">
              <mat-icon>warning</mat-icon>
              {{ stats.totalWarnings }}
            </mat-chip>
            
            <mat-chip 
              class="info-chip"
              [matBadge]="stats.totalInfos + stats.totalHints"
              [matBadgeHidden]="stats.totalInfos + stats.totalHints === 0"
              matBadgeColor="primary"
              matTooltip="Info & Hints">
              <mat-icon>info</mat-icon>
              {{ stats.totalInfos + stats.totalHints }}
            </mat-chip>
          </div>
          
          <!-- Action Buttons -->
          <button mat-icon-button 
                  (click)="runLinting()"
                  [disabled]="isLinting"
                  matTooltip="Run Lint Check">
            <mat-icon *ngIf="!isLinting">refresh</mat-icon>
            <mat-progress-spinner 
              *ngIf="isLinting"
              diameter="20"
              mode="indeterminate">
            </mat-progress-spinner>
          </button>
          
          <button mat-icon-button 
                  [color]="autoLint ? 'primary' : ''"
                  (click)="toggleAutoLint()"
                  matTooltip="Toggle Auto-Lint">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          
          <button mat-icon-button 
                  (click)="openLinterSettings()"
                  matTooltip="Linter Settings">
            <mat-icon>settings</mat-icon>
          </button>
        </mat-toolbar-row>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="linter-content">
        <mat-tab-group [(selectedIndex)]="activeTabIndex">
          <!-- Issues Tab -->
          <mat-tab label="Issues">
            <div class="tab-content">
              <!-- Filter Controls -->
              <div class="filter-controls">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Filter by Severity</mat-label>
                  <mat-select [value]="selectedSeverities"
                             (selectionChange)="onSeverityFilterChange($event)"
                             multiple>
                    <mat-option value="error">
                      <mat-icon class="severity-icon error">error</mat-icon>
                      Errors
                    </mat-option>
                    <mat-option value="warning">
                      <mat-icon class="severity-icon warning">warning</mat-icon>
                      Warnings
                    </mat-option>
                    <mat-option value="info">
                      <mat-icon class="severity-icon info">info</mat-icon>
                      Info
                    </mat-option>
                    <mat-option value="hint">
                      <mat-icon class="severity-icon hint">lightbulb</mat-icon>
                      Hints
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Filter by Category</mat-label>
                  <mat-select [value]="selectedCategories"
                             (selectionChange)="onCategoryFilterChange($event)"
                             multiple>
                    <mat-option value="syntax">Syntax</mat-option>
                    <mat-option value="semantic">Semantic</mat-option>
                    <mat-option value="style">Style</mat-option>
                    <mat-option value="performance">Performance</mat-option>
                    <mat-option value="best-practice">Best Practice</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Issues List -->
              <div class="issues-list" *ngIf="filteredErrors.length > 0">
                <mat-expansion-panel 
                  *ngFor="let error of filteredErrors; trackBy: trackByErrorId"
                  class="issue-panel"
                  [class]="'severity-' + error.severity">
                  
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon [class]="'severity-icon ' + error.severity">
                        {{ getSeverityIcon(error.severity) }}
                      </mat-icon>
                      <span class="error-message">{{ error.message }}</span>
                    </mat-panel-title>
                    <mat-panel-description>
                      <mat-chip size="small" class="category-chip">{{ error.category }}</mat-chip>
                      <span class="location">Line {{ error.line }}:{{ error.column }}</span>
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  
                  <div class="issue-details">
                    <div class="issue-info">
                      <div class="info-row">
                        <strong>Code:</strong> {{ error.code }}
                      </div>
                      <div class="info-row">
                        <strong>Location:</strong> Line {{ error.line }}, Column {{ error.column }}
                      </div>
                      <div class="info-row" *ngIf="error.tags && error.tags.length > 0">
                        <strong>Tags:</strong>
                        <mat-chip *ngFor="let tag of error.tags" size="small" class="tag-chip">
                          {{ tag }}
                        </mat-chip>
                      </div>
                      <div class="info-row" *ngIf="error.suggestion">
                        <strong>Suggestion:</strong> {{ error.suggestion }}
                      </div>
                    </div>
                    
                    <div class="issue-actions">
                      <button mat-button 
                              (click)="navigateToError(error)"
                              color="primary">
                        <mat-icon>my_location</mat-icon>
                        Go to Location
                      </button>
                      
                      <button mat-button 
                              *ngIf="error.quickFix"
                              (click)="applyQuickFix(error)"
                              color="accent">
                        <mat-icon>build</mat-icon>
                        {{ error.quickFix.title }}
                      </button>
                      
                      <button mat-button 
                              (click)="ignoreError(error)">
                        <mat-icon>visibility_off</mat-icon>
                        Ignore
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
              
              <!-- No Issues Message -->
              <div *ngIf="filteredErrors.length === 0" class="no-issues">
                <mat-icon class="no-issues-icon">check_circle</mat-icon>
                <h3>No Issues Found</h3>
                <p *ngIf="allErrors.length === 0">Your DSL is clean! No linting issues detected.</p>
                <p *ngIf="allErrors.length > 0">All issues are filtered out. Adjust your filters to see hidden issues.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Analytics Tab -->
          <mat-tab label="Analytics">
            <div class="tab-content">
              <div class="analytics-grid">
                <!-- Quality Metrics -->
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Code Quality</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="metric-item">
                      <span class="metric-label">Complexity Score:</span>
                      <span class="metric-value" 
                            [class]="getComplexityClass(stats.complexity)">
                        {{ stats.complexity }}/100
                      </span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Maintainability:</span>
                      <span class="metric-value"
                            [class]="getMaintainabilityClass(stats.maintainabilityIndex)">
                        {{ stats.maintainabilityIndex }}/100
                      </span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Last Lint:</span>
                      <span class="metric-value">{{ stats.lastLintTime | date:'medium' }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">Duration:</span>
                      <span class="metric-value">{{ stats.lintDuration }}ms</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Issue Distribution -->
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Issue Distribution</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="distribution-chart">
                      <div class="chart-bar" *ngFor="let category of getIssueDistribution()">
                        <div class="bar-label">{{ category.name }}</div>
                        <div class="bar-container">
                          <div class="bar-fill" 
                               [style.width.%]="category.percentage"
                               [class]="'bar-' + category.severity">
                          </div>
                          <span class="bar-value">{{ category.count }}</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Rule Usage -->
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Most Common Issues</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="common-issues">
                      <div *ngFor="let issue of getMostCommonIssues()" class="common-issue-item">
                        <div class="issue-code">{{ issue.code }}</div>
                        <div class="issue-count">{{ issue.count }} occurrences</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Rules Tab -->
          <mat-tab label="Rules">
            <div class="tab-content">
              <!-- Rule Categories -->
              <div class="rules-content">
                <mat-expansion-panel 
                  *ngFor="let category of getRuleCategories()" 
                  class="rule-category-panel">
                  
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      {{ category.name }} ({{ category.rules.length }})
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ category.enabledCount }}/{{ category.rules.length }} enabled
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  
                  <div class="category-rules">
                    <div *ngFor="let rule of category.rules" class="rule-item">
                      <div class="rule-header">
                        <mat-slide-toggle
                          [checked]="rule.enabled"
                          (toggleChange)="toggleRule(rule, $event)">
                        </mat-slide-toggle>
                        
                        <div class="rule-info">
                          <div class="rule-name">{{ rule.name }}</div>
                          <div class="rule-description">{{ rule.description }}</div>
                        </div>
                        
                        <mat-chip 
                          size="small" 
                          [class]="'severity-chip ' + rule.severity">
                          {{ rule.severity }}
                        </mat-chip>
                      </div>
                      
                      <div *ngIf="rule.configurable" class="rule-config">
                        <button mat-button 
                                size="small"
                                (click)="configureRule(rule)">
                          <mat-icon>settings</mat-icon>
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .dsl-linter-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .linter-toolbar {
      background: var(--mdc-theme-surface-variant);
      color: var(--mdc-theme-on-surface-variant);
      flex-shrink: 0;
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .stats-summary {
      display: flex;
      gap: 8px;
      margin-right: 16px;
    }

    .stats-summary mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .error-chip {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .warning-chip {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
    }

    .info-chip {
      background: var(--mdc-theme-info-container);
      color: var(--mdc-theme-on-info-container);
    }

    .success-chip {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .neutral-chip {
      background: var(--mdc-theme-surface-variant);
      color: var(--mdc-theme-on-surface-variant);
    }

    .linter-content {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 16px;
      height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 200px;
    }

    .severity-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    .severity-icon.error {
      color: var(--mdc-theme-error);
    }

    .severity-icon.warning {
      color: var(--mdc-theme-warning);
    }

    .severity-icon.info {
      color: var(--mdc-theme-info);
    }

    .severity-icon.hint {
      color: var(--mdc-theme-primary);
    }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .issue-panel {
      border-left: 4px solid transparent;
    }

    .issue-panel.severity-error {
      border-left-color: var(--mdc-theme-error);
    }

    .issue-panel.severity-warning {
      border-left-color: var(--mdc-theme-warning);
    }

    .issue-panel.severity-info {
      border-left-color: var(--mdc-theme-info);
    }

    .issue-panel.severity-hint {
      border-left-color: var(--mdc-theme-primary);
    }

    .error-message {
      font-weight: 500;
      margin-left: 8px;
    }

    .category-chip {
      background: var(--mdc-theme-secondary-container);
      color: var(--mdc-theme-on-secondary-container);
      margin-right: 8px;
    }

    .location {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      opacity: 0.7;
    }

    .issue-details {
      padding: 16px 0;
      border-top: 1px solid var(--mdc-theme-outline);
    }

    .issue-info {
      margin-bottom: 16px;
    }

    .info-row {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .tag-chip {
      background: var(--mdc-theme-surface-variant);
      color: var(--mdc-theme-on-surface-variant);
      margin-left: 4px;
    }

    .issue-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .no-issues {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: var(--mdc-theme-on-surface-variant);
    }

    .no-issues-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mdc-theme-tertiary);
      margin-bottom: 16px;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .analytics-card {
      height: fit-content;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
    }

    .metric-item:last-child {
      border-bottom: none;
    }

    .metric-label {
      font-weight: 500;
    }

    .metric-value {
      font-weight: 600;
    }

    .metric-value.excellent {
      color: var(--mdc-theme-tertiary);
    }

    .metric-value.good {
      color: var(--mdc-theme-primary);
    }

    .metric-value.fair {
      color: var(--mdc-theme-warning);
    }

    .metric-value.poor {
      color: var(--mdc-theme-error);
    }

    .distribution-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chart-bar {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bar-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface-variant);
    }

    .bar-container {
      position: relative;
      height: 24px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .bar-fill.bar-error {
      background: var(--mdc-theme-error);
    }

    .bar-fill.bar-warning {
      background: var(--mdc-theme-warning);
    }

    .bar-fill.bar-info {
      background: var(--mdc-theme-info);
    }

    .bar-fill.bar-hint {
      background: var(--mdc-theme-primary);
    }

    .bar-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .common-issues {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .common-issue-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 4px;
    }

    .issue-code {
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    .issue-count {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .rules-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rule-category-panel {
      border: 1px solid var(--mdc-theme-outline-variant);
    }

    .category-rules {
      padding: 16px;
    }

    .rule-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .rule-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .rule-info {
      flex: 1;
    }

    .rule-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .rule-description {
      font-size: 13px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .severity-chip {
      font-size: 11px;
      min-height: 20px;
    }

    .severity-chip.error {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .severity-chip.warning {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
    }

    .severity-chip.info {
      background: var(--mdc-theme-info-container);
      color: var(--mdc-theme-on-info-container);
    }

    .severity-chip.hint {
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
    }

    .rule-config {
      padding-left: 44px;
    }
  `]
})
export class DslLinterComponent implements OnInit, OnDestroy {
  @Input() dsl: string = '';
  @Input() autoLint: boolean = true;
  @Input() lintDelay: number = 1000;

  @Output() errorSelected = new EventEmitter<DslLintError>();
  @Output() quickFixApplied = new EventEmitter<{ error: DslLintError; fix: DslQuickFix }>();
  @Output() ruleToggled = new EventEmitter<{ rule: DslLintRule; enabled: boolean }>();

  private destroy$ = new Subject<void>();
  private lintSubject = new BehaviorSubject<string>('');

  // Component state
  isLinting = false;
  activeTabIndex = 0;
  
  allErrors: DslLintError[] = [];
  filteredErrors: DslLintError[] = [];
  selectedSeverities: string[] = ['error', 'warning', 'info', 'hint'];
  selectedCategories: string[] = ['syntax', 'semantic', 'style', 'performance', 'best-practice'];
  
  stats: DslLintStats = {
    totalErrors: 0,
    totalWarnings: 0,
    totalInfos: 0,
    totalHints: 0,
    complexity: 0,
    maintainabilityIndex: 100,
    lastLintTime: new Date(),
    lintDuration: 0
  };

  lintRules: DslLintRule[] = [
    // Syntax Rules
    {
      id: 'syntax-001',
      name: 'Missing Semicolon',
      description: 'Statements should end with semicolons',
      category: 'syntax',
      severity: 'error',
      enabled: true,
      configurable: false
    },
    {
      id: 'syntax-002',
      name: 'Unmatched Parentheses',
      description: 'Opening parentheses must have matching closing parentheses',
      category: 'syntax',
      severity: 'error',
      enabled: true,
      configurable: false
    },
    {
      id: 'syntax-003',
      name: 'Invalid Field Reference',
      description: 'Field references must be valid and properly formatted',
      category: 'syntax',
      severity: 'error',
      enabled: true,
      configurable: false
    },
    
    // Semantic Rules
    {
      id: 'semantic-001',
      name: 'Undefined Field',
      description: 'Referenced fields must be defined in the schema',
      category: 'semantic',
      severity: 'error',
      enabled: true,
      configurable: false
    },
    {
      id: 'semantic-002',
      name: 'Type Mismatch',
      description: 'Operations must be compatible with field types',
      category: 'semantic',
      severity: 'warning',
      enabled: true,
      configurable: true
    },
    {
      id: 'semantic-003',
      name: 'Unreachable Code',
      description: 'Code that can never be executed',
      category: 'semantic',
      severity: 'warning',
      enabled: true,
      configurable: false
    },
    
    // Style Rules
    {
      id: 'style-001',
      name: 'Inconsistent Indentation',
      description: 'Use consistent indentation throughout the DSL',
      category: 'style',
      severity: 'info',
      enabled: true,
      configurable: true
    },
    {
      id: 'style-002',
      name: 'Long Line',
      description: 'Lines should not exceed maximum length',
      category: 'style',
      severity: 'info',
      enabled: false,
      configurable: true,
      config: { maxLength: 120 }
    },
    {
      id: 'style-003',
      name: 'Trailing Whitespace',
      description: 'Remove trailing whitespace from lines',
      category: 'style',
      severity: 'hint',
      enabled: true,
      configurable: false
    },
    
    // Performance Rules
    {
      id: 'performance-001',
      name: 'Complex Expression',
      description: 'Expression complexity exceeds recommended threshold',
      category: 'performance',
      severity: 'warning',
      enabled: true,
      configurable: true,
      config: { maxComplexity: 10 }
    },
    {
      id: 'performance-002',
      name: 'Redundant Condition',
      description: 'Condition can be simplified or is redundant',
      category: 'performance',
      severity: 'info',
      enabled: true,
      configurable: false
    },
    
    // Best Practice Rules
    {
      id: 'best-practice-001',
      name: 'Magic Number',
      description: 'Consider using named constants instead of magic numbers',
      category: 'best-practice',
      severity: 'hint',
      enabled: true,
      configurable: true
    },
    {
      id: 'best-practice-002',
      name: 'Deep Nesting',
      description: 'Avoid deep nesting to improve readability',
      category: 'best-practice',
      severity: 'info',
      enabled: true,
      configurable: true,
      config: { maxDepth: 5 }
    },
    {
      id: 'best-practice-003',
      name: 'Missing Documentation',
      description: 'Complex rules should include documentation comments',
      category: 'best-practice',
      severity: 'hint',
      enabled: false,
      configurable: false
    }
  ];

  constructor(
    private ruleBuilderService: RuleBuilderService,
    private specificationBridge: SpecificationBridgeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.initializeLinting();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to DSL changes for auto-linting
    this.lintSubject.pipe(
      debounceTime(this.lintDelay),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(dsl => {
      if (this.autoLint && dsl) {
        this.performLinting(dsl);
      }
    });

    // Subscribe to rule builder state changes
    this.ruleBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.currentDSL && state.currentDSL !== this.dsl) {
          this.dsl = state.currentDSL;
          this.triggerLinting();
        }
      });
  }

  private initializeLinting(): void {
    if (this.dsl) {
      this.triggerLinting();
    }
  }

  private triggerLinting(): void {
    this.lintSubject.next(this.dsl);
  }

  runLinting(): void {
    if (this.dsl) {
      this.performLinting(this.dsl);
    }
  }

  private async performLinting(dsl: string): Promise<void> {
    if (this.isLinting) return;

    this.isLinting = true;
    const startTime = performance.now();
    this.cdr.detectChanges();

    try {
      // Simulate linting process with actual DSL analysis
      const errors = await this.analyzeDsl(dsl);
      
      this.allErrors = errors;
      this.applyFilters();
      this.updateStats(errors, performance.now() - startTime);
      
    } catch (error) {
      console.error('Linting failed:', error);
    } finally {
      this.isLinting = false;
      this.cdr.detectChanges();
    }
  }

  private async analyzeDsl(dsl: string): Promise<DslLintError[]> {
    const errors: DslLintError[] = [];
    const lines = dsl.split('\n');
    
    // Simulate comprehensive DSL analysis
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;
      
      // Check syntax rules
      errors.push(...this.checkSyntaxRules(line, lineNumber));
      
      // Check semantic rules
      errors.push(...this.checkSemanticRules(line, lineNumber, lines));
      
      // Check style rules
      errors.push(...this.checkStyleRules(line, lineNumber));
      
      // Check performance rules
      errors.push(...this.checkPerformanceRules(line, lineNumber));
      
      // Check best practice rules
      errors.push(...this.checkBestPracticeRules(line, lineNumber));
    }

    return errors.filter(error => this.isRuleEnabled(error.code));
  }

  private checkSyntaxRules(line: string, lineNumber: number): DslLintError[] {
    const errors: DslLintError[] = [];

    // Check for unmatched parentheses
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        id: `syntax-${lineNumber}-1`,
        line: lineNumber,
        column: line.length,
        length: 1,
        severity: 'error',
        code: 'syntax-002',
        message: 'Unmatched parentheses in expression',
        category: 'syntax',
        suggestion: 'Ensure all opening parentheses have matching closing parentheses',
        quickFix: {
          title: 'Add missing parenthesis',
          description: 'Automatically add the missing closing parenthesis',
          edits: [{
            range: {
              startLine: lineNumber,
              startColumn: line.length,
              endLine: lineNumber,
              endColumn: line.length
            },
            newText: ')'
          }]
        }
      });
    }

    // Check for invalid field references
    const fieldRefPattern = /\$\{([^}]*)\}/g;
    let match;
    while ((match = fieldRefPattern.exec(line)) !== null) {
      const fieldRef = match[1];
      if (!fieldRef || fieldRef.includes(' ')) {
        errors.push({
          id: `syntax-${lineNumber}-2`,
          line: lineNumber,
          column: match.index + 1,
          length: match[0].length,
          severity: 'error',
          code: 'syntax-003',
          message: 'Invalid field reference syntax',
          category: 'syntax',
          suggestion: 'Field references should contain valid field names without spaces'
        });
      }
    }

    return errors;
  }

  private checkSemanticRules(line: string, lineNumber: number, allLines: string[]): DslLintError[] {
    const errors: DslLintError[] = [];

    // Check for undefined fields (simplified)
    const fieldRefPattern = /\$\{([^}]+)\}/g;
    let match;
    while ((match = fieldRefPattern.exec(line)) !== null) {
      const fieldName = match[1];
      // This would normally check against actual field schema
      if (fieldName.startsWith('unknown_')) {
        errors.push({
          id: `semantic-${lineNumber}-1`,
          line: lineNumber,
          column: match.index + 1,
          length: match[0].length,
          severity: 'error',
          code: 'semantic-001',
          message: `Undefined field: ${fieldName}`,
          category: 'semantic',
          suggestion: 'Ensure the field is defined in your schema or fix the field name'
        });
      }
    }

    return errors;
  }

  private checkStyleRules(line: string, lineNumber: number): DslLintError[] {
    const errors: DslLintError[] = [];

    // Check trailing whitespace
    if (line.endsWith(' ') || line.endsWith('\t')) {
      errors.push({
        id: `style-${lineNumber}-1`,
        line: lineNumber,
        column: line.trimEnd().length + 1,
        length: line.length - line.trimEnd().length,
        severity: 'hint',
        code: 'style-003',
        message: 'Trailing whitespace detected',
        category: 'style',
        suggestion: 'Remove trailing whitespace',
        quickFix: {
          title: 'Remove trailing whitespace',
          description: 'Automatically remove trailing spaces and tabs',
          edits: [{
            range: {
              startLine: lineNumber,
              startColumn: line.trimEnd().length + 1,
              endLine: lineNumber,
              endColumn: line.length + 1
            },
            newText: ''
          }]
        }
      });
    }

    // Check line length
    const maxLength = this.getRuleConfig('style-002')?.maxLength || 120;
    if (this.isRuleEnabled('style-002') && line.length > maxLength) {
      errors.push({
        id: `style-${lineNumber}-2`,
        line: lineNumber,
        column: maxLength + 1,
        length: line.length - maxLength,
        severity: 'info',
        code: 'style-002',
        message: `Line exceeds maximum length of ${maxLength} characters`,
        category: 'style',
        suggestion: 'Consider breaking long lines for better readability'
      });
    }

    return errors;
  }

  private checkPerformanceRules(line: string, lineNumber: number): DslLintError[] {
    const errors: DslLintError[] = [];

    // Check expression complexity (simplified)
    const operators = (line.match(/&&|\|\||==|!=|>=|<=|>|</g) || []).length;
    const maxComplexity = this.getRuleConfig('performance-001')?.maxComplexity || 10;
    
    if (operators > maxComplexity) {
      errors.push({
        id: `performance-${lineNumber}-1`,
        line: lineNumber,
        column: 1,
        length: line.length,
        severity: 'warning',
        code: 'performance-001',
        message: `Expression complexity (${operators}) exceeds threshold (${maxComplexity})`,
        category: 'performance',
        suggestion: 'Consider breaking complex expressions into smaller, more readable parts'
      });
    }

    return errors;
  }

  private checkBestPracticeRules(line: string, lineNumber: number): DslLintError[] {
    const errors: DslLintError[] = [];

    // Check for magic numbers
    const numberPattern = /\b\d+\b/g;
    let match;
    while ((match = numberPattern.exec(line)) !== null) {
      const number = parseInt(match[0]);
      if (number > 10 && number !== 100 && number !== 1000) {
        errors.push({
          id: `best-practice-${lineNumber}-1`,
          line: lineNumber,
          column: match.index + 1,
          length: match[0].length,
          severity: 'hint',
          code: 'best-practice-001',
          message: `Consider using a named constant instead of magic number: ${number}`,
          category: 'best-practice',
          suggestion: 'Define meaningful constants for numeric values'
        });
      }
    }

    return errors;
  }

  private isRuleEnabled(ruleCode: string): boolean {
    const rule = this.lintRules.find(r => r.id === ruleCode);
    return rule?.enabled ?? false;
  }

  private getRuleConfig(ruleCode: string): any {
    const rule = this.lintRules.find(r => r.id === ruleCode);
    return rule?.config;
  }

  private updateStats(errors: DslLintError[], duration: number): void {
    this.stats = {
      totalErrors: errors.filter(e => e.severity === 'error').length,
      totalWarnings: errors.filter(e => e.severity === 'warning').length,
      totalInfos: errors.filter(e => e.severity === 'info').length,
      totalHints: errors.filter(e => e.severity === 'hint').length,
      complexity: this.calculateComplexity(errors),
      maintainabilityIndex: this.calculateMaintainabilityIndex(errors),
      lastLintTime: new Date(),
      lintDuration: Math.round(duration)
    };
  }

  private calculateComplexity(errors: DslLintError[]): number {
    const complexityFactors = {
      'error': 10,
      'warning': 5,
      'info': 2,
      'hint': 1
    };

    const totalPenalty = errors.reduce((sum, error) => {
      return sum + (complexityFactors[error.severity] || 1);
    }, 0);

    return Math.min(100, Math.max(0, 100 - totalPenalty));
  }

  private calculateMaintainabilityIndex(errors: DslLintError[]): number {
    const criticalErrors = errors.filter(e => e.severity === 'error').length;
    const warnings = errors.filter(e => e.severity === 'warning').length;
    
    const penalty = (criticalErrors * 15) + (warnings * 5);
    return Math.min(100, Math.max(0, 100 - penalty));
  }

  toggleAutoLint(): void {
    this.autoLint = !this.autoLint;
    if (this.autoLint && this.dsl) {
      this.triggerLinting();
    }
  }

  onSeverityFilterChange(event: MatSelectChange): void {
    this.selectedSeverities = event.value as string[];
    this.applyFilters();
  }

  onCategoryFilterChange(event: MatSelectChange): void {
    this.selectedCategories = event.value as string[];
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredErrors = this.allErrors.filter(error => 
      this.selectedSeverities.includes(error.severity) &&
      this.selectedCategories.includes(error.category)
    );
    this.cdr.detectChanges();
  }

  trackByErrorId(index: number, error: DslLintError): string {
    return error.id;
  }

  getSeverityIcon(severity: string): string {
    const icons = {
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'hint': 'lightbulb'
    };
    return icons[severity] || 'help';
  }

  getComplexityClass(complexity: number): string {
    if (complexity >= 80) return 'excellent';
    if (complexity >= 60) return 'good';
    if (complexity >= 40) return 'fair';
    return 'poor';
  }

  getMaintainabilityClass(maintainability: number): string {
    if (maintainability >= 80) return 'excellent';
    if (maintainability >= 60) return 'good';
    if (maintainability >= 40) return 'fair';
    return 'poor';
  }

  getIssueDistribution(): any[] {
    const distribution = [
      { name: 'Errors', severity: 'error', count: this.stats.totalErrors },
      { name: 'Warnings', severity: 'warning', count: this.stats.totalWarnings },
      { name: 'Info', severity: 'info', count: this.stats.totalInfos },
      { name: 'Hints', severity: 'hint', count: this.stats.totalHints }
    ];

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    
    return distribution.map(item => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0
    }));
  }

  getMostCommonIssues(): any[] {
    const codeCount = new Map<string, number>();
    
    this.allErrors.forEach(error => {
      codeCount.set(error.code, (codeCount.get(error.code) || 0) + 1);
    });

    return Array.from(codeCount.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getRuleCategories(): any[] {
    const categories = new Map<string, DslLintRule[]>();
    
    this.lintRules.forEach(rule => {
      const categoryName = rule.category.charAt(0).toUpperCase() + rule.category.slice(1);
      if (!categories.has(categoryName)) {
        categories.set(categoryName, []);
      }
      categories.get(categoryName)!.push(rule);
    });

    return Array.from(categories.entries()).map(([name, rules]) => ({
      name,
      rules,
      enabledCount: rules.filter(rule => rule.enabled).length
    }));
  }

  navigateToError(error: DslLintError): void {
    this.errorSelected.emit(error);
  }

  applyQuickFix(error: DslLintError): void {
    if (error.quickFix) {
      this.quickFixApplied.emit({ error, fix: error.quickFix });
      // Remove the error after applying the fix
      this.allErrors = this.allErrors.filter(e => e.id !== error.id);
      this.applyFilters();
    }
  }

  ignoreError(error: DslLintError): void {
    this.allErrors = this.allErrors.filter(e => e.id !== error.id);
    this.applyFilters();
  }

  toggleRule(rule: DslLintRule, change: MatSlideToggleChange): void {
    const enabled = change.checked;
    rule.enabled = enabled;
    this.ruleToggled.emit({ rule, enabled });
    // Re-run linting to apply the rule change
    this.runLinting();
  }

  configureRule(rule: DslLintRule): void {
    // Open rule configuration dialog
    console.log('Configure rule:', rule);
  }

  openLinterSettings(): void {
    // Open linter settings dialog
    console.log('Open linter settings');
  }
}