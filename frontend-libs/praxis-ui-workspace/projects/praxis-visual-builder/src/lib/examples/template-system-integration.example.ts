/**
 * Template System Integration Example
 * 
 * This file demonstrates how to integrate the complete template system
 * with the visual rule builder, including:
 * - Template creation from visual rules
 * - Template gallery with search and filtering
 * - Template application to new rule builders
 * - Import/export functionality
 * - Template preview and editing
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RuleTemplate, RuleNode, RuleBuilderState } from '../models/rule-builder.model';
import { RuleTemplateService } from '../services/rule-template.service';
import { SpecificationBridgeService } from '../services/specification-bridge.service';
import { TemplateGalleryComponent } from '../components/template-gallery.component';
import { VisualRuleBuilderComponent } from '../components/visual-rule-builder.component';

@Component({
  selector: 'praxis-template-system-integration',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    TemplateGalleryComponent,
    VisualRuleBuilderComponent
  ],
  template: `
    <div class="template-integration-example">
      <div class="example-header">
        <h1>Template System Integration Example</h1>
        <p>Complete template system with visual rule builder integration</p>
      </div>

      <mat-tab-group class="integration-tabs" animationDuration="0ms">
        <!-- Rule Builder Tab -->
        <mat-tab label="Rule Builder">
          <div class="tab-content">
            <div class="builder-section">
              <div class="section-header">
                <h2>Visual Rule Builder</h2>
                <div class="builder-actions">
                  <button mat-stroked-button 
                          color="primary"
                          (click)="createTemplateFromRules()"
                          [disabled]="!hasSelectedRules()">
                    <mat-icon>save</mat-icon>
                    Save as Template
                  </button>
                  <button mat-stroked-button 
                          (click)="clearAllRules()">
                    <mat-icon>clear</mat-icon>
                    Clear All
                  </button>
                </div>
              </div>

              <praxis-visual-rule-builder
                #ruleBuilder
                [fieldSchemas]="availableFields"
                [builderState]="currentBuilderState"
                (stateChanged)="onBuilderStateChanged($event)"
                (selectionChanged)="onSelectionChanged($event)"
                class="rule-builder-container">
              </praxis-visual-rule-builder>
            </div>
          </div>
        </mat-tab>

        <!-- Template Gallery Tab -->
        <mat-tab label="Template Gallery">
          <div class="tab-content">
            <div class="gallery-section">
              <div class="section-header">
                <h2>Template Gallery</h2>
                <div class="gallery-actions">
                  <button mat-flat-button 
                          color="primary"
                          (click)="createNewTemplate()">
                    <mat-icon>add</mat-icon>
                    Create Template
                  </button>
                </div>
              </div>

              <praxis-template-gallery
                #templateGallery
                [availableFields]="availableFields.map(f => f.name)"
                (templateApplied)="onTemplateApplied($event)"
                (templateCreated)="onTemplateCreated($event)"
                (templateDeleted)="onTemplateDeleted($event)"
                class="template-gallery-container">
              </praxis-template-gallery>
            </div>
          </div>
        </mat-tab>

        <!-- Integration Demo Tab -->
        <mat-tab label="Integration Demo">
          <div class="tab-content">
            <div class="demo-section">
              <h2>Template System Integration Demo</h2>
              
              <!-- Quick Actions -->
              <div class="quick-actions">
                <mat-card class="action-card">
                  <mat-card-header>
                    <mat-card-title>Quick Actions</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="action-buttons">
                      <button mat-stroked-button (click)="createSampleRule()">
                        <mat-icon>add_circle</mat-icon>
                        Create Sample Rule
                      </button>
                      <button mat-stroked-button (click)="loadSampleTemplate()">
                        <mat-icon>download</mat-icon>
                        Load Sample Template
                      </button>
                      <button mat-stroked-button (click)="demonstrateRoundTrip()">
                        <mat-icon>sync</mat-icon>
                        Demo Round-trip Conversion
                      </button>
                      <button mat-stroked-button (click)="exportCurrentState()">
                        <mat-icon>save_alt</mat-icon>
                        Export Current State
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Template Statistics -->
                <mat-card class="stats-card">
                  <mat-card-header>
                    <mat-card-title>Template Statistics</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="stats-grid" *ngIf="templateStats">
                      <div class="stat-item">
                        <mat-icon>widgets</mat-icon>
                        <span class="stat-value">{{ templateStats.totalTemplates }}</span>
                        <span class="stat-label">Total Templates</span>
                      </div>
                      <div class="stat-item">
                        <mat-icon>folder</mat-icon>
                        <span class="stat-value">{{ templateStats.categoriesCount }}</span>
                        <span class="stat-label">Categories</span>
                      </div>
                      <div class="stat-item" *ngIf="templateStats.mostUsedTemplate">
                        <mat-icon>trending_up</mat-icon>
                        <span class="stat-value">{{ templateStats.mostUsedTemplate.metadata?.usageCount || 0 }}</span>
                        <span class="stat-label">Most Used</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Integration Flow -->
              <div class="integration-flow">
                <h3>Integration Workflow</h3>
                <div class="workflow-steps">
                  <div class="step-card" *ngFor="let step of integrationSteps; let i = index">
                    <div class="step-number">{{ i + 1 }}</div>
                    <div class="step-content">
                      <h4>{{ step.title }}</h4>
                      <p>{{ step.description }}</p>
                      <button mat-button 
                              color="primary" 
                              (click)="executeStep(step.action)"
                              [disabled]="step.disabled">
                        {{ step.buttonText }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .template-integration-example {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .example-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .example-header h1 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-primary);
    }

    .example-header p {
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
    }

    .integration-tabs {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--mdc-theme-outline);
    }

    .section-header h2 {
      margin: 0;
      color: var(--mdc-theme-on-surface);
    }

    .builder-actions,
    .gallery-actions {
      display: flex;
      gap: 12px;
    }

    .rule-builder-container,
    .template-gallery-container {
      min-height: 400px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .action-card,
    .stats-card {
      height: fit-content;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 8px;
    }

    .stat-item mat-icon {
      display: block;
      margin: 0 auto 8px;
      color: var(--mdc-theme-primary);
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: var(--mdc-theme-primary);
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      margin-top: 4px;
    }

    .integration-flow h3 {
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .workflow-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .step-card {
      display: flex;
      gap: 16px;
      padding: 20px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      background: var(--mdc-theme-surface);
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--mdc-theme-primary);
      color: var(--mdc-theme-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: var(--mdc-theme-on-surface);
    }

    .step-content p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: var(--mdc-theme-on-surface-variant);
      line-height: 1.4;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .template-integration-example {
        padding: 16px;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .workflow-steps {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TemplateSystemIntegrationExample implements OnInit {
  // State management
  currentBuilderState: RuleBuilderState = {
    nodes: {},
    rootNodes: [],
    validationErrors: [],
    mode: 'visual',
    isDirty: false,
    history: [],
    historyPosition: 0
  };

  selectedNodes: RuleNode[] = [];
  templateStats: any = null;

  // Sample field schemas for demonstration
  availableFields = [
    {
      name: 'firstName',
      type: 'string',
      label: 'First Name',
      required: true
    },
    {
      name: 'lastName',
      type: 'string', 
      label: 'Last Name',
      required: true
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true
    },
    {
      name: 'age',
      type: 'number',
      label: 'Age',
      min: 0,
      max: 120
    },
    {
      name: 'address',
      type: 'object',
      label: 'Address',
      properties: {
        street: { type: 'string', label: 'Street' },
        city: { type: 'string', label: 'City' },
        zipCode: { type: 'string', label: 'ZIP Code' }
      }
    },
    {
      name: 'skills',
      type: 'array',
      label: 'Skills',
      items: { type: 'string' }
    }
  ];

  // Integration workflow steps
  integrationSteps = [
    {
      title: 'Create Visual Rules',
      description: 'Use the visual rule builder to create validation rules using drag-and-drop interface.',
      buttonText: 'Go to Builder',
      action: 'goToBuilder',
      disabled: false
    },
    {
      title: 'Save as Template',
      description: 'Convert your visual rules into reusable templates with metadata and categorization.',
      buttonText: 'Create Template',
      action: 'createTemplate',
      disabled: false
    },
    {
      title: 'Browse Gallery',
      description: 'Explore the template gallery with search, filtering, and preview capabilities.',
      buttonText: 'Open Gallery',
      action: 'openGallery',
      disabled: false
    },
    {
      title: 'Apply Templates',
      description: 'Apply existing templates to new rule builders with automatic node generation.',
      buttonText: 'Apply Template',
      action: 'applyTemplate',
      disabled: false
    },
    {
      title: 'Export/Import',
      description: 'Export templates as JSON files and import them across different environments.',
      buttonText: 'Export Template',
      action: 'exportTemplate',
      disabled: false
    },
    {
      title: 'Integrate with Specifications',
      description: 'Convert templates to specification DSL for backend validation integration.',
      buttonText: 'Generate DSL',
      action: 'generateDsl',
      disabled: false
    }
  ];

  constructor(
    private templateService: RuleTemplateService,
    private bridgeService: SpecificationBridgeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplateStats();
    this.initializeSampleData();
  }

  private loadTemplateStats(): void {
    this.templateService.getTemplateStats().subscribe(stats => {
      this.templateStats = stats;
    });
  }

  private initializeSampleData(): void {
    // Create some sample rules for demonstration
    this.createSampleRule();
  }

  // Builder state management
  onBuilderStateChanged(state: RuleBuilderState): void {
    this.currentBuilderState = state;
  }

  onSelectionChanged(nodes: RuleNode[]): void {
    this.selectedNodes = nodes;
  }

  hasSelectedRules(): boolean {
    return this.selectedNodes.length > 0 || 
           Object.keys(this.currentBuilderState.nodes).length > 0;
  }

  // Template actions
  createTemplateFromRules(): void {
    if (!this.hasSelectedRules()) {
      this.snackBar.open('No rules selected to save as template', 'Close', {
        duration: 3000
      });
      return;
    }

    const allNodes = Object.values(this.currentBuilderState.nodes);
    const selectedRules = this.selectedNodes.length > 0 ? this.selectedNodes : allNodes;

    // Navigate to template gallery and open create dialog
    this.executeStep('openGallery');
    
    // Simulate opening create template dialog with selected nodes
    setTimeout(() => {
      this.showCreateTemplateDialog(selectedRules);
    }, 500);
  }

  private showCreateTemplateDialog(nodes: RuleNode[]): void {
    // This would be handled by the template gallery component
    this.snackBar.open('Template creation dialog would open with selected rules', 'Close', {
      duration: 3000
    });
  }

  clearAllRules(): void {
    this.currentBuilderState = {
      nodes: {},
      rootNodes: [],
      validationErrors: [],
      mode: 'visual',
      isDirty: false,
      history: [],
      historyPosition: 0
    };
    this.selectedNodes = [];
  }

  createNewTemplate(): void {
    this.executeStep('createTemplate');
  }

  // Template event handlers
  onTemplateApplied(template: RuleTemplate): void {
    // Apply template nodes to current builder
    const appliedNodes: Record<string, RuleNode> = {};
    const rootNodes: string[] = [];

    template.nodes.forEach(node => {
      appliedNodes[node.id] = { ...node };
    });

    template.rootNodes.forEach(nodeId => {
      if (appliedNodes[nodeId]) {
        rootNodes.push(nodeId);
      }
    });

    this.currentBuilderState = {
      ...this.currentBuilderState,
      nodes: { ...this.currentBuilderState.nodes, ...appliedNodes },
      rootNodes: [...this.currentBuilderState.rootNodes, ...rootNodes],
      isDirty: true
    };

    this.snackBar.open(`Template "${template.name}" applied successfully`, 'Close', {
      duration: 3000
    });
  }

  onTemplateCreated(template: RuleTemplate): void {
    this.loadTemplateStats();
    this.snackBar.open(`Template "${template.name}" created successfully`, 'Close', {
      duration: 3000
    });
  }

  onTemplateDeleted(templateId: string): void {
    this.loadTemplateStats();
    this.snackBar.open('Template deleted successfully', 'Close', {
      duration: 3000
    });
  }

  // Demo actions
  createSampleRule(): void {
    const sampleNode: RuleNode = {
      id: `node_${Date.now()}`,
      type: 'fieldCondition',
      label: 'Email Validation',
      config: {
        type: 'fieldCondition',
        fieldName: 'email',
        operator: 'isNotEmpty',
        value: null,
        valueType: 'literal'
      }
    };

    this.currentBuilderState = {
      ...this.currentBuilderState,
      nodes: {
        ...this.currentBuilderState.nodes,
        [sampleNode.id]: sampleNode
      },
      rootNodes: [...this.currentBuilderState.rootNodes, sampleNode.id],
      isDirty: true
    };

    this.snackBar.open('Sample email validation rule created', 'Close', {
      duration: 3000
    });
  }

  loadSampleTemplate(): void {
    // Load a sample template from the service
    this.templateService.getTemplates().subscribe(templates => {
      if (templates.length > 0) {
        this.onTemplateApplied(templates[0]);
      } else {
        this.snackBar.open('No templates available to load', 'Close', {
          duration: 3000
        });
      }
    });
  }

  demonstrateRoundTrip(): void {
    if (Object.keys(this.currentBuilderState.nodes).length === 0) {
      this.snackBar.open('No rules to convert. Create some rules first.', 'Close', {
        duration: 3000
      });
      return;
    }

    try {
      const firstNode = Object.values(this.currentBuilderState.nodes)[0];
      
      // Convert to specification
      const specification = this.bridgeService.ruleNodeToSpecification(firstNode);
      
      // Export to DSL
      const dsl = this.bridgeService.exportToDsl(firstNode);
      
      // Validate round-trip
      const validation = this.bridgeService.validateRoundTrip(firstNode);
      
      console.log('Round-trip demonstration:', {
        originalNode: firstNode,
        specification: specification.toJSON(),
        dsl,
        validation
      });

      this.snackBar.open('Round-trip conversion completed. Check console for details.', 'Close', {
        duration: 5000
      });
    } catch (error) {
      this.snackBar.open(`Round-trip conversion failed: ${error}`, 'Close', {
        duration: 5000
      });
    }
  }

  exportCurrentState(): void {
    const exportData = {
      builderState: this.currentBuilderState,
      fieldSchemas: this.availableFields,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    this.downloadFile(dataStr, 'rule-builder-state.json', 'application/json');
    
    this.snackBar.open('Current state exported successfully', 'Close', {
      duration: 3000
    });
  }

  // Step execution
  executeStep(action: string): void {
    switch (action) {
      case 'goToBuilder':
        // Navigate to builder tab (already implemented in template)
        break;
      case 'createTemplate':
        this.createTemplateFromRules();
        break;
      case 'openGallery':
        // Navigate to gallery tab (already implemented in template)
        break;
      case 'applyTemplate':
        this.loadSampleTemplate();
        break;
      case 'exportTemplate':
        this.exportCurrentState();
        break;
      case 'generateDsl':
        this.demonstrateRoundTrip();
        break;
      default:
        this.snackBar.open(`Action "${action}" not implemented yet`, 'Close', {
          duration: 3000
        });
    }
  }

  // Utility methods
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