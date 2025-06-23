import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
      <ng-container *ngFor="let column of config.columns" [matColumnDef]="column.field">
        <th mat-header-cell *matHeaderCellDef>{{ column.title }}</th>
        <td mat-cell *matCellDef="let element">{{ element[column.field] }}</td>
      </ng-container>

      <ng-container *ngIf="config.showActionsColumn" matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Ações</th>
        <td mat-cell *matCellDef="let row">
          <button mat-button color="primary">View</button>
          <button mat-button color="accent">Edit</button>
          <button mat-button color="warn">Delete</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
  `,
  styles: [`table{width:100%;}`]
})
export class PraxisTable implements OnChanges {
  @Input() config: TableConfig = { columns: [], data: [] };

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  ngOnChanges(): void {
    this.displayedColumns = this.config.columns.map(c => c.field);
    if (this.config.showActionsColumn) {
      this.displayedColumns.push('actions');
    }
    this.dataSource.data = this.config.data;
  }
}
