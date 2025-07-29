import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  DestroyRef,
  inject
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
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VisualFormulaBuilderComponent } from '../visual-formula-builder/visual-formula-builder.component';
import { FieldSchema, FormulaDefinition } from '../visual-formula-builder/formula-types';
import { ValueMappingEditorComponent } from '../value-mapping-editor/value-mapping-editor.component';
import { DataFormatterComponent } from '../data-formatter/data-formatter.component';
import { ColumnDataType } from '../data-formatter/data-formatter-types';
// import { TableRuleEngineService, ConditionalStyle, ValidationResult } from '../integration/table-rule-engine.service';
// import { FieldSchemaAdapter } from '../integration/field-schema-adapter.service';

export interface ColumnChange {
  type: 'add' | 'remove' | 'update' | 'reorder' | 'global';
  columnIndex?: number;
  column?: ColumnDefinition;
  columns?: ColumnDefinition[];
  fullConfig?: TableConfig;
}

interface ExtendedColumnDefinition extends ColumnDefinition {
  calculationType?: string;
  calculationParams?: any;
  _generatedValueGetter?: string;
  valueMapping?: { [key: string | number]: string };
  format?: string;
  conditionalStyles?: any[]; // ConditionalStyle[];
  cellClassCondition?: any;
  resizable?: boolean;
  filterable?: boolean;
}

@Component({
  selector: 'columns-config-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./columns-config-editor.component.scss'],
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

      <!-- Global Configuration Accordion -->
      <mat-accordion class="global-config-accordion">
        <mat-expansion-panel class="global-config-panel" [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="panel-icon">tune</mat-icon>
              Configurações Globais
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="config-panel-content">
            <div class="config-layout">
              <!-- Visibility Controls -->
              <div class="config-group">
                <div class="control-section">
                  <label class="control-label">
                    Visibilidade
                    <span class="control-status">({{ getVisibleColumnsCount() }}/{{ columns.length }} visíveis)</span>
                  </label>
                  <mat-button-toggle-group 
                    [(ngModel)]="visibilityState" 
                    (ngModelChange)="onVisibilityChange($event)" 
                    class="visibility-toggle-group">
                    <mat-button-toggle value="all" [disabled]="areAllColumnsVisible()">
                      <mat-icon>visibility</mat-icon>
                      <span>Todas</span>
                    </mat-button-toggle>
                    <mat-button-toggle value="none" [disabled]="areAllColumnsHidden()">
                      <mat-icon>visibility_off</mat-icon>
                      <span>Nenhuma</span>
                    </mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
              </div>

              <!-- Alignment Controls -->
              <div class="config-group">
                <div class="control-section">
                  <label class="control-label">Alinhamento Padrão</label>
                  <mat-button-toggle-group 
                    [(ngModel)]="globalAlignment" 
                    (ngModelChange)="applyGlobalAlignment($event)" 
                    class="alignment-toggle-group">
                    <mat-button-toggle value="left" matTooltip="Esquerda">
                      <mat-icon>format_align_left</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="center" matTooltip="Centro">
                      <mat-icon>format_align_center</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="right" matTooltip="Direita">
                      <mat-icon>format_align_right</mat-icon>
                    </mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
              </div>

              <!-- Feature Options -->
              <div class="config-group features-group">
                <div class="control-section">
                  <label class="control-label">Recursos</label>
                  <div class="features-grid">
                    <mat-checkbox 
                      [(ngModel)]="globalSortableEnabled" 
                      (ngModelChange)="applyGlobalSortable($event)"
                      class="feature-checkbox">
                      Ordenação
                    </mat-checkbox>
                    
                    @if (isV2Config) {
                      <mat-checkbox 
                        [(ngModel)]="globalResizable" 
                        (ngModelChange)="applyGlobalResizable($event)"
                        class="feature-checkbox">
                        Redimensionáveis
                      </mat-checkbox>
                      
                      <mat-checkbox 
                        [(ngModel)]="globalFilterable" 
                        (ngModelChange)="applyGlobalFilterable($event)"
                        class="feature-checkbox">
                        Filtros
                      </mat-checkbox>
                      
                      <mat-checkbox 
                        [(ngModel)]="globalStickyEnabled" 
                        (ngModelChange)="applyGlobalSticky($event)"
                        class="feature-checkbox">
                        Fixar colunas
                      </mat-checkbox>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>

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
              @for (column of columns; track column.field; let i = $index) {
              <mat-list-item
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
                                  [matTooltip]="getMappingTooltip(column)"
                                  [attr.aria-hidden]="getMappingCount(column) === 0">
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
              }
            </mat-list>
          </div>
        </div>

        <mat-divider [vertical]="true" class="panel-divider"></mat-divider>

        <!-- Detail: Column Editor -->
        <div class="detail-panel">
          @if (selectedColumnIndex === -1) {
          <div class="no-selection-message">
            <mat-icon>table_chart</mat-icon>
            <h3>Selecione uma coluna</h3>
            <p>Escolha uma coluna da lista para editar suas propriedades</p>
          </div>
          }

          @if (selectedColumn) {
          <div class="column-editor">
            <div class="editor-header">
              <h3 class="editor-title">Editando: {{ selectedColumn.header || selectedColumn.field }}</h3>
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
              @if (isCalculatedColumn(selectedColumn)) {
              <div class="form-section">
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
              }

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
              @if (showDataFormatter(selectedColumn)) {
              <div class="form-section">
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
              }
            </form>
          </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ColumnsConfigEditorComponent implements OnInit, OnDestroy {

  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() columnChange = new EventEmitter<ColumnChange>();

  // Component state
  columns: ExtendedColumnDefinition[] = [];
  selectedColumnIndex = -1;
  selectedColumn: ExtendedColumnDefinition | null = null;
  isV2Config = false;

  // Formula builder data
  availableDataSchema: FieldSchema[] = [];

  // Style rules integration
  currentFieldSchemas: FieldSchema[] = [];
  sampleTableData: any[] = [];

  // Global settings
  globalSortableEnabled = true;
  globalAlignment: 'left' | 'center' | 'right' | null = null;
  visibilityState: 'all' | 'none' | null = null;
  
  // V2 specific features
  globalResizable = false;
  globalFilterable = false;
  globalStickyEnabled = false;

  // Race condition prevention
  private operationInProgress = false;
  private columnOperationSubject = new Subject<() => void>();
  
  // Dependency injection
  private readonly destroyRef = inject(DestroyRef);

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef
    // private tableRuleEngine: TableRuleEngineService,
    // private fieldSchemaAdapter: FieldSchemaAdapter
  ) {}

  ngOnInit(): void {
    this.isV2Config = isTableConfigV2(this.config);
    
    if (this.config?.columns) {
      this.columns = [...this.config.columns] as ExtendedColumnDefinition[];
      this.updateGlobalSettings();
      this.generateAvailableDataSchema();
      // this.initializeStyleRules();
    }
    
    // Setup debounced column operations to prevent race conditions
    this.columnOperationSubject.pipe(
      debounceTime(100),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(operation => {
      this.operationInProgress = true;
      try {
        operation();
      } finally {
        this.operationInProgress = false;
      }
    });
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
    
    // Update visibility state
    this.updateVisibilityState();
    
    // V2 specific global settings
    if (this.isV2Config) {
      this.globalResizable = this.columns.every(col => (col as any).resizable !== false);
      this.globalFilterable = this.columns.every(col => (col as any).filterable !== false);
      this.globalStickyEnabled = this.columns.some(col => (col as any).sticky === true);
    }
  }

  private updateVisibilityState(): void {
    if (this.areAllColumnsVisible()) {
      this.visibilityState = 'all';
    } else if (this.areAllColumnsHidden()) {
      this.visibilityState = 'none';
    } else {
      this.visibilityState = null;
    }
  }

  // Visibility Helper Methods
  getVisibleColumnsCount(): number {
    return this.columns.filter(col => col.visible).length;
  }

  areAllColumnsVisible(): boolean {
    return this.columns.length > 0 && this.columns.every(col => col.visible);
  }

  areAllColumnsHidden(): boolean {
    return this.columns.length > 0 && this.columns.every(col => !col.visible);
  }

  onVisibilityChange(state: 'all' | 'none'): void {
    if (state === 'all') {
      this.showAllColumns();
    } else if (state === 'none') {
      this.hideAllColumns();
    }
  }

  // Global Actions
  showAllColumns(): void {
    this.columns.forEach(column => column.visible = true);
    this.updateVisibilityState();
    this.emitConfigChange('global');
  }

  hideAllColumns(): void {
    this.columns.forEach(column => column.visible = false);
    this.updateVisibilityState();
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

  private isColumnExplicitlySet(column: ExtendedColumnDefinition, property: keyof ExtendedColumnDefinition | string): boolean {
    // In a real implementation, you might track which properties were explicitly set
    // For now, we'll assume all are explicit if they differ from default
    return false;
  }

  // Column Selection
  selectColumn(index: number): void {
    // Validate index
    if (index < -1 || index >= this.columns.length) {
      console.warn('Invalid column index for selection:', index);
      index = -1;
    }
    
    this.selectedColumnIndex = index;
    this.selectedColumn = index >= 0 && index < this.columns.length ? this.columns[index] : null;
    this.cdr.markForCheck();
  }

  // Column Management
  addNewColumn(): void {
    if (this.operationInProgress) return;
    
    this.columnOperationSubject.next(() => {
      // Generate unique field name
      let fieldIndex = this.columns.length + 1;
      let fieldName = `calculatedField${fieldIndex}`;
      
      // Ensure field name is unique
      while (this.columns.some(col => col.field === fieldName)) {
        fieldIndex++;
        fieldName = `calculatedField${fieldIndex}`;
      }
      
      const newColumn: ExtendedColumnDefinition = {
        field: fieldName,
        header: `Nova Coluna Calculada ${fieldIndex}`,
        visible: true,
        align: 'left',
        sortable: true,
        order: this.columns.length,
        type: 'string',
        _isApiField: false,
        calculationType: 'none',
        calculationParams: {},
        _generatedValueGetter: ''
      };

      this.columns = [...this.columns, newColumn];
      this.selectColumn(this.columns.length - 1);
      this.emitConfigChange('add');
    });
  }

  removeColumn(index: number, event: Event): void {
    event.stopPropagation();
    
    if (this.operationInProgress) return;
    
    // Validate bounds
    if (index < 0 || index >= this.columns.length) {
      console.warn('Invalid column index for removal:', index);
      return;
    }
    
    this.columnOperationSubject.next(() => {
      // Create new array without the removed column
      this.columns = this.columns.filter((_, i) => i !== index);
      
      // Update orders
      this.updateColumnOrders();
      
      // Adjust selection properly
      if (this.selectedColumnIndex === index) {
        // Column being removed was selected - clear selection
        this.selectedColumnIndex = -1;
        this.selectedColumn = null;
      } else if (this.selectedColumnIndex > index) {
        // Selected column is after removed column - adjust index
        this.selectedColumnIndex--;
        // Ensure the selected column reference is updated
        if (this.selectedColumnIndex >= 0 && this.selectedColumnIndex < this.columns.length) {
          this.selectedColumn = this.columns[this.selectedColumnIndex];
        } else {
          // Safety check - clear selection if index is invalid
          this.selectedColumnIndex = -1;
          this.selectedColumn = null;
        }
      }
      // If selectedColumnIndex < index, no adjustment needed
      
      this.emitConfigChange('remove');
      this.cdr.markForCheck();
    });
  }

  onColumnReorder(event: CdkDragDrop<ExtendedColumnDefinition[]>): void {
    if (event.previousIndex === event.currentIndex || this.operationInProgress) {
      return;
    }
    
    // Validate indices
    if (event.previousIndex < 0 || event.previousIndex >= this.columns.length ||
        event.currentIndex < 0 || event.currentIndex >= this.columns.length) {
      console.warn('Invalid indices for reorder:', event.previousIndex, event.currentIndex);
      return;
    }
    
    this.columnOperationSubject.next(() => {
      // Create a new array to avoid direct mutation
      const newColumns = [...this.columns];
      moveItemInArray(newColumns, event.previousIndex, event.currentIndex);
      this.columns = newColumns;
      
      this.updateColumnOrders();
      
      // Update selection index if needed
      let newSelectedIndex = this.selectedColumnIndex;
      
      if (this.selectedColumnIndex === event.previousIndex) {
        // The selected item was moved
        newSelectedIndex = event.currentIndex;
      } else if (event.previousIndex < event.currentIndex) {
        // Item moved forward
        if (this.selectedColumnIndex > event.previousIndex && this.selectedColumnIndex <= event.currentIndex) {
          newSelectedIndex--;
        }
      } else {
        // Item moved backward
        if (this.selectedColumnIndex >= event.currentIndex && this.selectedColumnIndex < event.previousIndex) {
          newSelectedIndex++;
        }
      }
      
      // Update selection with validation
      if (newSelectedIndex !== this.selectedColumnIndex) {
        this.selectedColumnIndex = newSelectedIndex;
        if (this.selectedColumnIndex >= 0 && this.selectedColumnIndex < this.columns.length) {
          this.selectedColumn = this.columns[this.selectedColumnIndex];
        }
      }
      
      this.emitConfigChange('reorder');
      this.cdr.markForCheck();
    });
  }

  private updateColumnOrders(): void {
    this.columns.forEach((column, index) => {
      column.order = index;
    });
  }

  // Column Property Changes
  onColumnPropertyChange(): void {
    this.updateVisibilityState();
    this.emitConfigChange('update');
    // this.updateFieldSchemasForStyleRules();
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
    if (!this.selectedColumn || this.selectedColumnIndex < 0) return;
    
    // Verify column still exists in array
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    this.selectedColumn.calculationType = formula.type;
    this.selectedColumn.calculationParams = formula.params;
    this.onColumnPropertyChange();
  }

  onGeneratedExpressionChange(expression: string): void {
    if (!this.selectedColumn || this.selectedColumnIndex < 0) return;
    
    // Verify column still exists
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    this.selectedColumn._generatedValueGetter = expression;
    this.onColumnPropertyChange();
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
    if (!this.selectedColumn || this.selectedColumnIndex < 0) {
      return;
    }
    
    // Verify column still exists
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    this.selectedColumn.valueMapping = mapping;
    this.onColumnPropertyChange();
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
    if (!this.selectedColumn || this.selectedColumnIndex < 0) return;
    
    // Verify column still exists
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    // Store the user-selected type in the standard 'type' property
    this.selectedColumn.type = dataType;

    // Clear existing format when changing data type
    this.selectedColumn.format = '';

    this.onColumnPropertyChange();
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
    if (!this.selectedColumn || this.selectedColumnIndex < 0) return;
    
    // Verify column still exists
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    this.selectedColumn.format = format;
    this.onColumnPropertyChange();
  }

  // Data Synchronization
  private emitConfigChange(changeType: ColumnChange['type']): void {
    if (!this.config) return;
    
    // Deep clone columns to prevent external mutations
    const clonedColumns = this.columns.map(col => ({ ...col }));
    
    const updatedConfig: TableConfig = {
      ...this.config,
      columns: clonedColumns
    };

    this.configChange.emit(updatedConfig);

    this.columnChange.emit({
      type: changeType,
      columns: clonedColumns,
      columnIndex: this.selectedColumnIndex,
      column: this.selectedColumnIndex >= 0 ? { ...this.columns[this.selectedColumnIndex] } : undefined,
      fullConfig: updatedConfig
    });

    this.cdr.markForCheck();
  }

  /**
   * Public method to update columns from external source
   */
  updateColumnsFromConfig(config: TableConfig): void {
    if (!config) return;
    
    this.isV2Config = isTableConfigV2(config);
    
    if (config.columns && Array.isArray(config.columns)) {
      this.columns = [...config.columns] as ExtendedColumnDefinition[];
      this.updateGlobalSettings();
      this.generateAvailableDataSchema();

      // Reset selection if current selection is invalid
      if (this.selectedColumnIndex >= this.columns.length || this.selectedColumnIndex < 0) {
        this.selectColumn(-1);
      } else {
        // Re-select to ensure reference is updated
        this.selectColumn(this.selectedColumnIndex);
      }

      this.cdr.markForCheck();
    }
  }

  /**
   * Public method to get current columns
   */
  getCurrentColumns(): ExtendedColumnDefinition[] {
    return [...this.columns];
  }

  // Style Rules Integration Methods
  private initializeStyleRules(): void {
    // Convert table config to field schemas for the rule builder
    // const fallbackConfig: TableConfig = { columns: this.columns };
    // this.currentFieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema(
    //   !isTableConfigV2(this.config) ? fallbackConfig : this.config
    // );
    
    // Generate sample data for preview (in real app, this would come from actual data)
    // this.generateSampleData();
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

  onConditionalStylesChanged(styles: any[]): void {
    if (!this.selectedColumn || this.selectedColumnIndex < 0) return;
    
    // Verify column still exists
    if (this.selectedColumnIndex >= this.columns.length ||
        this.columns[this.selectedColumnIndex] !== this.selectedColumn) {
      console.warn('Selected column reference is stale');
      this.selectColumn(-1);
      return;
    }
    
    this.selectedColumn.conditionalStyles = styles;
    
    // Compile rules for execution in the table
    // if (styles.length > 0) {
    //   this.selectedColumn.cellClassCondition = this.tableRuleEngine.compileConditionalStyles(styles);
    // } else {
    //   delete this.selectedColumn.cellClassCondition;
    // }
    
    this.onColumnPropertyChange();
  }

  onRuleValidated(event: { ruleId: string; result: any }): void {
    // Handle rule validation results - could show feedback to user
    console.log('Rule validated:', event);
  }

  // Update field schemas when columns change
  private updateFieldSchemasForStyleRules(): void {
    // this.currentFieldSchemas = this.fieldSchemaAdapter.adaptTableConfigToFieldSchema({ columns: this.columns });
    // this.generateSampleData();
  }
}
