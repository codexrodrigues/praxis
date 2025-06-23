import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { TableConfig } from '@praxis/core';
import { PraxisTableJsonConfig } from './praxis-table-json-config';
import { PraxisTablePaginationConfig } from './praxis-table-pagination-config';

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
    PraxisTablePaginationConfig
  ],
  template: `
    <h2>Editor de Configuração da Tabela</h2>
    <mat-tab-group>
      <mat-tab label="JSON" >
        <praxis-table-json-config [config]="workingConfig" (configChange)="onJsonChange($event.config, $event.valid)"></praxis-table-json-config>
      </mat-tab>
      <mat-tab label="Paginação">
        <praxis-table-pagination-config [config]="workingConfig" (configChange)="workingConfig = $event"></praxis-table-pagination-config>
      </mat-tab>
    </mat-tab-group>
    <div style="margin-top:1rem;text-align:right;">
      <span style="color:red;margin-right:auto;" *ngIf="!jsonValid">JSON inválido</span>
      <button mat-button (click)="cancel.emit()">Cancelar</button>
      <button mat-button color="primary" (click)="save.emit(workingConfig)" [disabled]="!jsonValid">Salvar</button>
    </div>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTableConfigEditor {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() save = new EventEmitter<TableConfig>();
  @Output() cancel = new EventEmitter<void>();

  workingConfig: TableConfig = { columns: [], data: [] };
  jsonValid = true;

  ngOnInit() {
    this.workingConfig = JSON.parse(JSON.stringify(this.config));
  }

  onJsonChange(cfg: TableConfig, valid: boolean) {
    this.workingConfig = cfg;
    this.jsonValid = valid;
  }
}
