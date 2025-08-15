import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { RuleTemplate, RuleNode, TemplateMetadata } from '../models/rule-builder.model';
import { RuleTemplateService } from '../services/rule-template.service';
import { SpecificationBridgeService } from '../services/specification-bridge.service';

export interface TemplateEditorDialogData {
  mode: 'create' | 'edit';
  template?: RuleTemplate;
  selectedNodes?: RuleNode[];
  availableCategories?: string[];
}

export interface TemplateEditorResult {
  action: 'save' | 'cancel';
  template?: RuleTemplate;
}

@Component({
  selector: 'praxis-template-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatStepperModule,
    MatCheckboxModule,
    MatTabsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="template-editor-dialog">
      <div mat-dialog-title class="dialog-title">
        <mat-icon>{{ data.mode === 'create' ? 'add' : 'edit' }}</mat-icon>
        <span>{{ data.mode === 'create' ? 'Create Template' : 'Edit Template' }}</span>
      </div>

      <div mat-dialog-content class="dialog-content">
        <mat-horizontal-stepper #stepper linear>
          <!-- Step 1: Basic Information -->
          <mat-step [stepControl]="basicInfoForm" label="Basic Information">
            <form [formGroup]="basicInfoForm" class="step-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="name-field">
                  <mat-label>Template Name</mat-label>
                  <input matInput 
                         formControlName="name"
                         placeholder="Enter template name"
                         maxlength="100">
                  <mat-hint align="end">{{ (basicInfoForm.get('name')?.value || '').length }}/100</mat-hint>
                  <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                    Template name is required
                  </mat-error>
                  <mat-error *ngIf="basicInfoForm.get('name')?.hasError('minlength')">
                    Name must be at least 3 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="category-field">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    <mat-option *ngFor="let category of availableCategories" 
                               [value]="category.id">
                      <div class="category-option">
                        <mat-icon>{{ category.icon }}</mat-icon>
                        <span>{{ category.name }}</span>
                      </div>
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="basicInfoForm.get('category')?.hasError('required')">
                    Category is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="description-field">
                <mat-label>Description</mat-label>
                <textarea matInput 
                          formControlName="description"
                          placeholder="Describe what this template does and when to use it"
                          rows="3"
                          maxlength="500"></textarea>
                <mat-hint align="end">{{ (basicInfoForm.get('description')?.value || '').length }}/500</mat-hint>
                <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
              </mat-form-field>

              <div class="tags-section">
                <h4>Tags</h4>
                <mat-form-field appearance="outline" class="tags-input">
                  <mat-label>Add tags</mat-label>
                  <mat-chip-grid #chipList>
                    <mat-chip-row *ngFor="let tag of tags" 
                             [removable]="true"
                             (removed)="removeTag(tag)">
                      {{ tag }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip-row>
                    <input placeholder="Type and press Enter"
                           [matChipInputFor]="chipList"
                           [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                           [matChipInputAddOnBlur]="true"
                           (matChipInputTokenEnd)="addTag($event)">
                  </mat-chip-grid>
                  <mat-hint>Tags help organize and find templates. Press Enter to add.</mat-hint>
                </mat-form-field>
              </div>

              <div class="step-actions">
                <button mat-flat-button 
                        color="primary"
                        matStepperNext
                        [disabled]="!basicInfoForm.valid">
                  Next: Configure Rules
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Rule Configuration -->
          <mat-step [stepControl]="rulesForm" label="Rule Configuration">
            <form [formGroup]="rulesForm" class="step-form">
              <div class="rules-section">
                <div class="section-header">
                  <h4>Template Rules</h4>
                  <p class="section-description">
                    {{ data.mode === 'create' ? 'Selected nodes will be included in the template.' : 'Configure the rules included in this template.' }}
                  </p>
                </div>

                <div class="rules-preview">
                  <div class="preview-header">
                    <mat-icon>rule</mat-icon>
                    <span>Rule Structure Preview</span>
                    <span class="node-count">({{ nodeCount }} nodes)</span>
                  </div>

                  <div class="nodes-tree">
                    <div *ngFor="let node of previewNodes" 
                         class="tree-node"
                         [class.root-node]="isRootNode(node)">
                      <div class="node-content">
                        <mat-icon class="node-icon">{{ getNodeIcon(node) }}</mat-icon>
                        <span class="node-label">{{ node.label || node.type }}</span>
                        <mat-chip class="node-type-chip">{{ node.type }}</mat-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="required-fields-section">
                  <h5>Required Fields</h5>
                  <p class="field-description">
                    Specify which fields are required for this template to work properly.
                  </p>
                  
                  <mat-form-field appearance="outline" class="required-fields-input">
                    <mat-label>Required field names</mat-label>
                    <mat-chip-grid #requiredFieldsList>
                      <mat-chip-row *ngFor="let field of requiredFields" 
                               [removable]="true"
                               (removed)="removeRequiredField(field)">
                        {{ field }}
                        <mat-icon matChipRemove>cancel</mat-icon>
                      </mat-chip-row>
                      <input placeholder="Add field name"
                             [matChipInputFor]="requiredFieldsList"
                             [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                             [matChipInputAddOnBlur]="true"
                             (matChipInputTokenEnd)="addRequiredField($event)">
                    </mat-chip-grid>
                    <mat-hint>Field names that must exist for the template to work correctly</mat-hint>
                  </mat-form-field>
                </div>

                <div class="template-variables-section">
                  <h5>Template Variables</h5>
                  <p class="field-description">
                    Variables like {{ '{{fieldName}}' }} will be replaced when the template is applied.
                  </p>
                  
                  <div class="detected-variables">
                    <mat-chip-set>
                      <mat-chip *ngFor="let variable of detectedVariables" 
                               color="accent">
                        {{ variable }}
                      </mat-chip>
                    </mat-chip-set>
                    <p *ngIf="detectedVariables.length === 0" class="no-variables">
                      No template variables detected in this configuration.
                    </p>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  Previous
                </button>
                <button mat-flat-button 
                        color="primary"
                        matStepperNext
                        [disabled]="!rulesForm.valid">
                  Next: Advanced Options
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Advanced Options -->
          <mat-step [stepControl]="advancedForm" label="Advanced Options">
            <form [formGroup]="advancedForm" class="step-form">
              <div class="advanced-section">
                <h4>Template Metadata</h4>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="icon-field">
                    <mat-label>Icon</mat-label>
                    <mat-select formControlName="icon">
                      <mat-option *ngFor="let icon of availableIcons" 
                                 [value]="icon.value">
                        <div class="icon-option">
                          <mat-icon>{{ icon.value }}</mat-icon>
                          <span>{{ icon.label }}</span>
                        </div>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="version-field">
                    <mat-label>Version</mat-label>
                    <input matInput 
                           formControlName="version"
                           placeholder="1.0.0">
                    <mat-hint>Semantic version (major.minor.patch)</mat-hint>
                  </mat-form-field>
                </div>

                <div class="author-section">
                  <h5>Author Information</h5>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="author-name">
                      <mat-label>Author Name</mat-label>
                      <input matInput formControlName="authorName">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="author-email">
                      <mat-label>Author Email</mat-label>
                      <input matInput 
                             type="email"
                             formControlName="authorEmail">
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="organization-field">
                    <mat-label>Organization</mat-label>
                    <input matInput formControlName="organization">
                  </mat-form-field>
                </div>

                <div class="example-section">
                  <h5>Usage Example</h5>
                  <mat-form-field appearance="outline" class="example-field">
                    <mat-label>Example usage or code snippet</mat-label>
                    <textarea matInput 
                              formControlName="example"
                              rows="4"
                              placeholder="Show how to use this template..."></textarea>
                  </mat-form-field>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  Previous
                </button>
                <button mat-flat-button 
                        color="primary"
                        [disabled]="!canSave()"
                        (click)="saveTemplate()">
                  {{ data.mode === 'create' ? 'Create Template' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </mat-step>
        </mat-horizontal-stepper>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="cancel()">
          Cancel
        </button>
        
        <div class="actions-spacer"></div>
        
        <button mat-button 
                *ngIf="data.mode === 'edit'"
                color="warn"
                (click)="deleteTemplate()">
          <mat-icon>delete</mat-icon>
          Delete
        </button>
        
        <button mat-button 
                (click)="previewTemplate()"
                [disabled]="!canPreview()">
          <mat-icon>preview</mat-icon>
          Preview
        </button>
      </div>
    </div>
  `,
  styles: [`
    .template-editor-dialog {
      min-width: 600px;
      max-width: 800px;
      max-height: 90vh;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 24px 24px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .dialog-content {
      padding: 16px 24px;
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }

    .step-form {
      padding: 16px 0;
      min-height: 400px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .name-field,
    .category-field {
      flex: 1;
    }

    .description-field,
    .tags-input,
    .required-fields-input,
    .example-field,
    .organization-field {
      width: 100%;
    }

    .icon-field,
    .version-field {
      flex: 1;
    }

    .author-name,
    .author-email {
      flex: 1;
    }

    .category-option,
    .icon-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tags-section,
    .required-fields-section,
    .template-variables-section,
    .author-section,
    .example-section {
      margin-bottom: 24px;
    }

    .tags-section h4,
    .author-section h5,
    .example-section h5,
    .required-fields-section h5,
    .template-variables-section h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .section-header {
      margin-bottom: 16px;
    }

    .section-header h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .section-description,
    .field-description {
      margin: 0;
      font-size: 13px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .rules-preview {
      background: var(--mdc-theme-surface-variant);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .node-count {
      font-weight: 400;
      color: var(--mdc-theme-on-surface-variant);
    }

    .nodes-tree {
      max-height: 200px;
      overflow-y: auto;
    }

    .tree-node {
      padding: 8px 0;
      border-left: 2px solid transparent;
      padding-left: 16px;
    }

    .tree-node.root-node {
      border-left-color: var(--mdc-theme-primary);
      background: rgba(var(--mdc-theme-primary-rgb), 0.05);
    }

    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mdc-theme-primary);
    }

    .node-label {
      flex: 1;
      font-size: 13px;
    }

    .node-type-chip {
      font-size: 10px;
      height: 18px;
      line-height: 18px;
    }

    .detected-variables {
      margin-top: 8px;
    }

    .no-variables {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      font-style: italic;
      margin: 8px 0;
    }

    .step-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--mdc-theme-outline);
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

    /* Stepper customization */
    ::ng-deep .mat-stepper-horizontal {
      margin-top: 8px;
    }

    ::ng-deep .mat-step-header {
      pointer-events: none;
    }

    ::ng-deep .mat-step-header.cdk-keyboard-focused,
    ::ng-deep .mat-step-header.cdk-program-focused,
    ::ng-deep .mat-step-header:hover {
      background-color: transparent;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .template-editor-dialog {
        min-width: 320px;
        max-width: 95vw;
      }
      
      .form-row {
        flex-direction: column;
      }
      
      .name-field,
      .category-field,
      .icon-field,
      .version-field,
      .author-name,
      .author-email {
        flex: none;
        width: 100%;
      }
    }
  `]
})
export class TemplateEditorDialogComponent implements OnInit {
  basicInfoForm: FormGroup;
  rulesForm: FormGroup;
  advancedForm: FormGroup;

  tags: string[] = [];
  requiredFields: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  availableCategories = [
    { id: 'validation', name: 'Field Validation', icon: 'check_circle' },
    { id: 'business', name: 'Business Rules', icon: 'business' },
    { id: 'collection', name: 'Collection Validation', icon: 'list' },
    { id: 'conditional', name: 'Conditional Logic', icon: 'alt_route' },
    { id: 'workflow', name: 'Workflow Rules', icon: 'workflow' },
    { id: 'security', name: 'Security Validation', icon: 'security' },
    { id: 'custom', name: 'Custom Templates', icon: 'extension' }
  ];

  availableIcons = [
    { value: 'rule', label: 'Rule' },
    { value: 'check_circle', label: 'Check Circle' },
    { value: 'business', label: 'Business' },
    { value: 'list', label: 'List' },
    { value: 'alt_route', label: 'Alt Route' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'security', label: 'Security' },
    { value: 'extension', label: 'Extension' },
    { value: 'widgets', label: 'Widgets' },
    { value: 'settings', label: 'Settings' }
  ];

  previewNodes: RuleNode[] = [];
  detectedVariables: string[] = [];

  get nodeCount(): number {
    return this.previewNodes.length;
  }

  constructor(
    private dialogRef: MatDialogRef<TemplateEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplateEditorDialogData,
    private fb: FormBuilder,
    private templateService: RuleTemplateService,
    private bridgeService: SpecificationBridgeService,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this.createBasicInfoForm();
    this.rulesForm = this.createRulesForm();
    this.advancedForm = this.createAdvancedForm();
  }

  ngOnInit(): void {
    this.loadTemplateData();
    this.setupPreviewNodes();
    this.detectTemplateVariables();
  }

  private createBasicInfoForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  private createRulesForm(): FormGroup {
    return this.fb.group({
      // Form controls for rule configuration
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.fb.group({
      icon: ['rule'],
      version: ['1.0.0'],
      authorName: [''],
      authorEmail: [''],
      organization: [''],
      example: ['']
    });
  }

  private loadTemplateData(): void {
    if (this.data.mode === 'edit' && this.data.template) {
      const template = this.data.template;
      
      this.basicInfoForm.patchValue({
        name: template.name,
        description: template.description,
        category: template.category
      });

      this.tags = [...template.tags];
      this.requiredFields = [...(template.requiredFields || [])];

      this.advancedForm.patchValue({
        icon: template.icon || 'rule',
        version: template.metadata?.version || '1.0.0',
        authorName: template.metadata?.author?.name || '',
        authorEmail: template.metadata?.author?.email || '',
        organization: template.metadata?.author?.organization || '',
        example: template.example || ''
      });

      this.previewNodes = template.nodes;
    }
  }

  private setupPreviewNodes(): void {
    if (this.data.mode === 'create' && this.data.selectedNodes) {
      this.previewNodes = this.data.selectedNodes;
    }
  }

  private detectTemplateVariables(): void {
    // Detect template variables like {{fieldName}} in node configurations
    const variables = new Set<string>();
    
    this.previewNodes.forEach(node => {
      const configStr = JSON.stringify(node.config);
      const matches = configStr.match(/\{\{([^}]+)\}\}/g);
      
      if (matches) {
        matches.forEach(match => {
          const variable = match.slice(2, -2).trim();
          variables.add(variable);
        });
      }
    });

    this.detectedVariables = Array.from(variables);
  }

  // Template methods
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }

    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  addRequiredField(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    
    if (value && !this.requiredFields.includes(value)) {
      this.requiredFields.push(value);
    }

    event.chipInput!.clear();
  }

  removeRequiredField(field: string): void {
    const index = this.requiredFields.indexOf(field);
    if (index >= 0) {
      this.requiredFields.splice(index, 1);
    }
  }

  isRootNode(node: RuleNode): boolean {
    if (this.data.mode === 'edit' && this.data.template) {
      return this.data.template.rootNodes.includes(node.id);
    }
    // For create mode, assume all selected nodes are potential root nodes
    return true;
  }

  getNodeIcon(node: RuleNode): string {
    const icons: Record<string, string> = {
      'fieldCondition': 'compare_arrows',
      'andGroup': 'join_inner',
      'orGroup': 'join_full',
      'notGroup': 'block',
      'requiredIf': 'star_border',
      'visibleIf': 'visibility',
      'forEach': 'repeat',
      'uniqueBy': 'fingerprint'
    };
    
    return icons[node.type] || 'rule';
  }

  canSave(): boolean {
    return this.basicInfoForm.valid && 
           this.rulesForm.valid && 
           this.advancedForm.valid &&
           this.previewNodes.length > 0;
  }

  canPreview(): boolean {
    return this.basicInfoForm.valid && this.previewNodes.length > 0;
  }

  saveTemplate(): void {
    if (!this.canSave()) {
      return;
    }

    const basicInfo = this.basicInfoForm.value;
    const advancedInfo = this.advancedForm.value;

    const templateData: Partial<RuleTemplate> = {
      name: basicInfo.name,
      description: basicInfo.description,
      category: basicInfo.category,
      tags: this.tags,
      nodes: this.previewNodes,
      rootNodes: this.previewNodes.map(n => n.id), // Simplified for demo
      requiredFields: this.requiredFields,
      icon: advancedInfo.icon,
      example: advancedInfo.example,
      metadata: {
        version: advancedInfo.version,
        author: {
          name: advancedInfo.authorName,
          email: advancedInfo.authorEmail,
          organization: advancedInfo.organization
        },
        complexity: this.calculateComplexity(),
        metrics: {
          nodeCount: this.previewNodes.length
        }
      }
    };

    if (this.data.mode === 'create') {
      this.templateService.createTemplate(
        templateData.name!,
        templateData.description!,
        templateData.category!,
        templateData.nodes!,
        templateData.rootNodes!,
        templateData.tags,
        templateData.requiredFields
      ).subscribe({
        next: (template) => {
          // Update with additional metadata
          this.templateService.updateTemplate(template.id, {
            icon: templateData.icon,
            example: templateData.example,
            metadata: templateData.metadata
          }).subscribe({
            next: (updatedTemplate) => {
              this.dialogRef.close({
                action: 'save',
                template: updatedTemplate
              } as TemplateEditorResult);
            }
          });
        },
        error: (error) => {
          this.snackBar.open(`Failed to create template: ${error.message}`, 'Close', {
            duration: 5000
          });
        }
      });
    } else if (this.data.template) {
      this.templateService.updateTemplate(this.data.template.id, templateData).subscribe({
        next: (template) => {
          this.dialogRef.close({
            action: 'save',
            template
          } as TemplateEditorResult);
        },
        error: (error) => {
          this.snackBar.open(`Failed to update template: ${error.message}`, 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  previewTemplate(): void {
    // Implementation would show template preview
    this.snackBar.open('Template preview would be shown here', 'Close', {
      duration: 3000
    });
  }

  deleteTemplate(): void {
    if (this.data.mode === 'edit' && this.data.template) {
      const confirmMessage = `Are you sure you want to delete the template "${this.data.template.name}"?`;
      
      if (confirm(confirmMessage)) {
        this.templateService.deleteTemplate(this.data.template.id).subscribe({
          next: () => {
            this.dialogRef.close({
              action: 'save',
              template: undefined
            } as TemplateEditorResult);
          },
          error: (error) => {
            this.snackBar.open(`Failed to delete template: ${error.message}`, 'Close', {
              duration: 5000
            });
          }
        });
      }
    }
  }

  cancel(): void {
    this.dialogRef.close({
      action: 'cancel'
    } as TemplateEditorResult);
  }

  private calculateComplexity(): 'simple' | 'medium' | 'complex' {
    const nodeCount = this.previewNodes.length;
    if (nodeCount <= 2) return 'simple';
    if (nodeCount <= 5) return 'medium';
    return 'complex';
  }
}