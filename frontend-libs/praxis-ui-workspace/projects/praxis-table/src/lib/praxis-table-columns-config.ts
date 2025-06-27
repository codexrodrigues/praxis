import { Component, EventEmitter, Input, Output } from '@angular/core';
              import { CommonModule } from '@angular/common';
              import { FormsModule } from '@angular/forms';
              import { MatFormFieldModule } from '@angular/material/form-field';
              import { MatInputModule } from '@angular/material/input';
              import { MatCheckboxModule } from '@angular/material/checkbox';
              import { MatIconModule } from '@angular/material/icon';
              import { MatCardModule } from '@angular/material/card';
              import { MatExpansionModule } from '@angular/material/expansion';
              import { MatTooltipModule } from '@angular/material/tooltip';
              import { MatSelectModule } from '@angular/material/select';
              import { MatDividerModule } from '@angular/material/divider';
              import { MatButtonModule } from '@angular/material/button';
              import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
              import { ColumnDefinition, TableConfig } from '@praxis/core';

              @Component({
                selector: 'praxis-table-columns-config',
                standalone: true,
                imports: [
                  CommonModule,
                  FormsModule,
                  MatFormFieldModule,
                  MatInputModule,
                  MatCheckboxModule,
                  MatIconModule,
                  MatCardModule,
                  MatExpansionModule,
                  MatTooltipModule,
                  MatSelectModule,
                  MatDividerModule,
                  MatButtonModule,
                  DragDropModule
                ],
                template: `
                  <!-- Configurações Globais -->
                  <mat-card class="global-config-card">
                    <mat-card-header>
                      <mat-card-title>Configurações Globais</mat-card-title>
                      <mat-card-subtitle>Aplique configurações a todas as colunas de uma vez</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="global-actions-container">
                        <div class="global-action">
                          <mat-form-field appearance="outline">
                            <mat-label>Alinhamento</mat-label>
                            <mat-select [(ngModel)]="globalAlign">
                              <mat-option [value]="null">Não alterar</mat-option>
                              <mat-option value="left">Esquerda</mat-option>
                              <mat-option value="center">Centro</mat-option>
                              <mat-option value="right">Direita</mat-option>
                            </mat-select>
                            <mat-hint>Alinhamento para todas as colunas</mat-hint>
                          </mat-form-field>
                        </div>

                        <div class="global-action">
                          <mat-form-field appearance="outline">
                            <mat-label>Visibilidade</mat-label>
                            <mat-select [(ngModel)]="globalVisibility">
                              <mat-option [value]="null">Não alterar</mat-option>
                              <mat-option [value]="true">Mostrar todas</mat-option>
                              <mat-option [value]="false">Ocultar todas</mat-option>
                            </mat-select>
                            <mat-hint>Mostrar/ocultar todas as colunas</mat-hint>
                          </mat-form-field>
                        </div>

                        <div class="global-action">
                          <button mat-raised-button color="primary" (click)="applyGlobalSettings()" [disabled]="!hasGlobalChanges()">
                            <mat-icon>check_circle</mat-icon> Aplicar a todas as colunas
                          </button>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Barra de Ações Rápidas -->
                  <div class="quick-actions">
                    <button mat-button color="accent" (click)="showAllColumns()">
                      <mat-icon>visibility</mat-icon> Mostrar todas
                    </button>
                    <button mat-button color="warn" (click)="hideAllColumns()">
                      <mat-icon>visibility_off</mat-icon> Ocultar todas
                    </button>
                    <span class="spacer"></span>
                    <mat-form-field appearance="outline" class="search-field">
                      <mat-label>Buscar coluna</mat-label>
                      <input matInput [(ngModel)]="searchQuery" placeholder="Filtrar colunas...">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="columns-config-container" cdkDropList [cdkDropListData]="filteredColumns" (cdkDropListDropped)="drop($event)">
                    <mat-card class="column-item" *ngFor="let col of filteredColumns; let i = index" cdkDrag>
                      <!-- Resto do template de colunas (já existente) -->
                      <div class="card-header">
                        <div class="drag-handle" cdkDragHandle matTooltip="Arraste para reordenar">
                          <mat-icon>drag_handle</mat-icon>
                        </div>

                        <!-- Informações Principais -->
                        <div class="main-info">
                          <div class="field-info">
                            <strong>{{ col.field }}</strong>
                            <mat-checkbox [(ngModel)]="col.visible" matTooltip="Mostrar/ocultar esta coluna">
                              Visível
                            </mat-checkbox>
                          </div>

                          <mat-form-field appearance="outline">
                            <mat-label>Título exibido</mat-label>
                            <input matInput [(ngModel)]="col.title" placeholder="Título da coluna">
                            <mat-hint>Nome que será exibido no cabeçalho</mat-hint>
                          </mat-form-field>
                        </div>
                      </div>

                      <!-- Configurações Avançadas -->
                      <mat-expansion-panel class="advanced-options">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>settings</mat-icon> Configurações avançadas
                          </mat-panel-title>
                        </mat-expansion-panel-header>

                        <div class="options-section">
                          <h4>Posicionamento</h4>
                          <div class="fields-row">
                            <mat-form-field appearance="outline">
                              <mat-label>Ordem</mat-label>
                              <input matInput type="number" [(ngModel)]="col.order" matTooltip="Ordem de exibição da coluna">
                              <mat-hint>Prioridade de exibição</mat-hint>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Alinhamento</mat-label>
                              <mat-select [(ngModel)]="col.align" matTooltip="Alinhamento do texto">
                                <mat-option value="left">Esquerda</mat-option>
                                <mat-option value="center">Centro</mat-option>
                                <mat-option value="right">Direita</mat-option>
                              </mat-select>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Largura</mat-label>
                              <input matInput [(ngModel)]="col.width" placeholder="Ex: 150px, 25%">
                              <mat-hint>Largura da coluna</mat-hint>
                            </mat-form-field>
                          </div>
                        </div>

                        <mat-divider></mat-divider>

                        <div class="options-section">
                          <h4>Estilização</h4>
                          <div class="fields-row">
                            <mat-form-field appearance="outline">
                              <mat-label>Estilo das células</mat-label>
                              <input matInput [(ngModel)]="col.style" placeholder="Ex: color: blue; font-weight: bold;">
                              <mat-hint>CSS aplicado às células</mat-hint>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Estilo do cabeçalho</mat-label>
                              <input matInput [(ngModel)]="col.headerStyle" placeholder="Ex: background-color: #f5f5f5;">
                              <mat-hint>CSS aplicado ao cabeçalho</mat-hint>
                            </mat-form-field>
                          </div>
                        </div>
                      </mat-expansion-panel>
                    </mat-card>
                  </div>
                `,
                styles: [`
                  :host {
                    display: block;
                  }

                  .columns-config-container {
                    max-width: 800px;
                    margin: 0 auto;
                  }

                  .column-item {
                    margin-bottom: 1rem;
                    padding: 0;
                    border-left: 4px solid var(--mat-sys-primary); // representa ação principal
                  background-color: var(--mat-sys-surface-container); // fundo adaptado para o item
                  }

                  .card-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background-color: var(--mat-sys-surface-container-high); // cabeçalho sobressai um pouco
                  }

                  .drag-handle {
                    cursor: move;
                    display: flex;
                    align-items: center;
                    margin-right: 0.75rem;
                    color: var(--mat-sys-on-surface); // ícones sobre o background padrão
                  }

                  .main-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                  }

                  .field-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                  }

                  .field-info strong {
                    font-size: 1.1rem;
                    color: var(--mat-sys-on-surface); // texto principal
                  }

                  .advanced-options {
                    margin: 0;
                    box-shadow: none !important;
                  }

                  .options-section {
                    padding: 0.5rem 0 1rem;
                  }

                  .options-section h4 {
                    margin: 0.5rem 0;
                    color: var(--mat-sys-outline); // título sutil, não dominante
                  font-weight: 500;
                  }

                  .fields-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                  }

                  .fields-row mat-form-field {
                    flex: 1 1 200px;
                  }

                  mat-divider {
                    margin: 0.5rem 0;
                    background-color: var(--mat-sys-outline-variant);
                  }

                  .global-config-card {
                    margin-bottom: 1.5rem;
                    border-top: 4px solid var(--mat-sys-secondary); // destaca o bloco de configuração
                    background-color: var(--mat-sys-surface-container); // mesmo fundo do item normal
                  }

                  .global-actions-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: flex-start;
                  }

                  .global-action {
                    flex: 1 1 200px;
                    min-width: 200px;
                    display: flex;
                    align-items: center;
                  }

                  .global-action mat-form-field {
                    width: 100%;
                  }

                  .quick-actions {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                  }

                  .spacer {
                    flex: 1;
                  }

                  .search-field {
                    width: 250px;
                  }

                `]
              })
              export class PraxisTableColumnsConfig {
                @Input() config: TableConfig = { columns: [], data: [] };
                @Output() configChange = new EventEmitter<TableConfig>();

                columns: ColumnDefinition[] = [];
                filteredColumns: ColumnDefinition[] = [];
                searchQuery: string = '';

                // Propriedades para configurações globais
                globalAlign: string | null = null;
                globalVisibility: boolean | null = null;

                ngOnInit() {
                  this.columns = this.config.columns.map(c => ({ visible: true, ...c }));
                  this.filteredColumns = [...this.columns];
                }

                ngDoCheck() {
                  this.emitChange();
                  this.filterColumns();
                }

                drop(event: CdkDragDrop<ColumnDefinition[]>) {
                  if (event.previousIndex === event.currentIndex) return;
                  moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
                  this.filteredColumns = [...this.filterColumns()];
                  this.emitChange();
                }

                emitChange() {
                  const cfg = JSON.parse(JSON.stringify(this.config));
                  cfg.columns = this.columns;
                  this.configChange.emit(cfg);
                }

                // Métodos para configurações globais
                applyGlobalSettings() {
                  this.columns.forEach(col => {
                    // Aplicar alinhamento global, se definido
                    if (this.globalAlign !== null) {
                      col.align = this.globalAlign;
                    }

                    // Aplicar visibilidade global, se definida
                    if (this.globalVisibility !== null) {
                      col.visible = this.globalVisibility;
                    }
                  });

                  // Resetar configurações globais após aplicação
                  this.globalAlign = null;
                  this.globalVisibility = null;

                  this.emitChange();
                }

                hasGlobalChanges(): boolean {
                  return this.globalAlign !== null || this.globalVisibility !== null;
                }

                // Ações rápidas
                showAllColumns() {
                  this.columns.forEach(col => col.visible = true);
                  this.emitChange();
                }

                hideAllColumns() {
                  this.columns.forEach(col => col.visible = false);
                  this.emitChange();
                }

                // Filtro de colunas
                filterColumns(): ColumnDefinition[] {
                  if (!this.searchQuery?.trim()) {
                    this.filteredColumns = [...this.columns];
                    return this.columns;
                  }

                  const query = this.searchQuery.toLowerCase().trim();
                  this.filteredColumns = this.columns.filter(col =>
                    col.field?.toLowerCase().includes(query) ||
                    col.title?.toLowerCase().includes(query)
                  );
                  return this.filteredColumns;
                }
              }
