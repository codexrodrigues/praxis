import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { 
  TableConfig, 
  ColumnDefinition,
  isTableConfigV2 
} from '@praxis/core';
import { Subject } from 'rxjs';
import { VisualFormulaBuilderComponent } from '../visual-formula-builder/visual-formula-builder.component';
import { FieldSchema, FormulaDefinition } from '../visual-formula-builder/formula-types';
import { ValueMappingEditorComponent } from '../value-mapping-editor/value-mapping-editor.component';
import { DataFormatterComponent } from '../data-formatter/data-formatter.component';
import { ColumnDataType } from '../data-formatter/data-formatter-types';
import { StyleRuleBuilderComponent } from '../integration/style-rule-builder.component';
import { StylePreviewComponent } from '../integration/style-preview.component';
import { TableRuleEngineService, ConditionalStyle, ValidationResult } from '../integration/table-rule-engine.service';
import { FieldSchemaAdapter } from '../integration/field-schema-adapter.service';

export interface ColumnChange {
  type: 'add' | 'remove' | 'update' | 'reorder' | 'global';
  columnIndex?: number;
  column?: ColumnDefinition;
  columns?: ColumnDefinition[];
  fullConfig?: TableConfig;
}

@Component({
  selector: 'columns-config-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule,
    DragDropModule,
    VisualFormulaBuilderComponent,
    ValueMappingEditorComponent,
    DataFormatterComponent
  ],
  template: `
    <div class="columns-config-editor">
      <!-- Educational Card - Compact -->
      <mat-card class="educational-card compact">
        <mat-card-content class="compact-content">
          <div class="compact-header">
            <mat-icon class="inline-icon">table_chart</mat-icon>
            <h4>Personalização de Colunas</h4>
          </div>
          <p>Configure visibilidade, cabeçalhos, largura e propriedades de cada coluna.</p>
        </mat-card-content>
      </mat-card>

      <!-- Global Actions Panel - Compact -->
      <mat-card class="global-actions-card compact">
        <mat-card-content class="compact-global-content">
          <div class="global-header">
            <mat-icon class="inline-icon">tune</mat-icon>
            <h4>Configurações Globais</h4>
          </div>
          <div class="global-actions-grid compact">
            <!-- Visibility Actions -->
            <div class="global-action-group">
              <label class="group-label">Visibilidade</label>
              <mat-button-toggle-group class="compact-toggle-group">
                <mat-button-toggle value="show" (click)="showAllColumns()">
                  <mat-icon>visibility</mat-icon>
                  <span class="toggle-text">Todas</span>
                </mat-button-toggle>
                <mat-button-toggle value="hide" (click)="hideAllColumns()">
                  <mat-icon>visibility_off</mat-icon>
                  <span class="toggle-text">Nenhuma</span>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- Sortable Global -->
            <div class="global-action-group">
              <label class="group-label">Ordenação</label>
              <mat-checkbox [(ngModel)]="globalSortableEnabled" (ngModelChange)="applyGlobalSortable($event)" class="compact-checkbox">
                Habilitar para todas
              </mat-checkbox>
            </div>

            <!-- Alignment Default -->
            <div class="global-action-group">
              <label class="group-label">Alinhamento</label>
              <mat-button-toggle-group [(ngModel)]="globalAlignment" (ngModelChange)="applyGlobalAlignment($event)" class="compact-toggle-group">
                <mat-button-toggle value="left">
                  <mat-icon>format_align_left</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="center">
                  <mat-icon>format_align_center</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="right">
                  <mat-icon>format_align_right</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>
            
            <!-- V2 Features -->
            <div *ngIf="isV2Config" class="v2-features-section">
              <mat-divider class="features-divider"></mat-divider>
              
              <!-- Resizable Columns -->
              <div class="global-action-group">
                <label class="group-label">Redimensionar</label>
                <mat-checkbox [(ngModel)]="globalResizable" (ngModelChange)="applyGlobalResizable($event)" class="compact-checkbox">
                  Colunas redimensionáveis
                </mat-checkbox>
              </div>
              
              <!-- Filterable Columns -->
              <div class="global-action-group">
                <label class="group-label">Filtragem</label>
                <mat-checkbox [(ngModel)]="globalFilterable" (ngModelChange)="applyGlobalFilterable($event)" class="compact-checkbox">
                  Filtros por coluna
                </mat-checkbox>
              </div>
              
              <!-- Sticky Columns -->
              <div class="global-action-group">
                <label class="group-label">Fixar</label>
                <mat-checkbox [(ngModel)]="globalStickyEnabled" (ngModelChange)="applyGlobalSticky($event)" class="compact-checkbox">
                  Fixar colunas
                </mat-checkbox>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Master-Detail Layout -->
      <div class="master-detail-layout">
        <!-- Master: Columns List -->
        <div class="master-panel">
          <div class="list-header">
            <h3>Colunas ({{ columns.length }})</h3>
            <button mat-fab color="primary" class="add-column-fab" (click)="addNewColumn()"
                    matTooltip="Adicionar Coluna Calculada">
              <mat-icon>functions</mat-icon>
            </button>
          </div>

          <div class="columns-list-container" cdkDropList (cdkDropListDropped)="onColumnReorder($event)">
            <mat-list class="columns-list">
              <mat-list-item
                *ngFor="let column of columns; let i = index"
                [class.selected]="selectedColumnIndex === i"
                (click)="selectColumn(i)"
                cdkDrag
                class="column-item">

                <div class="column-item-content" cdkDragHandle>
                  <div class="column-main-info">
                    <div class="column-header">
                      <mat-icon class="drag-handle">drag_handle</mat-icon>
                      <div class="column-text-info">
                        <span class="column-title"
                              [matTooltip]="column.field"
                              matTooltipPosition="below">
                          {{ column.header || column.field }}
                        </span>
                        <span class="column-field">{{ column.field }}</span>
                      </div>
                      <div class="column-indicators">
                        <mat-icon class="column-type-icon"
                                  [matTooltip]="isCalculatedColumn(column) ? 'Coluna Calculada' : 'Campo da API'">
                          {{ isCalculatedColumn(column) ? 'functions' : 'data_object' }}
                        </mat-icon>
                        <mat-icon class="mapping-indicator-icon"
                                  [matBadge]="getMappingCount(column)"
                                  [matBadgeHidden]="getMappingCount(column) === 0"
                                  matBadgeColor="accent"
                                  matBadgeSize="small"
                                  [matTooltip]="getMappingTooltip(column)">
                          swap_horiz
                        </mat-icon>
                        <mat-checkbox [(ngModel)]="column.visible"
                                    (ngModelChange)="onColumnPropertyChange()"
                                    (click)="$event.stopPropagation()"
                                    class="visibility-checkbox"
                                    matTooltip="Visível na tabela">
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>

                  <button mat-icon-button color="warn" class="remove-button"
                          (click)="removeColumn(i, $event)"
                          matTooltip="Remover Coluna">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </div>

        <mat-divider [vertical]="true" class="panel-divider"></mat-divider>

        <!-- Detail: Column Editor -->
        <div class="detail-panel">
          <div *ngIf="selectedColumnIndex === -1" class="no-selection-message">
            <mat-icon>table_chart</mat-icon>
            <h3>Selecione uma coluna</h3>
            <p>Escolha uma coluna da lista para editar suas propriedades</p>
          </div>

          <div *ngIf="selectedColumn" class="column-editor">
            <div class="editor-header">
              <h3>Editando: {{ selectedColumn.header || selectedColumn.field }}</h3>
            </div>

            <form class="column-form">
              <!-- Basic Properties Row -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="field-input">
                  <mat-label>Campo (field)</mat-label>
                  <input matInput
                         [(ngModel)]="selectedColumn.field"
                         name="field"
                         [readonly]="isExistingColumn(selectedColumn)"
                         (ngModelChange)="onColumnPropertyChange()">
                  <mat-hint>Nome técnico do campo</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="header-input">
                  <mat-label>Cabeçalho (header)</mat-label>
                  <input matInput
                         [(ngModel)]="selectedColumn.header"
                         name="header"
                         (ngModelChange)="onColumnPropertyChange()">
                  <mat-hint>Texto exibido no cabeçalho</mat-hint>
                </mat-form-field>
              </div>

              <!-- Visibility and Alignment Row -->
              <div class="form-row">
                <div class="checkbox-group">
                  <mat-checkbox [(ngModel)]="selectedColumn.visible"
                               name="visible"
                               (ngModelChange)="onColumnPropertyChange()">
                    Coluna Visível
                  </mat-checkbox>
                </div>

                <div class="alignment-group">
                  <label class="control-label">Alinhamento</label>
                  <mat-button-toggle-group [(ngModel)]="selectedColumn.align"
                                          name="align"
                                          (ngModelChange)="onColumnPropertyChange()">
                    <mat-button-toggle value="left">
                      <mat-icon>format_align_left</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="center">
                      <mat-icon>format_align_center</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="right">
                      <mat-icon>format_align_right</mat-icon>
                    </mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
              </div>

              <!-- Width and Advanced Row -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="width-input">
                  <mat-label>Largura</mat-label>
                  <input matInput
                         [(ngModel)]="selectedColumn.width"
                         name="width"
                         placeholder="auto"
                         (ngModelChange)="onColumnPropertyChange()">
                  <mat-hint>Ex: 100px, 10%, auto</mat-hint>
                </mat-form-field>

                <div class="checkbox-group">
                  <mat-checkbox [(ngModel)]="selectedColumn.sortable"
                               name="sortable"
                               (ngModelChange)="onColumnPropertyChange()">
                    Ordenável
                  </mat-checkbox>
                </div>
              </div>

              <!-- Data Type Row -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="data-type-input">
                  <mat-label>Tipo de Dados</mat-label>
                  <mat-select [(ngModel)]="selectedColumnDataType"
                              (ngModelChange)="onDataTypeChange($event)"
                              name="dataType">
                    <mat-option value="string">
                      <mat-icon>text_fields</mat-icon>
                      Texto
                    </mat-option>
                    <mat-option value="number">
                      <mat-icon>numbers</mat-icon>
                      Número
                    </mat-option>
                    <mat-option value="currency">
                      <mat-icon>attach_money</mat-icon>
                      Moeda
                    </mat-option>
                    <mat-option value="percentage">
                      <mat-icon>percent</mat-icon>
                      Percentual
                    </mat-option>
                    <mat-option value="date">
                      <mat-icon>calendar_today</mat-icon>
                      Data
                    </mat-option>
                    <mat-option value="boolean">
                      <mat-icon>toggle_on</mat-icon>
                      Booleano
                    </mat-option>
                  </mat-select>
                  <mat-hint>Define como os dados serão formatados</mat-hint>
                </mat-form-field>
              </div>

              <!-- Sticky Position Row -->
              <div class="form-row">
                <div class="sticky-group">
                  <label class="control-label">Posição Fixa</label>
                  <mat-button-toggle-group [(ngModel)]="selectedColumn.sticky"
                                          name="sticky"
                                          (ngModelChange)="onColumnPropertyChange()">
                    <mat-button-toggle [value]="null">Nenhum</mat-button-toggle>
                    <mat-button-toggle value="start">Início</mat-button-toggle>
                    <mat-button-toggle value="end">Fim</mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
              </div>

              <!-- Visual Formula Builder for Calculated Columns -->
              <div class="form-section" *ngIf="isCalculatedColumn(selectedColumn)">
                <mat-divider></mat-divider>
                <div class="formula-builder-section">
                  <visual-formula-builder
                    [availableDataSchema]="availableDataSchema"
                    [currentFormula]="getColumnFormula(selectedColumn)"
                    (formulaChange)="onFormulaChange($event)"
                    (generatedExpressionChange)="onGeneratedExpressionChange($event)">
                  </visual-formula-builder>
                </div>
              </div>

              <!-- Value Mapping Editor -->
              <div class="form-section">
                <mat-divider></mat-divider>
                <mat-expansion-panel class="mapping-expansion-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>swap_horiz</mat-icon>
                      Mapeamento de Valores
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ getMappingPanelDescription(selectedColumn) }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="mapping-panel-content">
                    <value-mapping-editor
                      [currentMapping]="getColumnMapping(selectedColumn)"
                      [keyInputType]="getColumnKeyInputType(selectedColumn)"
                      [labelKey]="'Valor Original'"
                      [labelValue]="'Valor Exibido'"
                      (mappingChange)="onMappingChange($event)">
                    </value-mapping-editor>
                  </div>
                </mat-expansion-panel>
              </div>

              <!-- Data Formatting Editor -->
              <div class="form-section" *ngIf="showDataFormatter(selectedColumn)">
                <mat-divider></mat-divider>
                <mat-expansion-panel class="formatter-expansion-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>{{ getFormatterIcon(selectedColumn) }}</mat-icon>
                      Formatação de Exibição
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ getFormatterPanelDescription(selectedColumn) }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="formatter-panel-content">
                    <data-formatter
                      [columnType]="getColumnDataType(selectedColumn)"
                      [currentFormat]="getColumnFormat(selectedColumn)"
                      (formatChange)="onFormatChange($event)">
                    </data-formatter>
                  </div>
                </mat-expansion-panel>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .columns-config-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 16px;
    }

    .educational-card {
      background-color: var(--mat-sys-surface-container-low);
      border-left: 4px solid var(--mat-sys-primary);
      margin-bottom: 12px;
    }

    .educational-card.compact {
      margin-bottom: 8px;
    }

    .compact-content {
      padding: 12px 16px !important;
    }

    .compact-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .inline-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-primary);
    }

    .compact-content h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .compact-content p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.3;
      color: var(--mat-sys-on-surface-variant);
    }

    .global-actions-card {
      background-color: var(--mat-sys-surface-container);
      border-left: 4px solid var(--mat-sys-secondary);
      margin-bottom: 12px;
    }

    .global-actions-card.compact {
      margin-bottom: 8px;
    }

    .compact-global-content {
      padding: 12px 16px !important;
    }

    .global-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .global-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: start;
    }

    .global-actions-grid.compact {
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .global-action-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .group-label {
      font-weight: 500;
      color: var(--mat-sys-on-surface);
      font-size: 0.8rem;
    }

    .compact-toggle-group {
      font-size: 0.875rem;
    }

    .compact-toggle-group .mat-button-toggle {
      height: 36px;
    }

    .toggle-text {
      font-size: 0.75rem;
    }

    .compact-checkbox {
      font-size: 0.875rem;
    }
    
    .v2-features-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }
    
    .features-divider {
      margin: 8px 0;
      opacity: 0.6;
    }

    .master-detail-layout {
      display: flex;
      flex: 1;
      gap: 16px;
      min-height: 0;
    }

    .master-panel {
      flex: 0 0 350px;
      display: flex;
      flex-direction: column;
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 8px;
      overflow: hidden;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .list-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .add-column-fab {
      transform: scale(0.7);
    }

    .columns-list-container {
      flex: 1;
      overflow-y: auto;
    }

    .columns-list {
      padding: 0;
    }

    .column-item {
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .column-item:hover {
      background-color: var(--mat-sys-surface-container);
    }

    .column-item.selected {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .column-item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 12px 16px;
    }

    .column-main-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .column-header {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .drag-handle {
      cursor: grab;
      color: var(--mat-sys-outline);
      font-size: 18px;
      flex-shrink: 0;
    }

    .column-text-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .column-title {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--mat-sys-on-surface);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .column-field {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      font-family: monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .column-indicators {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .column-type-icon {
      font-size: 16px;
      color: var(--mat-sys-outline);
    }

    .mapping-indicator-icon {
      font-size: 16px;
      color: var(--mat-sys-outline);
      transition: color 0.2s;
    }

    .mapping-indicator-icon:has([matBadge]:not([matBadgeHidden])) {
      color: var(--mat-sys-secondary);
    }

    .visibility-checkbox {
      transform: scale(0.9);
    }

    .remove-button {
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .remove-button:hover {
      opacity: 1;
    }

    .panel-divider {
      height: auto;
    }

    .detail-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 8px;
      overflow: hidden;
    }

    .no-selection-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      padding: 48px;
      color: var(--mat-sys-on-surface-variant);
    }

    .no-selection-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .column-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .editor-header {
      padding: 16px;
      background-color: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .editor-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .column-form {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: flex-start;
    }

    .field-input {
      flex: 1;
    }

    .header-input {
      flex: 2;
    }

    .width-input {
      flex: 1;
    }

    .data-type-input {
      flex: 1;
      min-width: 200px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      min-height: 56px;
    }

    .alignment-group,
    .sticky-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .value-getter-input {
      flex: 1;
    }

    .examples-section {
      width: 100%;
    }

    .examples-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .example-button {
      font-size: 0.8rem;
      padding: 4px 8px;
      min-width: auto;
      height: 32px;
    }

    .example-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .form-section {
      margin-top: 24px;
    }

    .formula-builder-section {
      margin-top: 16px;
    }

    .mapping-expansion-panel,
    .formatter-expansion-panel {
      margin-top: 16px;
    }

    .mapping-panel-content,
    .formatter-panel-content,
    .style-rules-panel-content {
      padding: 16px 0;
    }

    .style-rules-expansion-panel {
      margin-top: 16px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .master-detail-layout {
        flex-direction: column;
      }

      .master-panel {
        flex: 0 0 auto;
        max-height: 300px;
      }

      .detail-panel {
        flex: 1;
      }

      .global-actions-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .field-input,
      .header-input,
      .width-input {
        flex: 1;
      }
    }

    /* CDK Drag & Drop */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .columns-list.cdk-drop-list-dragging .column-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class ColumnsConfigEditorComponent implements OnInit, OnDestroy {

  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() columnChange = new EventEmitter<ColumnChange>();

  // Component state
  columns: ColumnDefinition[] = [];
  selectedColumnIndex = -1;
  selectedColumn: ColumnDefinition | null = null;
  isV2Config = false;

  // Formula builder data
  availableDataSchema: FieldSchema[] = [];

  // Style rules integration
  currentFieldSchemas: FieldSchema[] = [];
  sampleTableData: any[] = [];

  // Global settings
  globalSortableEnabled = true;
  globalAlignment: 'left' | 'center' | 'right' | null = null;
  
  // V2 specific features
  globalResizable = false;
  globalFilterable = false;
  globalStickyEnabled = false;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private tableRuleEngine: TableRuleEngineService,
    private fieldSchemaAdapter: FieldSchemaAdapter
  ) {}

  ngOnInit(): void {
    this.isV2Config = isTableConfigV2(this.config);
    
    if (this.config?.columns) {
      this.columns = [...this.config.columns];
      this.updateGlobalSettings();
      this.generateAvailableDataSchema();
      this.initializeStyleRules();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateGlobalSettings(): void {
    // Check if all columns have sortable enabled
    this.globalSortableEnabled = this.columns.every(col => col.sortable !== false);

    // Check if all columns have the same alignment
    const alignments = this.columns.map(col => col.align).filter(Boolean);
    const uniqueAlignments = [...new Set(alignments)];
    this.globalAlignment = uniqueAlignments.length === 1 ? uniqueAlignments[0] as any : null;
    
    // V2 specific global settings
    if (this.isV2Config) {
      this.globalResizable = this.columns.every(col => (col as any).resizable !== false);
      this.globalFilterable = this.columns.every(col => (col as any).filterable !== false);
      this.globalStickyEnabled = this.columns.some(col => (col as any).sticky === true);
    }
  }

  // Global Actions
  showAllColumns(): void {
    this.columns.forEach(column => column.visible = true);
    this.emitConfigChange('global');
  }

  hideAllColumns(): void {
    this.columns.forEach(column => column.visible = false);
    this.emitConfigChange('global');
  }

  applyGlobalSortable(enabled: boolean): void {
    this.columns.forEach(column => {
      if (!this.isColumnExplicitlySet(column, 'sortable')) {
        column.sortable = enabled;
      }
    });
    this.emitConfigChange('global');
  }

  applyGlobalAlignment(alignment: 'left' | 'center' | 'right'): void {
    this.columns.forEach(column => {
      if (!this.isColumnExplicitlySet(column, 'align')) {
        column.align = alignment;
      }
    });
    this.emitConfigChange('global');
  }
  
  // V2 Global Actions
  applyGlobalResizable(enabled: boolean): void {
    if (this.isV2Config) {
      this.columns.forEach(column => {
        if (!this.isColumnExplicitlySet(column, 'resizable')) {
          (column as any).resizable = enabled;
        }
      });
      this.emitConfigChange('global');
    }
  }
  
  applyGlobalFilterable(enabled: boolean): void {
    if (this.isV2Config) {
      this.columns.forEach(column => {
        if (!this.isColumnExplicitlySet(column, 'filterable')) {
          (column as any).filterable = enabled;
        }
      });
      this.emitConfigChange('global');
    }
  }
  
  applyGlobalSticky(enabled: boolean): void {
    if (this.isV2Config) {
      this.columns.forEach(column => {
        (column as any).sticky = enabled;
      });
      this.emitConfigChange('global');
    }
  }

  private isColumnExplicitlySet(column: ColumnDefinition, property: keyof ColumnDefinition | string): boolean {
    // In a real implementation, you might track which properties were explicitly set
    // For now, we'll assume all are explicit if they differ from default
    return false;
  }

  // Column Selection
  selectColumn(index: number): void {
    this.selectedColumnIndex = index;
    this.selectedColumn = index >= 0 ? this.columns[index] : null;
    this.cdr.markForCheck();
  }

  // Column Management
  addNewColumn(): void {
    const newColumn: any = {
      field: `calculatedField${this.columns.length + 1}`,
      header: `Nova Coluna Calculada ${this.columns.length + 1}`,
      visible: true,
      align: 'left',
      sortable: true,
      order: this.columns.length,
      type: 'string', // Default type for calculated columns
      _isApiField: false, // Explicitly mark as not from API
      calculationType: 'none', // Initialize with no formula
      calculationParams: {},
      _generatedValueGetter: ''
    };

    this.columns.push(newColumn);
    this.selectColumn(this.columns.length - 1);
    this.emitConfigChange('add');
  }

  removeColumn(index: number, event: Event): void {
    event.stopPropagation();

    if (index >= 0 && index < this.columns.length) {
      this.columns.splice(index, 1);

      // Update orders
      this.updateColumnOrders();

      // Adjust selection
      if (this.selectedColumnIndex === index) {
        this.selectColumn(-1);
      } else if (this.selectedColumnIndex > index) {
        this.selectedColumnIndex--;
        this.selectedColumn = this.selectedColumnIndex >= 0 ? this.columns[this.selectedColumnIndex] : null;
      }

      this.emitConfigChange('remove');
    }
  }

  onColumnReorder(event: CdkDragDrop<ColumnDefinition[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
      this.updateColumnOrders();

      // Update selection index if needed
      if (this.selectedColumnIndex === event.previousIndex) {
        this.selectedColumnIndex = event.currentIndex;
      } else if (this.selectedColumnIndex > event.previousIndex && this.selectedColumnIndex <= event.currentIndex) {
        this.selectedColumnIndex--;
      } else if (this.selectedColumnIndex < event.previousIndex && this.selectedColumnIndex >= event.currentIndex) {
        this.selectedColumnIndex++;
      }

      this.emitConfigChange('reorder');
    }
  }

  private updateColumnOrders(): void {
    this.columns.forEach((column, index) => {
      column.order = index;
    });
  }

  // Column Property Changes
  onColumnPropertyChange(): void {
    this.emitConfigChange('update');
    this.updateFieldSchemasForStyleRules();
  }

  isExistingColumn(column: ColumnDefinition): boolean {
    // Columns are considered existing (from API/schema) if they have the _isApiField flag
    // This provides a more robust way to identify API columns vs calculated columns
    return column._isApiField === true;
  }

  isCalculatedColumn(column: ColumnDefinition): boolean {
    // Simplified logic: A column is calculated if:
    // 1. It was created manually in the editor (_isApiField === false), OR
    // 2. It's an API field but has a formula applied to it
    
    if (column._isApiField !== true) {
      // Column created manually in editor - always calculated
      return true;
    }
    
    // API field with applied formula/calculation
    const extendedColumn = column as any;
    return !!(extendedColumn.calculationType && extendedColumn.calculationType !== 'none') ||
           !!(column._generatedValueGetter && column._generatedValueGetter.trim());
  }

  hasValueGetterError(column: ColumnDefinition): boolean {
    const valueGetter = (column as any).valueGetter;
    if (!valueGetter || typeof valueGetter !== 'string') {
      return false;
    }

    // Basic JavaScript syntax validation
    try {
      // Create a function to test syntax without executing
      new Function('rowData', `return ${valueGetter}`);
      return false;
    } catch {
      return true;
    }
  }

  // Formula Builder Integration
  private generateAvailableDataSchema(): void {
    // Generate schema from API fields only
    this.availableDataSchema = this.columns
      .filter(col => col._isApiField === true) // Only use columns from API schema
      .map(col => ({
        name: col.field,
        label: col.header || col.field,
        type: this.mapColumnTypeToFieldType((col._originalApiType || col.type || 'string') as ColumnDataType),
        path: col.field
      }));

    // If no API fields are available yet, add some common examples for the formula builder
    if (this.availableDataSchema.length === 0) {
      this.availableDataSchema.push(
        { name: 'id', label: 'ID', type: 'number', path: 'id' },
        { name: 'name', label: 'Nome', type: 'string', path: 'name' },
        { name: 'email', label: 'Email', type: 'string', path: 'email' },
        { name: 'status', label: 'Status', type: 'string', path: 'status' },
        { name: 'isActive', label: 'Ativo', type: 'boolean', path: 'isActive' },
        { name: 'createdAt', label: 'Data de Criação', type: 'date', path: 'createdAt' },
        { name: 'price', label: 'Preço', type: 'number', path: 'price' }
      );
    }
  }

  /**
   * Map ColumnDataType to FieldSchema type
   */
  private mapColumnTypeToFieldType(columnType: ColumnDataType): 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' {
    switch (columnType) {
      case 'number':
      case 'currency':
      case 'percentage':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'boolean';
      case 'string':
      case 'custom':
      default:
        return 'string';
    }
  }


  getColumnFormula(column: ColumnDefinition | null): FormulaDefinition | undefined {
    if (!column) return undefined;

    const extendedColumn = column as any;
    return {
      type: extendedColumn.calculationType || 'none',
      params: extendedColumn.calculationParams || {}
    };
  }

  onFormulaChange(formula: FormulaDefinition): void {
    if (this.selectedColumn) {
      const extendedColumn = this.selectedColumn as any;
      extendedColumn.calculationType = formula.type;
      extendedColumn.calculationParams = formula.params;
      this.onColumnPropertyChange();
    }
  }

  onGeneratedExpressionChange(expression: string): void {
    if (this.selectedColumn) {
      const extendedColumn = this.selectedColumn as any;
      extendedColumn._generatedValueGetter = expression;
      this.onColumnPropertyChange();
    }
  }

  // Value Mapping Management
  getMappingCount(column: ColumnDefinition): number {
    const extendedColumn = column as any;
    return extendedColumn.valueMapping ? Object.keys(extendedColumn.valueMapping).length : 0;
  }

  getMappingTooltip(column: ColumnDefinition): string {
    const count = this.getMappingCount(column);
    if (count === 0) {
      return 'Sem mapeamentos definidos';
    } else if (count === 1) {
      return '1 mapeamento definido';
    } else {
      return `${count} mapeamentos definidos`;
    }
  }

  getMappingPanelDescription(column: ColumnDefinition | null): string {
    if (!column) return 'Nenhuma coluna selecionada';

    const count = this.getMappingCount(column);
    if (count === 0) {
      return 'Converter valores brutos em texto amigável';
    } else if (count === 1) {
      return '1 mapeamento definido';
    } else {
      return `${count} mapeamentos definidos`;
    }
  }

  getColumnMapping(column: ColumnDefinition | null): { [key: string | number]: string } {
    if (!column) return {};

    const extendedColumn = column as any;
    return extendedColumn.valueMapping || {};
  }

  getColumnKeyInputType(column: ColumnDefinition | null): 'text' | 'number' | 'boolean' {
    if (!column) return 'text';

    // Try to infer from column field name
    const fieldName = column.field.toLowerCase();

    if (fieldName.includes('id') || fieldName.includes('count') ||
        fieldName.includes('price') || fieldName.includes('quantity') ||
        fieldName.includes('amount') || fieldName.includes('number')) {
      return 'number';
    }

    if (fieldName.includes('active') || fieldName.includes('enabled') ||
        fieldName.includes('visible') || fieldName.includes('is')) {
      return 'boolean';
    }

    return 'text';
  }

  onMappingChange(mapping: { [key: string | number]: string }): void {
    if (this.selectedColumn) {
      const extendedColumn = this.selectedColumn as any;
      extendedColumn.valueMapping = mapping;
      this.onColumnPropertyChange();
    }
  }

  get selectedColumnDataType(): ColumnDataType {
    return this.getColumnDataType(this.selectedColumn);
  }
  set selectedColumnDataType(value: ColumnDataType) {
    this.onDataTypeChange(value);
  }

  // Data Formatting Management
  getColumnDataType(column: ColumnDefinition | null): ColumnDataType {
    if (!column) return 'string';

    // Priority order: user-configured type > original API type > field name inference
    
    // 1. Use the user-configured type if available (highest priority)
    if (column.type) {
      return column.type;
    }

    // 2. For API fields, use the original API type as fallback
    if (column._isApiField && column._originalApiType) {
      return column._originalApiType as ColumnDataType;
    }

    // 3. Try to infer from column field name (last resort)
    return this.inferFieldTypeFromFieldName(column.field);
  }

  /**
   * Infer column data type from field name patterns (shared logic with PraxisTable)
   */
  private inferFieldTypeFromFieldName(fieldName: string): ColumnDataType {
    const lowercaseName = fieldName.toLowerCase();

    // Date/time patterns - more specific patterns first
    if (lowercaseName.endsWith('date') || lowercaseName.endsWith('time') ||
        lowercaseName.endsWith('at') || lowercaseName.startsWith('date') ||
        lowercaseName === 'created' || lowercaseName === 'updated' ||
        lowercaseName === 'modified' || lowercaseName.includes('timestamp')) {
      return 'date';
    }

    // Boolean patterns - most specific first to avoid conflicts
    if (lowercaseName.startsWith('is_') || lowercaseName.startsWith('has_') ||
        lowercaseName.startsWith('can_') || lowercaseName.startsWith('should_') ||
        lowercaseName === 'active' || lowercaseName === 'enabled' ||
        lowercaseName === 'visible' || lowercaseName === 'deleted' ||
        lowercaseName === 'archived' || lowercaseName.endsWith('_flag') ||
        lowercaseName.endsWith('_enabled') || lowercaseName.endsWith('_active')) {
      return 'boolean';
    }

    // Currency/money patterns - exclude common false positives
    if ((lowercaseName.includes('price') || lowercaseName.includes('amount') ||
         lowercaseName.includes('cost') || lowercaseName.includes('salary') ||
         lowercaseName.includes('wage') || lowercaseName.includes('fee') ||
         (lowercaseName.includes('value') && !lowercaseName.includes('id') && !lowercaseName.includes('key'))) &&
        !lowercaseName.includes('count') && !lowercaseName.includes('type')) {
      return 'currency';
    }

    // Percentage patterns - be more specific
    if (lowercaseName.includes('percent') || lowercaseName.endsWith('_rate') ||
        lowercaseName.endsWith('_ratio') || lowercaseName.endsWith('_pct') ||
        (lowercaseName.includes('rate') && !lowercaseName.includes('created') && !lowercaseName.includes('updated')) ||
        lowercaseName.endsWith('_score')) {
      return 'percentage';
    }

    // Number patterns - exclude common false positives like string IDs
    if ((lowercaseName.endsWith('_id') && lowercaseName !== 'id') || // composite IDs might be strings
        lowercaseName === 'id' || lowercaseName.includes('count') ||
        lowercaseName.includes('quantity') || lowercaseName.includes('number') ||
        lowercaseName.includes('total') || lowercaseName.includes('sum') ||
        lowercaseName.includes('age') || lowercaseName.includes('weight') ||
        lowercaseName.includes('height') || lowercaseName.includes('size') ||
        lowercaseName.endsWith('_num') || lowercaseName.endsWith('_number')) {
      return 'number';
    }

    // Default to string for ambiguous cases
    return 'string';
  }

  onDataTypeChange(dataType: ColumnDataType): void {
    if (this.selectedColumn) {
      // Store the user-selected type in the standard 'type' property
      this.selectedColumn.type = dataType;

      // Clear existing format when changing data type
      const extendedColumn = this.selectedColumn as any;
      extendedColumn.format = '';

      this.onColumnPropertyChange();
    }
  }

  showDataFormatter(column: ColumnDefinition | null): boolean {
    if (!column) return false;

    // Don't show formatter for calculated columns (they can use custom formatting)
    if (this.isCalculatedColumn(column)) {
      return false;
    }

    const dataType = this.getColumnDataType(column);
    return dataType !== 'custom';
  }

  getFormatterIcon(column: ColumnDefinition | null): string {
    const dataType = this.getColumnDataType(column);
    switch (dataType) {
      case 'date': return 'calendar_today';
      case 'number': return 'numbers';
      case 'currency': return 'attach_money';
      case 'percentage': return 'percent';
      case 'string': return 'text_fields';
      case 'boolean': return 'toggle_on';
      default: return 'format_shapes';
    }
  }

  getFormatterPanelDescription(column: ColumnDefinition | null): string {
    if (!column) return 'Nenhuma coluna selecionada';

    const dataType = this.getColumnDataType(column);
    const hasFormat = this.getColumnFormat(column).length > 0;

    if (hasFormat) {
      return 'Formatação personalizada aplicada';
    }

    switch (dataType) {
      case 'date': return 'Configure como as datas são exibidas';
      case 'number': return 'Defina a formatação de números';
      case 'currency': return 'Configure valores monetários';
      case 'percentage': return 'Formate percentuais';
      case 'string': return 'Transforme a apresentação de texto';
      case 'boolean': return 'Escolha exibição de verdadeiro/falso';
      default: return 'Configure a formatação dos dados';
    }
  }

  getColumnFormat(column: ColumnDefinition | null): string {
    if (!column) return '';

    const extendedColumn = column as any;
    return extendedColumn.format || '';
  }

  onFormatChange(format: string): void {
    if (this.selectedColumn) {
      const extendedColumn = this.selectedColumn as any;
      extendedColumn.format = format;
      this.onColumnPropertyChange();
    }
  }

  // Data Synchronization
  private emitConfigChange(changeType: ColumnChange['type']): void {
    if (this.config) {
      const updatedConfig: TableConfig = {
        ...this.config,
        columns: [...this.columns]
      };

      this.configChange.emit(updatedConfig);

      this.columnChange.emit({
        type: changeType,
        columns: [...this.columns],
        columnIndex: this.selectedColumnIndex,
        column: this.selectedColumn || undefined,
        fullConfig: updatedConfig
      });
    }

    this.cdr.markForCheck();
  }

  /**
   * Public method to update columns from external source
   */
  updateColumnsFromConfig(config: TableConfig): void {
    this.isV2Config = isTableConfigV2(config);
    
    if (config?.columns) {
      this.columns = [...config.columns];
      this.updateGlobalSettings();

      // Reset selection if current selection is invalid
      if (this.selectedColumnIndex >= this.columns.length) {
        this.selectColumn(-1);
      } else if (this.selectedColumnIndex >= 0) {
        this.selectedColumn = this.columns[this.selectedColumnIndex];
      }

      this.cdr.markForCheck();
    }
  }

  /**
   * Public method to get current columns
   */
  getCurrentColumns(): ColumnDefinition[] {
    return [...this.columns];
  }

  // Style Rules Integration Methods
  private initializeStyleRules(): void {
    // Convert table config to field schemas for the rule builder
    const fallbackConfig: TableConfig = { columns: this.columns };
    this.currentFieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema(
      !isTableConfigV2(this.config) ? fallbackConfig : this.config
    );
    
    // Generate sample data for preview (in real app, this would come from actual data)
    this.generateSampleData();
  }

  private generateSampleData(): void {
    // Generate realistic sample data based on columns
    this.sampleTableData = [];
    
    for (let i = 0; i < 5; i++) {
      const sampleRow: any = {};
      
      this.columns.forEach(column => {
        const fieldName = column.field;
        const dataType = this.getColumnDataType(column);
        
        // Generate sample values based on data type and field name
        switch (dataType) {
          case 'number':
            if (fieldName.toLowerCase().includes('id')) {
              sampleRow[fieldName] = i + 1;
            } else if (fieldName.toLowerCase().includes('age')) {
              sampleRow[fieldName] = 25 + Math.floor(Math.random() * 40);
            } else {
              sampleRow[fieldName] = Math.floor(Math.random() * 1000);
            }
            break;
            
          case 'currency':
            sampleRow[fieldName] = (Math.random() * 10000).toFixed(2);
            break;
            
          case 'percentage':
            sampleRow[fieldName] = (Math.random() * 100).toFixed(1);
            break;
            
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            sampleRow[fieldName] = date.toISOString().split('T')[0];
            break;
            
          case 'boolean':
            sampleRow[fieldName] = Math.random() > 0.5;
            break;
            
          default: // string
            if (fieldName.toLowerCase().includes('name')) {
              sampleRow[fieldName] = `Nome ${i + 1}`;
            } else if (fieldName.toLowerCase().includes('status')) {
              const statuses = ['Ativo', 'Inativo', 'Pendente', 'Cancelado'];
              sampleRow[fieldName] = statuses[Math.floor(Math.random() * statuses.length)];
            } else if (fieldName.toLowerCase().includes('email')) {
              sampleRow[fieldName] = `usuario${i + 1}@exemplo.com`;
            } else {
              sampleRow[fieldName] = `Valor ${i + 1}`;
            }
            break;
        }
      });
      
      this.sampleTableData.push(sampleRow);
    }
  }

  getStyleRulesPanelDescription(column: ColumnDefinition | null): string {
    if (!column) return 'Nenhuma coluna selecionada';
    
    const extendedColumn = column as any;
    const rulesCount = extendedColumn.conditionalStyles ? extendedColumn.conditionalStyles.length : 0;
    
    if (rulesCount === 0) {
      return 'Configure formatação condicional baseada em regras';
    } else if (rulesCount === 1) {
      return '1 regra de estilo definida';
    } else {
      return `${rulesCount} regras de estilo definidas`;
    }
  }

  onConditionalStylesChanged(styles: ConditionalStyle[]): void {
    if (this.selectedColumn) {
      const extendedColumn = this.selectedColumn as any;
      extendedColumn.conditionalStyles = styles;
      
      // Compile rules for execution in the table
      if (styles.length > 0) {
        extendedColumn.cellClassCondition = this.tableRuleEngine.compileConditionalStyles(styles);
      } else {
        delete extendedColumn.cellClassCondition;
      }
      
      this.onColumnPropertyChange();
    }
  }

  onRuleValidated(event: { ruleId: string; result: ValidationResult }): void {
    // Handle rule validation results - could show feedback to user
    console.log('Rule validated:', event);
  }

  // Update field schemas when columns change
  private updateFieldSchemasForStyleRules(): void {
    this.currentFieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema({ columns: this.columns });
    this.generateSampleData();
  }
}
