import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

import {
  RoundTripValidatorService,
  RoundTripValidationResult,
  RoundTripTestCase,
} from '../services/round-trip-validator.service';
import { RuleBuilderService } from '../services/rule-builder.service';
import { RuleNode, RuleNodeType } from '../models/rule-builder.model';

@Component({
  selector: 'praxis-round-trip-tester',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="round-trip-tester-container">
      <!-- Header -->
      <mat-toolbar color="primary">
        <span class="toolbar-title">
          <mat-icon>sync_alt</mat-icon>
          Round-Trip Validation Tester
        </span>

        <span class="toolbar-spacer"></span>

        <div class="toolbar-actions">
          <button
            mat-button
            (click)="runCurrentRuleTest()"
            [disabled]="isRunning || !hasCurrentRule"
            matTooltip="Test current rule from builder"
          >
            <mat-icon>play_arrow</mat-icon>
            Test Current Rule
          </button>

          <button
            mat-button
            (click)="runTestSuite()"
            [disabled]="isRunning"
            matTooltip="Run full test suite"
          >
            <mat-icon>playlist_play</mat-icon>
            Run Test Suite
          </button>

          <button
            mat-button
            (click)="clearResults()"
            [disabled]="isRunning"
            matTooltip="Clear all results"
          >
            <mat-icon>clear</mat-icon>
            Clear
          </button>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="tester-content">
        <div class="tester-grid">
          <!-- Test Selection Panel -->
          <mat-card class="test-selection-panel">
            <mat-card-header>
              <mat-card-title>Test Selection</mat-card-title>
              <mat-card-subtitle>Choose what to test</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="test-options">
                <!-- Current Rule Test -->
                <div class="test-option">
                  <h4>Current Rule</h4>
                  <p class="test-description">
                    Test the rule currently loaded in the visual builder
                  </p>
                  <div class="current-rule-info" *ngIf="hasCurrentRule">
                    <span class="rule-type">{{ getCurrentRuleType() }}</span>
                    <span class="rule-label">{{ getCurrentRuleLabel() }}</span>
                  </div>
                  <div class="no-rule-info" *ngIf="!hasCurrentRule">
                    <span class="no-rule-message"
                      >No rule loaded in builder</span
                    >
                  </div>
                </div>

                <mat-divider></mat-divider>

                <!-- Test Suite -->
                <div class="test-option">
                  <h4>Test Suite</h4>
                  <p class="test-description">
                    Run predefined test cases covering common scenarios
                  </p>
                  <div class="test-suite-info">
                    <span class="test-count"
                      >{{ defaultTestCases.length }} test cases</span
                    >
                    <button
                      mat-button
                      size="small"
                      (click)="showTestCases = !showTestCases"
                    >
                      {{ showTestCases ? 'Hide' : 'Show' }} Details
                    </button>
                  </div>

                  <!-- Test Cases List -->
                  <div *ngIf="showTestCases" class="test-cases-list">
                    <div
                      *ngFor="let testCase of defaultTestCases"
                      class="test-case-item"
                    >
                      <div class="test-case-header">
                        <span class="test-case-name">{{ testCase.name }}</span>
                        <mat-chip
                          [color]="getTestCaseColor(testCase)"
                          size="small"
                        >
                          {{ testCase.visualRule.type }}
                        </mat-chip>
                      </div>
                      <p class="test-case-description">
                        {{ testCase.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Results Panel -->
          <mat-card class="results-panel">
            <mat-card-header>
              <mat-card-title>
                Test Results
                <mat-icon *ngIf="isRunning" class="running-icon"
                  >hourglass_empty</mat-icon
                >
              </mat-card-title>
              <mat-card-subtitle *ngIf="lastTestResult">
                {{ getResultSummary() }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Progress Bar -->
              <mat-progress-bar
                *ngIf="isRunning"
                mode="indeterminate"
                class="progress-bar"
              >
              </mat-progress-bar>

              <!-- No Results Message -->
              <div
                *ngIf="!lastTestResult && !testSuiteResults && !isRunning"
                class="no-results"
              >
                <mat-icon>science</mat-icon>
                <h3>No Tests Run</h3>
                <p>Run a test to see validation results here</p>
              </div>

              <!-- Single Test Result -->
              <div
                *ngIf="lastTestResult && !testSuiteResults"
                class="single-test-result"
              >
                <div class="result-header">
                  <div
                    class="result-status"
                    [class]="getStatusClass(lastTestResult)"
                  >
                    <mat-icon>{{ getStatusIcon(lastTestResult) }}</mat-icon>
                    <span>{{
                      lastTestResult.success ? 'PASSED' : 'FAILED'
                    }}</span>
                  </div>
                  <div class="result-timing">
                    {{ lastTestResult.performance.totalTime.toFixed(2) }}ms
                  </div>
                </div>

                <!-- Stage Results -->
                <mat-expansion-panel class="stages-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Conversion Stages</mat-panel-title>
                    <mat-panel-description>
                      Step-by-step validation results
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="stages-list">
                    <div
                      *ngFor="let stage of getStages(lastTestResult)"
                      class="stage-item"
                      [class]="stage.success ? 'stage-success' : 'stage-error'"
                    >
                      <div class="stage-header">
                        <mat-icon>{{
                          stage.success ? 'check_circle' : 'error'
                        }}</mat-icon>
                        <span class="stage-name">{{ stage.name }}</span>
                        <span class="stage-timing"
                          >{{ stage.timing?.toFixed(2) }}ms</span
                        >
                      </div>
                      <div *ngIf="stage.error" class="stage-error-message">
                        {{ stage.error }}
                      </div>
                      <div *ngIf="stage.dsl" class="stage-dsl-output">
                        <strong>Generated DSL:</strong>
                        <pre>{{ stage.dsl }}</pre>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Data Integrity Results -->
                <mat-expansion-panel class="integrity-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Data Integrity</mat-panel-title>
                    <mat-panel-description>
                      Validation of data preservation
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="integrity-checks">
                    <div
                      *ngFor="let check of getIntegrityChecks(lastTestResult)"
                      class="integrity-check"
                      [class]="check.passed ? 'check-passed' : 'check-failed'"
                    >
                      <mat-icon>{{
                        check.passed ? 'check' : 'close'
                      }}</mat-icon>
                      <span>{{ check.name }}</span>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Errors and Warnings -->
                <div
                  *ngIf="
                    lastTestResult.errors.length > 0 ||
                    lastTestResult.warnings.length > 0
                  "
                  class="issues-section"
                >
                  <!-- Errors -->
                  <div
                    *ngIf="lastTestResult.errors.length > 0"
                    class="errors-section"
                  >
                    <h4 class="section-title error-title">
                      <mat-icon>error</mat-icon>
                      Errors ({{ lastTestResult.errors.length }})
                    </h4>
                    <div
                      *ngFor="let error of lastTestResult.errors"
                      class="issue-item error-item"
                    >
                      <div class="issue-header">
                        <span class="issue-code">{{ error.code }}</span>
                        <span class="issue-severity">{{ error.severity }}</span>
                      </div>
                      <div class="issue-message">{{ error.message }}</div>
                    </div>
                  </div>

                  <!-- Warnings -->
                  <div
                    *ngIf="lastTestResult.warnings.length > 0"
                    class="warnings-section"
                  >
                    <h4 class="section-title warning-title">
                      <mat-icon>warning</mat-icon>
                      Warnings ({{ lastTestResult.warnings.length }})
                    </h4>
                    <div
                      *ngFor="let warning of lastTestResult.warnings"
                      class="issue-item warning-item"
                    >
                      <div class="issue-header">
                        <span class="issue-code">{{ warning.code }}</span>
                        <span class="issue-severity">{{
                          warning.severity
                        }}</span>
                      </div>
                      <div class="issue-message">{{ warning.message }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Test Suite Results -->
              <div *ngIf="testSuiteResults" class="test-suite-results">
                <div class="suite-summary">
                  <div class="summary-stats">
                    <div class="stat-item">
                      <span class="stat-label">Total Tests</span>
                      <span class="stat-value">{{
                        testSuiteResults.totalTests
                      }}</span>
                    </div>
                    <div class="stat-item passed">
                      <span class="stat-label">Passed</span>
                      <span class="stat-value">{{
                        testSuiteResults.passed
                      }}</span>
                    </div>
                    <div class="stat-item failed">
                      <span class="stat-label">Failed</span>
                      <span class="stat-value">{{
                        testSuiteResults.failed
                      }}</span>
                    </div>
                  </div>

                  <div class="success-rate">
                    <span class="rate-label">Success Rate:</span>
                    <span class="rate-value" [class]="getSuccessRateClass()">
                      {{ getSuccessRate() }}%
                    </span>
                  </div>
                </div>

                <!-- Individual Test Results -->
                <mat-expansion-panel
                  *ngFor="let result of testSuiteResults.results; let i = index"
                  class="test-result-panel"
                >
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon
                        [class]="
                          result.result.success ? 'success-icon' : 'error-icon'
                        "
                      >
                        {{ result.result.success ? 'check_circle' : 'error' }}
                      </mat-icon>
                      {{ result.testCase.name }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ result.testCase.description }}
                      <span class="test-timing"
                        >{{
                          result.result.performance.totalTime.toFixed(2)
                        }}ms</span
                      >
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="test-details">
                    <!-- Test Case Info -->
                    <div class="test-case-info">
                      <h5>Test Case</h5>
                      <div class="test-case-details">
                        <span class="detail-item">
                          <strong>Type:</strong>
                          {{ result.testCase.visualRule.type }}
                        </span>
                        <span class="detail-item">
                          <strong>ID:</strong> {{ result.testCase.id }}
                        </span>
                      </div>
                    </div>

                    <!-- Quick Result Summary -->
                    <div class="quick-summary">
                      <h5>Result Summary</h5>
                      <div class="summary-items">
                        <span
                          class="summary-item"
                          [class]="
                            result.result.success ? 'success' : 'failure'
                          "
                        >
                          <mat-icon>{{
                            result.result.success ? 'check' : 'close'
                          }}</mat-icon>
                          {{ result.result.success ? 'Success' : 'Failed' }}
                        </span>
                        <span class="summary-item">
                          <mat-icon>error</mat-icon>
                          {{ result.result.errors.length }} errors
                        </span>
                        <span class="summary-item">
                          <mat-icon>warning</mat-icon>
                          {{ result.result.warnings.length }} warnings
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .round-trip-tester-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
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

      .toolbar-actions {
        display: flex;
        gap: 8px;
      }

      .tester-content {
        flex: 1;
        padding: 16px;
        overflow: auto;
      }

      .tester-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 16px;
        height: 100%;
      }

      .test-selection-panel,
      .results-panel {
        height: fit-content;
        max-height: 100%;
        overflow: auto;
      }

      .test-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .test-option h4 {
        margin: 0 0 8px 0;
        color: var(--mdc-theme-primary);
      }

      .test-description {
        margin: 0 0 12px 0;
        color: var(--mdc-theme-on-surface-variant);
        font-size: 14px;
      }

      .current-rule-info,
      .test-suite-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .rule-type,
      .test-count {
        background: var(--mdc-theme-primary-container);
        color: var(--mdc-theme-on-primary-container);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .rule-label {
        font-size: 13px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .no-rule-message {
        color: var(--mdc-theme-error);
        font-style: italic;
        font-size: 13px;
      }

      .test-cases-list {
        margin-top: 12px;
        border: 1px solid var(--mdc-theme-outline);
        border-radius: 4px;
        padding: 8px;
      }

      .test-case-item {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--mdc-theme-outline-variant);
      }

      .test-case-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .test-case-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .test-case-name {
        font-weight: 500;
        font-size: 14px;
      }

      .test-case-description {
        margin: 0;
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .progress-bar {
        margin-bottom: 16px;
      }

      .running-icon {
        animation: spin 2s linear infinite;
        margin-left: 8px;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .no-results {
        text-align: center;
        padding: 40px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .no-results mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      .no-results h3 {
        margin: 0 0 8px 0;
      }

      .single-test-result {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        background: var(--mdc-theme-surface-variant);
      }

      .result-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .result-status.success {
        color: var(--mdc-theme-tertiary);
      }

      .result-status.failure {
        color: var(--mdc-theme-error);
      }

      .result-timing {
        font-family: monospace;
        font-size: 14px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .stages-list,
      .integrity-checks {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .stage-item {
        padding: 12px;
        border-radius: 4px;
        border-left: 4px solid var(--mdc-theme-outline);
      }

      .stage-item.stage-success {
        border-left-color: var(--mdc-theme-tertiary);
        background: var(--mdc-theme-tertiary-container);
      }

      .stage-item.stage-error {
        border-left-color: var(--mdc-theme-error);
        background: var(--mdc-theme-error-container);
      }

      .stage-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .stage-name {
        flex: 1;
        font-weight: 500;
      }

      .stage-timing {
        font-family: monospace;
        font-size: 12px;
      }

      .stage-error-message {
        color: var(--mdc-theme-error);
        font-size: 13px;
        margin-top: 4px;
      }

      .stage-dsl-output {
        margin-top: 8px;
      }

      .stage-dsl-output pre {
        background: var(--mdc-theme-surface);
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        margin: 4px 0 0 0;
        overflow-x: auto;
      }

      .integrity-check {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
      }

      .integrity-check.check-passed {
        background: var(--mdc-theme-tertiary-container);
        color: var(--mdc-theme-on-tertiary-container);
      }

      .integrity-check.check-failed {
        background: var(--mdc-theme-error-container);
        color: var(--mdc-theme-on-error-container);
      }

      .issues-section {
        margin-top: 16px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 16px;
      }

      .error-title {
        color: var(--mdc-theme-error);
      }

      .warning-title {
        color: var(--mdc-theme-warning);
      }

      .issue-item {
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .error-item {
        background: var(--mdc-theme-error-container);
        color: var(--mdc-theme-on-error-container);
        border-left: 4px solid var(--mdc-theme-error);
      }

      .warning-item {
        background: var(--mdc-theme-warning-container);
        color: var(--mdc-theme-on-warning-container);
        border-left: 4px solid var(--mdc-theme-warning);
      }

      .issue-header {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
      }

      .issue-code {
        font-family: monospace;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
      }

      .issue-severity {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .issue-message {
        font-size: 14px;
      }

      .test-suite-results {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .suite-summary {
        background: var(--mdc-theme-surface-variant);
        padding: 16px;
        border-radius: 8px;
      }

      .summary-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 16px;
      }

      .stat-item {
        text-align: center;
        padding: 12px;
        border-radius: 4px;
        background: var(--mdc-theme-surface);
      }

      .stat-item.passed {
        border-left: 4px solid var(--mdc-theme-tertiary);
      }

      .stat-item.failed {
        border-left: 4px solid var(--mdc-theme-error);
      }

      .stat-label {
        display: block;
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
        margin-bottom: 4px;
      }

      .stat-value {
        display: block;
        font-size: 20px;
        font-weight: 600;
      }

      .success-rate {
        text-align: center;
      }

      .rate-label {
        font-size: 14px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .rate-value {
        font-size: 18px;
        font-weight: 600;
        margin-left: 8px;
      }

      .rate-value.excellent {
        color: var(--mdc-theme-tertiary);
      }

      .rate-value.good {
        color: var(--mdc-theme-warning);
      }

      .rate-value.poor {
        color: var(--mdc-theme-error);
      }

      .test-result-panel {
        margin-bottom: 8px;
      }

      .success-icon {
        color: var(--mdc-theme-tertiary);
      }

      .error-icon {
        color: var(--mdc-theme-error);
      }

      .test-timing {
        margin-left: auto;
        font-family: monospace;
        font-size: 12px;
      }

      .test-details {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }

      .test-case-info h5,
      .quick-summary h5 {
        margin: 0 0 8px 0;
        color: var(--mdc-theme-primary);
      }

      .test-case-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .detail-item {
        font-size: 13px;
      }

      .summary-items {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
      }

      .summary-item.success {
        color: var(--mdc-theme-tertiary);
      }

      .summary-item.failure {
        color: var(--mdc-theme-error);
      }

      /* Responsive adjustments */
      @media (max-width: 1024px) {
        .tester-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .test-selection-panel {
          order: 2;
        }

        .results-panel {
          order: 1;
        }
      }
    `,
  ],
})
export class RoundTripTesterComponent implements OnInit {
  isRunning = false;
  showTestCases = false;
  lastTestResult: RoundTripValidationResult | null = null;
  testSuiteResults: any = null;
  defaultTestCases: RoundTripTestCase[] = [];
  hasCurrentRule = false;

  constructor(
    private roundTripValidator: RoundTripValidatorService,
    private ruleBuilderService: RuleBuilderService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDefaultTestCases();
    this.checkCurrentRule();
  }

  private loadDefaultTestCases(): void {
    this.defaultTestCases = this.roundTripValidator.createDefaultTestCases();
  }

  private checkCurrentRule(): void {
    const state = this.ruleBuilderService.getCurrentState();
    this.hasCurrentRule = state.rootNodes.length > 0;
  }

  runCurrentRuleTest(): void {
    if (!this.hasCurrentRule) {
      this.snackBar.open('No rule loaded in builder', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isRunning = true;
    this.testSuiteResults = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      try {
        const state = this.ruleBuilderService.getCurrentState();
        if (state.rootNodes.length > 0) {
          // Get the first root node for testing
          const rootNodeId = state.rootNodes[0];
          const rootNode = state.nodes[rootNodeId];

          if (rootNode) {
            // Build the complete rule tree
            const completeRule = this.buildCompleteRuleTree(
              rootNode,
              state.nodes,
            );
            this.lastTestResult =
              this.roundTripValidator.validateRoundTrip(completeRule);

            const message = this.lastTestResult.success
              ? 'Round-trip test passed!'
              : 'Round-trip test failed';
            const duration = this.lastTestResult.success ? 2000 : 4000;

            this.snackBar.open(message, 'Close', { duration });
          }
        }
      } catch (error) {
        this.snackBar.open(`Test failed: ${error}`, 'Close', {
          duration: 4000,
        });
      } finally {
        this.isRunning = false;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  runTestSuite(): void {
    this.isRunning = true;
    this.lastTestResult = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      try {
        this.testSuiteResults = this.roundTripValidator.runTestSuite(
          this.defaultTestCases,
        );

        const message = `Test suite completed: ${this.testSuiteResults.passed}/${this.testSuiteResults.totalTests} passed`;
        this.snackBar.open(message, 'Close', { duration: 3000 });
      } catch (error) {
        this.snackBar.open(`Test suite failed: ${error}`, 'Close', {
          duration: 4000,
        });
      } finally {
        this.isRunning = false;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  clearResults(): void {
    this.lastTestResult = null;
    this.testSuiteResults = null;
    this.cdr.detectChanges();
  }

  private buildCompleteRuleTree(
    node: RuleNode,
    allNodes: Record<string, RuleNode>,
  ): RuleNode {
    return {
      ...node,
      children: node.children?.map((childId) => {
        if (typeof childId === 'string') {
          const childNode = allNodes[childId];
          if (childNode) {
            // Recursively build child tree but only return the ID for the children array
            this.buildCompleteRuleTree(childNode, allNodes);
          }
          return childId;
        }
        return childId;
      }),
    };
  }

  getCurrentRuleType(): string {
    const state = this.ruleBuilderService.getCurrentState();
    if (state.rootNodes.length > 0) {
      const rootNode = state.nodes[state.rootNodes[0]];
      if (!rootNode) return 'Unknown';

      // rootNode.type is always a string (RuleNodeType | RuleNodeTypeString)
      return String(rootNode.type);
    }
    return 'None';
  }

  getCurrentRuleLabel(): string {
    const state = this.ruleBuilderService.getCurrentState();
    if (state.rootNodes.length > 0) {
      const rootNode = state.nodes[state.rootNodes[0]];
      return rootNode?.label || 'Untitled Rule';
    }
    return '';
  }

  getTestCaseColor(testCase: RoundTripTestCase): 'primary' | 'accent' | 'warn' {
    const ruleType = testCase.visualRule.type;

    // Handle field conditions
    if (ruleType === 'fieldCondition') {
      return 'primary';
    }

    // Handle boolean groups
    if (ruleType === 'andGroup') {
      return 'accent';
    }
    if (ruleType === 'orGroup') {
      return 'accent';
    }
    if (ruleType === 'notGroup') {
      return 'accent';
    }
    if (ruleType === 'xorGroup') {
      return 'accent';
    }
    if (ruleType === 'impliesGroup') {
      return 'accent';
    }

    // Handle function calls
    if (ruleType === 'functionCall') {
      return 'warn';
    }

    return 'primary';
  }

  getResultSummary(): string {
    if (this.lastTestResult) {
      const timing = this.lastTestResult.performance.totalTime.toFixed(2);
      return `Single test • ${timing}ms • ${this.lastTestResult.success ? 'Passed' : 'Failed'}`;
    }
    if (this.testSuiteResults) {
      return `Test suite • ${this.testSuiteResults.passed}/${this.testSuiteResults.totalTests} passed`;
    }
    return '';
  }

  getStatusClass(result: RoundTripValidationResult): string {
    return result.success ? 'success' : 'failure';
  }

  getStatusIcon(result: RoundTripValidationResult): string {
    return result.success ? 'check_circle' : 'error';
  }

  getStages(result: RoundTripValidationResult): any[] {
    return [
      {
        name: 'Visual → Specification',
        success: result.stages.visualToSpecification.success,
        error: result.stages.visualToSpecification.error,
        timing: result.performance.stageTimings.visualToSpecification,
      },
      {
        name: 'Specification → DSL',
        success: result.stages.specificationToDsl.success,
        error: result.stages.specificationToDsl.error,
        dsl: result.stages.specificationToDsl.dsl,
        timing: result.performance.stageTimings.specificationToDsl,
      },
      {
        name: 'DSL → Specification',
        success: result.stages.dslToSpecification.success,
        error: result.stages.dslToSpecification.error,
        timing: result.performance.stageTimings.dslToSpecification,
      },
      {
        name: 'Specification → Visual',
        success: result.stages.specificationToVisual.success,
        error: result.stages.specificationToVisual.error,
        timing: result.performance.stageTimings.specificationToVisual,
      },
    ];
  }

  getIntegrityChecks(result: RoundTripValidationResult): any[] {
    return [
      {
        name: 'Node Count Match',
        passed: result.dataIntegrity.nodeCountMatch,
      },
      {
        name: 'Structure Match',
        passed: result.dataIntegrity.structureMatch,
      },
      {
        name: 'Metadata Preserved',
        passed: result.dataIntegrity.metadataPreserved,
      },
      {
        name: 'Logic Preserved',
        passed: result.dataIntegrity.logicPreserved,
      },
    ];
  }

  getSuccessRate(): number {
    if (!this.testSuiteResults) return 0;
    return Math.round(
      (this.testSuiteResults.passed / this.testSuiteResults.totalTests) * 100,
    );
  }

  getSuccessRateClass(): string {
    const rate = this.getSuccessRate();
    if (rate >= 90) return 'excellent';
    if (rate >= 70) return 'good';
    return 'poor';
  }
}
