import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { debounceTime, distinctUntilChanged, takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { RuleNode, SpecificationMetadata } from '../models/rule-builder.model';

@Component({
  selector: 'praxis-metadata-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatAutocompleteModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metadata-editor-container" *ngIf="selectedNode">
      <!-- Header -->
      <div class="editor-header">
        <div class="node-info">
          <mat-icon class="node-icon">{{ getNodeIcon() }}</mat-icon>
          <div class="node-details">
            <h3 class="node-title">{{ getNodeTitle() }}</h3>
            <p class="node-subtitle">{{ getNodeSubtitle() }}</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button mat-icon-button 
                  [color]="hasUnsavedChanges ? 'warn' : 'primary'"
                  [matTooltip]="hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved'"
                  [disabled]="!hasUnsavedChanges">
            <mat-icon>{{ hasUnsavedChanges ? 'edit' : 'check_circle' }}</mat-icon>
          </button>
        </div>
      </div>

      <form [formGroup]="metadataForm" class="metadata-form">
        <!-- Basic Metadata Tab -->
        <mat-tab-group [(selectedIndex)]="activeTabIndex">
          <mat-tab label="Basic Info">
            <div class="tab-content">
              <!-- Code -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Rule Code</mat-label>
                <input matInput 
                       formControlName="code"
                       placeholder="RULE_001">
                <mat-hint>Unique identifier for this rule</mat-hint>
              </mat-form-field>

              <!-- Message -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Message</mat-label>
                <textarea matInput 
                          formControlName="message"
                          rows="3"
                          placeholder="Validation or information message">
                </textarea>
                <mat-hint>Message shown to users when this rule is triggered</mat-hint>
              </mat-form-field>

              <!-- Tag -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tag</mat-label>
                <input matInput 
                       formControlName="tag"
                       [matAutocomplete]="tagAutocomplete"
                       placeholder="validation, ui, business">
                <mat-autocomplete #tagAutocomplete="matAutocomplete">
                  <mat-option *ngFor="let tag of filteredTags | async" [value]="tag">
                    {{ tag }}
                  </mat-option>
                </mat-autocomplete>
                <mat-hint>Categorization tag for grouping related rules</mat-hint>
              </mat-form-field>

              <!-- Description -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput 
                          formControlName="description"
                          rows="3"
                          placeholder="Detailed description of this rule's purpose and behavior">
                </textarea>
                <mat-hint>Internal documentation for developers</mat-hint>
              </mat-form-field>

              <!-- Priority -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option value="low">
                    <div class="priority-option">
                      <mat-icon>low_priority</mat-icon>
                      <span>Low Priority</span>
                      <small>Optional validation</small>
                    </div>
                  </mat-option>
                  <mat-option value="medium">
                    <div class="priority-option">
                      <mat-icon>priority_high</mat-icon>
                      <span>Medium Priority</span>
                      <small>Standard validation</small>
                    </div>
                  </mat-option>
                  <mat-option value="high">
                    <div class="priority-option">
                      <mat-icon>report_problem</mat-icon>
                      <span>High Priority</span>
                      <small>Critical validation</small>
                    </div>
                  </mat-option>
                  <mat-option value="critical">
                    <div class="priority-option">
                      <mat-icon>error</mat-icon>
                      <span>Critical Priority</span>
                      <small>Blocking validation</small>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-hint>Determines validation order and user experience</mat-hint>
              </mat-form-field>
            </div>
          </mat-tab>

          <!-- UI Configuration Tab -->
          <mat-tab label="UI Config">
            <div class="tab-content">
              <div formGroupName="uiConfig">
                <!-- Icon Configuration -->
                <mat-expansion-panel class="config-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>palette</mat-icon>
                      Icon & Visual
                    </mat-panel-title>
                    <mat-panel-description>
                      Configure visual appearance
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="panel-content">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="icon-select">
                        <mat-label>Icon</mat-label>
                        <mat-select formControlName="icon">
                          <mat-option *ngFor="let icon of availableIcons" [value]="icon.value">
                            <div class="icon-option">
                              <mat-icon>{{ icon.value }}</mat-icon>
                              <span>{{ icon.label }}</span>
                            </div>
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="color-select">
                        <mat-label>Color Theme</mat-label>
                        <mat-select formControlName="color">
                          <mat-option value="primary">Primary</mat-option>
                          <mat-option value="accent">Accent</mat-option>
                          <mat-option value="warn">Warning</mat-option>
                          <mat-option value="success">Success</mat-option>
                          <mat-option value="info">Info</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="size-select">
                        <mat-label>Size</mat-label>
                        <mat-select formControlName="size">
                          <mat-option value="small">Small</mat-option>
                          <mat-option value="medium">Medium</mat-option>
                          <mat-option value="large">Large</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <div class="toggle-options">
                        <mat-slide-toggle formControlName="showIcon">
                          Show Icon
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="showLabel">
                          Show Label
                        </mat-slide-toggle>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Display Configuration -->
                <mat-expansion-panel class="config-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>visibility</mat-icon>
                      Display Settings
                    </mat-panel-title>
                    <mat-panel-description>
                      Control when and how to display
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="panel-content">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="position-select">
                        <mat-label>Position</mat-label>
                        <mat-select formControlName="position">
                          <mat-option value="top">Top</mat-option>
                          <mat-option value="bottom">Bottom</mat-option>
                          <mat-option value="left">Left</mat-option>
                          <mat-option value="right">Right</mat-option>
                          <mat-option value="inline">Inline</mat-option>
                          <mat-option value="floating">Floating</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="alignment-select">
                        <mat-label>Alignment</mat-label>
                        <mat-select formControlName="alignment">
                          <mat-option value="start">Start</mat-option>
                          <mat-option value="center">Center</mat-option>
                          <mat-option value="end">End</mat-option>
                          <mat-option value="stretch">Stretch</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="display-options">
                      <mat-slide-toggle formControlName="hidden">
                        Hidden by Default
                      </mat-slide-toggle>
                      
                      <mat-slide-toggle formControlName="disabled">
                        Disabled by Default
                      </mat-slide-toggle>
                      
                      <mat-slide-toggle formControlName="readonly">
                        Readonly by Default
                      </mat-slide-toggle>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Animation Configuration -->
                <mat-expansion-panel class="config-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>animation</mat-icon>
                      Animation & Effects
                    </mat-panel-title>
                    <mat-panel-description>
                      Configure transitions and animations
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="panel-content">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="animation-select">
                        <mat-label>Animation Type</mat-label>
                        <mat-select formControlName="animation">
                          <mat-option value="none">None</mat-option>
                          <mat-option value="fade">Fade</mat-option>
                          <mat-option value="slide">Slide</mat-option>
                          <mat-option value="scale">Scale</mat-option>
                          <mat-option value="bounce">Bounce</mat-option>
                          <mat-option value="flip">Flip</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="duration-input">
                        <mat-label>Duration (ms)</mat-label>
                        <input matInput 
                               type="number"
                               formControlName="animationDuration"
                               min="0"
                               max="5000"
                               placeholder="300">
                      </mat-form-field>
                    </div>

                    <div class="animation-options">
                      <mat-slide-toggle formControlName="animateOnChange">
                        Animate on Value Change
                      </mat-slide-toggle>
                      
                      <mat-slide-toggle formControlName="animateOnValidation">
                        Animate on Validation
                      </mat-slide-toggle>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
            </div>
          </mat-tab>

          <!-- Advanced Tab -->
          <mat-tab label="Advanced">
            <div class="tab-content">
              <!-- Custom Properties -->
              <mat-expansion-panel class="config-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>settings</mat-icon>
                    Custom Properties
                  </mat-panel-title>
                  <mat-panel-description>
                    Add custom metadata properties
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="panel-content">
                  <div class="custom-properties">
                    <div formArrayName="customProperties">
                      <div *ngFor="let prop of customProperties.controls; let i = index"
                           class="custom-property-item"
                           [formGroupName]="i">
                        
                        <div class="property-header">
                          <span class="property-number">{{ i + 1 }}</span>
                          <button mat-icon-button 
                                  color="warn"
                                  (click)="removeCustomProperty(i)"
                                  [disabled]="customProperties.length <= 0">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>

                        <div class="property-form">
                          <mat-form-field appearance="outline" class="property-key">
                            <mat-label>Property Key</mat-label>
                            <input matInput 
                                   formControlName="key"
                                   placeholder="customProperty">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="property-value">
                            <mat-label>Property Value</mat-label>
                            <input matInput 
                                   formControlName="value"
                                   placeholder="value">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="property-type">
                            <mat-label>Type</mat-label>
                            <mat-select formControlName="type">
                              <mat-option value="string">String</mat-option>
                              <mat-option value="number">Number</mat-option>
                              <mat-option value="boolean">Boolean</mat-option>
                              <mat-option value="object">Object</mat-option>
                              <mat-option value="array">Array</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                      </div>
                    </div>

                    <button mat-stroked-button 
                            color="primary"
                            (click)="addCustomProperty()"
                            class="add-property-button">
                      <mat-icon>add</mat-icon>
                      Add Custom Property
                    </button>
                  </div>
                </div>
              </mat-expansion-panel>

              <!-- Conditions -->
              <mat-expansion-panel class="config-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>rule</mat-icon>
                    Conditional Metadata
                  </mat-panel-title>
                  <mat-panel-description>
                    Apply metadata based on conditions
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="panel-content">
                  <div class="conditional-config">
                    <mat-slide-toggle formControlName="enableConditionalMetadata">
                      Enable Conditional Metadata
                    </mat-slide-toggle>

                    <div *ngIf="enableConditionalMetadata" class="conditional-rules">
                      <mat-form-field appearance="outline" class="condition-input">
                        <mat-label>Condition Expression</mat-label>
                        <input matInput 
                               formControlName="conditionExpression"
                               placeholder="field.value === 'specific_value'">
                        <mat-hint>JavaScript expression that determines when this metadata applies</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="fallback-input">
                        <mat-label>Fallback Metadata</mat-label>
                        <textarea matInput 
                                  formControlName="fallbackMetadata"
                                  rows="3"
                                  placeholder="Default metadata when condition is not met">
                        </textarea>
                      </mat-form-field>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>

              <!-- Documentation -->
              <mat-expansion-panel class="config-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>description</mat-icon>
                    Documentation & Notes
                  </mat-panel-title>
                  <mat-panel-description>
                    Internal documentation and comments
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="panel-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Internal Notes</mat-label>
                    <textarea matInput 
                              formControlName="internalNotes"
                              rows="4"
                              placeholder="Internal notes for developers and documentation">
                    </textarea>
                  </mat-form-field>

                  <div class="documentation-links">
                    <h5>Documentation Links</h5>
                    <div formArrayName="documentationLinks">
                      <div *ngFor="let link of documentationLinks.controls; let i = index"
                           class="doc-link-item">
                        
                        <mat-form-field appearance="outline" class="link-title">
                          <mat-label>Title</mat-label>
                          <input matInput 
                                 [formControlName]="i"
                                 placeholder="Documentation title">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="link-url">
                          <mat-label>URL</mat-label>
                          <input matInput 
                                 [formControlName]="i"
                                 placeholder="https://docs.example.com">
                        </mat-form-field>

                        <button mat-icon-button 
                                color="warn"
                                (click)="removeDocumentationLink(i)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>

                    <button mat-stroked-button 
                            color="primary"
                            (click)="addDocumentationLink()"
                            class="add-link-button">
                      <mat-icon>add</mat-icon>
                      Add Documentation Link
                    </button>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Preview Section -->
        <div class="preview-section">
          <h4 class="preview-title">
            <mat-icon>preview</mat-icon>
            Metadata Preview
          </h4>
          
          <div class="preview-content">
            <pre class="preview-json">{{ getMetadataPreview() }}</pre>
          </div>
        </div>
      </form>
    </div>

    <!-- Empty State -->
    <div class="empty-state" *ngIf="!selectedNode">
      <div class="empty-state-content">
        <mat-icon class="empty-icon">rule</mat-icon>
        <h3>No Rule Selected</h3>
        <p>Select a rule from the canvas or sidebar to edit its metadata</p>
      </div>
    </div>
  `,
  styles: [`
    .metadata-editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-bottom: 1px solid var(--mdc-theme-outline);
    }

    .node-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .node-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--mdc-theme-primary);
    }

    .node-details {
      display: flex;
      flex-direction: column;
    }

    .node-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--mdc-theme-on-surface);
    }

    .node-subtitle {
      margin: 0;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .metadata-form {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }

    .tab-content {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .form-row > * {
      flex: 1;
    }

    .config-panel {
      margin-bottom: 16px;
    }

    .panel-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .priority-option,
    .icon-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .priority-option small,
    .icon-option small {
      color: var(--mdc-theme-on-surface-variant);
      font-size: 11px;
    }

    .toggle-options,
    .display-options,
    .animation-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .custom-properties {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .custom-property-item {
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      padding: 12px;
      background: var(--mdc-theme-surface);
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .property-number {
      background: var(--mdc-theme-primary);
      color: var(--mdc-theme-on-primary);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .property-form {
      display: flex;
      gap: 8px;
    }

    .property-key,
    .property-value {
      flex: 2;
    }

    .property-type {
      flex: 1;
    }

    .conditional-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .conditional-rules {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background: var(--mdc-theme-surface);
      border-radius: 8px;
      border: 1px solid var(--mdc-theme-outline);
    }

    .documentation-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .documentation-links h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--mdc-theme-primary);
    }

    .doc-link-item {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .link-title,
    .link-url {
      flex: 1;
    }

    .add-property-button,
    .add-link-button {
      align-self: flex-start;
    }

    .preview-section {
      margin-top: 24px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 12px 16px;
      background: var(--mdc-theme-primary-container);
      border-bottom: 1px solid var(--mdc-theme-outline);
      font-size: 14px;
      font-weight: 500;
    }

    .preview-content {
      padding: 16px;
      background: var(--mdc-theme-surface);
    }

    .preview-json {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: var(--mdc-theme-on-surface);
      margin: 0;
      white-space: pre-wrap;
      background: var(--mdc-theme-surface-variant);
      padding: 12px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
      max-height: 200px;
      overflow-y: auto;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    }

    .empty-state-content {
      max-width: 300px;
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
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
      line-height: 1.4;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
      
      .property-form {
        flex-direction: column;
      }
      
      .doc-link-item {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class MetadataEditorComponent implements OnInit, OnChanges {
  @Input() selectedNode: RuleNode | null = null;
  
  @Output() metadataUpdated = new EventEmitter<SpecificationMetadata>();

  private destroy$ = new Subject<void>();

  metadataForm: FormGroup;
  activeTabIndex = 0;
  hasUnsavedChanges = false;

  // Autocomplete data
  availableTags = ['validation', 'ui', 'business', 'security', 'performance', 'accessibility'];
  filteredTags!: Observable<string[]>;

  availableIcons = [
    { value: 'rule', label: 'Rule' },
    { value: 'star', label: 'Star' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'info', label: 'Info' },
    { value: 'check_circle', label: 'Check' },
    { value: 'cancel', label: 'Cancel' },
    { value: 'help', label: 'Help' },
    { value: 'settings', label: 'Settings' },
    { value: 'visibility', label: 'Visibility' },
    { value: 'lock', label: 'Lock' },
    { value: 'security', label: 'Security' }
  ];

  get customProperties(): FormArray {
    return this.metadataForm.get('customProperties') as FormArray;
  }

  get documentationLinks(): FormArray {
    return this.metadataForm.get('documentationLinks') as FormArray;
  }

  get enableConditionalMetadata(): boolean {
    return this.metadataForm.get('enableConditionalMetadata')?.value || false;
  }

  constructor(private fb: FormBuilder) {
    this.metadataForm = this.createForm();
    this.setupTagAutocomplete();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadMetadata();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode']) {
      this.loadMetadata();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      code: [''],
      message: [''],
      tag: [''],
      description: [''],
      priority: ['medium'],
      uiConfig: this.fb.group({
        icon: ['rule'],
        color: ['primary'],
        size: ['medium'],
        showIcon: [true],
        showLabel: [true],
        position: ['top'],
        alignment: ['start'],
        hidden: [false],
        disabled: [false],
        readonly: [false],
        animation: ['fade'],
        animationDuration: [300],
        animateOnChange: [false],
        animateOnValidation: [true]
      }),
      customProperties: this.fb.array([]),
      enableConditionalMetadata: [false],
      conditionExpression: [''],
      fallbackMetadata: [''],
      internalNotes: [''],
      documentationLinks: this.fb.array([])
    });
  }

  private setupFormSubscriptions(): void {
    this.metadataForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.hasUnsavedChanges = true;
        this.emitMetadataUpdate();
      });
  }

  private setupTagAutocomplete(): void {
    const tagControl = this.metadataForm.get('tag');
    if (tagControl) {
      this.filteredTags = tagControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterTags(value || ''))
      );
    } else {
      this.filteredTags = new Observable(observer => observer.next(this.availableTags));
    }
  }

  private filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter(tag => 
      tag.toLowerCase().includes(filterValue)
    );
  }

  private loadMetadata(): void {
    if (!this.selectedNode?.metadata) {
      this.resetForm();
      return;
    }

    const metadata = this.selectedNode.metadata;
    
    this.metadataForm.patchValue({
      code: metadata.code || '',
      message: metadata.message || '',
      tag: metadata.tag || '',
      description: metadata.description || '',
      priority: metadata.priority || 'medium',
      uiConfig: {
        icon: metadata.uiConfig?.icon || 'rule',
        color: metadata.uiConfig?.color || 'primary',
        size: metadata.uiConfig?.size || 'medium',
        showIcon: metadata.uiConfig?.showIcon !== false,
        showLabel: metadata.uiConfig?.showLabel !== false,
        position: metadata.uiConfig?.position || 'top',
        alignment: metadata.uiConfig?.alignment || 'start',
        hidden: metadata.uiConfig?.hidden || false,
        disabled: metadata.uiConfig?.disabled || false,
        readonly: metadata.uiConfig?.readonly || false,
        animation: metadata.uiConfig?.animation || 'fade',
        animationDuration: metadata.uiConfig?.animationDuration || 300,
        animateOnChange: metadata.uiConfig?.animateOnChange || false,
        animateOnValidation: metadata.uiConfig?.animateOnValidation !== false
      },
      enableConditionalMetadata: !!metadata.conditionExpression,
      conditionExpression: metadata.conditionExpression || '',
      fallbackMetadata: metadata.fallbackMetadata || '',
      internalNotes: metadata.internalNotes || ''
    });

    // Load custom properties
    this.loadCustomProperties(metadata.customProperties || {});
    
    // Load documentation links
    this.loadDocumentationLinks(metadata.documentationLinks || []);

    this.hasUnsavedChanges = false;
  }

  private resetForm(): void {
    this.metadataForm.reset();
    this.customProperties.clear();
    this.documentationLinks.clear();
    this.hasUnsavedChanges = false;
  }

  private loadCustomProperties(properties: Record<string, any>): void {
    this.customProperties.clear();
    
    Object.entries(properties).forEach(([key, value]) => {
      this.customProperties.push(this.fb.group({
        key: [key],
        value: [value],
        type: [this.inferType(value)]
      }));
    });
  }

  private loadDocumentationLinks(links: any[]): void {
    this.documentationLinks.clear();
    
    links.forEach(link => {
      this.documentationLinks.push(this.fb.group({
        title: [link.title || ''],
        url: [link.url || '']
      }));
    });
  }

  private emitMetadataUpdate(): void {
    if (!this.selectedNode) return;

    const formValue = this.metadataForm.value;
    const metadata: SpecificationMetadata = {
      code: formValue.code || undefined,
      message: formValue.message || undefined,
      tag: formValue.tag || undefined,
      description: formValue.description || undefined,
      priority: formValue.priority || undefined,
      uiConfig: this.cleanUiConfig(formValue.uiConfig),
      customProperties: this.getCustomPropertiesValue(),
      conditionExpression: formValue.enableConditionalMetadata ? formValue.conditionExpression : undefined,
      fallbackMetadata: formValue.enableConditionalMetadata ? formValue.fallbackMetadata : undefined,
      internalNotes: formValue.internalNotes || undefined,
      documentationLinks: this.getDocumentationLinksValue()
    };

    // Remove undefined values
    Object.keys(metadata).forEach(key => {
      if (metadata[key as keyof SpecificationMetadata] === undefined) {
        delete metadata[key as keyof SpecificationMetadata];
      }
    });

    this.metadataUpdated.emit(metadata);
  }

  private cleanUiConfig(uiConfig: any): any {
    const cleaned: any = {};
    
    Object.entries(uiConfig).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  private getCustomPropertiesValue(): Record<string, any> | undefined {
    const properties: Record<string, any> = {};
    
    this.customProperties.controls.forEach(control => {
      const prop = control.value;
      if (prop.key && prop.value) {
        properties[prop.key] = this.convertValueByType(prop.value, prop.type);
      }
    });

    return Object.keys(properties).length > 0 ? properties : undefined;
  }

  private getDocumentationLinksValue(): any[] | undefined {
    const links = this.documentationLinks.controls
      .map(control => control.value)
      .filter(link => link.title && link.url);

    return links.length > 0 ? links : undefined;
  }

  private inferType(value: any): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'string';
  }

  private convertValueByType(value: any, type: string): any {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === true;
      case 'array':
        try {
          return Array.isArray(value) ? value : JSON.parse(value);
        } catch {
          return [value];
        }
      case 'object':
        try {
          return typeof value === 'object' ? value : JSON.parse(value);
        } catch {
          return { value };
        }
      default:
        return String(value);
    }
  }

  // Template methods
  getNodeIcon(): string {
    return this.selectedNode?.type ? this.getNodeTypeIcon(this.selectedNode.type) : 'rule';
  }

  getNodeTitle(): string {
    return this.selectedNode?.label || this.selectedNode?.type || 'Unknown Rule';
  }

  getNodeSubtitle(): string {
    return this.selectedNode?.metadata?.description || this.selectedNode?.id || '';
  }

  getNodeTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'fieldCondition': 'compare_arrows',
      'andGroup': 'join_inner',
      'orGroup': 'join_full',
      'requiredIf': 'star',
      'visibleIf': 'visibility',
      'disabledIf': 'block',
      'readonlyIf': 'lock'
    };
    
    return icons[type] || 'rule';
  }

  getMetadataPreview(): string {
    const formValue = this.metadataForm.value;
    
    const metadata: any = {
      code: formValue.code || undefined,
      message: formValue.message || undefined,
      tag: formValue.tag || undefined,
      description: formValue.description || undefined,
      priority: formValue.priority || undefined,
      uiConfig: this.cleanUiConfig(formValue.uiConfig),
      customProperties: this.getCustomPropertiesValue()
    };

    // Remove undefined values for cleaner preview
    Object.keys(metadata).forEach(key => {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    });

    return JSON.stringify(metadata, null, 2);
  }

  // Event handlers
  addCustomProperty(): void {
    this.customProperties.push(this.fb.group({
      key: [''],
      value: [''],
      type: ['string']
    }));
  }

  removeCustomProperty(index: number): void {
    this.customProperties.removeAt(index);
  }

  addDocumentationLink(): void {
    this.documentationLinks.push(this.fb.group({
      title: [''],
      url: ['']
    }));
  }

  removeDocumentationLink(index: number): void {
    this.documentationLinks.removeAt(index);
  }
}