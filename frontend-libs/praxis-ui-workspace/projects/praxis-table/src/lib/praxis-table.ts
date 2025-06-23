import { Component, Input, OnChanges, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatSortModule],
  template: `
    <table mat-table [dataSource]="dataSource" matSort
           (matSortChange)="onSortChange($event)"
           [matSortDisabled]="!config.gridOptions?.sortable"
           class="mat-elevation-z8">
      <ng-container *ngFor="let column of config.columns" [matColumnDef]="column.field">
        <th mat-header-cell *matHeaderCellDef mat-sort-header
            [disabled]="!config.gridOptions?.sortable || column.sortable === false">
          {{ column.title }}
        </th>
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
                   [length]="config.gridOptions.pagination.length ?? config.data.length"
                   [pageSize]="config.gridOptions.pagination.pageSize"
                   [pageSizeOptions]="config.gridOptions.pagination.pageSizeOptions"
                   [showFirstLastButtons]="config.gridOptions.pagination.showFirstLastButtons"
                   (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`table{width:100%;}`]
})
export class PraxisTable implements OnChanges, AfterViewInit {
  @Input() config: TableConfig = { columns: [], data: [] };

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

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
    this.applyDataSourceSettings();
  }

  ngAfterViewInit(): void {
    this.applyDataSourceSettings();
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(event: Sort): void {
    this.sortChange.emit(event);
  }

  private applyDataSourceSettings(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      if (this.config.gridOptions?.pagination?.length !== undefined) {
        this.paginator.length = this.config.gridOptions.pagination.length;
      } else {
        this.paginator.length = this.config.data.length;
      }
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
}
