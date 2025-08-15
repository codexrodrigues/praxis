import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Subject, takeUntil, combineLatest } from 'rxjs';

import { RuleBuilderService } from '../services/rule-builder.service';
import { FieldSchemaService } from '../services/field-schema.service';
import { RuleCanvasComponent } from './rule-canvas.component';
import { MetadataEditorComponent } from './metadata-editor.component';
import { DslViewerComponent } from './dsl-viewer.component';
import { JsonViewerComponent } from './json-viewer.component';
import { RoundTripTesterComponent } from './round-trip-tester.component';
import { ExportDialogComponent } from './export-dialog.component';
import { DslLinterComponent } from './dsl-linter.component';
import {
  RuleBuilderState,
  RuleNode,
  RuleNodeType,
  ValidationError,
  ExportOptions,
  ImportOptions,
  RuleBuilderConfig,
} from '../models/rule-builder.model';
import { FieldSchema, CustomFunction, ContextVariable } from '../models/field-schema.model';

@Component({
  selector: 'praxis-rule-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDialogModule,
    DragDropModule,
    RuleCanvasComponent,
    MetadataEditorComponent,
    DslViewerComponent,
    JsonViewerComponent,
    RoundTripTesterComponent,
    DslLinterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rule-editor-container">
      <!-- Header Toolbar -->
      <mat-toolbar class="rule-editor-toolbar">
        <mat-toolbar-row>
          <span class="toolbar-title">
            <mat-icon>rule</mat-icon>
            Visual Rule Builder
          </span>

          <span class="toolbar-spacer"></span>

          <!-- Mode Selector -->
          <mat-button-toggle-group
            [value]="currentState?.mode"
            (change)="onModeChange($event)"
          >
            <mat-button-toggle value="visual">
              <mat-icon>view_module</mat-icon>
              Visual
            </mat-button-toggle>
            <mat-button-toggle value="dsl">
              <mat-icon>code</mat-icon>
              DSL
            </mat-button-toggle>
            <mat-button-toggle value="json">
              <mat-icon>data_object</mat-icon>
              JSON
            </mat-button-toggle>
          </mat-button-toggle-group>

          <!-- Action Buttons -->
          <button
            mat-icon-button
            [disabled]="!canUndo"
            (click)="undo()"
            matTooltip="Undo"
          >
            <mat-icon>undo</mat-icon>
          </button>

          <button
            mat-icon-button
            [disabled]="!canRedo"
            (click)="redo()"
            matTooltip="Redo"
          >
            <mat-icon>redo</mat-icon>
          </button>

          <button
            mat-icon-button
            (click)="clearRules()"
            matTooltip="Clear All Rules"
          >
            <mat-icon>clear_all</mat-icon>
          </button>

          <button mat-button (click)="openExportDialog()" color="primary">
            <mat-icon>download</mat-icon>
            Export
          </button>

          <button mat-button (click)="importRules()" color="accent">
            <mat-icon>upload</mat-icon>
            Import
          </button>
        </mat-toolbar-row>
      </mat-toolbar>

      <!-- Main Content Area -->
      <div class="rule-editor-content">
        <!-- Sidebar -->
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav mode="side" opened="true" class="rule-editor-sidebar">
            <!-- Rules List -->
            <div class="sidebar-section">
              <h3 class="sidebar-title">
                <mat-icon>list</mat-icon>
                Rules
              </h3>

              <div
                class="rules-list"
                cdkDropList
                (cdkDropListDropped)="onRuleDrop($event)"
              >
                <div
                  *ngFor="
                    let nodeId of currentState?.rootNodes;
                    trackBy: trackByNodeId
                  "
                  class="rule-item"
                  [class.selected]="isNodeSelected(nodeId)"
                  cdkDrag
                  (click)="selectNode(nodeId)"
                >
                  <div class="rule-item-content">
                    <mat-icon class="rule-type-icon">{{
                      getNodeIcon(getNode(nodeId))
                    }}</mat-icon>
                    <span class="rule-label">{{ getNodeLabel(nodeId) }}</span>

                    <div class="rule-actions">
                      <button
                        mat-icon-button
                        size="small"
                        (click)="editNode(nodeId); $event.stopPropagation()"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>

                      <button
                        mat-icon-button
                        size="small"
                        color="warn"
                        (click)="removeNode(nodeId); $event.stopPropagation()"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Nested Rules -->
                  <div *ngIf="hasChildren(nodeId)" class="nested-rules">
                    <div
                      *ngFor="let childId of getChildren(nodeId)"
                      class="nested-rule-item"
                      [class.selected]="isNodeSelected(childId)"
                      (click)="selectNode(childId); $event.stopPropagation()"
                    >
                      <mat-icon class="rule-type-icon">{{
                        getNodeIcon(getNode(childId))
                      }}</mat-icon>
                      <span class="rule-label">{{
                        getNodeLabel(childId)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Rule Button -->
              <button
                mat-fab
                color="primary"
                class="add-rule-fab"
                (click)="showAddRuleDialog()"
              >
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <mat-divider></mat-divider>

            <!-- Field Palette -->
            <div class="sidebar-section">
              <h3 class="sidebar-title">
                <mat-icon>view_list</mat-icon>
                Fields
              </h3>

              <div class="field-palette">
                <div
                  *ngFor="let category of fieldCategories"
                  class="field-category"
                >
                  <h4 class="category-title">{{ category.name }}</h4>

                  <div
                    *ngFor="let field of category.fields"
                    class="field-item"
                    draggable="true"
                    (dragstart)="onFieldDragStart(field, $event)"
                  >
                    <mat-icon class="field-icon">{{
                      getFieldIcon(field.type)
                    }}</mat-icon>
                    <span class="field-label">{{ field.label }}</span>
                    <span class="field-type">{{ field.type }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-sidenav>

          <!-- Main Editor Area -->
          <mat-sidenav-content class="editor-content">
            <div class="editor-tabs">
              <mat-tab-group [(selectedIndex)]="activeTabIndex">
                <!-- Visual Builder Tab -->
                <mat-tab label="Visual Builder">
                  <div class="visual-builder">
                    <praxis-rule-canvas
                      [state]="currentState"
                      [fieldSchemas]="fieldSchemas"
                      (nodeSelected)="selectNode($event)"
                      (nodeAdded)="onNodeAdded($event)"
                      (nodeUpdated)="onNodeUpdated($event)"
                      (nodeRemoved)="removeNode($event)"
                    >
                    </praxis-rule-canvas>
                  </div>
                </mat-tab>

                <!-- Metadata Editor Tab -->
                <mat-tab label="Metadata">
                  <div class="metadata-editor">
                    <praxis-metadata-editor
                      [selectedNode]="selectedNode"
                      (metadataUpdated)="onMetadataUpdated($event)"
                    >
                    </praxis-metadata-editor>
                  </div>
                </mat-tab>

                <!-- DSL Viewer Tab -->
                <mat-tab label="DSL Preview">
                  <div class="dsl-viewer">
                    <praxis-dsl-viewer
                      [dsl]="currentState?.currentDSL || ''"
                      [editable]="currentState?.mode === 'dsl'"
                      (dslChanged)="onDslChanged($event)"
                    >
                    </praxis-dsl-viewer>
                  </div>
                </mat-tab>

                <!-- JSON Viewer Tab -->
                <mat-tab label="JSON Preview">
                  <div class="json-viewer">
                    <praxis-json-viewer
                      [json]="currentState?.currentJSON"
                      [editable]="currentState?.mode === 'json'"
                      (jsonChanged)="onJsonChanged($event)"
                    >
                    </praxis-json-viewer>
                  </div>
                </mat-tab>

                <!-- Round-Trip Tester Tab -->
                <mat-tab label="Round-Trip Validation">
                  <div class="round-trip-tester">
                    <praxis-round-trip-tester></praxis-round-trip-tester>
                  </div>
                </mat-tab>

                <!-- DSL Linter Tab -->
                <mat-tab label="DSL Linter">
                  <div class="dsl-linter">
                    <praxis-dsl-linter
                      [dsl]="currentState?.currentDSL || ''"
                      [autoLint]="true"
                      (errorSelected)="onLinterErrorSelected($event)"
                      (quickFixApplied)="onQuickFixApplied($event)"
                      (ruleToggled)="onLinterRuleToggled($event)"
                    >
                    </praxis-dsl-linter>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          <span class="node-count">{{ getRuleCount() }} rules</span>
          <span *ngIf="currentState?.isDirty" class="dirty-indicator">•</span>
        </div>

        <div class="status-center">
          <div
            *ngIf="validationErrors && validationErrors.length > 0"
            class="validation-status error"
          >
            <mat-icon>error</mat-icon>
            {{ validationErrors.length }} error(s)
          </div>
          <div
            *ngIf="validationErrors?.length === 0"
            class="validation-status success"
          >
            <mat-icon>check_circle</mat-icon>
            Valid
          </div>
        </div>

        <div class="status-right">
          <span class="mode-indicator">{{
            currentState?.mode?.toUpperCase()
          }}</span>
        </div>
      </div>

      <!-- Validation Errors Panel -->
      <div
        *ngIf="showValidationErrors && validationErrors && validationErrors.length > 0"
        class="validation-panel"
      >
        <div class="validation-header">
          <h3>Validation Errors</h3>
          <button mat-icon-button (click)="hideValidationErrors()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="validation-list">
          <div
            *ngFor="let error of validationErrors"
            class="validation-error"
            [class]="error.severity"
          >
            <mat-icon>{{ getErrorIcon(error.severity) }}</mat-icon>
            <div class="error-content">
              <div class="error-message">{{ error.message }}</div>
              <div *ngIf="error.suggestion" class="error-suggestion">
                Suggestion: {{ error.suggestion }}
              </div>
            </div>
            <button
              *ngIf="error.nodeId"
              mat-icon-button
              (click)="selectNode(error.nodeId)"
            >
              <mat-icon>my_location</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rule-editor-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      .rule-editor-toolbar {
        background: var(--mdc-theme-primary);
        color: white;
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

      .rule-editor-content {
        flex: 1;
        overflow: hidden;
      }

      .sidenav-container {
        height: 100%;
      }

      .rule-editor-sidebar {
        width: 300px;
        padding: 16px;
        background: var(--mdc-theme-surface);
        border-right: 1px solid var(--mdc-theme-outline);
      }

      .sidebar-section {
        margin-bottom: 24px;
      }

      .sidebar-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface-variant);
      }

      .rules-list {
        min-height: 200px;
      }

      .rule-item {
        margin-bottom: 8px;
        padding: 12px;
        border: 1px solid var(--mdc-theme-outline);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .rule-item:hover {
        border-color: var(--mdc-theme-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .rule-item.selected {
        border-color: var(--mdc-theme-primary);
        background: var(--mdc-theme-primary-container);
      }

      .rule-item-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rule-type-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--mdc-theme-primary);
      }

      .rule-label {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
      }

      .rule-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .rule-item:hover .rule-actions {
        opacity: 1;
      }

      .nested-rules {
        margin-top: 8px;
        margin-left: 24px;
        border-left: 2px solid var(--mdc-theme-outline);
        padding-left: 12px;
      }

      .nested-rule-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }

      .nested-rule-item:hover {
        background: var(--mdc-theme-surface-variant);
      }

      .nested-rule-item.selected {
        background: var(--mdc-theme-primary-container);
      }

      .add-rule-fab {
        position: absolute;
        bottom: 16px;
        right: 16px;
        scale: 0.8;
      }

      .field-palette {
        max-height: 300px;
        overflow-y: auto;
      }

      .field-category {
        margin-bottom: 16px;
      }

      .category-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--mdc-theme-primary);
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        cursor: grab;
        font-size: 13px;
        transition: background 0.2s ease;
      }

      .field-item:hover {
        background: var(--mdc-theme-surface-variant);
      }

      .field-item:active {
        cursor: grabbing;
      }

      .field-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--mdc-theme-secondary);
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

      .editor-content {
        background: var(--mdc-theme-background);
      }

      .editor-tabs {
        height: 100%;
      }

      .visual-builder,
      .metadata-editor,
      .dsl-viewer,
      .json-viewer,
      .round-trip-tester,
      .dsl-linter {
        height: calc(100vh - 200px);
        padding: 16px;
      }

      .round-trip-tester,
      .dsl-linter {
        padding: 0; /* Let the component handle its own padding */
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: var(--mdc-theme-surface-variant);
        border-top: 1px solid var(--mdc-theme-outline);
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .status-left,
      .status-center,
      .status-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dirty-indicator {
        color: var(--mdc-theme-primary);
        font-weight: bold;
      }

      .validation-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
      }

      .validation-status.error {
        color: var(--mdc-theme-error);
      }

      .validation-status.success {
        color: var(--mdc-theme-tertiary);
      }

      .validation-status mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .mode-indicator {
        font-weight: 600;
        color: var(--mdc-theme-primary);
      }

      .validation-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 200px;
        background: var(--mdc-theme-surface);
        border-top: 1px solid var(--mdc-theme-outline);
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }

      .validation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--mdc-theme-outline);
      }

      .validation-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }

      .validation-list {
        max-height: 150px;
        overflow-y: auto;
        padding: 8px;
      }

      .validation-error {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .validation-error.error {
        background: var(--mdc-theme-error-container);
        color: var(--mdc-theme-on-error-container);
      }

      .validation-error.warning {
        background: var(--mdc-theme-warning-container);
        color: var(--mdc-theme-on-warning-container);
      }

      .validation-error.info {
        background: var(--mdc-theme-info-container);
        color: var(--mdc-theme-on-info-container);
      }

      .error-content {
        flex: 1;
      }

      .error-message {
        font-weight: 500;
        margin-bottom: 2px;
      }

      .error-suggestion {
        font-size: 12px;
        opacity: 0.8;
      }

      /* Drag and drop styles */
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow:
          0 5px 5px -3px rgba(0, 0, 0, 0.2),
          0 8px 10px 1px rgba(0, 0, 0, 0.14),
          0 3px 14px 2px rgba(0, 0, 0, 0.12);
      }

      .cdk-drag-placeholder {
        opacity: 0;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .rule-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class RuleEditorComponent implements OnInit, OnDestroy {
  @Input() config: RuleBuilderConfig | null = null;
  @Input() initialRules: any = null;

  @Output() rulesChanged = new EventEmitter<any>();
  @Output() exportRequested = new EventEmitter<ExportOptions>();
  @Output() importRequested = new EventEmitter<ImportOptions>();

  private destroy$ = new Subject<void>();

  // Component state
  currentState: RuleBuilderState | null = null;
  validationErrors: ValidationError[] = [];
  selectedNode: RuleNode | null = null;
  fieldSchemas: Record<string, FieldSchema> = {};
  fieldCategories: any[] = [];

  activeTabIndex = 0;
  showValidationErrors = false;

  // Computed properties
  get canUndo(): boolean {
    return (this.currentState?.historyPosition || 0) > 0;
  }

  get canRedo(): boolean {
    return (
      (this.currentState?.historyPosition || 0) <
      (this.currentState?.history.length || 0) - 1
    );
  }

  constructor(
    private ruleBuilderService: RuleBuilderService,
    private fieldSchemaService: FieldSchemaService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.initializeBuilder();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to rule builder state changes
    this.ruleBuilderService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.currentState = state;
        this.updateSelectedNode();
        this.rulesChanged.emit(state);
      });

    // Subscribe to validation errors
    this.ruleBuilderService.validationErrors$
      .pipe(takeUntil(this.destroy$))
      .subscribe((errors) => {
        this.validationErrors = errors;
        this.showValidationErrors = errors.length > 0;
      });

    // Subscribe to node selection
    this.ruleBuilderService.nodeSelected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((nodeId) => {
        this.updateSelectedNode();
      });

    // Subscribe to field schemas
    combineLatest([
      this.fieldSchemaService.fieldSchemas$,
      this.fieldSchemaService.getFieldSchemasByCategory(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([schemas, categories]) => {
        this.fieldSchemas = schemas;
        this.fieldCategories = Object.entries(categories).map(
          ([name, fields]) => ({
            name,
            fields,
          }),
        );
      });
  }

  private initializeBuilder(): void {
    if (this.config) {
      this.ruleBuilderService.initialize(this.config);
      this.fieldSchemaService.setFieldSchemas(this.config.fieldSchemas as Record<string, FieldSchema>);

      if (this.config.contextVariables) {
        this.fieldSchemaService.setContext({
          contextVariables: this.config.contextVariables as ContextVariable[],
          customFunctions: this.config.customFunctions as CustomFunction[],
        });
      }
    }

    if (this.initialRules) {
      this.importInitialRules();
    }
  }

  private importInitialRules(): void {
    try {
      this.ruleBuilderService.import(
        typeof this.initialRules === 'string'
          ? this.initialRules
          : JSON.stringify(this.initialRules),
        { format: 'json' },
      );
    } catch (error) {
      console.error('Failed to import initial rules:', error);
      this.snackBar.open('Failed to import initial rules', 'Close', {
        duration: 3000,
      });
    }
  }

  private updateSelectedNode(): void {
    if (this.currentState?.selectedNodeId) {
      this.selectedNode =
        this.currentState.nodes[this.currentState.selectedNodeId] || null;
    } else {
      this.selectedNode = null;
    }
  }

  // Template methods
  trackByNodeId(index: number, nodeId: string): string {
    return nodeId;
  }

  getNode(nodeId: string): RuleNode | null {
    return this.currentState?.nodes[nodeId] || null;
  }

  getNodeLabel(nodeId: string): string {
    const node = this.getNode(nodeId);
    return node?.label || node?.type || 'Unknown';
  }

  getNodeIcon(node: RuleNode | null): string {
    if (!node) return 'help';

    const icons: Record<RuleNodeType, string> = {
      [RuleNodeType.FIELD_CONDITION]: 'compare_arrows',
      [RuleNodeType.AND_GROUP]: 'join_inner',
      [RuleNodeType.OR_GROUP]: 'join_full',
      [RuleNodeType.NOT_GROUP]: 'block',
      [RuleNodeType.XOR_GROUP]: 'join_left',
      [RuleNodeType.IMPLIES_GROUP]: 'arrow_forward',
      // Phase 1: Conditional Validators (Enhanced Icons)
      [RuleNodeType.REQUIRED_IF]: 'star_border',
      [RuleNodeType.VISIBLE_IF]: 'visibility',
      [RuleNodeType.DISABLED_IF]: 'block',
      [RuleNodeType.READONLY_IF]: 'lock_outline',
      [RuleNodeType.FOR_EACH]: 'repeat',
      [RuleNodeType.UNIQUE_BY]: 'fingerprint',
      [RuleNodeType.MIN_LENGTH]: 'height',
      [RuleNodeType.MAX_LENGTH]: 'height',
      [RuleNodeType.IF_DEFINED]: 'help',
      [RuleNodeType.IF_NOT_NULL]: 'help_outline',
      [RuleNodeType.IF_EXISTS]: 'search',
      [RuleNodeType.WITH_DEFAULT]: 'settings_backup_restore',
      [RuleNodeType.FUNCTION_CALL]: 'functions',
      [RuleNodeType.FIELD_TO_FIELD]: 'compare_arrows',
      [RuleNodeType.CONTEXTUAL]: 'dynamic_form',
      [RuleNodeType.AT_LEAST]: 'filter_list',
      [RuleNodeType.EXACTLY]: 'looks_one',
      [RuleNodeType.EXPRESSION]: 'code',
      [RuleNodeType.CONTEXTUAL_TEMPLATE]: 'view_module',
      [RuleNodeType.CUSTOM]: 'extension',
    };

    return icons[node.type] || 'help';
  }

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

  isNodeSelected(nodeId: string): boolean {
    return this.currentState?.selectedNodeId === nodeId;
  }

  hasChildren(nodeId: string): boolean {
    const node = this.getNode(nodeId);
    return !!(node?.children && node.children.length > 0);
  }

  getChildren(nodeId: string): string[] {
    const node = this.getNode(nodeId);
    return node?.children || [];
  }

  getRuleCount(): number {
    return Object.keys(this.currentState?.nodes || {}).length;
  }

  getErrorIcon(severity: string): string {
    const icons: Record<string, string> = {
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return icons[severity] || 'info';
  }

  // Event handlers
  onModeChange(event: MatButtonToggleChange): void {
    const mode = event.value as any;
    // Handle mode change
  }

  selectNode(nodeId?: string): void {
    this.ruleBuilderService.selectNode(nodeId);
  }

  editNode(nodeId: string): void {
    // Open edit dialog or navigate to metadata tab
    this.selectNode(nodeId);
    this.activeTabIndex = 1; // Metadata tab
  }

  removeNode(nodeId: string): void {
    this.ruleBuilderService.removeNode(nodeId);
    this.snackBar
      .open('Rule removed', 'Undo', { duration: 3000 })
      .onAction()
      .subscribe(() => {
        this.undo();
      });
  }

  onRuleDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      // Handle rule reordering
    }
  }

  onFieldDragStart(field: FieldSchema, event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('field', JSON.stringify(field));
    }
  }

  showAddRuleDialog(): void {
    // Open add rule dialog
  }

  onNodeAdded(event: any): void {
    // Handle node added from canvas
  }

  onNodeUpdated(event: any): void {
    // Handle node updated from canvas
  }

  onMetadataUpdated(event: any): void {
    if (this.selectedNode) {
      this.ruleBuilderService.updateNode(this.selectedNode.id, {
        metadata: event,
      });
    }
  }

  onDslChanged(dsl: string): void {
    try {
      this.ruleBuilderService.import(dsl, { format: 'dsl', merge: false });
      this.snackBar.open('DSL imported successfully', 'Close', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to import DSL:', error);
      this.snackBar.open('Failed to import DSL: Invalid syntax', 'Close', {
        duration: 3000,
      });
    }
  }

  onJsonChanged(json: any): void {
    try {
      const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
      this.ruleBuilderService.import(jsonString, {
        format: 'json',
        merge: false,
      });
      this.snackBar.open('JSON imported successfully', 'Close', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to import JSON:', error);
      this.snackBar.open('Failed to import JSON: Invalid format', 'Close', {
        duration: 3000,
      });
    }
  }

  undo(): void {
    this.ruleBuilderService.undo();
  }

  redo(): void {
    this.ruleBuilderService.redo();
  }

  clearRules(): void {
    this.ruleBuilderService.clear();
    this.snackBar.open('All rules cleared', 'Close', { duration: 2000 });
  }

  openExportDialog(): void {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        title: 'Export Rules',
        allowMultipleFormats: true,
        preselectedFormat: this.currentState?.mode === 'dsl' ? 'dsl' : 'json',
        showIntegrationTab: true,
        showSharingTab: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle any post-export actions if needed
        this.snackBar.open('Export completed', 'Close', { duration: 2000 });
      }
    });
  }

  importRules(): void {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.dsl,.txt';
    input.multiple = false;

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const format =
            file.name.endsWith('.dsl') || file.name.endsWith('.txt')
              ? 'dsl'
              : 'json';

          this.ruleBuilderService.import(content, { format, merge: false });
          this.snackBar.open(`Rules imported from ${file.name}`, 'Close', {
            duration: 2000,
          });
        } catch (error) {
          console.error('Import failed:', error);
          this.snackBar.open(
            'Failed to import rules: Invalid format',
            'Close',
            { duration: 3000 },
          );
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  hideValidationErrors(): void {
    this.showValidationErrors = false;
  }

  onLinterErrorSelected(error: any): void {
    // Navigate to the error location in DSL viewer
    this.activeTabIndex = 2; // DSL Preview tab
    // Additional logic to highlight the specific line/column could be added here
    console.log('Navigate to linter error:', error);
  }

  onQuickFixApplied(event: any): void {
    // Apply the quick fix to the DSL
    const { error, fix } = event;

    try {
      // Get current DSL
      let currentDsl = this.currentState?.currentDSL || '';

      // Apply edits from the quick fix
      if (fix.edits && fix.edits.length > 0) {
        const lines = currentDsl.split('\n');

        // Apply edits in reverse order to maintain line/column positions
        fix.edits
          .sort((a: any, b: any) => b.range.startLine - a.range.startLine)
          .forEach((edit: any) => {
            const lineIndex = edit.range.startLine - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
              const line = lines[lineIndex];
              const before = line.substring(0, edit.range.startColumn - 1);
              const after = line.substring(edit.range.endColumn - 1);
              lines[lineIndex] = before + edit.newText + after;
            }
          });

        const fixedDsl = lines.join('\n');

        // Import the fixed DSL
        this.ruleBuilderService.import(fixedDsl, {
          format: 'dsl',
          merge: false,
        });
        this.snackBar.open(`Quick fix applied: ${fix.title}`, 'Close', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to apply quick fix:', error);
      this.snackBar.open('Failed to apply quick fix', 'Close', {
        duration: 3000,
      });
    }
  }

  onLinterRuleToggled(event: any): void {
    const { rule, enabled } = event;
    console.log(`Linter rule ${rule.id} ${enabled ? 'enabled' : 'disabled'}`);

    // Save linter rule preferences (could be stored in local storage or user preferences)
    const preferences = JSON.parse(
      localStorage.getItem('dsl-linter-rules') || '{}',
    );
    preferences[rule.id] = enabled;
    localStorage.setItem('dsl-linter-rules', JSON.stringify(preferences));

    this.snackBar.open(
      `Rule "${rule.name}" ${enabled ? 'enabled' : 'disabled'}`,
      'Close',
      { duration: 2000 },
    );
  }
}
