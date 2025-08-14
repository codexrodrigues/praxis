import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

import { StyleRuleTemplatesService, StyleRuleTemplate, TemplateVariable } from './style-rule-templates.service';
import { ConditionalStyle } from './table-rule-engine.service';

export interface TemplateGalleryData {
  selectedTemplate?: StyleRuleTemplate;
}

@Component({
  selector: 'template-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatBadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="template-gallery">
      <!-- Header -->
      <div class="gallery-header">
        <div class="header-content">
          <h2 mat-dialog-title>
            <mat-icon>collections</mat-icon>
            Galeria de Templates
          </h2>
          <p class="header-description">
            Escolha um template pronto para começar rapidamente ou customize conforme sua necessidade
          </p>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar templates</mat-label>
          <input matInput 
                 [(ngModel)]="searchQuery"
                 (input)="onSearchChange()"
                 placeholder="Ex: status, prioridade, data...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Content -->
      <div class="gallery-content" mat-dialog-content>
        <mat-tab-group class="category-tabs" (selectedTabChange)="onTabChange($event)">
          <!-- Popular Tab -->
          <mat-tab label="Populares">
            <div class="tab-content">
              <p class="tab-description">Templates mais utilizados pela comunidade</p>
              <div class="templates-grid">
                <div *ngFor="let template of popularTemplates" 
                     class="template-card"
                     [class.selected]="selectedTemplate?.id === template.id"
                     (click)="selectTemplate(template)">
                  <div class="template-preview" [style]="getTemplatePreviewStyle(template)">
                    <span class="preview-text">{{ template.preview.sampleText }}</span>
                  </div>
                  <div class="template-info">
                    <div class="template-header">
                      <mat-icon class="template-icon">{{ template.icon }}</mat-icon>
                      <h4>{{ template.name }}</h4>
                    </div>
                    <p class="template-description">{{ template.description }}</p>
                    <div class="template-tags">
                      <mat-chip *ngFor="let tag of template.tags.slice(0, 3)" class="tag-chip">
                        {{ tag }}
                      </mat-chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Category Tabs -->
          <mat-tab *ngFor="let category of categories">
            <ng-template mat-tab-label>
              {{ category.name }}
              <span
                [matBadge]="getTemplatesByCategory(category.id).length"
                matBadgeColor="primary"
                matBadgeSize="small"
              ></span>
            </ng-template>
            <div class="tab-content">
              <div class="category-header">
                <mat-icon>{{ category.icon }}</mat-icon>
                <p class="tab-description">{{ category.description }}</p>
              </div>
              <div class="templates-grid">
                <div *ngFor="let template of getTemplatesByCategory(category.id)" 
                     class="template-card"
                     [class.selected]="selectedTemplate?.id === template.id"
                     (click)="selectTemplate(template)">
                  <div class="template-preview" [style]="getTemplatePreviewStyle(template)">
                    <span class="preview-text">{{ template.preview.sampleText }}</span>
                  </div>
                  <div class="template-info">
                    <div class="template-header">
                      <mat-icon class="template-icon">{{ template.icon }}</mat-icon>
                      <h4>{{ template.name }}</h4>
                    </div>
                    <p class="template-description">{{ template.description }}</p>
                    <div class="template-tags">
                      <mat-chip *ngFor="let tag of template.tags.slice(0, 3)" class="tag-chip">
                        {{ tag }}
                      </mat-chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Search Results Tab -->
          <mat-tab label="Busca" *ngIf="showSearchResults">
            <div class="tab-content">
              <p class="tab-description">
                {{ searchResults.length }} resultado(s) para "{{ searchQuery }}"
              </p>
              <div class="templates-grid" *ngIf="searchResults.length > 0">
                <div *ngFor="let template of searchResults" 
                     class="template-card"
                     [class.selected]="selectedTemplate?.id === template.id"
                     (click)="selectTemplate(template)">
                  <div class="template-preview" [style]="getTemplatePreviewStyle(template)">
                    <span class="preview-text">{{ template.preview.sampleText }}</span>
                  </div>
                  <div class="template-info">
                    <div class="template-header">
                      <mat-icon class="template-icon">{{ template.icon }}</mat-icon>
                      <h4>{{ template.name }}</h4>
                    </div>
                    <p class="template-description">{{ template.description }}</p>
                    <div class="template-tags">
                      <mat-chip *ngFor="let tag of template.tags.slice(0, 3)" class="tag-chip">
                        {{ tag }}
                      </mat-chip>
                    </div>
                  </div>
                </div>
              </div>
              <div class="no-results" *ngIf="searchResults.length === 0">
                <mat-icon>search_off</mat-icon>
                <h4>Nenhum template encontrado</h4>
                <p>Tente usar termos diferentes ou navegue pelas categorias</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Template Configuration -->
      <div class="template-config" *ngIf="selectedTemplate">
        <mat-divider></mat-divider>
        <mat-expansion-panel class="config-panel" [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>tune</mat-icon>
              Personalizar Template
            </mat-panel-title>
            <mat-panel-description>
              Ajuste os parâmetros do template selecionado
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-content">
            <form [formGroup]="configForm" class="config-form">
              <div *ngFor="let variable of selectedTemplate.variables" class="config-field">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ variable.label }}</mat-label>
                  
                  <!-- String input -->
                  <input *ngIf="variable.type === 'string'"
                         matInput 
                         [formControlName]="variable.name"
                         [placeholder]="variable.defaultValue">
                  
                  <!-- Number input -->
                  <input *ngIf="variable.type === 'number'"
                         matInput 
                         type="number"
                         [formControlName]="variable.name"
                         [placeholder]="variable.defaultValue">
                  
                  <!-- Color input -->
                  <input *ngIf="variable.type === 'color'"
                         matInput 
                         type="color"
                         [formControlName]="variable.name">
                  
                  <!-- Select input -->
                  <mat-select *ngIf="variable.type === 'select'"
                              [formControlName]="variable.name">
                    <mat-option *ngFor="let option of variable.options" [value]="option.value">
                      {{ option.label }}
                    </mat-option>
                  </mat-select>
                  
                  <mat-hint *ngIf="variable.description">{{ variable.description }}</mat-hint>
                </mat-form-field>
              </div>
            </form>

            <!-- Preview of configured template -->
            <div class="configured-preview">
              <h5>Preview da Configuração</h5>
              <div class="preview-cell" [style]="getConfiguredPreviewStyle()">
                <span>{{ getConfiguredPreviewText() }}</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </div>

      <!-- Actions -->
      <div class="gallery-actions" mat-dialog-actions>
        <div class="action-info">
          <span *ngIf="selectedTemplate" class="selection-info">
            <mat-icon>check_circle</mat-icon>
            {{ selectedTemplate.name }} selecionado
          </span>
        </div>
        <div class="action-buttons">
          <button mat-button mat-dialog-close>
            Cancelar
          </button>
          <button mat-raised-button 
                  color="primary"
                  [disabled]="!selectedTemplate"
                  (click)="applyTemplate()">
            <mat-icon>check</mat-icon>
            Aplicar Template
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .template-gallery {
      display: flex;
      flex-direction: column;
      width: 900px;
      max-width: 90vw;
      height: 700px;
      max-height: 90vh;
    }

    .gallery-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
    }

    .header-content h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: var(--mdc-theme-primary);
    }

    .header-description {
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
    }

    .search-section {
      padding: 16px 24px;
      background: var(--mdc-theme-surface-variant);
    }

    .search-field {
      width: 100%;
    }

    .gallery-content {
      flex: 1;
      overflow: hidden;
      padding: 0 !important;
    }

    .category-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 24px;
      height: calc(100% - 48px);
      overflow-y: auto;
    }

    .tab-description {
      margin: 0 0 24px 0;
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .category-header mat-icon {
      color: var(--mdc-theme-primary);
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .template-card {
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--mdc-theme-surface);
    }

    .template-card:hover {
      border-color: var(--mdc-theme-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .template-card.selected {
      border-color: var(--mdc-theme-primary);
      border-width: 2px;
      box-shadow: 0 0 0 1px var(--mdc-theme-primary-container);
    }

    .template-preview {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
      font-weight: 500;
    }

    .preview-text {
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
    }

    .template-info {
      padding: 16px;
    }

    .template-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .template-icon {
      font-size: 20px;
      color: var(--mdc-theme-primary);
    }

    .template-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .template-description {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: var(--mdc-theme-on-surface-variant);
      line-height: 1.4;
    }

    .template-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag-chip {
      font-size: 11px;
      min-height: 20px;
      background: var(--mdc-theme-surface-variant);
    }

    .no-results {
      text-align: center;
      padding: 48px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .template-config {
      border-top: 1px solid var(--mdc-theme-outline-variant);
    }

    .config-panel {
      box-shadow: none;
      border: none;
    }

    .config-content {
      padding: 16px 0;
    }

    .config-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .config-field {
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    .configured-preview {
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 8px;
    }

    .configured-preview h5 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: var(--mdc-theme-primary);
    }

    .preview-cell {
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--mdc-theme-outline);
      background: white;
      font-weight: 500;
    }

    .gallery-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid var(--mdc-theme-outline-variant);
      background: var(--mdc-theme-surface-variant);
    }

    .action-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mdc-theme-primary);
      font-size: 14px;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  `]
})
export class TemplateGalleryComponent implements OnInit {
  selectedTemplate: StyleRuleTemplate | null = null;
  categories: any[] = [];
  popularTemplates: StyleRuleTemplate[] = [];
  searchQuery = '';
  searchResults: StyleRuleTemplate[] = [];
  showSearchResults = false;
  configForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private templatesService: StyleRuleTemplatesService,
    private dialogRef: MatDialogRef<TemplateGalleryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplateGalleryData
  ) {
    this.configForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.categories = this.templatesService.getTemplateCategories();
    this.popularTemplates = this.templatesService.getPopularTemplates();
    
    if (this.data?.selectedTemplate) {
      this.selectTemplate(this.data.selectedTemplate);
    }
  }

  selectTemplate(template: StyleRuleTemplate): void {
    this.selectedTemplate = template;
    this.setupConfigForm();
  }

  private setupConfigForm(): void {
    if (!this.selectedTemplate) return;

    const formControls: any = {};
    this.selectedTemplate.variables.forEach(variable => {
      formControls[variable.name] = [variable.defaultValue];
    });

    this.configForm = this.fb.group(formControls);
  }

  getTemplatesByCategory(categoryId: string): StyleRuleTemplate[] {
    return this.templatesService.getTemplatesByCategory(categoryId);
  }

  getTemplatePreviewStyle(template: StyleRuleTemplate): any {
    return {
      'background-color': template.preview.backgroundColor,
      'color': template.preview.textColor
    };
  }

  getConfiguredPreviewStyle(): any {
    if (!this.selectedTemplate) return {};

    const variables = this.configForm.value;
    const appliedRule = this.templatesService.applyTemplate(this.selectedTemplate, variables);
    
    return {
      'background-color': appliedRule.styles.backgroundColor,
      'color': appliedRule.styles.textColor,
      'font-weight': appliedRule.styles.fontWeight
    };
  }

  getConfiguredPreviewText(): string {
    if (!this.selectedTemplate) return '';
    
    const variables = this.configForm.value;
    return this.selectedTemplate.preview.sampleText.replace(/\${(\w+)}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  onSearchChange(): void {
    if (this.searchQuery.trim()) {
      this.searchResults = this.templatesService.searchTemplates(this.searchQuery);
      this.showSearchResults = true;
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  onTabChange(event: any): void {
    // Handle tab change if needed
  }

  applyTemplate(): void {
    if (!this.selectedTemplate) return;

    const variables = this.configForm.value;
    const appliedRule = this.templatesService.applyTemplate(this.selectedTemplate, variables);

    this.dialogRef.close(appliedRule);
  }
}