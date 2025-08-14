import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

import { RuleTemplate, RuleNode } from '../models/rule-builder.model';

export interface TemplatePreviewDialogData {
  template: RuleTemplate;
}

@Component({
  selector: 'praxis-template-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatExpansionModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="template-preview-dialog">
      <div mat-dialog-title class="dialog-title">
        <div class="title-content">
          <mat-icon>{{ data.template.icon || 'rule' }}</mat-icon>
          <div class="title-text">
            <h2>{{ data.template.name }}</h2>
            <p class="template-category">{{ data.template.category }}</p>
          </div>
        </div>
        <div class="title-actions">
          <mat-chip
            class="complexity-chip"
            [class]="
              'complexity-' + (data.template.metadata?.complexity || 'unknown')
            "
          >
            {{ data.template.metadata?.complexity || 'unknown' }}
          </mat-chip>
        </div>
      </div>

      <div mat-dialog-content class="dialog-content">
        <!-- Template Description -->
        <div class="template-info">
          <h3>Description</h3>
          <p class="template-description">{{ data.template.description }}</p>

          <div class="template-tags" *ngIf="data.template.tags.length > 0">
            <h4>Tags</h4>
            <mat-chip-set>
              <mat-chip *ngFor="let tag of data.template.tags" class="tag-chip">
                {{ tag }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Template Metadata -->
        <div class="template-metadata">
          <h3>Template Information</h3>
          <div class="metadata-grid">
            <div class="metadata-item" *ngIf="data.template.metadata?.version">
              <mat-icon>info</mat-icon>
              <span class="label">Version:</span>
              <span class="value">{{ data.template.metadata?.version }}</span>
            </div>
            <div
              class="metadata-item"
              *ngIf="data.template.metadata?.usageCount"
            >
              <mat-icon>trending_up</mat-icon>
              <span class="label">Usage Count:</span>
              <span class="value">{{
                data.template.metadata?.usageCount
              }}</span>
            </div>
            <div
              class="metadata-item"
              *ngIf="data.template.metadata?.createdAt"
            >
              <mat-icon>schedule</mat-icon>
              <span class="label">Created:</span>
              <span class="value">{{
                formatDate(data.template.metadata?.createdAt)
              }}</span>
            </div>
            <div
              class="metadata-item"
              *ngIf="data.template.metadata?.updatedAt"
            >
              <mat-icon>update</mat-icon>
              <span class="label">Updated:</span>
              <span class="value">{{
                formatDate(data.template.metadata?.updatedAt)
              }}</span>
            </div>
            <div
              class="metadata-item"
              *ngIf="data.template.metadata?.author?.name"
            >
              <mat-icon>person</mat-icon>
              <span class="label">Author:</span>
              <span class="value">{{
                data.template.metadata?.author?.name
              }}</span>
            </div>
            <div class="metadata-item">
              <mat-icon>account_tree</mat-icon>
              <span class="label">Nodes:</span>
              <span class="value">{{ data.template.nodes.length }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Rule Structure Preview -->
        <div class="rule-structure">
          <h3>Rule Structure</h3>
          <div class="structure-container">
            <mat-expansion-panel
              *ngFor="let rootNodeId of data.template.rootNodes; let i = index"
              [expanded]="i === 0"
              class="root-node-panel"
            >
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>{{
                    getNodeIcon(getRootNode(rootNodeId))
                  }}</mat-icon>
                  <span>{{
                    getRootNode(rootNodeId)?.label ||
                      getRootNode(rootNodeId)?.type ||
                      'Unknown Node'
                  }}</span>
                </mat-panel-title>
                <mat-panel-description>
                  {{ getNodeDescription(getRootNode(rootNodeId)) }}
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="node-details">
                <div class="node-tree">
                  <div
                    class="tree-node"
                    *ngFor="let node of getNodeHierarchy(rootNodeId)"
                    [style.margin-left.px]="node.level * 20"
                  >
                    <div class="node-content">
                      <mat-icon class="node-icon">{{
                        getNodeIcon(node.node)
                      }}</mat-icon>
                      <span class="node-label">{{
                        node.node.label || node.node.type
                      }}</span>
                      <mat-chip class="node-type-chip" size="small">{{
                        node.node.type
                      }}</mat-chip>
                    </div>
                    <div class="node-config" *ngIf="node.node.config">
                      <pre class="config-preview">{{
                        formatConfig(node.node.config)
                      }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </div>
        </div>

        <!-- Required Fields -->
        <div
          class="required-fields"
          *ngIf="
            data.template.requiredFields &&
            data.template.requiredFields.length > 0
          "
        >
          <mat-divider></mat-divider>
          <h3>Required Fields</h3>
          <mat-chip-set>
            <mat-chip
              *ngFor="let field of data.template.requiredFields"
              color="accent"
              class="required-field-chip"
            >
              {{ field }}
            </mat-chip>
          </mat-chip-set>
          <p class="fields-note">
            These fields must be available in your form schema for the template
            to work correctly.
          </p>
        </div>

        <!-- Example Usage -->
        <div class="example-usage" *ngIf="data.template.example">
          <mat-divider></mat-divider>
          <h3>Example Usage</h3>
          <div class="example-content">
            <pre class="example-code">{{ data.template.example }}</pre>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="cancel()">Close</button>

        <div class="actions-spacer"></div>

        <button mat-stroked-button color="primary" (click)="exportTemplate()">
          <mat-icon>download</mat-icon>
          Export
        </button>

        <button mat-flat-button color="primary" (click)="applyTemplate()">
          <mat-icon>play_arrow</mat-icon>
          Apply Template
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .template-preview-dialog {
        min-width: 500px;
        max-width: 700px;
      }

      .dialog-title {
        padding: 24px 24px 0;
        margin: 0;
      }

      .title-content {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .title-content mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mdc-theme-primary);
      }

      .title-text h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }

      .template-category {
        margin: 4px 0 0 0;
        font-size: 14px;
        color: var(--mdc-theme-on-surface-variant);
        text-transform: capitalize;
      }

      .title-actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      }

      .complexity-chip {
        font-size: 11px;
      }

      .complexity-simple {
        background: var(--mdc-theme-tertiary-container);
        color: var(--mdc-theme-on-tertiary-container);
      }

      .complexity-medium {
        background: var(--mdc-theme-secondary-container);
        color: var(--mdc-theme-on-secondary-container);
      }

      .complexity-complex {
        background: var(--mdc-theme-error-container);
        color: var(--mdc-theme-on-error-container);
      }

      .dialog-content {
        padding: 16px 24px;
        max-height: 70vh;
        overflow-y: auto;
      }

      .template-info h3,
      .template-metadata h3,
      .rule-structure h3,
      .required-fields h3,
      .example-usage h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--mdc-theme-primary);
      }

      .template-description {
        margin: 0 0 16px 0;
        line-height: 1.5;
      }

      .template-tags h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .tag-chip {
        margin-right: 4px;
        margin-bottom: 4px;
      }

      .metadata-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .metadata-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--mdc-theme-surface-variant);
        border-radius: 8px;
      }

      .metadata-item mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--mdc-theme-primary);
      }

      .metadata-item .label {
        font-weight: 500;
        color: var(--mdc-theme-on-surface);
      }

      .metadata-item .value {
        color: var(--mdc-theme-on-surface-variant);
      }

      .structure-container {
        margin-top: 8px;
      }

      .root-node-panel {
        margin-bottom: 8px;
      }

      .node-details {
        padding: 0 16px 16px;
      }

      .tree-node {
        margin-bottom: 8px;
        padding: 8px;
        border-left: 2px solid var(--mdc-theme-outline);
        background: var(--mdc-theme-surface-variant);
        border-radius: 4px;
      }

      .node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .node-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--mdc-theme-primary);
      }

      .node-label {
        flex: 1;
        font-weight: 500;
      }

      .node-type-chip {
        font-size: 10px;
        height: 20px;
        line-height: 20px;
      }

      .node-config {
        margin-top: 4px;
      }

      .config-preview {
        font-size: 11px;
        margin: 0;
        padding: 4px 8px;
        background: var(--mdc-theme-surface);
        border-radius: 4px;
        border: 1px solid var(--mdc-theme-outline);
        overflow-x: auto;
      }

      .required-field-chip {
        margin-right: 4px;
        margin-bottom: 4px;
      }

      .fields-note {
        margin: 12px 0 0 0;
        font-size: 13px;
        color: var(--mdc-theme-on-surface-variant);
        font-style: italic;
      }

      .example-content {
        background: var(--mdc-theme-surface-variant);
        border-radius: 8px;
        padding: 16px;
      }

      .example-code {
        margin: 0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        overflow-x: auto;
      }

      .dialog-actions {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .actions-spacer {
        flex: 1;
      }

      mat-divider {
        margin: 16px 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .template-preview-dialog {
          min-width: 320px;
          max-width: 95vw;
        }

        .metadata-grid {
          grid-template-columns: 1fr;
        }

        .title-content {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class TemplatePreviewDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<TemplatePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplatePreviewDialogData,
  ) {}

  getRootNode(nodeId: string): RuleNode | undefined {
    return this.data.template.nodes.find((n) => n.id === nodeId);
  }

  getNodeHierarchy(rootNodeId: string): { node: RuleNode; level: number }[] {
    const result: { node: RuleNode; level: number }[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.data.template.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      result.push({ node, level });

      // Traverse children
      if (node.children) {
        node.children.forEach((childId) => {
          if (typeof childId === 'string') {
            traverse(childId, level + 1);
          }
        });
      }
    };

    traverse(rootNodeId, 0);
    return result;
  }

  getNodeIcon(node?: RuleNode): string {
    if (!node) return 'help';

    const icons: Record<string, string> = {
      fieldCondition: 'compare_arrows',
      andGroup: 'join_inner',
      orGroup: 'join_full',
      notGroup: 'block',
      requiredIf: 'star_border',
      visibleIf: 'visibility',
      disabledIf: 'disabled_by_default',
      readonlyIf: 'lock',
      forEach: 'repeat',
      uniqueBy: 'fingerprint',
      minLength: 'expand_less',
      maxLength: 'expand_more',
      functionCall: 'functions',
      fieldToField: 'compare',
      custom: 'extension',
    };

    return icons[node.type] || 'rule';
  }

  getNodeDescription(node?: RuleNode): string {
    if (!node) return '';

    switch (node.type) {
      case 'fieldCondition':
        return 'Field validation rule';
      case 'andGroup':
        return 'All conditions must be true';
      case 'orGroup':
        return 'At least one condition must be true';
      case 'notGroup':
        return 'Condition must be false';
      case 'requiredIf':
        return 'Field becomes required when condition is met';
      case 'visibleIf':
        return 'Field becomes visible when condition is met';
      case 'disabledIf':
        return 'Field becomes disabled when condition is met';
      case 'readonlyIf':
        return 'Field becomes readonly when condition is met';
      case 'forEach':
        return 'Apply validation to each array item';
      case 'uniqueBy':
        return 'Ensure array items are unique by specified fields';
      case 'minLength':
        return 'Array must have minimum number of items';
      case 'maxLength':
        return 'Array must not exceed maximum items';
      default:
        return node.label || 'Custom rule';
    }
  }

  formatConfig(config: any): string {
    try {
      // Create a simplified version for display
      const simplified = { ...config };

      // Remove verbose properties for cleaner display
      delete simplified.type;
      if (simplified.metadata) {
        delete simplified.metadata;
      }

      return JSON.stringify(simplified, null, 2);
    } catch {
      return 'Invalid configuration';
    }
  }

  formatDate(date?: Date | string): string {
    if (!date) {
      return 'Unknown';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date));
    } catch {
      return 'Invalid date';
    }
  }

  applyTemplate(): void {
    this.dialogRef.close('apply');
  }

  exportTemplate(): void {
    this.dialogRef.close('export');
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
