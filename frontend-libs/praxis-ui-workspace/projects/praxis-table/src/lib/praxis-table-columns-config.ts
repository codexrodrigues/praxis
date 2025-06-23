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
              DragDropModule
            ],
            template: `
              <div class="columns-config-container" cdkDropList [cdkDropListData]="columns" (cdkDropListDropped)="drop($event)">
                <mat-card class="column-item" *ngFor="let col of columns; let i = index" cdkDrag>
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
                border-left: 4px solid #3f51b5;
              }
              .card-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                background-color: #f9f9f9;
              }
              .drag-handle {
                cursor: move;
                display: flex;
                align-items: center;
                margin-right: 0.75rem;
                color: #666;
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
                color: #3f51b5;
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
                color: #666;
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
              }
            `]
          })
          export class PraxisTableColumnsConfig {
            @Input() config: TableConfig = { columns: [], data: [] };
            @Output() configChange = new EventEmitter<TableConfig>();

            columns: ColumnDefinition[] = [];

            ngOnInit() {
              this.columns = this.config.columns.map(c => ({ visible: true, ...c }));
            }

            drop(event: CdkDragDrop<ColumnDefinition[]>) {
              if (event.previousIndex === event.currentIndex) return;
              moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
              this.emitChange();
            }

            ngDoCheck() {
              this.emitChange();
            }

            emitChange() {
              const cfg = JSON.parse(JSON.stringify(this.config));
              cfg.columns = this.columns;
              this.configChange.emit(cfg);
            }
          }
