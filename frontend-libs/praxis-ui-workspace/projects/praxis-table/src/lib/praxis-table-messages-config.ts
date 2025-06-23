import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-messages-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Mensagem de vazio</mat-label>
      <input matInput [(ngModel)]="empty" />
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Mensagem de carregamento</mat-label>
      <input matInput [(ngModel)]="loading" />
    </mat-form-field>
    <mat-form-field appearance="fill">
      <mat-label>Mensagem de erro</mat-label>
      <input matInput [(ngModel)]="error" />
    </mat-form-field>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTableMessagesConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  empty = '';
  loading = '';
  error = '';

  ngOnInit() {
    const msg = this.config.messages || {};
    this.empty = msg.empty || '';
    this.loading = msg.loading || '';
    this.error = msg.error || '';
  }

  ngDoCheck() { this.emitChange(); }

  emitChange() {
    const cfg = JSON.parse(JSON.stringify(this.config));
    cfg.messages = { empty: this.empty, loading: this.loading, error: this.error };
    this.configChange.emit(cfg);
  }
}
