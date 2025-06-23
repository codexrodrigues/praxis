import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-grid-options-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSlideToggleModule],
  template: `
    <mat-slide-toggle [(ngModel)]="sortable">Ordenação</mat-slide-toggle>
    <mat-slide-toggle [(ngModel)]="filterable">Filtro</mat-slide-toggle>
    <mat-slide-toggle [(ngModel)]="groupable">Agrupamento</mat-slide-toggle>
  `,
  styles: [`:host{display:block;}`]
})
export class PraxisTableGridOptionsConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  sortable = true;
  filterable = false;
  groupable = false;

  ngOnInit() {
    const opts = this.config.gridOptions || {};
    this.sortable = opts.sortable ?? true;
    this.filterable = opts.filterable ?? false;
    this.groupable = opts.groupable ?? false;
  }

  ngDoCheck() {
    this.emitChange();
  }

  emitChange() {
    const cfg = JSON.parse(JSON.stringify(this.config));
    if (!cfg.gridOptions) cfg.gridOptions = {} as any;
    cfg.gridOptions.sortable = this.sortable;
    cfg.gridOptions.filterable = this.filterable;
    cfg.gridOptions.groupable = this.groupable;
    this.configChange.emit(cfg);
  }
}
