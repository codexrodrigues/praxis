import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
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
    DragDropModule
  ],
  template: `
    <div cdkDropList [cdkDropListData]="columns" (cdkDropListDropped)="drop($event)">
      <mat-card class="column-item" *ngFor="let col of columns; let i = index" cdkDrag>
        <div class="drag-handle" cdkDragHandle>
          <mat-icon>drag_handle</mat-icon>
        </div>
        <div class="fields">
          <mat-form-field appearance="fill">
            <mat-label>Campo</mat-label>
            <input matInput [value]="col.field" disabled />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Título</mat-label>
            <input matInput [(ngModel)]="col.title" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Ordem</mat-label>
            <input matInput type="number" [(ngModel)]="col.order" />
          </mat-form-field>
          <mat-checkbox [(ngModel)]="col.visible">Visível</mat-checkbox>
          <mat-form-field appearance="fill">
            <mat-label>Alinh.</mat-label>
            <input matInput [(ngModel)]="col.align" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Largura</mat-label>
            <input matInput [(ngModel)]="col.width" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Estilo</mat-label>
            <input matInput [(ngModel)]="col.style" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Estilo Cabeçalho</mat-label>
            <input matInput [(ngModel)]="col.headerStyle" />
          </mat-form-field>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    :host{display:block;}
    .column-item{display:flex;flex-wrap:wrap;align-items:flex-start;margin-bottom:.5rem;padding:.5rem;gap:.5rem;}
    .fields{display:flex;flex-wrap:wrap;gap:.5rem;flex:1;}
    .column-item mat-form-field{width:150px;flex:1 1 150px;}
    .drag-handle{cursor:move;display:flex;align-items:center;}
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
