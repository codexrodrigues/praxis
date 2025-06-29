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
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableConfig, ColumnDefinition } from '@praxis/core';
import { Subject } from 'rxjs';

export interface ColumnChange {
  type: 'add' | 'remove' | 'update' | 'reorder' | 'global';
  columnIndex?: number;
  column?: ColumnDefinition;
  columns?: ColumnDefinition[];
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
    DragDropModule
  ],
  template: `
    <div class="columns-config-editor">
      <!-- Educational Card -->
      <mat-card class="educational-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="card-icon">table_chart</mat-icon>
          <mat-card-title>Personalização de Colunas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Personalize cada coluna da tabela individualmente. Defina visibilidade, cabeçalhos, largura, 
             tipo de dado, formatação e estilos condicionais para uma exibição perfeita.</p>
        </mat-card-content>
      </mat-card>

      <!-- Global Actions Panel -->
      <mat-card class="global-actions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>tune</mat-icon>
            Configurações Globais
          </mat-card-title>
          <mat-card-subtitle>Aplicar configurações a todas as colunas de uma vez</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="global-actions-grid">
            <!-- Visibility Actions -->
            <div class="global-action-group">
              <label class="group-label">Visibilidade</label>
              <mat-button-toggle-group class="visibility-toggle-group">
                <mat-button-toggle value="show" (click)="showAllColumns()">
                  <mat-icon>visibility</mat-icon>
                  Mostrar Todas
                </mat-button-toggle>
                <mat-button-toggle value="hide" (click)="hideAllColumns()">
                  <mat-icon>visibility_off</mat-icon>
                  Ocultar Todas
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- Sortable Global -->
            <div class="global-action-group">
              <label class="group-label">Ordenação</label>
              <mat-checkbox [(ngModel)]="globalSortableEnabled" (ngModelChange)="applyGlobalSortable($event)">
                Habilitar Ordenação Padrão para Colunas
              </mat-checkbox>
            </div>

            <!-- Alignment Default -->
            <div class="global-action-group">
              <label class="group-label">Alinhamento Padrão</label>
              <mat-button-toggle-group [(ngModel)]="globalAlignment" (ngModelChange)="applyGlobalAlignment($event)">
                <mat-button-toggle value="left">
                  <mat-icon>format_align_left</mat-icon>
                  Esquerda
                </mat-button-toggle>
                <mat-button-toggle value="center">
                  <mat-icon>format_align_center</mat-icon>
                  Centro
                </mat-button-toggle>
                <mat-button-toggle value="right">
                  <mat-icon>format_align_right</mat-icon>
                  Direita
                </mat-button-toggle>
              </mat-button-toggle-group>
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
                    matTooltip="Adicionar Nova Coluna">
              <mat-icon>add</mat-icon>
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
                      <span class="column-title">{{ column.header || column.field }}</span>
                      <mat-icon class="visibility-icon" [class.visible]="column.visible">
                        {{ column.visible ? 'visibility' : 'visibility_off' }}
                      </mat-icon>
                    </div>
                    <span class="column-field">{{ column.field }}</span>
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
    }

    .card-icon {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .global-actions-card {
      background-color: var(--mat-sys-surface-container);
      border-left: 4px solid var(--mat-sys-secondary);
    }

    .global-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      align-items: start;
    }

    .global-action-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .group-label {
      font-weight: 500;
      color: var(--mat-sys-on-surface);
      font-size: 0.875rem;
    }

    .visibility-toggle-group {
      width: 100%;
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
    }

    .drag-handle {
      cursor: grab;
      color: var(--mat-sys-outline);
      font-size: 18px;
    }

    .column-title {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .visibility-icon {
      font-size: 16px;
      color: var(--mat-sys-outline);
    }

    .visibility-icon.visible {
      color: var(--mat-sys-primary);
    }

    .column-field {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      margin-left: 26px;
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
  
  @Input() config: TableConfig | null = null;
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() columnChange = new EventEmitter<ColumnChange>();

  // Component state
  columns: ColumnDefinition[] = [];
  selectedColumnIndex = -1;
  selectedColumn: ColumnDefinition | null = null;

  // Global settings
  globalSortableEnabled = true;
  globalAlignment: 'left' | 'center' | 'right' | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.config?.columns) {
      this.columns = [...this.config.columns];
      this.updateGlobalSettings();
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

  private isColumnExplicitlySet(column: ColumnDefinition, property: keyof ColumnDefinition): boolean {
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
    const newColumn: ColumnDefinition = {
      field: `newColumn${this.columns.length + 1}`,
      header: `Nova Coluna ${this.columns.length + 1}`,
      visible: true,
      align: 'left',
      sortable: true,
      order: this.columns.length
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
  }

  isExistingColumn(column: ColumnDefinition): boolean {
    // In a real implementation, you might track which columns come from schema
    // For now, we'll assume columns with certain naming patterns are new
    return !column.field.startsWith('newColumn');
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
        column: this.selectedColumn || undefined
      });
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Public method to update columns from external source
   */
  updateColumnsFromConfig(config: TableConfig): void {
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
}