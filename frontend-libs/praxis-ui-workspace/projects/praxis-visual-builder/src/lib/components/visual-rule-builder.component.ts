import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RuleBuilderState, RuleNode } from '../models/rule-builder.model';

/**
 * Placeholder Visual Rule Builder Component
 * 
 * This is a placeholder component for the template integration example.
 * In a real implementation, this would be the main visual rule builder interface.
 */
@Component({
  selector: 'praxis-visual-rule-builder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="visual-rule-builder-placeholder">
      <div class="placeholder-content">
        <h3>Visual Rule Builder</h3>
        <p>This is a placeholder for the visual rule builder component.</p>
        <p>Current state has {{ nodeCount }} nodes.</p>
        
        <div class="builder-actions">
          <button type="button" (click)="addSampleNode()">Add Sample Node</button>
          <button type="button" (click)="clearNodes()">Clear All</button>
        </div>

        <div class="state-display" *ngIf="nodeCount > 0">
          <h4>Current Nodes:</h4>
          <ul>
            <li *ngFor="let nodeId of builderState?.rootNodes">
              Node: {{ nodeId }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visual-rule-builder-placeholder {
      padding: 24px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      background: #f9f9f9;
      text-align: center;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-content {
      max-width: 400px;
    }

    .placeholder-content h3 {
      margin: 0 0 16px 0;
      color: #666;
    }

    .placeholder-content p {
      margin: 8px 0;
      color: #888;
    }

    .builder-actions {
      margin: 20px 0;
    }

    .builder-actions button {
      margin: 0 8px;
      padding: 8px 16px;
      border: 1px solid #ccc;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .builder-actions button:hover {
      background: #f0f0f0;
    }

    .state-display {
      margin-top: 20px;
      text-align: left;
      background: white;
      padding: 16px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .state-display h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .state-display ul {
      margin: 0;
      padding-left: 20px;
    }

    .state-display li {
      color: #666;
      margin: 4px 0;
    }
  `]
})
export class VisualRuleBuilderComponent {
  @Input() fieldSchemas: any[] = [];
  @Input() builderState: RuleBuilderState | null = null;
  
  @Output() stateChanged = new EventEmitter<RuleBuilderState>();
  @Output() selectionChanged = new EventEmitter<any[]>();

  get nodeCount(): number {
    return this.builderState ? Object.keys(this.builderState.nodes).length : 0;
  }

  addSampleNode(): void {
    if (!this.builderState) {
      this.builderState = {
        nodes: {},
        rootNodes: [],
        validationErrors: [],
        mode: 'visual',
        isDirty: false,
        history: [],
        historyPosition: 0
      };
    }

    const nodeId = `sample-node-${Date.now()}`;
    const sampleNode: RuleNode = {
      id: nodeId,
      type: 'fieldCondition',
      label: 'Sample Rule',
      config: {
        type: 'fieldCondition',
        fieldName: 'email',
        operator: 'neq',
        value: ''
      }
    };

    const newState: RuleBuilderState = {
      ...this.builderState,
      nodes: {
        ...this.builderState.nodes,
        [nodeId]: sampleNode
      },
      rootNodes: [...this.builderState.rootNodes, nodeId],
      isDirty: true
    };

    this.builderState = newState;
    this.stateChanged.emit(newState);
    this.selectionChanged.emit([sampleNode]);
  }

  clearNodes(): void {
    const newState: RuleBuilderState = {
      nodes: {},
      rootNodes: [],
      validationErrors: [],
      mode: 'visual',
      isDirty: false,
      history: [],
      historyPosition: 0
    };

    this.builderState = newState;
    this.stateChanged.emit(newState);
    this.selectionChanged.emit([]);
  }
}