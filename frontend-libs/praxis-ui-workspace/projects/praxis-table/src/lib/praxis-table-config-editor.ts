import { Component, EventEmitter, Input, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableConfig } from '@praxis/core';
import { PraxisTableJsonConfig } from './praxis-table-json-config';
import { PraxisTablePaginationConfig } from './praxis-table-pagination-config';
import { PraxisTableGridOptionsConfig } from './praxis-table-grid-options-config';
import { PraxisTableToolbarConfig } from './praxis-table-toolbar-config';
import { PraxisTableExportConfig } from './praxis-table-export-config';
import { PraxisTableMessagesConfig } from './praxis-table-messages-config';
import { PraxisTableRowActionsConfig } from './praxis-table-row-actions-config';
import { PraxisTableColumnsConfig } from './praxis-table-columns-config';
import { mergeWithDefaults } from './table-config-defaults';

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    PraxisTableJsonConfig,
    PraxisTablePaginationConfig,
    PraxisTableGridOptionsConfig,
    PraxisTableToolbarConfig,
    PraxisTableExportConfig,
    PraxisTableMessagesConfig,
    PraxisTableRowActionsConfig,
    PraxisTableColumnsConfig
  ],
  template: `
    <h2>Editor de Configuração da Tabela</h2>
    <mat-tab-group>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>code</mat-icon>
          <span>JSON</span>
        </ng-template>
        <praxis-table-json-config [config]="workingConfig" (configChange)="onJsonChange($event.config, $event.valid)"></praxis-table-json-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>format_list_numbered</mat-icon>
          <span>Paginação</span>
        </ng-template>
        <praxis-table-pagination-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-pagination-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>tune</mat-icon>
          <span>Grid</span>
        </ng-template>
        <praxis-table-grid-options-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-grid-options-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>dashboard</mat-icon>
          <span>Toolbar</span>
        </ng-template>
        <praxis-table-toolbar-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-toolbar-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>file_download</mat-icon>
          <span>Exportar</span>
        </ng-template>
        <praxis-table-export-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-export-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>message</mat-icon>
          <span>Mensagens</span>
        </ng-template>
        <praxis-table-messages-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-messages-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>view_column</mat-icon>
          <span>Colunas</span>
        </ng-template>
        <praxis-table-columns-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-columns-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>list</mat-icon>
          <span>Ações da linha</span>
        </ng-template>
        <praxis-table-row-actions-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-row-actions-config>
      </mat-tab>
    </mat-tab-group>
    <div style="margin-top:1rem;text-align:right;">
      <span style="color:red;margin-right:auto;" *ngIf="!jsonValid">JSON inválido</span>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onSave()" [disabled]="!jsonValid">Salvar</button>
    </div>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTableConfigEditor {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() save = new EventEmitter<TableConfig>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private dialogRef: MatDialogRef<PraxisTableConfigEditor>,
    @Inject(MAT_DIALOG_DATA) public data: { config?: TableConfig }
  ) {
    if (data?.config) {
      this.config = data.config;
    }
  }

  workingConfig: TableConfig = { columns: [], data: [] };
  jsonValid = true;

  ngOnInit() {
    this.workingConfig = mergeWithDefaults(this.config);
  }

  onJsonChange(cfg: TableConfig, valid: boolean) {
    this.workingConfig = cfg;
    this.jsonValid = valid;
  }

  onSave(): void {
    this.save.emit(this.workingConfig);
    this.dialogRef.close(this.workingConfig);
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
