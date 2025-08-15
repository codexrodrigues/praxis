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
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  startWith,
  map,
} from 'rxjs/operators';

import {
  RuleTemplate,
  TemplateMetadata,
  RuleNode,
} from '../models/rule-builder.model';
import {
  RuleTemplateService,
  TemplateCategory,
  TemplateSearchCriteria,
  TemplateStats,
} from '../services/rule-template.service';
import {
  TemplateEditorDialogComponent,
  TemplateEditorDialogData,
  TemplateEditorResult,
} from './template-editor-dialog.component';
import { TemplatePreviewDialogComponent } from './template-preview-dialog.component';

/**
 * Template display mode
 */
export type TemplateDisplayMode = 'grid' | 'list' | 'compact';

/**
 * Template sort option
 */
export interface TemplateSortOption {
  field: keyof RuleTemplate | keyof TemplateMetadata;
  direction: 'asc' | 'desc';
  label: string;
}

@Component({
  selector: 'praxis-template-gallery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="template-gallery">
      <!-- Header Section -->
      <div class="gallery-header">
        <div class="header-content">
          <div class="title-section">
            <h2 class="gallery-title">
              <mat-icon>widgets</mat-icon>
              Rule Templates
            </h2>
            <p class="gallery-subtitle">
              Reusable rule patterns for faster development
            </p>
          </div>

          <div class="header-actions">
            <button
              mat-stroked-button
              color="primary"
              (click)="showCreateTemplateDialog()"
              matTooltip="Create new template"
            >
              <mat-icon>add</mat-icon>
              Create Template
            </button>

            <button
              mat-stroked-button
              (click)="importTemplate()"
              matTooltip="Import template from file"
            >
              <mat-icon>upload</mat-icon>
              Import
            </button>

            <button
              mat-icon-button
              [matMenuTriggerFor]="viewMenu"
              matTooltip="View options"
            >
              <mat-icon>view_module</mat-icon>
            </button>

            <mat-menu #viewMenu="matMenu">
              <button mat-menu-item (click)="setDisplayMode('grid')">
                <mat-icon>view_module</mat-icon>
                Grid View
              </button>
              <button mat-menu-item (click)="setDisplayMode('list')">
                <mat-icon>view_list</mat-icon>
                List View
              </button>
              <button mat-menu-item (click)="setDisplayMode('compact')">
                <mat-icon>view_compact</mat-icon>
                Compact View
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Statistics Bar -->
        <div class="stats-bar" *ngIf="stats$ | async as stats">
          <div class="stat-item">
            <mat-icon>widgets</mat-icon>
            <span>{{ stats.totalTemplates }} Templates</span>
          </div>
          <div class="stat-item">
            <mat-icon>folder</mat-icon>
            <span>{{ stats.categoriesCount }} Categories</span>
          </div>
          <div class="stat-item" *ngIf="stats.mostUsedTemplate">
            <mat-icon>trending_up</mat-icon>
            <span>Most Used: {{ stats.mostUsedTemplate.name }}</span>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <form [formGroup]="searchForm" class="search-form">
          <div class="search-row">
            <mat-form-field appearance="outline" class="search-input">
              <mat-label>Search templates...</mat-label>
              <input
                matInput
                formControlName="query"
                placeholder="Name, description, or tags"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="category-select">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                <mat-option
                  *ngFor="let category of categories$ | async"
                  [value]="category.id"
                >
                  <div class="category-option">
                    <mat-icon>{{ category.icon }}</mat-icon>
                    <span>{{ category.name }}</span>
                    <span
                      [matBadge]="category.templates.length || 0"
                      matBadgeColor="primary"
                      matBadgeSize="small"
                    ></span>
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="complexity-select">
              <mat-label>Complexity</mat-label>
              <mat-select formControlName="complexity">
                <mat-option value="">Any Complexity</mat-option>
                <mat-option value="simple">Simple</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="complex">Complex</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sort-select">
              <mat-label>Sort by</mat-label>
              <mat-select formControlName="sortBy">
                <mat-option value="name">Name</mat-option>
                <mat-option value="usageCount">Usage Count</mat-option>
                <mat-option value="createdAt">Created Date</mat-option>
                <mat-option value="updatedAt">Updated Date</mat-option>
                <mat-option value="complexity">Complexity</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Tags Filter -->
          <div class="tags-section" *ngIf="popularTags.length > 0">
            <span class="tags-label">Popular tags:</span>
            <mat-chip-listbox class="tags-list">
              <mat-chip-option
                *ngFor="let tag of popularTags"
                [selected]="selectedTags.has(tag)"
                (click)="toggleTag(tag)"
              >
                {{ tag }}
              </mat-chip-option>
            </mat-chip-listbox>
          </div>

          <!-- Active Filters -->
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <span class="filters-label">Active filters:</span>
            <mat-chip-set class="filter-chips">
              <mat-chip
                *ngIf="searchForm.get('category')?.value"
                (removed)="clearFilter('category')"
              >
                Category:
                {{ getCategoryName(searchForm.get('category')?.value || '') }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
              <mat-chip
                *ngIf="searchForm.get('complexity')?.value"
                (removed)="clearFilter('complexity')"
              >
                Complexity: {{ searchForm.get('complexity')?.value || '' }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
              <mat-chip
                *ngFor="let tag of Array.from(selectedTags)"
                (removed)="toggleTag(tag)"
              >
                {{ tag }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            </mat-chip-set>
            <button
              mat-button
              color="warn"
              class="clear-all-button"
              (click)="clearAllFilters()"
            >
              Clear All
            </button>
          </div>
        </form>
      </div>

      <!-- Recently Used Section -->
      <div
        class="recently-used-section"
        *ngIf="recentlyUsed$ | async as recentTemplates"
      >
        <div *ngIf="recentTemplates.length > 0">
          <h3 class="section-title">
            <mat-icon>history</mat-icon>
            Recently Used
          </h3>
          <div class="recent-templates">
            <div
              *ngFor="let template of recentTemplates.slice(0, 5)"
              class="recent-template-item"
            >
              <button
                mat-stroked-button
                class="recent-template-button"
                (click)="applyTemplate(template)"
                [matTooltip]="template.description"
              >
                <mat-icon>{{ template.icon || 'rule' }}</mat-icon>
                <span>{{ template.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Templates Grid/List -->
      <div class="templates-section">
        <div class="templates-header">
          <h3 class="section-title">
            <mat-icon>library_books</mat-icon>
            Templates
            <span class="template-count"
              >({{ (filteredTemplates$ | async)?.length || 0 }})</span
            >
          </h3>

          <div class="view-toggle">
            <mat-slide-toggle [(ngModel)]="showPreview">
              Show Preview
            </mat-slide-toggle>
          </div>
        </div>

        <div
          class="templates-container"
          [class.grid-view]="displayMode === 'grid'"
          [class.list-view]="displayMode === 'list'"
          [class.compact-view]="displayMode === 'compact'"
        >
          <div
            *ngFor="
              let template of filteredTemplates$ | async;
              trackBy: trackByTemplateId
            "
            class="template-card"
          >
            <!-- Grid View Template Card -->
            <mat-card *ngIf="displayMode === 'grid'" class="template-grid-card">
              <mat-card-header>
                <div mat-card-avatar class="template-icon">
                  <mat-icon>{{ template.icon || 'rule' }}</mat-icon>
                </div>
                <mat-card-title>{{ template.name }}</mat-card-title>
                <mat-card-subtitle>{{ template.category }}</mat-card-subtitle>

                <div class="card-actions">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="templateMenu"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #templateMenu="matMenu">
                    <button mat-menu-item (click)="applyTemplate(template)">
                      <mat-icon>play_arrow</mat-icon>
                      Apply Template
                    </button>
                    <button mat-menu-item (click)="previewTemplate(template)">
                      <mat-icon>preview</mat-icon>
                      Preview
                    </button>
                    <button mat-menu-item (click)="editTemplate(template)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="duplicateTemplate(template)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <button mat-menu-item (click)="exportTemplate(template)">
                      <mat-icon>download</mat-icon>
                      Export
                    </button>
                    <mat-divider></mat-divider>
                    <button
                      mat-menu-item
                      color="warn"
                      (click)="deleteTemplate(template)"
                    >
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </div>
              </mat-card-header>

              <mat-card-content>
                <p class="template-description">{{ template.description }}</p>

                <div class="template-tags">
                  <mat-chip-set>
                    <mat-chip
                      *ngFor="let tag of template.tags.slice(0, 3)"
                      class="template-tag"
                    >
                      {{ tag }}
                    </mat-chip>
                    <mat-chip
                      *ngIf="template.tags.length > 3"
                      class="more-tags"
                    >
                      +{{ template.tags.length - 3 }}
                    </mat-chip>
                  </mat-chip-set>
                </div>

                <div class="template-metadata">
                  <div class="metadata-item">
                    <mat-icon>complexity</mat-icon>
                    <span>{{
                      template.metadata?.complexity || 'unknown'
                    }}</span>
                  </div>
                  <div
                    class="metadata-item"
                    *ngIf="template.metadata?.usageCount"
                  >
                    <mat-icon>trending_up</mat-icon>
                    <span>{{ template.metadata?.usageCount }} uses</span>
                  </div>
                  <div class="metadata-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{
                      getRelativeDate(template.metadata?.updatedAt)
                    }}</span>
                  </div>
                </div>

                <!-- Template Preview -->
                <div class="template-preview" *ngIf="showPreview">
                  <div class="preview-header">
                    <mat-icon>preview</mat-icon>
                    <span>Structure Preview</span>
                  </div>
                  <div class="preview-content">
                    <div class="node-tree">
                      <div
                        *ngFor="let nodeId of template.rootNodes"
                        class="root-node"
                      >
                        {{ getNodeLabel(template, nodeId) }}
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button
                  mat-button
                  color="primary"
                  (click)="applyTemplate(template)"
                >
                  <mat-icon>play_arrow</mat-icon>
                  Apply
                </button>
                <button mat-button (click)="previewTemplate(template)">
                  <mat-icon>preview</mat-icon>
                  Preview
                </button>
              </mat-card-actions>
            </mat-card>

            <!-- List View Template Card -->
            <mat-card *ngIf="displayMode === 'list'" class="template-list-card">
              <div class="list-card-content">
                <div class="template-info">
                  <div class="template-header">
                    <mat-icon class="template-icon">{{
                      template.icon || 'rule'
                    }}</mat-icon>
                    <div class="template-details">
                      <h4 class="template-name">{{ template.name }}</h4>
                      <p class="template-description">
                        {{ template.description }}
                      </p>
                    </div>
                  </div>

                  <div class="template-meta">
                    <span class="category-badge">{{ template.category }}</span>
                    <span
                      class="complexity-badge"
                      [class]="
                        'complexity-' +
                        (template.metadata?.complexity || 'unknown')
                      "
                    >
                      {{ template.metadata?.complexity || 'unknown' }}
                    </span>
                    <span
                      class="usage-count"
                      *ngIf="template.metadata?.usageCount"
                    >
                      {{ template.metadata?.usageCount }} uses
                    </span>
                  </div>
                </div>

                <div class="template-actions">
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="applyTemplate(template)"
                  >
                    Apply
                  </button>
                  <button
                    mat-stroked-button
                    (click)="previewTemplate(template)"
                  >
                    Preview
                  </button>
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="listTemplateMenu"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #listTemplateMenu="matMenu">
                    <button mat-menu-item (click)="editTemplate(template)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="duplicateTemplate(template)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <button mat-menu-item (click)="exportTemplate(template)">
                      <mat-icon>download</mat-icon>
                      Export
                    </button>
                    <button mat-menu-item (click)="deleteTemplate(template)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </div>
              </div>
            </mat-card>

            <!-- Compact View Template Card -->
            <div
              *ngIf="displayMode === 'compact'"
              class="template-compact-card"
            >
              <div class="compact-content">
                <mat-icon class="compact-icon">{{
                  template.icon || 'rule'
                }}</mat-icon>
                <div class="compact-info">
                  <span class="compact-name">{{ template.name }}</span>
                  <span class="compact-category">{{ template.category }}</span>
                </div>
                <div class="compact-actions">
                  <button
                    mat-icon-button
                    (click)="applyTemplate(template)"
                    matTooltip="Apply template"
                  >
                    <mat-icon>play_arrow</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    (click)="previewTemplate(template)"
                    matTooltip="Preview template"
                  >
                    <mat-icon>preview</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="(filteredTemplates$ | async)?.length === 0"
            class="empty-state"
          >
            <mat-icon class="empty-icon">widgets</mat-icon>
            <h3>No templates found</h3>
            <p>Try adjusting your search criteria or create a new template.</p>
            <button mat-flat-button color="primary" (click)="clearAllFilters()">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .template-gallery {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--mdc-theme-background);
      }

      .gallery-header {
        background: var(--mdc-theme-surface);
        border-bottom: 1px solid var(--mdc-theme-outline);
        padding: 16px 24px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .title-section {
        flex: 1;
      }

      .gallery-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface);
      }

      .gallery-subtitle {
        margin: 4px 0 0 32px;
        color: var(--mdc-theme-on-surface-variant);
        font-size: 14px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .stats-bar {
        display: flex;
        gap: 24px;
        padding: 12px 0;
        border-top: 1px solid var(--mdc-theme-outline);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .stat-item mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .search-section {
        padding: 16px 24px;
        background: var(--mdc-theme-surface-variant);
        border-bottom: 1px solid var(--mdc-theme-outline);
      }

      .search-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .search-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .search-input {
        flex: 2;
        min-width: 300px;
      }

      .category-select,
      .complexity-select,
      .sort-select {
        flex: 1;
        min-width: 150px;
      }

      .category-option {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .tags-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .tags-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface-variant);
      }

      .tags-list {
        flex: 1;
      }

      .active-filters {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 8px 0;
        border-top: 1px solid var(--mdc-theme-outline);
      }

      .filters-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface-variant);
      }

      .filter-chips {
        flex: 1;
      }

      .clear-all-button {
        font-size: 12px;
      }

      .recently-used-section {
        padding: 16px 24px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--mdc-theme-on-surface);
      }

      .template-count {
        font-size: 14px;
        font-weight: 400;
        color: var(--mdc-theme-on-surface-variant);
      }

      .recent-templates {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .recent-template-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
      }

      .templates-section {
        flex: 1;
        padding: 0 24px 24px;
        overflow: auto;
      }

      .templates-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .view-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .templates-container {
        min-height: 200px;
      }

      /* Grid View */
      .templates-container.grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 16px;
      }

      .template-grid-card {
        height: fit-content;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .template-grid-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .template-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--mdc-theme-primary-container);
        color: var(--mdc-theme-on-primary-container);
      }

      .card-actions {
        margin-left: auto;
      }

      .template-description {
        font-size: 14px;
        line-height: 1.4;
        margin: 0 0 12px 0;
        color: var(--mdc-theme-on-surface-variant);
      }

      .template-tags {
        margin-bottom: 12px;
      }

      .template-tag {
        font-size: 11px;
        height: 20px;
        line-height: 20px;
      }

      .more-tags {
        background: var(--mdc-theme-surface-variant);
        color: var(--mdc-theme-on-surface-variant);
      }

      .template-metadata {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .metadata-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .metadata-item mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .template-preview {
        margin-top: 12px;
        padding: 8px;
        background: var(--mdc-theme-surface-variant);
        border-radius: 4px;
      }

      .preview-header {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .preview-header mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .node-tree {
        font-size: 11px;
        font-family: monospace;
      }

      .root-node {
        padding: 2px 0;
        color: var(--mdc-theme-on-surface);
      }

      /* List View */
      .templates-container.list-view {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-list-card {
        padding: 12px 16px;
      }

      .list-card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .template-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .template-details {
        flex: 1;
      }

      .template-name {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      .template-meta {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .category-badge,
      .complexity-badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 12px;
        background: var(--mdc-theme-surface-variant);
        color: var(--mdc-theme-on-surface-variant);
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

      .usage-count {
        font-size: 11px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .template-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      /* Compact View */
      .templates-container.compact-view {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .template-compact-card {
        padding: 8px 12px;
        border: 1px solid var(--mdc-theme-outline);
        border-radius: 4px;
        background: var(--mdc-theme-surface);
      }

      .compact-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .compact-icon {
        color: var(--mdc-theme-primary);
      }

      .compact-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .compact-name {
        font-size: 14px;
        font-weight: 500;
      }

      .compact-category {
        font-size: 12px;
        color: var(--mdc-theme-on-surface-variant);
      }

      .compact-actions {
        display: flex;
        gap: 4px;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
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
        margin: 0 0 16px 0;
        max-width: 400px;
      }

      /* Responsive adjustments */
      @media (max-width: 1024px) {
        .templates-container.grid-view {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .search-row {
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1 1 100%;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .templates-container.grid-view {
          grid-template-columns: 1fr;
        }

        .stats-bar {
          flex-wrap: wrap;
          gap: 12px;
        }

        .gallery-subtitle {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class TemplateGalleryComponent implements OnInit, OnDestroy {
  @Input() availableFields: string[] = [];

  @Output() templateApplied = new EventEmitter<RuleTemplate>();
  @Output() templateCreated = new EventEmitter<RuleTemplate>();
  @Output() templateDeleted = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  searchForm: FormGroup;
  displayMode: TemplateDisplayMode = 'grid';
  showPreview = false;
  selectedTags = new Set<string>();
  popularTags: string[] = [];

  // Observables
  templates$!: Observable<RuleTemplate[]>;
  categories$!: Observable<TemplateCategory[]>;
  recentlyUsed$!: Observable<RuleTemplate[]>;
  stats$!: Observable<TemplateStats>;
  filteredTemplates$: Observable<RuleTemplate[]>;

  Array = Array; // For template usage

  constructor(
    private templateService: RuleTemplateService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.searchForm = this.createSearchForm();
    this.templates$ = this.templateService.getTemplates();
    this.categories$ = this.templateService.getCategories();
    this.recentlyUsed$ = this.templateService.recentlyUsed$;
    this.stats$ = this.templateService.getTemplateStats();
    this.filteredTemplates$ = this.createFilteredTemplatesStream();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadPopularTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      query: [''],
      category: [''],
      complexity: [''],
      sortBy: ['name'],
    });
  }

  private createFilteredTemplatesStream(): Observable<RuleTemplate[]> {
    return combineLatest([
      this.templates$,
      this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value),
        debounceTime(300),
        distinctUntilChanged(),
      ),
    ]).pipe(
      map(([templates, filters]) => {
        const criteria: TemplateSearchCriteria = {
          query: filters.query || undefined,
          category: filters.category || undefined,
          complexity: filters.complexity || undefined,
          tags:
            this.selectedTags.size > 0
              ? Array.from(this.selectedTags)
              : undefined,
        };

        // Apply filters
        let filtered = this.filterTemplates(templates, criteria);

        // Apply sorting
        filtered = this.sortTemplates(filtered, filters.sortBy);

        return filtered;
      }),
    );
  }

  private setupFormSubscriptions(): void {
    // Additional subscriptions can be added here
  }

  private loadPopularTags(): void {
    this.stats$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      this.popularTags = stats.popularTags.slice(0, 10);
    });
  }

  private filterTemplates(
    templates: RuleTemplate[],
    criteria: TemplateSearchCriteria,
  ): RuleTemplate[] {
    let filtered = templates;

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (criteria.category) {
      filtered = filtered.filter((t) => t.category === criteria.category);
    }

    if (criteria.complexity) {
      filtered = filtered.filter(
        (t) => t.metadata?.complexity === criteria.complexity,
      );
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter((t) =>
        criteria.tags!.some((tag) => t.tags.includes(tag)),
      );
    }

    return filtered;
  }

  private sortTemplates(
    templates: RuleTemplate[],
    sortBy: string,
  ): RuleTemplate[] {
    return [...templates].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usageCount':
          return (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0);
        case 'createdAt':
          const aCreated = a.metadata?.createdAt || new Date(0);
          const bCreated = b.metadata?.createdAt || new Date(0);
          return bCreated.getTime() - aCreated.getTime();
        case 'updatedAt':
          const aUpdated = a.metadata?.updatedAt || new Date(0);
          const bUpdated = b.metadata?.updatedAt || new Date(0);
          return bUpdated.getTime() - aUpdated.getTime();
        case 'complexity':
          const complexityOrder = { simple: 0, medium: 1, complex: 2 };
          const aComplexity =
            complexityOrder[a.metadata?.complexity || 'simple'];
          const bComplexity =
            complexityOrder[b.metadata?.complexity || 'simple'];
          return aComplexity - bComplexity;
        default:
          return 0;
      }
    });
  }

  // Template methods
  trackByTemplateId(index: number, template: RuleTemplate): string {
    return template.id;
  }

  setDisplayMode(mode: TemplateDisplayMode): void {
    this.displayMode = mode;
  }

  toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    // Trigger filter update
    this.searchForm.updateValueAndValidity();
  }

  hasActiveFilters(): boolean {
    const values = this.searchForm.value;
    return !!(
      values?.category ||
      values?.complexity ||
      this.selectedTags.size > 0
    );
  }

  clearFilter(field: string): void {
    this.searchForm.patchValue({ [field]: '' });
  }

  clearAllFilters(): void {
    this.searchForm.reset();
    this.selectedTags.clear();
  }

  getCategoryName(categoryId: string): string {
    const categoryNames: Record<string, string> = {
      validation: 'Field Validation',
      business: 'Business Rules',
      collection: 'Collection Validation',
      conditional: 'Conditional Logic',
      workflow: 'Workflow Rules',
      security: 'Security Validation',
      custom: 'Custom Templates',
    };
    return (
      categoryNames[categoryId] ||
      categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
    );
  }

  getRelativeDate(date?: Date | string): string {
    if (!date) {
      return 'Unknown';
    }

    const target = new Date(date);
    const now = new Date();
    const diff = now.getTime() - target.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  getNodeLabel(template: RuleTemplate, nodeId: string): string {
    const node = template.nodes.find((n) => n.id === nodeId);
    return node?.label || node?.type || 'Unknown';
  }

  // Template actions
  showCreateTemplateDialog(selectedNodes?: RuleNode[]): void {
    const dialogData: TemplateEditorDialogData = {
      mode: 'create',
      selectedNodes: selectedNodes || [],
      availableCategories: [
        'validation',
        'business',
        'collection',
        'conditional',
        'workflow',
        'security',
        'custom',
      ],
    };

    const dialogRef = this.dialog.open(TemplateEditorDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .subscribe((result: TemplateEditorResult | undefined) => {
        if (result?.action === 'save' && result.template) {
          this.templateCreated.emit(result.template);
          this.snackBar.open(
            `Template "${result.template.name}" created successfully`,
            'Close',
            {
              duration: 3000,
            },
          );
        }
      });
  }

  importTemplate(): void {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.template.json';
    input.multiple = false;

    input.onchange = (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          this.templateService.importTemplate(content).subscribe({
            next: (template) => {
              this.templateCreated.emit(template);
              this.snackBar.open(
                `Template "${template.name}" imported successfully`,
                'Close',
                {
                  duration: 3000,
                },
              );
            },
            error: (error) => {
              this.snackBar.open(
                `Failed to import template: ${error.message}`,
                'Close',
                {
                  duration: 5000,
                },
              );
            },
          });
        } catch (error) {
          this.snackBar.open('Invalid template file format', 'Close', {
            duration: 5000,
          });
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  applyTemplate(template: RuleTemplate): void {
    this.templateService.applyTemplate(template.id).subscribe({
      next: (result) => {
        if (result.success) {
          this.templateApplied.emit(template);
          this.snackBar.open(
            `Template "${template.name}" applied successfully`,
            'Close',
            {
              duration: 3000,
            },
          );
        } else {
          this.snackBar.open(
            `Failed to apply template: ${result.errors.join(', ')}`,
            'Close',
            {
              duration: 5000,
            },
          );
        }
      },
      error: (error) => {
        this.snackBar.open(
          `Error applying template: ${error.message}`,
          'Close',
          {
            duration: 5000,
          },
        );
      },
    });
  }

  previewTemplate(template: RuleTemplate): void {
    // Create a simple preview dialog showing template structure
    const dialogRef = this.dialog.open(TemplatePreviewDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { template },
      panelClass: 'template-preview-dialog',
    });

    // Handle actions from preview
    dialogRef.afterClosed().subscribe((action?: string) => {
      if (action === 'apply') {
        this.applyTemplate(template);
      } else if (action === 'export') {
        this.exportTemplate(template);
      }
    });
  }

  editTemplate(template: RuleTemplate): void {
    const dialogData: TemplateEditorDialogData = {
      mode: 'edit',
      template: template,
      availableCategories: [
        'validation',
        'business',
        'collection',
        'conditional',
        'workflow',
        'security',
        'custom',
      ],
    };

    const dialogRef = this.dialog.open(TemplateEditorDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .subscribe((result: TemplateEditorResult | undefined) => {
        if (result?.action === 'save' && result.template) {
          this.snackBar.open(
            `Template "${result.template.name}" updated successfully`,
            'Close',
            {
              duration: 3000,
            },
          );
        }
      });
  }

  duplicateTemplate(template: RuleTemplate): void {
    this.templateService.duplicateTemplate(template.id).subscribe({
      next: (duplicated) => {
        this.snackBar.open(
          `Template duplicated as "${duplicated.name}"`,
          'Close',
          {
            duration: 3000,
          },
        );
      },
      error: (error) => {
        this.snackBar.open(
          `Failed to duplicate template: ${error.message}`,
          'Close',
          {
            duration: 5000,
          },
        );
      },
    });
  }

  exportTemplate(template: RuleTemplate): void {
    this.templateService
      .exportTemplate(template.id, { format: 'json', prettyPrint: true })
      .subscribe({
        next: (jsonData) => {
          this.downloadFile(
            jsonData,
            `${template.name}.template.json`,
            'application/json',
          );
          this.snackBar.open('Template exported successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open(
            `Failed to export template: ${error.message}`,
            'Close',
            {
              duration: 5000,
            },
          );
        },
      });
  }

  deleteTemplate(template: RuleTemplate): void {
    if (
      confirm(
        `Are you sure you want to delete the template "${template.name}"?`,
      )
    ) {
      this.templateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.templateDeleted.emit(template.id);
          this.snackBar.open('Template deleted successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open(
            `Failed to delete template: ${error.message}`,
            'Close',
            {
              duration: 5000,
            },
          );
        },
      });
    }
  }

  private downloadFile(
    content: string,
    filename: string,
    contentType: string,
  ): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
