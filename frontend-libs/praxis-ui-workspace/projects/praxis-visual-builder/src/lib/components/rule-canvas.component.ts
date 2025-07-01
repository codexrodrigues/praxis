import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { Subject, takeUntil } from 'rxjs';

import { 
  RuleBuilderState, 
  RuleNode, 
  RuleNodeType,
  RuleNodeConfig
} from '../models/rule-builder.model';
import { FieldSchema } from '../models/field-schema.model';
import { RuleNodeComponent } from './rule-node.component';

@Component({
  selector: 'praxis-rule-canvas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    DragDropModule,
    RuleNodeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rule-canvas" 
         (drop)="onDrop($event)" 
         (dragover)="onDragOver($event)"
         (dragenter)="onDragEnter($event)"
         (dragleave)="onDragLeave($event)">
      
      <!-- Empty State -->
      <div *ngIf="isEmpty" class="empty-state">
        <div class="empty-state-content">
          <mat-icon class="empty-icon">rule</mat-icon>
          <h3>Start Building Rules</h3>
          <p>Drag fields from the sidebar or click the button below to create your first rule</p>
          
          <button mat-raised-button 
                  color="primary"
                  (click)="addFirstRule()">
            <mat-icon>add</mat-icon>
            Add First Rule
          </button>
        </div>
      </div>

      <!-- Rule Tree -->
      <div *ngIf="!isEmpty" class="rule-tree">
        <div *ngFor="let nodeId of state?.rootNodes; trackBy: trackByNodeId" 
             class="root-rule-container">
          <praxis-rule-node
            [node]="getNode(nodeId)"
            [fieldSchemas]="fieldSchemas"
            [level]="0"
            [isSelected]="isNodeSelected(nodeId)"
            [validationErrors]="getNodeValidationErrors(nodeId)"
            (nodeClicked)="selectNode(nodeId)"
            (nodeUpdated)="updateNode($event)"
            (nodeDeleted)="deleteNode(nodeId)"
            (childAdded)="addChildNode(nodeId, $event)"
            (childMoved)="moveChildNode($event)">
          </praxis-rule-node>
          
          <!-- Connector for multiple root rules -->
          <div *ngIf="!isLastRootNode(nodeId)" class="root-connector">
            <div class="connector-line"></div>
            <div class="connector-operator">AND</div>
          </div>
        </div>
      </div>

      <!-- Drop Zone Overlay -->
      <div *ngIf="isDragOver" class="drop-zone-overlay">
        <div class="drop-zone-content">
          <mat-icon>add_circle</mat-icon>
          <span>Drop here to create a new rule</span>
        </div>
      </div>

      <!-- Floating Add Menu -->
      <div class="floating-add-menu" 
           [class.expanded]="showAddMenu">
        <button mat-fab 
                color="primary"
                (click)="toggleAddMenu()"
                class="main-add-button">
          <mat-icon>{{ showAddMenu ? 'close' : 'add' }}</mat-icon>
        </button>
        
        <div *ngIf="showAddMenu" class="add-menu-options">
          <button *ngFor="let option of addMenuOptions"
                  mat-mini-fab
                  [color]="option.color"
                  (click)="addRule(option.type)"
                  [matTooltip]="option.label"
                  class="add-option-button">
            <mat-icon>{{ option.icon }}</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rule-canvas {
      position: relative;
      min-height: 500px;
      width: 100%;
      background: var(--mdc-theme-surface);
      border: 2px dashed var(--mdc-theme-outline);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
    }

    .rule-canvas.drag-over {
      border-color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
      border-style: solid;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
    }

    .empty-state-content {
      max-width: 400px;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mdc-theme-on-surface-variant);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-on-surface);
      font-weight: 500;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: var(--mdc-theme-on-surface-variant);
      line-height: 1.4;
    }

    .rule-tree {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .root-rule-container {
      position: relative;
    }

    .root-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 8px 0;
    }

    .connector-line {
      width: 2px;
      height: 16px;
      background: var(--mdc-theme-outline);
    }

    .connector-operator {
      background: var(--mdc-theme-primary);
      color: var(--mdc-theme-on-primary);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-top: -1px;
    }

    .drop-zone-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(var(--mdc-theme-primary-rgb), 0.1);
      border: 3px dashed var(--mdc-theme-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .drop-zone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--mdc-theme-primary);
      font-weight: 500;
    }

    .drop-zone-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .floating-add-menu {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    .main-add-button {
      transition: transform 0.3s ease;
    }

    .floating-add-menu.expanded .main-add-button {
      transform: rotate(45deg);
    }

    .add-menu-options {
      position: absolute;
      bottom: 64px;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .add-option-button {
      animation: fadeIn 0.3s ease;
      animation-fill-mode: both;
    }

    .add-option-button:nth-child(1) { animation-delay: 0.1s; }
    .add-option-button:nth-child(2) { animation-delay: 0.15s; }
    .add-option-button:nth-child(3) { animation-delay: 0.2s; }
    .add-option-button:nth-child(4) { animation-delay: 0.25s; }
    .add-option-button:nth-child(5) { animation-delay: 0.3s; }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .rule-canvas {
        padding: 16px;
      }
      
      .floating-add-menu {
        bottom: 16px;
        right: 16px;
      }
    }
  `]
})
export class RuleCanvasComponent implements OnInit, OnDestroy {
  @Input() state: RuleBuilderState | null = null;
  @Input() fieldSchemas: Record<string, FieldSchema> = {};
  
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() nodeAdded = new EventEmitter<{ type: RuleNodeType; parentId?: string; config?: RuleNodeConfig }>();
  @Output() nodeUpdated = new EventEmitter<{ nodeId: string; updates: Partial<RuleNode> }>();
  @Output() nodeRemoved = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  isDragOver = false;
  showAddMenu = false;
  
  addMenuOptions = [
    { type: RuleNodeType.FIELD_CONDITION, icon: 'compare_arrows', label: 'Field Condition', color: 'primary' },
    { type: RuleNodeType.AND_GROUP, icon: 'join_inner', label: 'AND Group', color: 'accent' },
    { type: RuleNodeType.OR_GROUP, icon: 'join_full', label: 'OR Group', color: 'warn' },
    { type: RuleNodeType.REQUIRED_IF, icon: 'star', label: 'Required If', color: 'primary' },
    { type: RuleNodeType.FOR_EACH, icon: 'repeat', label: 'For Each', color: 'accent' }
  ];

  get isEmpty(): boolean {
    return !this.state?.rootNodes || this.state.rootNodes.length === 0;
  }

  constructor() {}

  ngOnInit(): void {
    // Setup any initialization logic
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Template methods
  trackByNodeId(index: number, nodeId: string): string {
    return nodeId;
  }

  getNode(nodeId: string): RuleNode | null {
    return this.state?.nodes[nodeId] || null;
  }

  isNodeSelected(nodeId: string): boolean {
    return this.state?.selectedNodeId === nodeId;
  }

  isLastRootNode(nodeId: string): boolean {
    if (!this.state?.rootNodes) return true;
    return this.state.rootNodes[this.state.rootNodes.length - 1] === nodeId;
  }

  getNodeValidationErrors(nodeId: string): any[] {
    // Return validation errors for this specific node
    return [];
  }

  // Event handlers
  selectNode(nodeId: string): void {
    this.nodeSelected.emit(nodeId);
  }

  updateNode(event: { nodeId: string; updates: Partial<RuleNode> }): void {
    this.nodeUpdated.emit(event);
  }

  deleteNode(nodeId: string): void {
    this.nodeRemoved.emit(nodeId);
  }

  addChildNode(parentId: string, childType: RuleNodeType): void {
    this.nodeAdded.emit({
      type: childType,
      parentId
    });
    this.showAddMenu = false;
  }

  moveChildNode(event: any): void {
    // Handle child node movement
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    // Only hide if leaving the canvas completely
    if (!event.currentTarget || !event.relatedTarget) {
      this.isDragOver = false;
      return;
    }

    const canvas = event.currentTarget as Element;
    const related = event.relatedTarget as Element;
    
    if (!canvas.contains(related)) {
      this.isDragOver = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    try {
      const fieldData = event.dataTransfer?.getData('field');
      if (fieldData) {
        const field = JSON.parse(fieldData) as FieldSchema;
        this.createFieldConditionFromDrop(field);
        return;
      }

      const ruleData = event.dataTransfer?.getData('rule');
      if (ruleData) {
        const ruleType = ruleData as RuleNodeType;
        this.addRule(ruleType);
        return;
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  }

  private createFieldConditionFromDrop(field: FieldSchema): void {
    const config: RuleNodeConfig = {
      type: 'fieldCondition',
      fieldName: field.name,
      operator: 'equals',
      value: null
    };

    this.nodeAdded.emit({
      type: RuleNodeType.FIELD_CONDITION,
      config
    });
  }

  // Add menu handlers
  toggleAddMenu(): void {
    this.showAddMenu = !this.showAddMenu;
  }

  addFirstRule(): void {
    this.addRule(RuleNodeType.FIELD_CONDITION);
  }

  addRule(type: RuleNodeType): void {
    this.nodeAdded.emit({ type });
    this.showAddMenu = false;
  }
}