import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, take, Subscription } from 'rxjs';
import { SettingsPanelService } from '@praxis/settings-panel';
import {
  ColumnDefinition,
  FieldDefinition,
  GenericCrudService,
  Page,
  Pageable,
  TableConfig,
  createDefaultTableConfig,
  CONFIG_STORAGE,
  ConfigStorage,
} from '@praxis/core';
import { PraxisTableToolbar } from './praxis-table-toolbar';
import { PraxisTableConfigEditor } from './praxis-table-config-editor';
import { DataFormattingService } from './data-formatter/data-formatting.service';
import { ColumnDataType } from './data-formatter/data-formatter-types';
import { TableDefaultsProvider } from './services/table-defaults.provider';
import { PraxisFilter } from './praxis-filter';

@Component({
  selector: 'praxis-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    PraxisTableToolbar,
    PraxisFilter,
  ],
  template: `
    <praxis-table-toolbar
      *ngIf="showToolbar"
      [config]="config"
      [showFilter]="toolbarSearchEnabled"
      [filterValue]="filterValue"
      (toolbarAction)="onToolbarAction($event)"
    >
      <praxis-filter
        *ngIf="
          resourcePath &&
          config.behavior?.filtering?.advancedFilters?.enabled &&
          !projectedFilter
        "
        advancedFilter
        [resourcePath]="resourcePath"
        [formId]="tableId + '-filter'"
        (submit)="onAdvancedFilterSubmit($event)"
        (clear)="onAdvancedFilterClear()"
      ></praxis-filter>
      <ng-content select="[advancedFilter]" />
      <ng-content select="[toolbar]" />
    </praxis-table-toolbar>
    <button
      mat-icon-button
      *ngIf="editModeEnabled"
      (click)="openTableSettings()"
      style="float:right;"
    >
      <mat-icon>settings</mat-icon>
    </button>
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      (matSortChange)="onSortChange($event)"
      [matSortDisabled]="!getSortingEnabled()"
      class="mat-elevation-z8"
    >
      <ng-container
        *ngFor="let column of visibleColumns"
        [matColumnDef]="column.field"
      >
        <th
          mat-header-cell
          *matHeaderCellDef
          mat-sort-header
          [disabled]="!getSortingEnabled() || column.sortable === false"
          [style.text-align]="column.align"
          [style.width]="column.width"
          [attr.style]="column.headerStyle"
        >
          {{ column.header }}
        </th>
        <td
          mat-cell
          *matCellDef="let element"
          [style.text-align]="column.align"
          [style.width]="column.width"
          [attr.style]="column.style"
        >
          {{ getCellValue(element, column) }}
        </td>
      </ng-container>
      <ng-container
        *ngIf="config.actions?.row?.enabled"
        matColumnDef="_actions"
      >
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let element">
          <ng-container *ngFor="let action of config.actions?.row?.actions">
            <button
              mat-icon-button
              (click)="onRowAction(action.action, element, $event)"
            >
              <mat-icon>{{ action.icon }}</mat-icon>
            </button>
          </ng-container>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr
        mat-row
        *matRowDef="let row; let i = index; columns: displayedColumns"
        (click)="onRowClicked(row, i)"
      ></tr>
    </table>
    <mat-paginator
      *ngIf="getPaginationEnabled()"
      [length]="getPaginationLength()"
      [pageSize]="getPaginationPageSize()"
      [pageSizeOptions]="getPaginationPageSizeOptions()"
      [showFirstLastButtons]="getPaginationShowFirstLast()"
      (page)="onPageChange($event)"
    >
    </mat-paginator>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class PraxisTable
  implements OnInit, OnChanges, AfterViewInit, AfterContentInit, OnDestroy
{
  @Input() config: TableConfig = createDefaultTableConfig();
  @Input() resourcePath?: string;
  @Input() filterCriteria: any = {};
  /** Controls toolbar visibility */
  @Input() showToolbar = false;

  /** Enable edit mode */
  @Input() editModeEnabled = false;

  /** Identifier used for settings storage */
  @Input() tableId = 'default';

  @Output() rowClick = new EventEmitter<{ row: any; index: number }>();
  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() toolbarAction = new EventEmitter<{ action: string }>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  @ContentChild(PraxisFilter) projectedFilter?: PraxisFilter;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  visibleColumns: ColumnDefinition[] = [];
  filterValue = '';
  private dataSubject = new BehaviorSubject<any[]>([]);
  private pageIndex = 0;
  private pageSize = 5;
  private sortState: Sort = { active: '', direction: '' };
  private subscriptions: Subscription[] = [];

  constructor(
    private crudService: GenericCrudService<any>,
    private cdr: ChangeDetectorRef,
    private settingsPanel: SettingsPanelService,
    private formattingService: DataFormattingService,
    @Inject(CONFIG_STORAGE) private configStorage: ConfigStorage,
    private tableDefaultsProvider: TableDefaultsProvider,
  ) {
    this.subscriptions.push(
      this.dataSubject.subscribe((data) => (this.dataSource.data = data)),
    );
  }

  get toolbarSearchEnabled(): boolean {
    return !!this.config?.toolbar?.search?.enabled;
  }

  ngOnInit(): void {
    const storedConfig = this.configStorage.loadConfig<TableConfig>(
      `table-config:${this.tableId}`,
    );
    if (storedConfig) {
      this.config = storedConfig;
    }
  }

  ngAfterContentInit(): void {
    if (this.config) {
      this.setupColumns();
      if (this.resourcePath) {
        this.fetchData();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.setupColumns();
      if (this.resourcePath) {
        this.fetchData();
      }
    }

    if (changes['resourcePath'] && this.resourcePath) {
      this.crudService.configure(this.resourcePath);
      this.loadSchema();
      this.fetchData();
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

  onRowClicked(row: any, index: number): void {
    this.rowClick.emit({ row, index });
  }

  onRowAction(action: string, row: any, event: Event): void {
    event.stopPropagation();
    (event.target as HTMLElement).blur();
    this.rowAction.emit({ action, row });
  }

  onToolbarAction(event: { action: string }): void {
    this.toolbarAction.emit(event);
  }

  onAdvancedFilterSubmit(criteria: Record<string, any>): void {
    this.filterCriteria = criteria || {};
    if (this.resourcePath) {
      this.fetchData();
    }
  }

  onAdvancedFilterClear(): void {
    this.filterCriteria = {};
    if (this.resourcePath) {
      this.fetchData();
    }
  }

  openTableSettings(): void {
    try {
      console.debug('[PraxisTable] Opening table settings', {
        tableId: this.tableId,
        config: this.config,
      });

      const configCopy = JSON.parse(JSON.stringify(this.config)) as TableConfig;

      const ref = this.settingsPanel.open({
        id: `table.${this.tableId}`,
        title: 'Configurações da Tabela',
        content: { component: PraxisTableConfigEditor, inputs: configCopy },
      });

      this.subscriptions.push(
        ref.applied$.subscribe((cfg: TableConfig) => {
          console.debug('[PraxisTable] Applied config', cfg);
          if (!cfg) return;
          this.applyTableConfig(cfg);
        }),
        ref.saved$.subscribe((cfg: TableConfig) => {
          console.debug('[PraxisTable] Saved config', cfg);
          if (!cfg) return;
          this.configStorage.saveConfig(`table-config:${this.tableId}`, cfg);
          this.applyTableConfig(cfg);
        }),
        ref.reset$.subscribe(() => {
          console.debug('[PraxisTable] Resetting to default config');
          const defaults = this.tableDefaultsProvider.getDefaults(this.tableId);
          this.applyTableConfig(defaults);
        }),
      );
    } catch (error) {
      console.error('[PraxisTable] Error opening table settings', error);
    }
  }

  private applyTableConfig(cfg: TableConfig): void {
    console.debug('[PraxisTable] Applying table config', cfg);
    this.config = { ...cfg };
    this.setupColumns();
    this.applyDataSourceSettings();
    if (this.resourcePath) {
      this.fetchData();
    }
    this.cdr.detectChanges();
  }

  private applyDataSourceSettings(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.length = this.getPaginationLength();
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private setupColumns(): void {
    const columns = this.config.columns || [];
    this.visibleColumns = columns
      .filter((c) => c.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.displayedColumns = this.visibleColumns.map((c) => c.field);
    if (this.config.actions?.row?.enabled) {
      this.displayedColumns.push('_actions');
    }
  }

  private loadSchema(): void {
    this.crudService
      .getSchema()
      .pipe(take(1))
      .subscribe((fields: FieldDefinition[]) => {
        if (this.config.columns.length === 0) {
          this.config.columns = fields
            .filter((f) => !f.tableHidden)
            .map((f) => this.convertFieldToColumn(f));
        }
        this.setupColumns();
        this.cdr.detectChanges();
      });
  }

  private convertFieldToColumn(field: FieldDefinition): ColumnDefinition {
    // Prioritize API type over inference - only use inference as last resort
    let apiType: ColumnDataType;

    if (field.type && this.isValidColumnDataType(field.type)) {
      // Use API type if it's valid
      apiType = field.type as ColumnDataType;
    } else {
      // Fall back to inference only if API type is not available or invalid
      apiType = this.inferFieldTypeFromFieldName(field.name);
    }

    return {
      field: field.name,
      header: field.label ?? field.name,
      order: field.order,
      width: (field.width as any) ?? undefined,
      sortable: field.sortable,
      visible: field.tableHidden ? false : true,
      type: apiType,
      _originalApiType: apiType,
      _isApiField: true,
    } as ColumnDefinition;
  }

  /**
   * Check if a value is a valid ColumnDataType
   */
  private isValidColumnDataType(type: any): boolean {
    const validTypes: ColumnDataType[] = [
      'string',
      'number',
      'date',
      'boolean',
      'currency',
      'percentage',
      'custom',
    ];
    return validTypes.includes(type);
  }

  /**
   * Infer column data type from field name patterns when API type is not available
   * Refined logic to reduce false positives
   */
  private inferFieldTypeFromFieldName(fieldName: string): ColumnDataType {
    const lowercaseName = fieldName.toLowerCase();

    // Date/time patterns - more specific patterns first
    if (
      lowercaseName.endsWith('date') ||
      lowercaseName.endsWith('time') ||
      lowercaseName.endsWith('at') ||
      lowercaseName.startsWith('date') ||
      lowercaseName === 'created' ||
      lowercaseName === 'updated' ||
      lowercaseName === 'modified' ||
      lowercaseName.includes('timestamp')
    ) {
      return 'date';
    }

    // Boolean patterns - most specific first to avoid conflicts
    if (
      lowercaseName.startsWith('is_') ||
      lowercaseName.startsWith('has_') ||
      lowercaseName.startsWith('can_') ||
      lowercaseName.startsWith('should_') ||
      lowercaseName === 'active' ||
      lowercaseName === 'enabled' ||
      lowercaseName === 'visible' ||
      lowercaseName === 'deleted' ||
      lowercaseName === 'archived' ||
      lowercaseName.endsWith('_flag') ||
      lowercaseName.endsWith('_enabled') ||
      lowercaseName.endsWith('_active')
    ) {
      return 'boolean';
    }

    // Currency/money patterns - exclude common false positives
    if (
      (lowercaseName.includes('price') ||
        lowercaseName.includes('amount') ||
        lowercaseName.includes('cost') ||
        lowercaseName.includes('salary') ||
        lowercaseName.includes('wage') ||
        lowercaseName.includes('fee') ||
        (lowercaseName.includes('value') &&
          !lowercaseName.includes('id') &&
          !lowercaseName.includes('key'))) &&
      !lowercaseName.includes('count') &&
      !lowercaseName.includes('type')
    ) {
      return 'currency';
    }

    // Percentage patterns - be more specific
    if (
      lowercaseName.includes('percent') ||
      lowercaseName.endsWith('_rate') ||
      lowercaseName.endsWith('_ratio') ||
      lowercaseName.endsWith('_pct') ||
      (lowercaseName.includes('rate') &&
        !lowercaseName.includes('created') &&
        !lowercaseName.includes('updated')) ||
      lowercaseName.endsWith('_score')
    ) {
      return 'percentage';
    }

    // Number patterns - exclude common false positives like string IDs
    if (
      (lowercaseName.endsWith('_id') && lowercaseName !== 'id') || // composite IDs might be strings
      lowercaseName === 'id' ||
      lowercaseName.includes('count') ||
      lowercaseName.includes('quantity') ||
      lowercaseName.includes('number') ||
      lowercaseName.includes('total') ||
      lowercaseName.includes('sum') ||
      lowercaseName.includes('age') ||
      lowercaseName.includes('weight') ||
      lowercaseName.includes('height') ||
      lowercaseName.includes('size') ||
      lowercaseName.endsWith('_num') ||
      lowercaseName.endsWith('_number')
    ) {
      return 'number';
    }

    // Default to string for ambiguous cases
    return 'string';
  }

  private fetchData(): void {
    if (!this.resourcePath) {
      return;
    }
    const pageable: Pageable = {
      pageNumber: this.pageIndex,
      pageSize: this.pageSize,
    };
    if (this.sortState.active && this.sortState.direction) {
      pageable.sort = `${this.sortState.active},${this.sortState.direction}`;
    }
    this.crudService
      .filter(this.filterCriteria || {}, pageable)
      .pipe(take(1))
      .subscribe((page: Page<any>) => {
        this.dataSubject.next(page.content);
        if (this.paginator) {
          this.paginator.length = page.totalElements;
        }
      });
  }

  refetch(): void {
    this.fetchData();
  }

  /**
   * Get the cell value for a given row and column
   * Handles the complete transformation pipeline:
   * 1. _generatedValueGetter (calculated columns) or regular field access
   * 2. valueMapping (convert values to display text)
   * 3. format (data formatting like dates, numbers, currency)
   */
  getCellValue(rowData: any, column: ColumnDefinition): any {
    let value: any;

    // Step 1: Get raw value (calculated or direct field access)
    if (column._generatedValueGetter && column._generatedValueGetter.trim()) {
      try {
        // Safely evaluate the generated expression
        const evaluationFunction = new Function(
          'rowData',
          `return ${column._generatedValueGetter}`,
        );
        value = evaluationFunction(rowData);
      } catch (error) {
        // TODO: Implement proper error logging service
        return `[Formula Error]`;
      }
    } else {
      // Fallback to regular field access
      value = this.getNestedPropertyValue(rowData, column.field);
    }

    // Step 2: Apply value mapping if defined
    if (column.valueMapping && Object.keys(column.valueMapping).length > 0) {
      value = this.applyValueMapping(value, column.valueMapping);
    }

    // Step 3: Apply data formatting if defined
    if (
      column.type &&
      column.format &&
      this.formattingService.needsFormatting(column.type, column.format)
    ) {
      try {
        value = this.formattingService.formatValue(
          value,
          column.type,
          column.format,
        );
      } catch (error) {
        // TODO: Implement proper error logging service
      }
    }

    return value;
  }

  /**
   * Apply value mapping to transform raw values into display-friendly text
   */
  private applyValueMapping(
    value: any,
    mapping: { [key: string | number]: string },
  ): any {
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
      if (
        !isNaN(numValue) &&
        isFinite(numValue) &&
        mapping.hasOwnProperty(numValue)
      ) {
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
      // TODO: Implement proper error logging service
      return null;
    }
  }

  // =============================================================================
  // CONFIGURATION ACCESS METHODS
  // =============================================================================

  /**
   * Verifica se a ordenação está habilitada
   */
  getSortingEnabled(): boolean {
    return this.config.behavior?.sorting?.enabled ?? true;
  }

  /**
   * Verifica se a paginação está habilitada
   */
  getPaginationEnabled(): boolean {
    return this.config.behavior?.pagination?.enabled ?? false;
  }

  /**
   * Obtém o comprimento total da paginação
   */
  getPaginationLength(): number {
    return this.config.behavior?.pagination?.totalItems ?? 0;
  }

  /**
   * Obtém o tamanho da página
   */
  getPaginationPageSize(): number {
    return this.config.behavior?.pagination?.pageSize ?? 10;
  }

  /**
   * Obtém as opções de tamanho de página
   */
  getPaginationPageSizeOptions(): number[] {
    return this.config.behavior?.pagination?.pageSizeOptions ?? [5, 10, 25, 50];
  }

  /**
   * Verifica se deve mostrar botões primeira/última
   */
  getPaginationShowFirstLast(): boolean {
    return this.config.behavior?.pagination?.showFirstLastButtons ?? true;
  }

  /**
   * Verifica se uma funcionalidade está disponível
   */
  isFeatureAvailable(feature: string): boolean {
    switch (feature) {
      case 'multiSort':
        return this.config.behavior?.sorting?.multiSort ?? false;
      case 'bulkActions':
        return this.config.actions?.bulk?.enabled ?? false;
      case 'rowActions':
        return this.config.actions?.row?.enabled ?? false;
      case 'globalFilter':
        return this.config.behavior?.filtering?.globalFilter?.enabled ?? false;
      case 'columnFilters':
        return this.config.behavior?.filtering?.columnFilters?.enabled ?? false;
      case 'export':
        return this.config.export?.enabled ?? false;
      case 'resizing':
        return this.config.behavior?.resizing?.enabled ?? false;
      case 'dragging':
        return this.config.behavior?.dragging?.columns ?? false;
      default:
        return false;
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];

    // Complete the data subject
    this.dataSubject.complete();
  }
}
