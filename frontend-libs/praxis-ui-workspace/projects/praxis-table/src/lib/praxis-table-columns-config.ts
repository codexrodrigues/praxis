import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div *ngFor="let col of columns; let i = index" style="display:flex;align-items:center;margin-bottom:0.5rem;">
      <mat-form-field appearance="fill" style="width:120px;margin-right:0.5rem;">
        <mat-label>Campo</mat-label>
        <input matInput [value]="col.field" disabled />
      </mat-form-field>
      <mat-form-field appearance="fill" style="flex:1;margin-right:0.5rem;">
        <mat-label>Título</mat-label>
        <input matInput [(ngModel)]="col.title" />
      </mat-form-field>
      <mat-form-field appearance="fill" style="width:70px;margin-right:0.5rem;">
        <mat-label>Ordem</mat-label>
        <input matInput type="number" [(ngModel)]="col.order" />
      </mat-form-field>
      <mat-checkbox [(ngModel)]="col.visible" style="margin-right:0.5rem;">Visível</mat-checkbox>
      <mat-form-field appearance="fill" style="width:90px;margin-right:0.5rem;">
        <mat-label>Alinh.</mat-label>
        <input matInput [(ngModel)]="col.align" />
      </mat-form-field>
      <mat-form-field appearance="fill" style="width:90px;margin-right:0.5rem;">
        <mat-label>Largura</mat-label>
        <input matInput [(ngModel)]="col.width" />
      </mat-form-field>
      <mat-form-field appearance="fill" style="flex:1;margin-right:0.5rem;">
        <mat-label>Estilo</mat-label>
        <input matInput [(ngModel)]="col.style" />
      </mat-form-field>
      <button mat-icon-button (click)="moveUp(i)" [disabled]="i === 0">
        <mat-icon>arrow_upward</mat-icon>
      </button>
      <button mat-icon-button (click)="moveDown(i)" [disabled]="i === columns.length - 1">
        <mat-icon>arrow_downward</mat-icon>
      </button>
    </div>
  `,
  styles: [`:host{display:block;}`]
})
export class PraxisTableColumnsConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  columns: ColumnDefinition[] = [];

  ngOnInit() {
    this.columns = this.config.columns.map(c => ({ visible: true, ...c }));
  }

  moveUp(index: number) {
    if (index <= 0) return;
    [this.columns[index - 1], this.columns[index]] = [this.columns[index], this.columns[index - 1]];
  }

  moveDown(index: number) {
    if (index >= this.columns.length - 1) return;
    [this.columns[index + 1], this.columns[index]] = [this.columns[index], this.columns[index + 1]];
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
