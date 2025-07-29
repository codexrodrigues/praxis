import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ContextVariable } from './expression-editor.component';

/**
 * Context scope configuration
 */
export interface ContextScope {
  /** Scope identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon */
  icon: string;
  /** Whether this scope is editable */
  editable: boolean;
  /** Default variables for this scope */
  defaultVariables?: Partial<ContextVariable>[];
}

/**
 * Variable validation rule
 */
export interface VariableValidationRule {
  /** Rule type */
  type: 'required' | 'pattern' | 'range' | 'custom';
  /** Rule value/configuration */
  value?: any;
  /** Error message */
  message: string;
}

/**
 * Enhanced context variable with validation and metadata
 */
export interface EnhancedContextVariable extends ContextVariable {
  /** Unique ID */
  id: string;
  /** Whether variable is read-only */
  readOnly?: boolean;
  /** Validation rules */
  validationRules?: VariableValidationRule[];
  /** Default value */
  defaultValue?: any;
  /** Whether variable is required */
  required?: boolean;
  /** Variable category */
  category?: string;
  /** Creation date */
  createdAt?: Date;
  /** Last modified date */
  modifiedAt?: Date;
  /** Usage count */
  usageCount?: number;
}

/**
 * Variable import/export format
 */
export interface VariableExportData {
  /** Export metadata */
  metadata: {
    exportedAt: string;
    exportedBy: string;
    version: string;
  };
  /** Context scopes */
  scopes: ContextScope[];
  /** Variables */
  variables: EnhancedContextVariable[];
}

@Component({
  selector: 'praxis-context-variable-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule,
    MatExpansionModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="context-variable-manager">
      <!-- Header -->
      <div class="manager-header">
        <div class="header-title">
          <mat-icon>data_object</mat-icon>
          <span>Context Variable Manager</span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button 
                  color="primary"
                  (click)="addVariable()">
            <mat-icon>add</mat-icon>
            Add Variable
          </button>
          <button mat-stroked-button 
                  [matMenuTriggerFor]="importExportMenu">
            <mat-icon>import_export</mat-icon>
            Import/Export
          </button>
          <button mat-icon-button 
                  matTooltip="Refresh"
                  (click)="refreshVariables()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content Tabs -->
      <mat-tab-group class="manager-tabs" animationDuration="0ms">
        <!-- Variables Management Tab -->
        <mat-tab label="Variables">
          <div class="tab-content">
            <!-- Scope Filter -->
            <div class="scope-filter">
              <mat-form-field appearance="outline">
                <mat-label>Filter by Scope</mat-label>
                <mat-select [(value)]="selectedScope" (selectionChange)="onScopeChange()">
                  <mat-option value="">All Scopes</mat-option>
                  <mat-option *ngFor="let scope of contextScopes" [value]="scope.id">
                    <div class="scope-option">
                      <mat-icon>{{ scope.icon }}</mat-icon>
                      <span>{{ scope.name }}</span>
                    </div>
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Search Variables</mat-label>
                <input matInput 
                       [(ngModel)]="searchQuery" 
                       (ngModelChange)="onSearchChange()"
                       placeholder="Name, type, or description">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>

            <!-- Variables Table -->
            <div class="variables-table-container">
              <table mat-table 
                     [dataSource]="filteredVariables" 
                     matSort 
                     class="variables-table">
                
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                  <td mat-cell *matCellDef="let variable">
                    <div class="variable-name">
                      <code>\${{ variable.name }}</code>
                      <mat-icon *ngIf="variable.readOnly" 
                               matTooltip="Read-only"
                               class="read-only-icon">lock</mat-icon>
                    </div>
                  </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                  <td mat-cell *matCellDef="let variable">
                    <mat-chip class="type-chip" [class]="'type-' + variable.type">
                      {{ variable.type }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Scope Column -->
                <ng-container matColumnDef="scope">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Scope</th>
                  <td mat-cell *matCellDef="let variable">
                    <div class="scope-info">
                      <mat-icon class="scope-icon">{{ getScopeIcon(variable.scope) }}</mat-icon>
                      <span>{{ variable.scope }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Description Column -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let variable">
                    <span class="variable-description">{{ variable.description || 'No description' }}</span>
                  </td>
                </ng-container>

                <!-- Default Value Column -->
                <ng-container matColumnDef="defaultValue">
                  <th mat-header-cell *matHeaderCellDef>Default Value</th>
                  <td mat-cell *matCellDef="let variable">
                    <code class="default-value" *ngIf="variable.defaultValue !== undefined">
                      {{ formatValue(variable.defaultValue) }}
                    </code>
                    <span class="no-default" *ngIf="variable.defaultValue === undefined">-</span>
                  </td>
                </ng-container>

                <!-- Usage Column -->
                <ng-container matColumnDef="usage">
                  <th mat-header-cell *matHeaderCellDef>Usage</th>
                  <td mat-cell *matCellDef="let variable">
                    <span class="usage-count">{{ variable.usageCount || 0 }}</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let variable">
                    <div class="action-buttons">
                      <button mat-icon-button 
                              matTooltip="Edit Variable"
                              (click)="editVariable(variable)"
                              [disabled]="variable.readOnly">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button 
                              matTooltip="Copy Variable Reference"
                              (click)="copyVariableReference(variable)">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                      <button mat-icon-button 
                              matTooltip="Delete Variable"
                              (click)="deleteVariable(variable)"
                              [disabled]="variable.readOnly"
                              color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="filteredVariables.length === 0">
                <mat-icon class="empty-icon">data_object</mat-icon>
                <h3>No Variables Found</h3>
                <p>{{ getEmptyStateMessage() }}</p>
                <button mat-stroked-button 
                        color="primary" 
                        (click)="addVariable()">
                  <mat-icon>add</mat-icon>
                  Add First Variable
                </button>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Scope Management Tab -->
        <mat-tab label="Scopes">
          <div class="tab-content">
            <div class="scopes-grid">
              <mat-card *ngFor="let scope of contextScopes" class="scope-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar>{{ scope.icon }}</mat-icon>
                  <mat-card-title>{{ scope.name }}</mat-card-title>
                  <mat-card-subtitle>{{ scope.description }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="scope-stats">
                    <div class="stat-item">
                      <span class="stat-label">Variables:</span>
                      <span class="stat-value">{{ getVariableCountForScope(scope.id) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Editable:</span>
                      <mat-icon class="status-icon" [color]="scope.editable ? 'primary' : 'warn'">
                        {{ scope.editable ? 'check_circle' : 'block' }}
                      </mat-icon>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button (click)="viewScopeVariables(scope)">
                    <mat-icon>visibility</mat-icon>
                    View Variables
                  </button>
                  <button mat-button 
                          (click)="editScope(scope)"
                          [disabled]="!scope.editable">
                    <mat-icon>edit</mat-icon>
                    Edit Scope
                  </button>
                </mat-card-actions>
              </mat-card>

              <!-- Add Scope Card -->
              <mat-card class="add-scope-card">
                <mat-card-content class="add-scope-content">
                  <mat-icon class="add-icon">add_circle</mat-icon>
                  <h3>Add Custom Scope</h3>
                  <p>Create a new context scope for organizing variables</p>
                  <button mat-stroked-button 
                          color="primary" 
                          (click)="addScope()">
                    <mat-icon>add</mat-icon>
                    Add Scope
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Variable Editor Tab -->
        <mat-tab label="Editor" [disabled]="!editingVariable">
          <div class="tab-content" *ngIf="editingVariable">
            <form [formGroup]="variableForm" class="variable-form">
              <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Variable Name</mat-label>
                    <input matInput 
                           formControlName="name"
                           placeholder="variableName"
                           [readonly]="editingVariable?.readOnly">
                    <mat-hint>Use camelCase or snake_case</mat-hint>
                    <mat-error *ngIf="variableForm.get('name')?.hasError('required')">
                      Variable name is required
                    </mat-error>
                    <mat-error *ngIf="variableForm.get('name')?.hasError('pattern')">
                      Invalid variable name format
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Variable Type</mat-label>
                    <mat-select formControlName="type">
                      <mat-option value="string">String</mat-option>
                      <mat-option value="number">Number</mat-option>
                      <mat-option value="boolean">Boolean</mat-option>
                      <mat-option value="date">Date</mat-option>
                      <mat-option value="object">Object</mat-option>
                      <mat-option value="array">Array</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Scope</mat-label>
                    <mat-select formControlName="scope">
                      <mat-option *ngFor="let scope of editableScopes" [value]="scope.id">
                        <div class="scope-option">
                          <mat-icon>{{ scope.icon }}</mat-icon>
                          <span>{{ scope.name }}</span>
                        </div>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput 
                            formControlName="description"
                            rows="2"
                            placeholder="Describe what this variable represents"></textarea>
                </mat-form-field>
              </div>

              <div class="form-section">
                <h3>Configuration</h3>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Default Value</mat-label>
                    <input matInput 
                           formControlName="defaultValue"
                           [placeholder]="getDefaultValuePlaceholder()">
                    <mat-hint>Optional default value for this variable</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Example Value</mat-label>
                    <input matInput 
                           formControlName="example"
                           placeholder="Example value for documentation">
                  </mat-form-field>
                </div>

                <div class="checkbox-row">
                  <mat-checkbox formControlName="required">
                    Required Variable
                  </mat-checkbox>
                  <mat-checkbox formControlName="readOnly">
                    Read-only Variable
                  </mat-checkbox>
                </div>
              </div>

              <div class="form-section">
                <h3>Validation Rules</h3>
                <div class="validation-rules">
                  <div formArrayName="validationRules">
                    <div *ngFor="let rule of validationRulesArray.controls; let i = index" 
                         [formGroupName]="i" 
                         class="validation-rule">
                      <mat-form-field appearance="outline">
                        <mat-label>Rule Type</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="required">Required</mat-option>
                          <mat-option value="pattern">Pattern</mat-option>
                          <mat-option value="range">Range</mat-option>
                          <mat-option value="custom">Custom</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Rule Value</mat-label>
                        <input matInput formControlName="value">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Error Message</mat-label>
                        <input matInput formControlName="message">
                      </mat-form-field>

                      <button mat-icon-button 
                              color="warn"
                              (click)="removeValidationRule(i)"
                              matTooltip="Remove Rule">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <button mat-stroked-button 
                          (click)="addValidationRule()"
                          class="add-rule-button">
                    <mat-icon>add</mat-icon>
                    Add Validation Rule
                  </button>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button (click)="cancelEdit()">
                  Cancel
                </button>
                <button mat-flat-button 
                        color="primary"
                        (click)="saveVariable()"
                        [disabled]="!variableForm.valid">
                  {{ editingVariable.id ? 'Update' : 'Create' }} Variable
                </button>
              </div>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Import/Export Menu -->
      <mat-menu #importExportMenu="matMenu">
        <button mat-menu-item (click)="exportVariables()">
          <mat-icon>download</mat-icon>
          Export Variables
        </button>
        <button mat-menu-item (click)="importVariables()">
          <mat-icon>upload</mat-icon>
          Import Variables
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="exportToClipboard()">
          <mat-icon>content_copy</mat-icon>
          Copy to Clipboard
        </button>
        <button mat-menu-item (click)="loadDefaultVariables()">
          <mat-icon>restore</mat-icon>
          Load Defaults
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .context-variable-manager {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }

    .manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--mdc-theme-outline);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 500;
      color: var(--mdc-theme-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .manager-tabs {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px 0;
    }

    /* Variables Tab */
    .scope-filter {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: flex-end;
    }

    .scope-filter mat-form-field {
      min-width: 200px;
    }

    .scope-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .variables-table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .variables-table {
      width: 100%;
    }

    .variable-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .variable-name code {
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .read-only-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mdc-theme-outline);
    }

    .type-chip {
      font-size: 11px;
      height: 24px;
      line-height: 24px;
    }

    .type-string { background: #E3F2FD; color: #1976D2; }
    .type-number { background: #E8F5E8; color: #388E3C; }
    .type-boolean { background: #FFF3E0; color: #F57C00; }
    .type-date { background: #F3E5F5; color: #7B1FA2; }
    .type-object { background: #FFEBEE; color: #C62828; }
    .type-array { background: #E0F2F1; color: #00695C; }

    .scope-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .scope-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mdc-theme-primary);
    }

    .variable-description {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .default-value {
      background: var(--mdc-theme-surface-variant);
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 11px;
    }

    .no-default {
      color: var(--mdc-theme-on-surface-variant);
      font-style: italic;
    }

    .usage-count {
      background: var(--mdc-theme-secondary-container);
      color: var(--mdc-theme-on-secondary-container);
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
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
      margin-bottom: 16px;
      color: var(--mdc-theme-outline);
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-on-surface);
    }

    .empty-state p {
      margin: 0 0 24px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Scopes Tab */
    .scopes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .scope-card {
      height: fit-content;
    }

    .scope-stats {
      margin: 16px 0;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .stat-label {
      font-weight: 500;
    }

    .stat-value {
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .status-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .add-scope-card {
      border: 2px dashed var(--mdc-theme-outline);
      background: var(--mdc-theme-surface-variant);
    }

    .add-scope-content {
      text-align: center;
      padding: 32px 16px;
    }

    .add-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mdc-theme-primary);
      margin-bottom: 16px;
    }

    .add-scope-content h3 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-on-surface);
    }

    .add-scope-content p {
      margin: 0 0 24px 0;
      color: var(--mdc-theme-on-surface-variant);
    }

    /* Variable Editor Tab */
    .variable-form {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--mdc-theme-outline);
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
      font-size: 18px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .validation-rules {
      background: var(--mdc-theme-surface-variant);
      padding: 16px;
      border-radius: 8px;
    }

    .validation-rule {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr auto;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 12px;
      padding: 12px;
      background: white;
      border-radius: 4px;
    }

    .add-rule-button {
      margin-top: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--mdc-theme-outline);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .context-variable-manager {
        padding: 8px;
      }

      .manager-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .scope-filter {
        flex-direction: column;
        align-items: stretch;
      }

      .scope-filter mat-form-field {
        min-width: auto;
      }

      .scopes-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .validation-rule {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .checkbox-row {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class ContextVariableManagerComponent implements OnInit, OnDestroy {
  @Input() variables: EnhancedContextVariable[] = [];
  @Input() scopes: ContextScope[] = [];
  @Input() readonly = false;

  @Output() variablesChanged = new EventEmitter<EnhancedContextVariable[]>();
  @Output() scopesChanged = new EventEmitter<ContextScope[]>();
  @Output() variableSelected = new EventEmitter<EnhancedContextVariable>();

  private destroy$ = new Subject<void>();

  // State management
  filteredVariables: EnhancedContextVariable[] = [];
  selectedScope = '';
  searchQuery = '';
  editingVariable: Partial<EnhancedContextVariable> | null = null;

  // Form management
  variableForm: FormGroup;

  // Table configuration
  displayedColumns = ['name', 'type', 'scope', 'description', 'defaultValue', 'usage', 'actions'];

  // Context scopes
  contextScopes: ContextScope[] = [
    {
      id: 'user',
      name: 'User Context',
      description: 'Variables related to the current user',
      icon: 'person',
      editable: true,
      defaultVariables: [
        { name: 'id', type: 'string', description: 'User ID' },
        { name: 'email', type: 'string', description: 'User email address' },
        { name: 'role', type: 'string', description: 'User role' },
        { name: 'permissions', type: 'array', description: 'User permissions' }
      ]
    },
    {
      id: 'session',
      name: 'Session Context',
      description: 'Variables related to the current session',
      icon: 'schedule',
      editable: true,
      defaultVariables: [
        { name: 'id', type: 'string', description: 'Session ID' },
        { name: 'startTime', type: 'date', description: 'Session start time' },
        { name: 'ip', type: 'string', description: 'Client IP address' },
        { name: 'userAgent', type: 'string', description: 'Client user agent' }
      ]
    },
    {
      id: 'env',
      name: 'Environment',
      description: 'Environment configuration variables',
      icon: 'settings',
      editable: false,
      defaultVariables: [
        { name: 'stage', type: 'string', description: 'Environment stage (dev/test/prod)' },
        { name: 'version', type: 'string', description: 'Application version' },
        { name: 'region', type: 'string', description: 'Deployment region' }
      ]
    },
    {
      id: 'global',
      name: 'Global Context',
      description: 'Global application variables',
      icon: 'public',
      editable: true,
      defaultVariables: [
        { name: 'now', type: 'date', description: 'Current timestamp' },
        { name: 'today', type: 'date', description: 'Current date' },
        { name: 'locale', type: 'string', description: 'User locale' }
      ]
    }
  ];

  get editableScopes(): ContextScope[] {
    return this.contextScopes.filter(scope => scope.editable);
  }

  get validationRulesArray(): FormArray {
    return this.variableForm.get('validationRules') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.variableForm = this.createVariableForm();
  }

  ngOnInit(): void {
    this.initializeScopes();
    this.filterVariables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createVariableForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9_.]*$/)]],
      type: ['string', Validators.required],
      scope: ['user', Validators.required],
      description: [''],
      defaultValue: [''],
      example: [''],
      required: [false],
      readOnly: [false],
      validationRules: this.fb.array([])
    });
  }

  private initializeScopes(): void {
    // Merge provided scopes with default scopes
    const mergedScopes = [...this.contextScopes];
    
    this.scopes.forEach(providedScope => {
      const existingIndex = mergedScopes.findIndex(s => s.id === providedScope.id);
      if (existingIndex >= 0) {
        mergedScopes[existingIndex] = { ...mergedScopes[existingIndex], ...providedScope };
      } else {
        mergedScopes.push(providedScope);
      }
    });

    this.contextScopes = mergedScopes;
  }

  // Filtering and search
  onScopeChange(): void {
    this.filterVariables();
  }

  onSearchChange(): void {
    this.filterVariables();
  }

  private filterVariables(): void {
    let filtered = [...this.variables];

    // Filter by scope
    if (this.selectedScope) {
      filtered = filtered.filter(v => v.scope === this.selectedScope);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query) ||
        (v.description || '').toLowerCase().includes(query)
      );
    }

    this.filteredVariables = filtered;
    this.cdr.detectChanges();
  }

  // Variable management
  addVariable(): void {
    this.editingVariable = {
      id: '',
      name: '',
      type: 'string',
      scope: 'user',
      description: '',
      readOnly: false,
      required: false,
      validationRules: [],
      createdAt: new Date(),
      usageCount: 0
    };
    this.loadVariableIntoForm(this.editingVariable);
  }

  editVariable(variable: EnhancedContextVariable): void {
    this.editingVariable = { ...variable };
    this.loadVariableIntoForm(this.editingVariable);
  }

  private loadVariableIntoForm(variable: Partial<EnhancedContextVariable>): void {
    this.variableForm.patchValue({
      name: variable.name || '',
      type: variable.type || 'string',
      scope: variable.scope || 'user',
      description: variable.description || '',
      defaultValue: variable.defaultValue || '',
      example: variable.example || '',
      required: variable.required || false,
      readOnly: variable.readOnly || false
    });

    // Load validation rules
    const rulesArray = this.validationRulesArray;
    rulesArray.clear();
    
    (variable.validationRules || []).forEach(rule => {
      rulesArray.push(this.fb.group({
        type: [rule.type, Validators.required],
        value: [rule.value || ''],
        message: [rule.message, Validators.required]
      }));
    });

    this.cdr.detectChanges();
  }

  saveVariable(): void {
    if (!this.variableForm.valid || !this.editingVariable) return;

    const formValue = this.variableForm.value;
    const variable: EnhancedContextVariable = {
      ...this.editingVariable,
      id: this.editingVariable.id || this.generateVariableId(),
      name: formValue.name,
      type: formValue.type,
      scope: formValue.scope,
      description: formValue.description,
      defaultValue: formValue.defaultValue || undefined,
      example: formValue.example || undefined,
      required: formValue.required,
      readOnly: formValue.readOnly,
      validationRules: formValue.validationRules,
      modifiedAt: new Date()
    };

    const existingIndex = this.variables.findIndex(v => v.id === variable.id);
    
    if (existingIndex >= 0) {
      this.variables[existingIndex] = variable;
      this.snackBar.open('Variable updated successfully', 'Close', { duration: 3000 });
    } else {
      this.variables.push(variable);
      this.snackBar.open('Variable created successfully', 'Close', { duration: 3000 });
    }

    this.variablesChanged.emit([...this.variables]);
    this.filterVariables();
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingVariable = null;
    this.variableForm.reset();
    this.validationRulesArray.clear();
  }

  deleteVariable(variable: EnhancedContextVariable): void {
    if (!confirm(`Are you sure you want to delete variable "${variable.name}"?`)) {
      return;
    }

    const index = this.variables.findIndex(v => v.id === variable.id);
    if (index >= 0) {
      this.variables.splice(index, 1);
      this.variablesChanged.emit([...this.variables]);
      this.filterVariables();
      this.snackBar.open('Variable deleted successfully', 'Close', { duration: 3000 });
    }
  }

  copyVariableReference(variable: EnhancedContextVariable): void {
    const reference = `\${${variable.name}}`;
    navigator.clipboard.writeText(reference).then(() => {
      this.snackBar.open(`Copied "${reference}" to clipboard`, 'Close', { duration: 2000 });
    });
  }

  // Validation rules management
  addValidationRule(): void {
    const ruleGroup = this.fb.group({
      type: ['required', Validators.required],
      value: [''],
      message: ['This field is required', Validators.required]
    });

    this.validationRulesArray.push(ruleGroup);
  }

  removeValidationRule(index: number): void {
    this.validationRulesArray.removeAt(index);
  }

  // Scope management
  viewScopeVariables(scope: ContextScope): void {
    this.selectedScope = scope.id;
    this.filterVariables();
  }

  editScope(scope: ContextScope): void {
    // Implementation for scope editing would go here
    this.snackBar.open('Scope editing not implemented yet', 'Close', { duration: 3000 });
  }

  addScope(): void {
    // Implementation for adding custom scopes would go here
    this.snackBar.open('Custom scope creation not implemented yet', 'Close', { duration: 3000 });
  }

  getVariableCountForScope(scopeId: string): number {
    return this.variables.filter(v => v.scope === scopeId).length;
  }

  // Import/Export
  exportVariables(): void {
    const exportData: VariableExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'praxis-visual-builder',
        version: '1.0.0'
      },
      scopes: this.contextScopes,
      variables: this.variables
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    this.downloadFile(dataStr, 'context-variables.json', 'application/json');
    this.snackBar.open('Variables exported successfully', 'Close', { duration: 3000 });
  }

  importVariables(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData: VariableExportData = JSON.parse(e.target?.result as string);
          
          // Merge imported variables
          importData.variables.forEach(variable => {
            const existingIndex = this.variables.findIndex(v => v.name === variable.name && v.scope === variable.scope);
            if (existingIndex >= 0) {
              this.variables[existingIndex] = variable;
            } else {
              this.variables.push(variable);
            }
          });

          this.variablesChanged.emit([...this.variables]);
          this.filterVariables();
          this.snackBar.open(`Imported ${importData.variables.length} variables`, 'Close', { duration: 3000 });
        } catch (error) {
          this.snackBar.open('Failed to import variables: Invalid file format', 'Close', { duration: 5000 });
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  exportToClipboard(): void {
    const exportData = {
      variables: this.variables,
      scopes: this.contextScopes
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
      this.snackBar.open('Variables copied to clipboard', 'Close', { duration: 3000 });
    });
  }

  loadDefaultVariables(): void {
    const defaultVariables: EnhancedContextVariable[] = [];

    this.contextScopes.forEach(scope => {
      scope.defaultVariables?.forEach(defaultVar => {
        defaultVariables.push({
          id: this.generateVariableId(),
          name: defaultVar.name!,
          type: defaultVar.type!,
          scope: scope.id,
          description: defaultVar.description,
          readOnly: !scope.editable,
          createdAt: new Date(),
          usageCount: 0
        });
      });
    });

    this.variables.push(...defaultVariables);
    this.variablesChanged.emit([...this.variables]);
    this.filterVariables();
    this.snackBar.open(`Loaded ${defaultVariables.length} default variables`, 'Close', { duration: 3000 });
  }

  refreshVariables(): void {
    this.filterVariables();
    this.snackBar.open('Variables refreshed', 'Close', { duration: 2000 });
  }

  // Utility methods
  formatValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getScopeIcon(scopeId: string): string {
    const scope = this.contextScopes.find(s => s.id === scopeId);
    return scope?.icon || 'data_object';
  }

  getDefaultValuePlaceholder(): string {
    const type = this.variableForm.get('type')?.value;
    const placeholders: Record<string, string> = {
      string: '"example string"',
      number: '42',
      boolean: 'true',
      date: '2024-01-01',
      object: '{"key": "value"}',
      array: '["item1", "item2"]'
    };
    return placeholders[type] || 'default value';
  }

  getEmptyStateMessage(): string {
    if (this.selectedScope) {
      return `No variables found in the ${this.selectedScope} scope.`;
    }
    if (this.searchQuery) {
      return `No variables match your search for "${this.searchQuery}".`;
    }
    return 'No context variables have been defined yet.';
  }

  private generateVariableId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}