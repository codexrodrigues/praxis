import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-export-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSlideToggleModule],
  template: `
    <mat-slide-toggle [(ngModel)]="excel">Excel</mat-slide-toggle>
    <mat-slide-toggle [(ngModel)]="pdf">PDF</mat-slide-toggle>
  `,
  styles: [`:host{display:block;}`]
})
export class PraxisTableExportConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  excel = false;
  pdf = false;

  ngOnInit() {
    const exp = this.config.exportOptions || {};
    this.excel = exp.excel ?? false;
    this.pdf = exp.pdf ?? false;
  }

  ngDoCheck() {
    this.emitChange();
  }

  emitChange() {
    const cfg = JSON.parse(JSON.stringify(this.config));
    cfg.exportOptions = { excel: this.excel, pdf: this.pdf };
    this.configChange.emit(cfg);
  }
}
