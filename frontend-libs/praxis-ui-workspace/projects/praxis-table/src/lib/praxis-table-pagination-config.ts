import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-pagination-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  template: `
    <mat-slide-toggle [(ngModel)]="enabled" (ngModelChange)="onEnabledChange()">Paginação</mat-slide-toggle>
    <div *ngIf="enabled" style="margin-top:0.5rem;">
      <mat-form-field appearance="fill">
        <mat-label>Tamanho da página</mat-label>
        <input matInput type="number" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()" />
      </mat-form-field>
    </div>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTablePaginationConfig {
  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  enabled = false;
  pageSize = 5;

  ngOnInit() {
    const pagination = this.config.gridOptions?.pagination;
    if (pagination) {
      this.enabled = true;
      this.pageSize = pagination.pageSize;
    }
  }

  ngOnChanges() {
    // Remove emissão automática no ngOnChanges
  }

  emitChange() {
    const cfg = JSON.parse(JSON.stringify(this.config));
    if (!cfg.gridOptions) cfg.gridOptions = {};
    if (this.enabled) {
      cfg.gridOptions.pagination = { pageSize: this.pageSize };
    } else {
      cfg.gridOptions.pagination = undefined as any;
    }
    this.configChange.emit(cfg);
  }

  // Métodos para detectar mudanças do usuário
  onEnabledChange() {
    this.emitChange();
  }
  
  onPageSizeChange() {
    this.emitChange();
  }
}
