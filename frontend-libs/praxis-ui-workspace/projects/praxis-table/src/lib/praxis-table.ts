import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatSortModule],
  template: `
    <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
      <ng-container *ngFor="let column of config.columns" [matColumnDef]="column.field">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ column.title }}</th>
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
    <mat-paginator *ngIf="config.gridOptions?.pagination"
                   [pageSize]="config.gridOptions.pagination.pageSize"
                   [pageSizeOptions]="config.gridOptions.pagination.pageSizeOptions"
                   [showFirstLastButtons]="config.gridOptions.pagination.showFirstLastButtons">
    </mat-paginator>
  `,
  styles: [`table{width:100%;}`]
})
export class PraxisTable implements OnChanges {
  @Input() config: TableConfig = { columns: [], data: [] };

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  ngOnChanges(): void {
    this.displayedColumns = this.config.columns.map(c => c.field);
    if (this.config.showActionsColumn) {
      this.displayedColumns.push('actions');
    }
    this.dataSource.data = this.config.data;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
}
