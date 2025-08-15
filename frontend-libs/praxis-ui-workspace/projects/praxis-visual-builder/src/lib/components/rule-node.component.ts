import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import {
  RuleNode,
  RuleNodeType,
  RuleNodeTypeString,
  RuleNodeConfig,
  FieldConditionConfig,
  BooleanGroupConfig,
  ConditionalValidatorConfig,
  CollectionValidatorConfig,
  ValidationError,
} from '../models/rule-builder.model';
import {
  FieldSchema,
  FIELD_TYPE_OPERATORS,
  OPERATOR_LABELS,
} from '../models/field-schema.model';
import { FieldConditionEditorComponent } from './field-condition-editor.component';
import { ConditionalValidatorEditorComponent } from './conditional-validator-editor.component';
import { CollectionValidatorEditorComponent } from './collection-validator-editor.component';

@Component({
  selector: 'praxis-rule-node',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    DragDropModule,
    FieldConditionEditorComponent,
    ConditionalValidatorEditorComponent,
    CollectionValidatorEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rule-node-container"
      [class.selected]="isSelected"
      [class.has-errors]="hasValidationErrors"
      [class]="'level-' + level"
    >
      <!-- Main Rule Node -->
      <mat-card
        class="rule-node"
        [class.selected]="isSelected"
        (click)="selectNode()"
      >
        <!-- Node Header -->
        <div class="node-header">
          <div class="node-type">
            <mat-icon class="type-icon" [class]="getNodeTypeClass()">
              {{ getNodeIcon() }}
            </mat-icon>
            <span class="type-label">{{ getNodeLabel() }}</span>
          </div>

          <div class="node-actions">
            <!-- Validation Errors Badge -->
            <mat-icon
              *ngIf="hasValidationErrors"
              class="error-badge"
              [matBadge]="validationErrors.length"
              matBadgeColor="warn"
              matBadgeSize="small"
              matTooltip="Has validation errors"
            >
              error
            </mat-icon>

            <!-- Node Menu -->
            <button
              mat-icon-button
              [matMenuTriggerFor]="nodeMenu"
              (click)="$event.stopPropagation()"
            >
              <mat-icon>more_vert</mat-icon>
            </button>

            <mat-menu #nodeMenu="matMenu">
              <button mat-menu-item (click)="editNode()">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>

              <button mat-menu-item (click)="duplicateNode()">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>

              <mat-divider></mat-divider>

              <button
                mat-menu-item
                *ngIf="canHaveChildren()"
                [matMenuTriggerFor]="addChildMenu"
              >
                <mat-icon>add</mat-icon>
                <span>Add Child</span>
              </button>

              <mat-divider></mat-divider>

              <button
                mat-menu-item
                (click)="deleteNode()"
                class="delete-action"
              >
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>

            <mat-menu #addChildMenu="matMenu">
              <button
                mat-menu-item
                *ngFor="let option of getChildOptions()"
                (click)="addChild(option.type)"
              >
                <mat-icon>{{ option.icon }}</mat-icon>
                <span>{{ option.label }}</span>
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Node Content -->
        <div class="node-content">
          <!-- Field Condition Content -->
          <div *ngIf="isFieldCondition()" class="field-condition-content">
            <praxis-field-condition-editor
              [config]="getFieldConditionConfig()"
              [fieldSchemas]="fieldSchemas"
              (configChanged)="onFieldConditionChanged($event)"
            >
            </praxis-field-condition-editor>
          </div>

          <!-- Boolean Group Content -->
          <div *ngIf="isBooleanGroup()" class="boolean-group-content">
            <div class="group-operator">
              <mat-form-field appearance="outline" class="operator-select">
                <mat-select
                  [value]="getBooleanOperator()"
                  (selectionChange)="onBooleanOperatorChanged($event)"
                >
                  <mat-option value="and">AND</mat-option>
                  <mat-option value="or">OR</mat-option>
                  <mat-option value="not">NOT</mat-option>
                  <mat-option value="xor">XOR</mat-option>
                  <mat-option value="implies">IMPLIES</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Conditional Validator Content -->
          <div
            *ngIf="isConditionalValidator()"
            class="conditional-validator-content"
          >
            <praxis-conditional-validator-editor
              [config]="getConditionalValidatorConfig()"
              [fieldSchemas]="fieldSchemas"
              (configChanged)="onConditionalValidatorChanged($event)"
            >
            </praxis-conditional-validator-editor>
          </div>

          <!-- Collection Validation Content -->
          <div
            *ngIf="isCollectionValidation()"
            class="collection-validation-content"
          >
            <praxis-collection-validator-editor
              [config]="getCollectionValidationConfig()"
              [fieldSchemas]="fieldSchemas"
              (configChanged)="onCollectionValidationChanged($event)"
            >
            </praxis-collection-validator-editor>
          </div>

          <!-- Metadata Preview -->
          <div *ngIf="node?.metadata" class="metadata-preview">
            <mat-chip-set class="metadata-chips">
              <mat-chip
                *ngIf="node!.metadata?.code"
                class="metadata-chip code-chip"
              >
                {{ node!.metadata!.code }}
              </mat-chip>

              <mat-chip
                *ngIf="node!.metadata?.tag"
                class="metadata-chip tag-chip"
              >
                {{ node!.metadata!.tag }}
              </mat-chip>
            </mat-chip-set>

            <div
              *ngIf="node!.metadata?.message"
              class="metadata-message"
              [title]="node!.metadata?.message"
            >
              {{ node!.metadata!.message }}
            </div>
          </div>
        </div>

        <!-- Validation Errors -->
        <div *ngIf="hasValidationErrors" class="validation-errors">
          <div
            *ngFor="let error of validationErrors"
            class="validation-error"
            [class]="error.severity"
          >
            <mat-icon class="error-icon">{{
              getErrorIcon(error.severity)
            }}</mat-icon>
            <span class="error-message">{{ error.message }}</span>
          </div>
        </div>
      </mat-card>

      <!-- Children Container -->
      <div *ngIf="hasChildren()" class="children-container">
        <div class="children-connector">
          <div class="connector-line"></div>
        </div>

        <div
          class="children-list"
          cdkDropList
          [cdkDropListData]="node?.children || []"
          (cdkDropListDropped)="onChildDrop($event)"
        >
          <div
            *ngFor="let childId of node?.children; trackBy: trackByChildId"
            class="child-wrapper"
            cdkDrag
          >
            <praxis-rule-node
              [node]="getChildNode(childId)"
              [fieldSchemas]="fieldSchemas"
              [level]="level + 1"
              [isSelected]="isChildSelected(childId)"
              [validationErrors]="getChildValidationErrors(childId)"
              (nodeClicked)="onChildClicked(childId)"
              (nodeUpdated)="onChildUpdated($event)"
              (nodeDeleted)="onChildDeleted(childId)"
              (childAdded)="onChildAdded($event)"
              (childMoved)="onChildMoved($event)"
            >
            </praxis-rule-node>

            <!-- Child Connector -->
            <div *ngIf="!isLastChild(childId)" class="child-connector">
              <div class="connector-line"></div>
              <div class="connector-operator">
                {{ getBooleanOperator().toUpperCase() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Add Child Button -->
        <div *ngIf="canHaveChildren()" class="add-child-area">
          <button
            mat-icon-button
            color="primary"
            (click)="showAddChildMenu()"
            class="add-child-button"
          >
            <mat-icon>add_circle</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rule-node-container {
        position: relative;
        margin-bottom: 16px;
      }

      .rule-node {
        min-width: 300px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .rule-node:hover {
        border-color: var(--mdc-theme-primary);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .rule-node.selected {
        border-color: var(--mdc-theme-primary);
        background: var(--mdc-theme-primary-container);
        box-shadow: 0 4px 12px rgba(var(--mdc-theme-primary-rgb), 0.3);
      }

      .rule-node-container.has-errors .rule-node {
        border-color: var(--mdc-theme-error);
      }

      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--mdc-theme-outline);
        background: var(--mdc-theme-surface-variant);
      }

      .node-type {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .type-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .type-icon.field-condition {
        color: var(--mdc-theme-primary);
      }
      .type-icon.boolean-group {
        color: var(--mdc-theme-secondary);
      }
      .type-icon.conditional-validator {
        color: var(--mdc-theme-tertiary);
      }
      .type-icon.collection-validation {
        color: var(--mdc-theme-error);
      }

      .type-label {
        font-weight: 500;
        font-size: 14px;
      }

      .node-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .error-badge {
        color: var(--mdc-theme-error);
        font-size: 18px;
      }

      .node-content {
        padding: 16px;
      }

      .field-condition-content,
      .boolean-group-content,
      .conditional-validator-content,
      .collection-validation-content {
        min-height: 60px;
      }

      .group-operator {
        display: flex;
        justify-content: center;
      }

      .operator-select {
        width: 120px;
      }

      .metadata-preview {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--mdc-theme-outline);
      }

      .metadata-chips {
        margin-bottom: 8px;
      }

      .metadata-chip {
        font-size: 11px;
        height: 20px;
      }

      .code-chip {
        background: var(--mdc-theme-primary-container);
        color: var(--mdc-theme-on-primary-container);
      }

      .tag-chip {
        background: var(--mdc-theme-secondary-container);
        color: var(--mdc-theme-on-secondary-container);
      }

      .metadata-message {
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
        font-style: italic;
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .validation-errors {
        border-top: 1px solid var(--mdc-theme-error);
        background: var(--mdc-theme-error-container);
        padding: 8px 12px;
      }

      .validation-error {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .validation-error:last-child {
        margin-bottom: 0;
      }

      .validation-error.error {
        color: var(--mdc-theme-on-error-container);
      }

      .validation-error.warning {
        color: var(--mdc-theme-warning);
      }

      .error-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .children-container {
        margin-left: 24px;
        position: relative;
      }

      .children-connector {
        position: absolute;
        left: -12px;
        top: 0;
        width: 12px;
        height: 24px;
      }

      .connector-line {
        width: 2px;
        height: 100%;
        background: var(--mdc-theme-outline);
        margin-left: 10px;
      }

      .children-list {
        padding-left: 12px;
        border-left: 2px solid var(--mdc-theme-outline);
      }

      .child-wrapper {
        position: relative;
      }

      .child-connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 8px 0;
      }

      .child-connector .connector-line {
        width: 2px;
        height: 12px;
        background: var(--mdc-theme-outline);
      }

      .connector-operator {
        background: var(--mdc-theme-secondary);
        color: var(--mdc-theme-on-secondary);
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        margin-top: -1px;
      }

      .add-child-area {
        display: flex;
        justify-content: center;
        margin-top: 16px;
        padding: 8px;
        border: 1px dashed var(--mdc-theme-outline);
        border-radius: 8px;
        background: var(--mdc-theme-surface-variant);
      }

      .add-child-button {
        color: var(--mdc-theme-primary);
      }

      /* Level-based indentation */
      .level-1 {
        margin-left: 20px;
      }
      .level-2 {
        margin-left: 40px;
      }
      .level-3 {
        margin-left: 60px;
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

      .children-list.cdk-drop-list-dragging
        .child-wrapper:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      /* Menu styles */
      .delete-action {
        color: var(--mdc-theme-error);
      }
    `,
  ],
})
export class RuleNodeComponent {
  @Input() node: RuleNode | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};
  @Input() level: number = 0;
  @Input() isSelected: boolean = false;
  @Input() validationErrors: ValidationError[] = [];

  @Output() nodeClicked = new EventEmitter<void>();
  @Output() nodeUpdated = new EventEmitter<{
    nodeId: string;
    updates: Partial<RuleNode>;
  }>();
  @Output() nodeDeleted = new EventEmitter<void>();
  @Output() childAdded = new EventEmitter<RuleNodeType>();
  @Output() childMoved = new EventEmitter<CdkDragDrop<string[]>>();

  get hasValidationErrors(): boolean {
    return this.validationErrors && this.validationErrors.length > 0;
  }

  constructor(private fb: FormBuilder) {}

  // Template methods
  selectNode(): void {
    this.nodeClicked.emit();
  }

  getNodeIcon(): string {
    if (!this.node) return 'help';

    const icons: Record<RuleNodeType, string> = {
      [RuleNodeType.FIELD_CONDITION]: 'compare_arrows',
      [RuleNodeType.AND_GROUP]: 'join_inner',
      [RuleNodeType.OR_GROUP]: 'join_full',
      [RuleNodeType.NOT_GROUP]: 'block',
      [RuleNodeType.XOR_GROUP]: 'join_left',
      [RuleNodeType.IMPLIES_GROUP]: 'arrow_forward',
      [RuleNodeType.REQUIRED_IF]: 'star',
      [RuleNodeType.VISIBLE_IF]: 'visibility',
      [RuleNodeType.DISABLED_IF]: 'block',
      [RuleNodeType.READONLY_IF]: 'lock',
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

    return icons[this.node.type] || 'help';
  }

  getNodeLabel(): string {
    if (!this.node) return 'Unknown';
    return this.node.label || this.formatNodeType(this.node.type);
  }

  getNodeTypeClass(): string {
    if (!this.node) return '';

    if (this.isFieldCondition()) return 'field-condition';
    if (this.isBooleanGroup()) return 'boolean-group';
    if (this.isConditionalValidator()) return 'conditional-validator';
    if (this.isCollectionValidation()) return 'collection-validation';

    return '';
  }

  getErrorIcon(severity: string): string {
    const icons: Record<string, string> = {
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[severity] || 'info';
  }

  // Node type checks
  isFieldCondition(): boolean {
    return this.node?.type === RuleNodeType.FIELD_CONDITION;
  }

  isBooleanGroup(): boolean {
    return [
      RuleNodeType.AND_GROUP,
      RuleNodeType.OR_GROUP,
      RuleNodeType.NOT_GROUP,
      RuleNodeType.XOR_GROUP,
      RuleNodeType.IMPLIES_GROUP,
    ].includes(this.node?.type as RuleNodeType);
  }

  isConditionalValidator(): boolean {
    return [
      RuleNodeType.REQUIRED_IF,
      RuleNodeType.VISIBLE_IF,
      RuleNodeType.DISABLED_IF,
      RuleNodeType.READONLY_IF,
    ].includes(this.node?.type as RuleNodeType);
  }

  isCollectionValidation(): boolean {
    return [
      RuleNodeType.FOR_EACH,
      RuleNodeType.UNIQUE_BY,
      RuleNodeType.MIN_LENGTH,
      RuleNodeType.MAX_LENGTH,
    ].includes(this.node?.type as RuleNodeType);
  }

  // Configuration getters
  getFieldConditionConfig(): FieldConditionConfig | null {
    if (!this.isFieldCondition()) return null;
    return (this.node?.config as FieldConditionConfig) || null;
  }

  getBooleanGroupConfig(): BooleanGroupConfig | null {
    if (!this.isBooleanGroup()) return null;
    return (this.node?.config as BooleanGroupConfig) || null;
  }

  getConditionalValidatorConfig(): ConditionalValidatorConfig | null {
    if (!this.isConditionalValidator()) return null;
    return (this.node?.config as ConditionalValidatorConfig) || null;
  }

  getCollectionValidationConfig(): CollectionValidatorConfig | null {
    if (!this.isCollectionValidation()) return null;
    return (this.node?.config as CollectionValidatorConfig) || null;
  }

  getBooleanOperator(): string {
    const config = this.getBooleanGroupConfig();
    return config?.operator || 'and';
  }

  // Children management
  hasChildren(): boolean {
    return !!(this.node?.children && this.node.children.length > 0);
  }

  canHaveChildren(): boolean {
    return this.isBooleanGroup() || this.isConditionalValidator();
  }

  getChildOptions(): { type: RuleNodeType; icon: string; label: string }[] {
    return [
      {
        type: RuleNodeType.FIELD_CONDITION,
        icon: 'compare_arrows',
        label: 'Field Condition',
      },
      { type: RuleNodeType.AND_GROUP, icon: 'join_inner', label: 'AND Group' },
      { type: RuleNodeType.OR_GROUP, icon: 'join_full', label: 'OR Group' },
      { type: RuleNodeType.REQUIRED_IF, icon: 'star', label: 'Required If' },
    ];
  }

  trackByChildId(index: number, childId: string): string {
    return childId;
  }

  getChildNode(childId: string): RuleNode | null {
    // This would typically come from a service or parent component
    return null;
  }

  isChildSelected(childId: string): boolean {
    // This would typically come from a service or parent component
    return false;
  }

  getChildValidationErrors(childId: string): ValidationError[] {
    // This would typically come from a service or parent component
    return [];
  }

  isLastChild(childId: string): boolean {
    if (!this.node?.children) return true;
    return this.node.children[this.node.children.length - 1] === childId;
  }

  // Event handlers
  editNode(): void {
    // Open edit dialog or emit edit event
  }

  duplicateNode(): void {
    // Duplicate the current node
  }

  deleteNode(): void {
    this.nodeDeleted.emit();
  }

  addChild(type: RuleNodeType): void {
    this.childAdded.emit(type);
  }

  showAddChildMenu(): void {
    // Show add child menu
  }

  onBooleanOperatorChanged(event: MatSelectChange): void {
    if (!this.node) return;

    const operator = event.value as 'and' | 'or' | 'not' | 'xor' | 'implies';
    const config: BooleanGroupConfig = {
      ...this.getBooleanGroupConfig(),
      type: 'booleanGroup',
      operator,
    };

    this.nodeUpdated.emit({
      nodeId: this.node.id,
      updates: { config },
    });
  }

  onFieldConditionChanged(config: FieldConditionConfig): void {
    if (!this.node) return;

    this.nodeUpdated.emit({
      nodeId: this.node.id,
      updates: { config },
    });
  }

  onConditionalValidatorChanged(config: ConditionalValidatorConfig): void {
    if (!this.node) return;

    this.nodeUpdated.emit({
      nodeId: this.node.id,
      updates: { config },
    });
  }

  onCollectionValidationChanged(config: CollectionValidatorConfig): void {
    if (!this.node) return;

    this.nodeUpdated.emit({
      nodeId: this.node.id,
      updates: { config },
    });
  }

  onChildClicked(childId: string): void {
    // Bubble up child selection
  }

  onChildUpdated(event: { nodeId: string; updates: Partial<RuleNode> }): void {
    // Bubble up child updates
  }

  onChildDeleted(childId: string): void {
    // Handle child deletion
  }

  onChildAdded(event: RuleNodeType): void {
    // Handle child addition
  }

  onChildMoved(event: CdkDragDrop<string[]>): void {
    this.childMoved.emit(event);
  }

  onChildDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.childMoved.emit(event);
    }
  }

  // Helper methods
  private formatNodeType(type: RuleNodeType | RuleNodeTypeString): string {
    return type
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase()
      .replace(/^\w/, (c: string) => c.toUpperCase());
  }
}
