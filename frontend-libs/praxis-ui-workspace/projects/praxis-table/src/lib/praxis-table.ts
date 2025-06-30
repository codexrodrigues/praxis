import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ColumnDefinition, FieldDefinition, GenericCrudService, Page, Pageable, TableConfig} from '@praxis/core';
import {BehaviorSubject, take} from 'rxjs';
import {PraxisTableToolbar} from './praxis-table-toolbar';
import {PraxisTableConfigEditor} from './praxis-table-config-editor';

@Component({
  selector: 'praxis-table',
  standalone: true,
  providers: [GenericCrudService],
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatSortModule, MatIconModule, MatMenuModule, MatDialogModule, PraxisTableToolbar,],
  template: `
    <praxis-table-toolbar *ngIf="showToolbar"
                          [config]="config"
                          [showFilter]="showFilter"
                          [filterValue]="filterValue">
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
            [attr.style]="column.style">{{ getCellValue(element, column) }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
    <mat-paginator *ngIf="config.gridOptions?.pagination"
                   [length]="config.gridOptions?.pagination?.length ?? 0"
                   [pageSize]="config.gridOptions?.pagination?.pageSize"
                   [pageSizeOptions]="config.gridOptions?.pagination?.pageSizeOptions ?? []"
                   [showFirstLastButtons]="config.gridOptions?.pagination?.showFirstLastButtons"
                   (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`table {
    width: 100%;
  }

  .spacer {
    flex: 1 1 auto;
  }`]
})
export class PraxisTable implements OnChanges, AfterViewInit, AfterContentInit {
  @Input() config: TableConfig = {columns: []};
  @Input() resourcePath?: string;
  @Input() filterCriteria: any = {};
  /** Controls toolbar visibility */
  @Input() showToolbar = false;

  /** Show simple filter input in toolbar */
  @Input() showFilter = false;

  /** Enable edit mode */
  @Input() editModeEnabled = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @ContentChild('advancedFilter') advancedFilterComponent?: any;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  visibleColumns: ColumnDefinition[] = [];
  filterValue = '';
  private dataSubject = new BehaviorSubject<any[]>([]);
  private pageIndex = 0;
  private pageSize = 5;
  private sortState: Sort = {active: '', direction: ''};

  constructor(private crudService: GenericCrudService<any>, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.dataSubject.subscribe(data => (this.dataSource.data = data));
  }

  ngAfterContentInit(): void {
    this.showToolbar = this.config.toolbar?.visible ?? this.showToolbar;

    // Inicialização inicial dos dados e colunas
    this.setupColumns();
    if (this.resourcePath) {
      this.fetchData();
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
    } else if (changes['config']) {
      this.setupColumns();
      if (this.resourcePath) {
        this.fetchData();
      }
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
    if (this.resourcePath) {
      this.fetchData();
    }
  }

  onSortChange(event: Sort): void {
    this.sortState = event;
    if (this.resourcePath) {
      this.fetchData();
    }
  }

  openConfigEditor(): void {
    // Criar cópia profunda da configuração para evitar alterações acidentais
    const configCopy = JSON.parse(JSON.stringify(this.config)) as TableConfig;

    const dialogRef = this.dialog.open(PraxisTableConfigEditor, {
      data: { config: configCopy },
      width: '90%',
      height: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe((result: TableConfig | undefined) => {
      if (result) {
        // Aplicar as configurações retornadas
        console.log('Configurações atualizadas:', result);
        this.config = { ...result };
        this.setupColumns();
        this.applyDataSourceSettings();
        if (this.resourcePath) {
          this.fetchData();
        }
        // Forçar detecção de mudanças
        this.cdr.detectChanges();
      }
    });
  }

  private applyDataSourceSettings(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.length = this.config.gridOptions?.pagination?.length ?? 0;
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
      pageNumber: this.pageIndex, pageSize: this.pageSize
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

  /**
   * Get the cell value for a given row and column
   * Handles the complete transformation pipeline:
   * 1. _generatedValueGetter (calculated columns) or regular field access
   * 2. valueMapping (convert values to display text)
   * 3. format (future: formatting like dates, numbers)
   */
  getCellValue(rowData: any, column: ColumnDefinition): any {
    const extendedColumn = column as any;
    let value: any;

    // Step 1: Get raw value (calculated or direct field access)
    if (extendedColumn._generatedValueGetter && extendedColumn._generatedValueGetter.trim()) {
      try {
        // Safely evaluate the generated expression
        const evaluationFunction = new Function('rowData', `return ${extendedColumn._generatedValueGetter}`);
        value = evaluationFunction(rowData);
      } catch (error) {
        console.warn(`Error evaluating formula for column ${column.field}:`, error);
        return `[Formula Error]`;
      }
    } else {
      // Fallback to regular field access
      value = this.getNestedPropertyValue(rowData, column.field);
    }

    // Step 2: Apply value mapping if defined
    if (extendedColumn.valueMapping && Object.keys(extendedColumn.valueMapping).length > 0) {
      value = this.applyValueMapping(value, extendedColumn.valueMapping);
    }

    // Step 3: Apply formatting (future implementation)
    // if (extendedColumn.format) {
    //   value = this.applyFormatting(value, extendedColumn.format);
    // }

    return value;
  }

  /**
   * Apply value mapping to transform raw values into display-friendly text
   */
  private applyValueMapping(value: any, mapping: { [key: string | number]: string }): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Try to find mapping by exact match
    if (mapping.hasOwnProperty(value)) {
      return mapping[value];
    }

    // Try string conversion for number/boolean values
    const stringValue = String(value);
    if (mapping.hasOwnProperty(stringValue)) {
      return mapping[stringValue];
    }

    // Try number conversion for string values that represent numbers
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && isFinite(numValue) && mapping.hasOwnProperty(numValue)) {
        return mapping[numValue];
      }
    }

    // Try boolean conversion for string values
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' && mapping.hasOwnProperty('true')) {
        return mapping['true'];
      }
      if (lowerValue === 'false' && mapping.hasOwnProperty('false')) {
        return mapping['false'];
      }
    }

    // Return original value if no mapping found
    return value;
  }

  /**
   * Safely access nested properties using dot notation
   */
  private getNestedPropertyValue(obj: any, path: string): any {
    if (!obj || !path) {
      return null;
    }

    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
      }, obj);
    } catch (error) {
      console.warn(`Error accessing property ${path}:`, error);
      return null;
    }
  }
}
