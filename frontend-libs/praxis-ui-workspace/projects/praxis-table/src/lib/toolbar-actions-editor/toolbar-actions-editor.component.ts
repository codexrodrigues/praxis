import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { 
  TableConfig
} from '@praxis/core';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: string;
  type: 'button' | 'icon' | 'fab' | 'menu';
  color?: 'primary' | 'accent' | 'warn';
  action: string;
  position: 'start' | 'end';
  order?: number;
  disabled?: boolean;
  visible?: boolean;
  shortcut?: string;
  tooltip?: string;
  visibleWhen?: string;
  children?: ToolbarAction[];
}

export interface RowAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  requiresConfirmation?: boolean;
  separator?: boolean;
  conditional?: string; // Expressão para mostrar/ocultar
}

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  requiresConfirmation?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface ToolbarActionsChange {
  type: 'toolbar' | 'rowActions' | 'bulkActions' | 'export';
  property: string;
  value: any;
  fullConfig: TableConfig;
}

@Component({
  selector: 'toolbar-actions-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    DragDropModule
  ],
  template: `
    <div class="toolbar-actions-container">
      <form [formGroup]="toolbarForm">
        
        <!-- Barra de Ferramentas -->
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">build</mat-icon>
              Barra de Ferramentas
            </mat-panel-title>
            <mat-panel-description>
              Configure a barra superior da tabela
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <mat-slide-toggle formControlName="toolbarVisible" class="toggle-field">
              Mostrar barra de ferramentas
            </mat-slide-toggle>
            
            <div class="config-fields" *ngIf="toolbarForm.get('toolbarVisible')?.value">
              <mat-form-field appearance="outline">
                <mat-label>Título da barra</mat-label>
                <input matInput formControlName="toolbarTitle" placeholder="Ex: Gerenciar Usuários">
                <mat-hint>Título exibido na barra de ferramentas</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Subtítulo</mat-label>
                <input matInput formControlName="toolbarSubtitle" placeholder="Ex: Lista completa de usuários do sistema">
                <mat-hint>Texto de apoio abaixo do título</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Posição</mat-label>
                <mat-select formControlName="toolbarPosition">
                  <mat-option value="top">Acima da tabela</mat-option>
                  <mat-option value="bottom">Abaixo da tabela</mat-option>
                  <mat-option value="both">Ambos</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Altura da barra (px)</mat-label>
                <input matInput type="number" formControlName="toolbarHeight" min="40" max="120">
                <mat-hint>Altura em pixels da barra de ferramentas</mat-hint>
              </mat-form-field>
              
              <!-- Busca Integrada -->
              <div class="subsection">
                <h4>Busca Integrada</h4>
                <mat-slide-toggle formControlName="searchEnabled" class="toggle-field">
                  Habilitar busca na toolbar
                </mat-slide-toggle>
                
                <div class="nested-fields" *ngIf="toolbarForm.get('searchEnabled')?.value">
                  <mat-form-field appearance="outline">
                    <mat-label>Placeholder da busca</mat-label>
                    <input matInput formControlName="searchPlaceholder">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Posição da busca</mat-label>
                    <mat-select formControlName="searchPosition">
                      <mat-option value="start">Início</mat-option>
                      <mat-option value="center">Centro</mat-option>
                      <mat-option value="end">Fim</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Largura da busca</mat-label>
                    <input matInput formControlName="searchWidth" placeholder="300px">
                  </mat-form-field>
                  
                  <mat-slide-toggle formControlName="searchRealtime" class="toggle-field">
                    Busca em tempo real
                  </mat-slide-toggle>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Ações da Toolbar -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">add_circle</mat-icon>
              Ações da Toolbar
            </mat-panel-title>
            <mat-panel-description>
              Botões e menus personalizados na barra
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="actions-header">
              <button mat-raised-button color="primary" (click)="addToolbarAction()" type="button">
                <mat-icon>add</mat-icon>
                Adicionar Ação
              </button>
            </div>
            
            <div class="actions-list" cdkDropList (cdkDropListDropped)="dropToolbarAction($event)">
              <div class="action-item" 
                   *ngFor="let action of toolbarActions; let i = index" 
                   cdkDrag>
                <div class="action-header" cdkDragHandle>
                  <mat-icon class="drag-handle">drag_indicator</mat-icon>
                  <mat-icon>{{ action.icon }}</mat-icon>
                  <span class="action-label">{{ action.label || 'Nova Ação' }}</span>
                  <div class="action-controls">
                    <button mat-icon-button (click)="editToolbarAction(i)" type="button">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="removeToolbarAction(i)" type="button" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div class="action-details" *ngIf="editingToolbarActionIndex === i">
                  <div class="action-form">
                    <mat-form-field appearance="outline">
                      <mat-label>ID da ação</mat-label>
                      <input matInput [(ngModel)]="action.id" (ngModelChange)="updateToolbarActions()">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Label</mat-label>
                      <input matInput [(ngModel)]="action.label" (ngModelChange)="updateToolbarActions()">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Ícone</mat-label>
                      <input matInput [(ngModel)]="action.icon" (ngModelChange)="updateToolbarActions()">
                      <mat-hint>Nome do Material Icon (ex: add, edit, delete)</mat-hint>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Tipo</mat-label>
                      <mat-select [(ngModel)]="action.type" (ngModelChange)="updateToolbarActions()">
                        <mat-option value="button">Botão</mat-option>
                        <mat-option value="menu">Menu</mat-option>
                        <mat-option value="toggle">Toggle</mat-option>
                        <mat-option value="input">Input</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Ação/Função</mat-label>
                      <input matInput [(ngModel)]="action.action" (ngModelChange)="updateToolbarActions()">
                      <mat-hint>Nome da função a ser chamada</mat-hint>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Posição</mat-label>
                      <mat-select [(ngModel)]="action.position" (ngModelChange)="updateToolbarActions()">
                        <mat-option value="start">Início</mat-option>
                        <mat-option value="center">Centro</mat-option>
                        <mat-option value="end">Fim</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Cor</mat-label>
                      <mat-select [(ngModel)]="action.color" (ngModelChange)="updateToolbarActions()">
                        <mat-option value="">Padrão</mat-option>
                        <mat-option value="primary">Primary</mat-option>
                        <mat-option value="accent">Accent</mat-option>
                        <mat-option value="warn">Warn</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Atalho de teclado</mat-label>
                      <input matInput [(ngModel)]="action.shortcut" (ngModelChange)="updateToolbarActions()" 
                             placeholder="Ex: Ctrl+N">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Tooltip</mat-label>
                      <input matInput [(ngModel)]="action.tooltip" (ngModelChange)="updateToolbarActions()">
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Ações por Linha -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">more_vert</mat-icon>
              Ações por Linha
            </mat-panel-title>
            <mat-panel-description>
              Ações específicas para cada registro
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <mat-slide-toggle formControlName="rowActionsEnabled" class="toggle-field">
              Habilitar ações por linha
            </mat-slide-toggle>
            
            <div class="config-fields" *ngIf="toolbarForm.get('rowActionsEnabled')?.value">
              <mat-form-field appearance="outline">
                <mat-label>Modo de exibição</mat-label>
                <mat-select formControlName="rowActionsDisplay">
                  <mat-option value="menu">Menu suspenso</mat-option>
                  <mat-option value="buttons">Botões individuais</mat-option>
                  <mat-option value="hybrid">Híbrido (botões + menu)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Quando mostrar</mat-label>
                <mat-select formControlName="rowActionsTrigger">
                  <mat-option value="always">Sempre visível</mat-option>
                  <mat-option value="hover">Apenas no hover</mat-option>
                  <mat-option value="focus">Apenas com foco</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Máximo de ações visíveis</mat-label>
                <input matInput type="number" formControlName="maxVisibleRowActions" min="1" max="5">
                <mat-hint>Demais ações ficam no menu "Mais"</mat-hint>
              </mat-form-field>
              
              <div class="actions-header">
                <button mat-raised-button color="primary" (click)="addRowAction()" type="button">
                  <mat-icon>add</mat-icon>
                  Adicionar Ação de Linha
                </button>
              </div>
              
              <div class="actions-list" cdkDropList (cdkDropListDropped)="dropRowAction($event)">
                <div class="action-item" 
                     *ngFor="let action of rowActions; let i = index" 
                     cdkDrag>
                  <div class="action-header" cdkDragHandle>
                    <mat-icon class="drag-handle">drag_indicator</mat-icon>
                    <mat-icon>{{ action.icon }}</mat-icon>
                    <span class="action-label">{{ action.label || 'Nova Ação' }}</span>
                    <div class="action-controls">
                      <button mat-icon-button (click)="editRowAction(i)" type="button">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="removeRowAction(i)" type="button" color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="action-details" *ngIf="editingRowActionIndex === i">
                    <div class="action-form">
                      <mat-form-field appearance="outline">
                        <mat-label>ID da ação</mat-label>
                        <input matInput [(ngModel)]="action.id" (ngModelChange)="updateRowActions()">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Label</mat-label>
                        <input matInput [(ngModel)]="action.label" (ngModelChange)="updateRowActions()">
                      </mat-form-field>
                      
                    <mat-form-field appearance="outline">
                      <mat-label>Ícone</mat-label>
                      <input matInput [(ngModel)]="action.icon" (ngModelChange)="updateRowActions()">
                      <mat-hint>Nome do Material Icon (ex: add, edit, delete)</mat-hint>
                    </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Ação/Função</mat-label>
                        <input matInput [(ngModel)]="action.action" (ngModelChange)="updateRowActions()">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Cor</mat-label>
                        <mat-select [(ngModel)]="action.color" (ngModelChange)="updateRowActions()">
                          <mat-option value="">Padrão</mat-option>
                          <mat-option value="primary">Primary</mat-option>
                          <mat-option value="accent">Accent</mat-option>
                          <mat-option value="warn">Warn</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Tooltip</mat-label>
                        <input matInput [(ngModel)]="action.tooltip" (ngModelChange)="updateRowActions()">
                      </mat-form-field>
                      
                      <mat-slide-toggle [(ngModel)]="action.requiresConfirmation" 
                                       (ngModelChange)="updateRowActions()" 
                                       class="toggle-field">
                        Requer confirmação
                      </mat-slide-toggle>
                      
                      <mat-slide-toggle [(ngModel)]="action.separator" 
                                       (ngModelChange)="updateRowActions()" 
                                       class="toggle-field">
                        Separador após esta ação
                      </mat-slide-toggle>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Ações em Lote -->
        <mat-expansion-panel *ngIf="isV2">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">select_all</mat-icon>
              Ações em Lote
            </mat-panel-title>
            <mat-panel-description>
              Ações para múltiplas seleções (V2 only)
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <mat-slide-toggle formControlName="bulkActionsEnabled" class="toggle-field">
              Habilitar ações em lote
            </mat-slide-toggle>
            
            <div class="config-fields" *ngIf="toolbarForm.get('bulkActionsEnabled')?.value">
              <mat-form-field appearance="outline">
                <mat-label>Posição das ações em lote</mat-label>
                <mat-select formControlName="bulkActionsPosition">
                  <mat-option value="toolbar">Na barra de ferramentas</mat-option>
                  <mat-option value="floating">Barra flutuante</mat-option>
                  <mat-option value="bottom">Barra inferior</mat-option>
                </mat-select>
              </mat-form-field>
              
              <div class="actions-header">
                <button mat-raised-button color="primary" (click)="addBulkAction()" type="button">
                  <mat-icon>add</mat-icon>
                  Adicionar Ação em Lote
                </button>
              </div>
              
              <div class="actions-list" cdkDropList (cdkDropListDropped)="dropBulkAction($event)">
                <div class="action-item" 
                     *ngFor="let action of bulkActions; let i = index" 
                     cdkDrag>
                  <div class="action-header" cdkDragHandle>
                    <mat-icon class="drag-handle">drag_indicator</mat-icon>
                    <mat-icon>{{ action.icon }}</mat-icon>
                    <span class="action-label">{{ action.label || 'Nova Ação' }}</span>
                    <div class="action-controls">
                      <button mat-icon-button (click)="editBulkAction(i)" type="button">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="removeBulkAction(i)" type="button" color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="action-details" *ngIf="editingBulkActionIndex === i">
                    <div class="action-form">
                      <mat-form-field appearance="outline">
                        <mat-label>ID da ação</mat-label>
                        <input matInput [(ngModel)]="action.id" (ngModelChange)="updateBulkActions()">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Label</mat-label>
                        <input matInput [(ngModel)]="action.label" (ngModelChange)="updateBulkActions()">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Ícone</mat-label>
                        <input matInput [(ngModel)]="action.icon" (ngModelChange)="updateBulkActions()">
                        <mat-hint>Nome do Material Icon (ex: add, edit, delete)</mat-hint>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Ação/Função</mat-label>
                        <input matInput [(ngModel)]="action.action" (ngModelChange)="updateBulkActions()">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Cor</mat-label>
                        <mat-select [(ngModel)]="action.color" (ngModelChange)="updateBulkActions()">
                          <mat-option value="">Padrão</mat-option>
                          <mat-option value="primary">Primary</mat-option>
                          <mat-option value="accent">Accent</mat-option>
                          <mat-option value="warn">Warn</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Mínimo de seleções</mat-label>
                        <input matInput type="number" [(ngModel)]="action.minSelections" 
                               (ngModelChange)="updateBulkActions()" min="1">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Máximo de seleções</mat-label>
                        <input matInput type="number" [(ngModel)]="action.maxSelections" 
                               (ngModelChange)="updateBulkActions()" min="1">
                      </mat-form-field>
                      
                      <mat-slide-toggle [(ngModel)]="action.requiresConfirmation" 
                                       (ngModelChange)="updateBulkActions()" 
                                       class="toggle-field">
                        Requer confirmação
                      </mat-slide-toggle>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Exportação -->
        <mat-expansion-panel *ngIf="isV2">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">download</mat-icon>
              Exportação
            </mat-panel-title>
            <mat-panel-description>
              Configurações de exportação de dados (V2 only)
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <mat-slide-toggle formControlName="exportEnabled" class="toggle-field">
              Habilitar exportação
            </mat-slide-toggle>
            
            <div class="config-fields" *ngIf="toolbarForm.get('exportEnabled')?.value">
              <mat-form-field appearance="outline">
                <mat-label>Formatos disponíveis</mat-label>
                <mat-select formControlName="exportFormats" multiple>
                  <mat-option value="excel">Excel (.xlsx)</mat-option>
                  <mat-option value="csv">CSV</mat-option>
                  <mat-option value="pdf">PDF</mat-option>
                  <mat-option value="json">JSON</mat-option>
                </mat-select>
                <mat-hint>Segure Ctrl para selecionar múltiplos formatos</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Nome padrão do arquivo</mat-label>
                <input matInput formControlName="exportFileName" placeholder="dados-export">
              </mat-form-field>
              
              <mat-slide-toggle formControlName="exportIncludeHeaders" class="toggle-field">
                Incluir cabeçalhos
              </mat-slide-toggle>
              
              <mat-slide-toggle formControlName="exportRespectFilters" class="toggle-field">
                Respeitar filtros aplicados
              </mat-slide-toggle>
              
              <mat-slide-toggle formControlName="exportSelectedOnly" class="toggle-field">
                Apenas linhas selecionadas
              </mat-slide-toggle>
              
              <mat-form-field appearance="outline">
                <mat-label>Máximo de linhas</mat-label>
                <input matInput type="number" formControlName="exportMaxRows" min="1" max="100000">
                <mat-hint>Limite para evitar arquivos muito grandes</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
        
      </form>
    </div>
  `,
  styles: [`
    .toolbar-actions-container {
      width: 100%;
      padding: 8px;
    }
    
    .config-section {
      padding: 16px;
    }
    
    .config-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    
    .nested-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-left: 24px;
      margin-top: 12px;
      padding: 16px;
      background-color: var(--mat-sys-surface-variant);
      border-radius: 8px;
    }
    
    .toggle-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      margin-right: 8px;
      color: var(--mat-sys-primary);
    }
    
    .subsection {
      margin-top: 24px;
      padding: 16px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
    }
    
    .subsection h4 {
      margin: 0 0 16px 0;
      color: var(--mat-sys-on-surface);
      font-weight: 500;
    }
    
    .actions-header {
      margin: 16px 0;
      display: flex;
      justify-content: flex-start;
    }
    
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 60px;
    }
    
    .action-item {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      background-color: var(--mat-sys-surface);
      overflow: hidden;
    }
    
    .action-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--mat-sys-surface-container-low);
      cursor: move;
    }
    
    .drag-handle {
      margin-right: 8px;
      color: var(--mat-sys-on-surface-variant);
      cursor: grab;
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
    
    .action-label {
      flex: 1;
      margin-left: 8px;
      font-weight: 500;
    }
    
    .action-controls {
      display: flex;
      gap: 4px;
    }
    
    .action-details {
      padding: 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      background-color: var(--mat-sys-surface);
    }
    
    .action-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    mat-expansion-panel {
      margin-bottom: 8px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    mat-expansion-panel-header {
      min-height: 56px;
    }
    
    mat-panel-description {
      color: var(--mat-sys-on-surface-variant);
    }
    
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
    
    .actions-list.cdk-drop-list-dragging .action-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class ToolbarActionsEditorComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() toolbarActionsChange = new EventEmitter<ToolbarActionsChange>();
  
  toolbarForm!: FormGroup;
  isV2 = false;
  
  // Actions arrays
  toolbarActions: ToolbarAction[] = [];
  rowActions: RowAction[] = [];
  bulkActions: BulkAction[] = [];
  
  // Editing state
  editingToolbarActionIndex: number | null = null;
  editingRowActionIndex: number | null = null;
  editingBulkActionIndex: number | null = null;
  
  private destroy$ = new Subject<void>();
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.isV2 = true; // Always V2 in unified architecture
    this.initializeForm();
    this.setupFormListeners();
    this.loadActionsFromConfig();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    // Use type guards to safely access properties
    const v1Config = this.isV2 ? null : this.config as any;
    const toolbar = v1Config?.toolbar || {};
    
    this.toolbarForm = this.fb.group({
      // Toolbar settings
      toolbarVisible: [toolbar.visible || false],
      toolbarTitle: [toolbar.title || ''],
      toolbarSubtitle: [toolbar.subtitle || ''],
      toolbarPosition: [toolbar.position || 'top'],
      toolbarHeight: [toolbar.height || 64],
      
      // Search settings
      searchEnabled: [false],
      searchPlaceholder: ['Buscar...'],
      searchPosition: ['center'],
      searchWidth: ['300px'],
      searchRealtime: [true],
      
      // Row actions
      rowActionsEnabled: [!!v1Config?.showActionsColumn],
      rowActionsDisplay: ['menu'],
      rowActionsTrigger: ['always'],
      maxVisibleRowActions: [3],
      
      // Bulk actions (V2 only)
      bulkActionsEnabled: [false],
      bulkActionsPosition: ['toolbar'],
      
      // Export (V2 only)
      exportEnabled: [false],
      exportFormats: [['excel', 'csv']],
      exportFileName: ['dados-export'],
      exportIncludeHeaders: [true],
      exportRespectFilters: [true],
      exportSelectedOnly: [false],
      exportMaxRows: [10000]
    });
    
    // If V2, load advanced settings
    if (this.isV2) {
      const v2Config = this.config as TableConfig;
      
      if (v2Config.toolbar) {
        this.toolbarForm.patchValue({
          toolbarVisible: v2Config.toolbar.visible !== false,
          toolbarTitle: v2Config.toolbar.title || '',
          toolbarSubtitle: v2Config.toolbar.subtitle || '',
          toolbarPosition: v2Config.toolbar.position || 'top',
          toolbarHeight: v2Config.toolbar.layout?.height || 64,
          searchEnabled: v2Config.toolbar.search?.enabled || false,
          searchPlaceholder: v2Config.toolbar.search?.placeholder || 'Buscar...',
          searchPosition: v2Config.toolbar.search?.position || 'center',
          searchWidth: v2Config.toolbar.search?.width || '300px',
          searchRealtime: v2Config.toolbar.search?.realtime !== false
        });
      }
      
      if (v2Config.actions) {
        this.toolbarForm.patchValue({
          rowActionsEnabled: v2Config.actions.row?.enabled || false,
          rowActionsDisplay: v2Config.actions.row?.display || 'menu',
          rowActionsTrigger: v2Config.actions.row?.trigger || 'always',
          maxVisibleRowActions: v2Config.actions.row?.maxVisibleActions || 3,
          bulkActionsEnabled: v2Config.actions.bulk?.enabled || false,
          bulkActionsPosition: v2Config.actions.bulk?.position || 'toolbar'
        });
      }
      
      if (v2Config.export) {
        this.toolbarForm.patchValue({
          exportEnabled: v2Config.export.enabled || false,
          exportFormats: v2Config.export.formats || ['excel', 'csv'],
          exportFileName: v2Config.export.general?.defaultFileName || 'dados-export',
          exportIncludeHeaders: v2Config.export.general?.includeHeaders !== false,
          exportRespectFilters: v2Config.export.general?.respectFilters !== false,
          exportSelectedOnly: v2Config.export.general?.selectedRowsOnly || false,
          exportMaxRows: v2Config.export.general?.maxRows || 10000
        });
      }
    }
  }
  
  private setupFormListeners(): void {
    this.toolbarForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.updateConfig(values);
      });
  }
  
  private loadActionsFromConfig(): void {
    if (this.isV2) {
      const v2Config = this.config as TableConfig;
      
      // Load toolbar actions
      if (v2Config.toolbar?.actions) {
        this.toolbarActions = [...v2Config.toolbar.actions] as ToolbarAction[];
      }
      
      // Load row actions
      if (v2Config.actions?.row?.actions) {
        this.rowActions = [...v2Config.actions.row.actions] as RowAction[];
      }
      
      // Load bulk actions
      if (v2Config.actions?.bulk?.actions) {
        this.bulkActions = [...v2Config.actions.bulk.actions] as BulkAction[];
      }
    } else {
      // Load V1 config
      const v1Config = this.config as any;
      if (v1Config.toolbar?.actions) {
        this.toolbarActions = [...v1Config.toolbar.actions] as ToolbarAction[];
      }
      if (v1Config.rowActions) {
        this.rowActions = [...v1Config.rowActions] as RowAction[];
      }
    }
  }
  
  private updateConfig(values: any): void {
    const updatedConfig = { ...this.config };
    
    if (this.isV2) {
      // Update V2 config structure
      const v2Config = updatedConfig as TableConfig;
      
      // Toolbar
      if (!v2Config.toolbar) {
        v2Config.toolbar = {
          visible: false,
          position: 'top'
        };
      }
      v2Config.toolbar.visible = values.toolbarVisible;
      v2Config.toolbar.title = values.toolbarTitle;
      v2Config.toolbar.subtitle = values.toolbarSubtitle;
      v2Config.toolbar.position = values.toolbarPosition;
      
      if (!v2Config.toolbar.layout) {
        v2Config.toolbar.layout = {
          alignment: 'space-between',
          showSeparator: false
        };
      }
      v2Config.toolbar.layout.height = values.toolbarHeight;
      
      v2Config.toolbar.search = {
        enabled: values.searchEnabled,
        placeholder: values.searchPlaceholder,
        position: values.searchPosition,
        width: values.searchWidth,
        realtime: values.searchRealtime,
        delay: values.searchRealtime ? 300 : 0
      };
      
      v2Config.toolbar.actions = this.toolbarActions;
      
      // Actions
      v2Config.actions = v2Config.actions || {};
      v2Config.actions.row = {
        enabled: values.rowActionsEnabled,
        position: 'end',
        width: '120px',
        actions: this.rowActions,
        display: values.rowActionsDisplay,
        trigger: values.rowActionsTrigger,
        maxVisibleActions: values.maxVisibleRowActions
      };
      
      v2Config.actions.bulk = {
        enabled: values.bulkActionsEnabled,
        position: values.bulkActionsPosition,
        actions: this.bulkActions
      };
      
      // Export
      v2Config.export = {
        enabled: values.exportEnabled,
        formats: values.exportFormats,
        general: {
          includeHeaders: values.exportIncludeHeaders,
          respectFilters: values.exportRespectFilters,
          selectedRowsOnly: values.exportSelectedOnly,
          maxRows: values.exportMaxRows,
          defaultFileName: values.exportFileName,
          includeColumns: 'visible',
          applyFormatting: true
        }
      };
      
    } else {
      // Update V1 config structure
      const v1UpdatedConfig = updatedConfig as any;
      
      if (values.toolbarVisible) {
        v1UpdatedConfig.toolbar = {
          visible: true,
          title: values.toolbarTitle,
          actions: this.toolbarActions
        };
      } else {
        delete v1UpdatedConfig.toolbar;
      }
      
      v1UpdatedConfig.showActionsColumn = values.rowActionsEnabled;
      v1UpdatedConfig.rowActions = this.rowActions;
    }
    
    this.configChange.emit(updatedConfig);
  }
  
  // Toolbar Actions Management
  addToolbarAction(): void {
    const newAction: ToolbarAction = {
      id: `action-${Date.now()}`,
      label: 'Nova Ação',
      icon: 'add',
      type: 'button',
      action: 'newAction',
      position: 'end',
      order: this.toolbarActions.length
    };
    
    this.toolbarActions.push(newAction);
    this.editingToolbarActionIndex = this.toolbarActions.length - 1;
    this.updateToolbarActions();
  }
  
  editToolbarAction(index: number): void {
    this.editingToolbarActionIndex = this.editingToolbarActionIndex === index ? null : index;
  }
  
  removeToolbarAction(index: number): void {
    this.toolbarActions.splice(index, 1);
    this.editingToolbarActionIndex = null;
    this.updateToolbarActions();
  }
  
  dropToolbarAction(event: CdkDragDrop<ToolbarAction[]>): void {
    moveItemInArray(this.toolbarActions, event.previousIndex, event.currentIndex);
    this.updateToolbarActions();
  }
  
  updateToolbarActions(): void {
    // Update order based on array position
    this.toolbarActions.forEach((action, index) => {
      action.order = index;
    });
    
    const values = this.toolbarForm.value;
    this.updateConfig(values);
  }
  
  // Row Actions Management
  addRowAction(): void {
    const newAction: RowAction = {
      id: `row-action-${Date.now()}`,
      label: 'Nova Ação',
      icon: 'edit',
      action: 'editRow'
    };
    
    this.rowActions.push(newAction);
    this.editingRowActionIndex = this.rowActions.length - 1;
    this.updateRowActions();
  }
  
  editRowAction(index: number): void {
    this.editingRowActionIndex = this.editingRowActionIndex === index ? null : index;
  }
  
  removeRowAction(index: number): void {
    this.rowActions.splice(index, 1);
    this.editingRowActionIndex = null;
    this.updateRowActions();
  }
  
  dropRowAction(event: CdkDragDrop<RowAction[]>): void {
    moveItemInArray(this.rowActions, event.previousIndex, event.currentIndex);
    this.updateRowActions();
  }
  
  updateRowActions(): void {
    const values = this.toolbarForm.value;
    this.updateConfig(values);
  }
  
  // Bulk Actions Management  
  addBulkAction(): void {
    const newAction: BulkAction = {
      id: `bulk-action-${Date.now()}`,
      label: 'Nova Ação em Lote',
      icon: 'delete',
      action: 'bulkDelete',
      minSelections: 1
    };
    
    this.bulkActions.push(newAction);
    this.editingBulkActionIndex = this.bulkActions.length - 1;
    this.updateBulkActions();
  }
  
  editBulkAction(index: number): void {
    this.editingBulkActionIndex = this.editingBulkActionIndex === index ? null : index;
  }
  
  removeBulkAction(index: number): void {
    this.bulkActions.splice(index, 1);
    this.editingBulkActionIndex = null;
    this.updateBulkActions();
  }
  
  dropBulkAction(event: CdkDragDrop<BulkAction[]>): void {
    moveItemInArray(this.bulkActions, event.previousIndex, event.currentIndex);
    this.updateBulkActions();
  }
  
  updateBulkActions(): void {
    const values = this.toolbarForm.value;
    this.updateConfig(values);
  }
}