import { Component, Input, OnChanges, ViewChild, AfterViewInit, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { TableConfig, GenericCrudService, Page, Pageable, FieldDefinition, ColumnDefinition } from '@praxis/core';
import { BehaviorSubject, take } from 'rxjs';

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
  @Input() resourcePath?: string;
  @Input() filterCriteria: any = {};

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  private dataSubject = new BehaviorSubject<any[]>([]);
  private pageIndex = 0;
  private pageSize = 5;
  private sortState: Sort = { active: '', direction: '' };

  constructor(private crudService: GenericCrudService<any>) {
    this.dataSubject.subscribe(data => (this.dataSource.data = data));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.config.gridOptions?.pagination?.pageSize) {
      this.pageSize = this.config.gridOptions.pagination.pageSize;
    }

    if (changes['resourcePath'] && this.resourcePath) {
      this.crudService.configure(this.resourcePath);
      this.loadSchema();
      this.fetchData();
    } else {
      this.setupColumns();
      this.dataSubject.next(this.config.data);
    }

    if (changes['filterCriteria'] && this.resourcePath) {
      this.fetchData();
    }

    this.applyDataSourceSettings();
  }

  ngAfterViewInit(): void {
    this.applyDataSourceSettings();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
    this.fetchData();
  }

  onSortChange(event: Sort): void {
    this.sortState = event;
    this.sortChange.emit(event);
    this.fetchData();
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

  private setupColumns(): void {
    this.displayedColumns = this.config.columns.map(c => c.field);
    if (this.config.showActionsColumn) {
      this.displayedColumns.push('actions');
    }
  }

  private loadSchema(): void {
    this.crudService.getSchema().pipe(take(1)).subscribe((fields: FieldDefinition[]) => {
      if (this.config.columns.length === 0) {
        this.config.columns = fields
          .filter(f => !f.tableHidden)
          .map(f => this.convertFieldToColumn(f));
      }
      this.setupColumns();
    });
  }

  private convertFieldToColumn(field: FieldDefinition): ColumnDefinition {
    return {
      field: field.name,
      title: field.label ?? field.name,
      sortable: field.sortable
    } as ColumnDefinition;
  }

  private fetchData(): void {
    if (!this.resourcePath) {
      return;
    }
    const pageable: Pageable = {
      pageNumber: this.pageIndex,
      pageSize: this.pageSize
    };
    if (this.sortState.active && this.sortState.direction) {
      pageable.sort = `${this.sortState.active},${this.sortState.direction}`;
    }
    this.crudService
      .filter(this.filterCriteria || {}, pageable)
      .pipe(take(1))
      .subscribe((page: Page<any>) => {
        this.dataSubject.next(page.content);
        if (this.config.gridOptions?.pagination) {
          this.config.gridOptions.pagination.length = page.totalElements;
        }
        if (this.paginator) {
          this.paginator.length = page.totalElements;
        }
      });
  }
}
