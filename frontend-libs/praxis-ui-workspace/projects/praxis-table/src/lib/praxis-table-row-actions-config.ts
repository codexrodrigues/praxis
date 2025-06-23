import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableConfig, RowAction } from '@praxis/core';

@Component({
  selector: 'praxis-table-row-actions-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <label>Ações de linha (JSON)</label>
    <textarea [(ngModel)]="actionsJson" rows="5" style="width:100%" (ngModelChange)="onChange()"></textarea>
    <div style="margin-top:0.5rem;">
      <button mat-button (click)="formatJson()"><mat-icon>format_align_left</mat-icon>Formatar</button>
      <button mat-button (click)="copyJson()"><mat-icon>content_copy</mat-icon>Copiar</button>
    </div>
    <div style="color:red" *ngIf="!valid">JSON inválido</div>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTableRowActionsConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  actions: RowAction[] = [];
  actionsJson = '[]';
  valid = true;

  ngOnInit() {
    if (this.config.rowActions) {
      this.actions = this.config.rowActions;
    }
    this.actionsJson = JSON.stringify(this.actions, null, 2);
  }

  onChange() {
    try {
      this.actions = JSON.parse(this.actionsJson);
      this.valid = true;
    } catch {
      this.valid = false;
    }
  }

  formatJson() {
    try {
      const obj = JSON.parse(this.actionsJson);
      this.actionsJson = JSON.stringify(obj, null, 2);
    } catch {}
  }

  copyJson() {
    const textarea = document.createElement('textarea');
    textarea.value = this.actionsJson;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  ngDoCheck() {
    this.emitChange();
  }

  emitChange() {
    if (!this.valid) return;
    const cfg = JSON.parse(JSON.stringify(this.config));
    cfg.rowActions = this.actions;
    this.configChange.emit(cfg);
  }
}
