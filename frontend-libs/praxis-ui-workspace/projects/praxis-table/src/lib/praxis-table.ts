import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
  SimpleChanges,
  AfterContentInit,
  ContentChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PraxisTableConfigEditor } from './praxis-table-config-editor';
import { TableConfig, GenericCrudService, Page, Pageable, FieldDefinition, ColumnDefinition } from '@praxis/core';
import { PraxisTableEvent } from './praxis-table-event';
import { PraxisTableToolbar } from './praxis-table-toolbar';
import { BehaviorSubject, take } from 'rxjs';

@Component({
  selector: 'praxis-table',
  standalone: true,
  providers: [GenericCrudService],
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    PraxisTableToolbar
  ],
  template: `
    <praxis-table-toolbar *ngIf="showToolbar"
                          [config]="config"
                          [showFilter]="showFilter"
                          [filterValue]="filterValue"
                          (newRecord)="newRecord.emit($event)"
                          (toolbarAction)="toolbarAction.emit($event)"
                          (exportData)="exportData.emit($event)"
                          (filterInput)="onFilterInput($event.payload)">
      <ng-content select="[advancedFilter]"/>
      <ng-content select="[toolbar]"/>
    </praxis-table-toolbar>
    <button mat-icon-button *ngIf="editModeEnabled" (click)="openConfigEditor()" style="float:right;">
      <mat-icon>settings</mat-icon>
    </button>
    <table mat-table [dataSource]="dataSource" matSort
           (matSortChange)="onSortChange($event)"
           [matSortDisabled]="!config.gridOptions?.sortable"
           class="mat-elevation-z8">
      <ng-container *ngFor="let column of visibleColumns" [matColumnDef]="column.field">
        <th mat-header-cell *matHeaderCellDef mat-sort-header
            [disabled]="!config.gridOptions?.sortable || column.sortable === false"
            [style.text-align]="column.align"
            [style.width]="column.width"
            [attr.style]="column.headerStyle">
          {{ column.header }}
        </th>
        <td mat-cell *matCellDef="let element"
            [style.text-align]="column.align"
            [style.width]="column.width"
            [attr.style]="column.style">{{ element[column.field] }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
    <mat-paginator *ngIf="config.gridOptions?.pagination"
                   [length]="config.gridOptions?.pagination?.length ?? config.data.length"
                   [pageSize]="config.gridOptions?.pagination?.pageSize"
                   [pageSizeOptions]="config.gridOptions?.pagination?.pageSizeOptions ?? []"
                   [showFirstLastButtons]="config.gridOptions?.pagination?.showFirstLastButtons"
                   (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`table{width:100%;}.spacer{flex:1 1 auto;}`]
})
export class PraxisTable implements OnChanges, AfterViewInit, AfterContentInit {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Input() resourcePath?: string;
  @Input() filterCriteria: any = {};
  /** Controls toolbar visibility */
  @Input() showToolbar = false;

  /** Show simple filter input in toolbar */
  @Input() showFilter = false;

  /** Enable edit mode */
  @Input() editModeEnabled = false;

  @Output() newRecord = new EventEmitter<PraxisTableEvent<void>>();
  @Output() toolbarAction = new EventEmitter<PraxisTableEvent<string>>();
  @Output() exportData = new EventEmitter<PraxisTableEvent<'excel' | 'pdf'>>();
  @Output() filterChange = new EventEmitter<PraxisTableEvent<any>>();

  @Output() pageChange = new EventEmitter<PraxisTableEvent<PageEvent>>();
  @Output() sortChange = new EventEmitter<PraxisTableEvent<Sort>>();
  @Output() rowAction = new EventEmitter<PraxisTableEvent<{action: string; row: any}>>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @ContentChild('advancedFilter') advancedFilterComponent?: any;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  visibleColumns: ColumnDefinition[] = [];

  private dataSubject = new BehaviorSubject<any[]>([]);
  private pageIndex = 0;
  private pageSize = 5;
  private sortState: Sort = { active: '', direction: '' };

  filterValue = '';

  constructor(
    private crudService: GenericCrudService<any>,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.dataSubject.subscribe(data => (this.dataSource.data = data));
  }

  ngAfterContentInit(): void {
    this.showToolbar = this.config.toolbar?.visible ?? this.showToolbar;
    this.showFilter = this.config.gridOptions?.filterable ?? this.showFilter;

    if (this.advancedFilterComponent && this.advancedFilterComponent.criteriaChange) {
      this.advancedFilterComponent.criteriaChange.subscribe((criteria: any) => {
        this.filterCriteria = criteria;
        this.filterChange.emit({ type: 'filterChange', payload: this.filterCriteria });
        this.fetchData();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.showToolbar = this.config.toolbar?.visible ?? this.showToolbar;
      this.showFilter = this.config.gridOptions?.filterable ?? this.showFilter;
    }
    if (this.config.gridOptions?.pagination?.pageSize) {
      this.pageSize = this.config.gridOptions?.pagination?.pageSize;
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
    this.pageChange.emit({ type: 'page', payload: event });
    this.fetchData();
  }

  onSortChange(event: Sort): void {
    this.sortState = event;
    this.sortChange.emit({ type: 'sort', payload: event });
    this.fetchData();
  }

  onFilterInput(value: string): void {
    this.filterValue = value;
    this.filterCriteria = { ...this.filterCriteria, query: value };
    this.filterChange.emit({ type: 'filterChange', payload: this.filterCriteria });
    this.fetchData();
  }

  onRowAction(action: string, row: any): void {
    this.rowAction.emit({ type: action, payload: { action, row } });
  }

openConfigEditor(): void {
  this.dialog
    .open(PraxisTableConfigEditor, {
      data: { config: this.config },
      width: '80%',
      height: '80%',
      maxHeight: '90vh',
      maxWidth: '90vw'
    })
    .afterClosed()
    .subscribe((result: TableConfig | undefined) => {
      if (result) {
        this.config = result;
        this.setupColumns();
        this.applyDataSourceSettings();
      }
    });
}

  private applyDataSourceSettings(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      if (this.config.gridOptions?.pagination?.length !== undefined) {
        this.paginator.length = this.config.gridOptions?.pagination?.length as number;
      } else {
        this.paginator.length = this.config.data.length;
      }
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private setupColumns(): void {
    this.visibleColumns = this.config.columns
      .filter(c => c.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.displayedColumns = this.visibleColumns.map(c => c.field);
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
      this.cdr.detectChanges();
    });
  }

  private convertFieldToColumn(field: FieldDefinition): ColumnDefinition {
    return {
      field: field.name,
      header: field.label ?? field.name,
      order: field.order,
      width: (field.width as any) ?? undefined,
      sortable: field.sortable,
      visible: field.tableHidden ? false : true
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
        const pagination = this.config.gridOptions?.pagination;
        if (pagination) {
          pagination.length = page.totalElements;
        }
        if (this.paginator) {
          this.paginator.length = page.totalElements;
        }
      });
  }
}
