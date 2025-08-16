import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, take, Subscription } from 'rxjs';
import { SettingsPanelService } from '@praxis/settings-panel';
import {
  ColumnDefinition,
  FieldDefinition,
  GenericCrudService,
  BatchDeleteProgress,
  BatchDeleteResult,
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
import { FilterConfigService } from './services/filter-config.service';
import { PraxisFilter, I18n } from './components/praxis-filter';
import { getActionId, ActionLike } from './utils/action-utils';

export interface RowActionConfig extends ActionLike {
  /**
   * Identifier of the action. Historically this property was named `id`
   * in some configurations, so both `action` and `id` are supported.
   */
  icon: string;
  label?: string;
  priority?: number;
  alwaysInline?: boolean;
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  autoDelete?: boolean;
}

export interface RowActionsBehavior {
  enabled: boolean;
  maxInline:
    | number
    | { xs: number; sm: number; md: number; lg: number }
    | 'auto';
  autoStrategy?: 'measure' | 'breakpoint';
}

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
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
    PraxisTableToolbar,
    PraxisFilter,
  ],
  template: `
    <ng-container *ngIf="toolbarV2; else legacyHeader">
      <div class="praxis-table-header" *ngIf="showToolbar || editModeEnabled">
        <praxis-table-toolbar
          *ngIf="showToolbar"
          [config]="config"
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
            [quickField]="
              config.behavior?.filtering?.advancedFilters?.settings?.quickField
            "
            [alwaysVisibleFields]="
              config.behavior?.filtering?.advancedFilters?.settings
                ?.alwaysVisibleFields
            "
            [allowSaveTags]="
              config.behavior?.filtering?.advancedFilters?.settings
                ?.allowSaveTags
            "
            [changeDebounceMs]="
              config.behavior?.filtering?.advancedFilters?.settings
                ?.changeDebounceMs ?? 300
            "
            [i18n]="getFilterI18n()"
            [mode]="
              config.behavior?.filtering?.advancedFilters?.settings?.mode ??
              'auto'
            "
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
          class="settings-button"
          aria-label="Configurações"
        >
          <mat-icon>settings</mat-icon>
        </button>
      </div>
    </ng-container>
    <ng-template #legacyHeader>
      <praxis-table-toolbar
        *ngIf="showToolbar"
        [config]="config"
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
          [quickField]="
            config.behavior?.filtering?.advancedFilters?.settings?.quickField
          "
          [alwaysVisibleFields]="
            config.behavior?.filtering?.advancedFilters?.settings
              ?.alwaysVisibleFields
          "
          [allowSaveTags]="
            config.behavior?.filtering?.advancedFilters?.settings?.allowSaveTags
          "
          [changeDebounceMs]="
            config.behavior?.filtering?.advancedFilters?.settings
              ?.changeDebounceMs ?? 300
          "
          [i18n]="getFilterI18n()"
          [mode]="
            config.behavior?.filtering?.advancedFilters?.settings?.mode ??
            'auto'
          "
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
    </ng-template>
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      (matSortChange)="onSortChange($event)"
      [matSortDisabled]="!getSortingEnabled()"
      class="mat-elevation-z8"
    >
      <ng-container
        *ngIf="config.behavior?.selection?.enabled"
        matColumnDef="_select"
      >
        <th mat-header-cell *matHeaderCellDef>
          <mat-checkbox
            (change)="masterToggle()"
            [checked]="isAllSelected()"
            [indeterminate]="selection.hasValue() && !isAllSelected()"
          ></mat-checkbox>
        </th>
        <td mat-cell *matCellDef="let row">
          <mat-checkbox
            (click)="$event.stopPropagation()"
            (change)="toggleRow(row)"
            [checked]="selection.isSelected(row)"
          ></mat-checkbox>
        </td>
      </ng-container>
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
        <th mat-header-cell *matHeaderCellDef #actionsHeaderCell></th>
        <td
          mat-cell
          *matCellDef="let row"
          class="praxis-actions-cell"
          [class.dense]="dense"
        >
          <!-- Ações inline -->
          <ng-container
            *ngFor="let a of getInlineRowActions(row); trackBy: trackAction"
          >
            <button
              mat-icon-button
              class="praxis-icon-btn"
              [disabled]="isActionDisabled(a, row)"
              (click)="onRowAction(getActionId(a), row, $event)"
              [matTooltip]="a.label || getActionId(a)"
              matTooltipPosition="above"
              matTooltipClass="praxis-tooltip"
              [attr.aria-label]="a.label || getActionId(a)"
            >
              <mat-icon>{{ a.icon }}</mat-icon>
            </button>
          </ng-container>

          <!-- Menu de overflow -->
          <button
            mat-icon-button
            class="praxis-icon-btn"
            *ngIf="hasOverflowRowActions(row)"
            [matMenuTriggerFor]="rowMoreMenu"
            aria-label="Mais ações"
          >
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #rowMoreMenu="matMenu" xPosition="before">
            <ng-container
              *ngFor="let a of getOverflowRowActions(row); trackBy: trackAction"
            >
              <button
                mat-menu-item
                (click)="onRowAction(getActionId(a), row, $event)"
                [disabled]="isActionDisabled(a, row)"
              >
                <mat-icon>{{ a.icon }}</mat-icon>
                <span>{{ a.label || getActionId(a) }}</span>
              </button>
            </ng-container>
          </mat-menu>
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

      .praxis-actions-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        padding-inline: 12px;
        gap: 8px;
        white-space: nowrap;
      }

      .praxis-actions-cell.dense {
        gap: 6px;
      }

      .praxis-icon-btn {
        width: 40px;
        height: 40px;
        border: 0;
        background: transparent;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        cursor: pointer;
        --mat-icon-button-state-layer-size: 40px;
      }

      .praxis-icon-btn:hover {
        background: var(--surface-2, rgba(255, 255, 255, 0.06));
      }

      .praxis-icon-btn:focus-visible {
        outline: 2px solid var(--primary, #48a1ff);
        outline-offset: 2px;
      }

      .praxis-icon-btn mat-icon,
      .praxis-icon-btn .mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        line-height: 22px;
      }

      .praxis-icon-btn.destructive mat-icon {
        color: #ff6b6b;
      }

      .mat-mdc-tooltip.praxis-tooltip {
        margin-top: -8px;
        margin-bottom: 8px;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .praxis-table-header {
        display: flex;
        align-items: center;
      }

      .settings-button {
        margin-left: auto;
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
  /** Enables new toolbar layout */
  @Input() toolbarV2 = true;

  /** Habilita exclusão automática */
  @Input() autoDelete = false;

  /** Enable edit mode */
  @Input() editModeEnabled = false;

  /** Dense mode reduces cell padding */
  @Input() dense = false;

  /** Identifier used for settings storage */
  @Input() tableId = 'default';

  @Output() rowClick = new EventEmitter<{ row: any; index: number }>();
  @Output() rowAction = new EventEmitter<{ action: string; row: any }>();
  @Output() toolbarAction = new EventEmitter<{ action: string }>();
  @Output() bulkAction = new EventEmitter<{ action: string; rows: any[] }>();

  @Output() beforeDelete = new EventEmitter<any>();
  @Output() afterDelete = new EventEmitter<any>();
  @Output() deleteError = new EventEmitter<{ row: any; error: unknown }>();

  @Output() beforeBulkDelete = new EventEmitter<any[]>();
  @Output() afterBulkDelete = new EventEmitter<any[]>();
  @Output() bulkDeleteError = new EventEmitter<{
    rows: any[];
    error: unknown;
  }>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('actionsHeaderCell') actionsHeaderCell?: ElementRef<HTMLElement>;

  @ContentChild(PraxisFilter) projectedFilter?: PraxisFilter;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  visibleColumns: ColumnDefinition[] = [];
  private dataSubject = new BehaviorSubject<any[]>([]);
  selection = new SelectionModel<any>(true, []);
  private pageIndex = 0;
  private pageSize = 5;
  private sortState: Sort = { active: '', direction: '' };
  private breakpoints = { xs: 0, sm: 600, md: 960, lg: 1280 };
  private measuredInline = 0;
  private resizeObserver?: ResizeObserver;
  readonly getActionId = getActionId;

  toggleRow(row: any): void {
    this.selection.toggle(row);
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  private isOverflowEnabled(): boolean {
    return this.config.actions?.row?.behavior?.enabled !== false;
  }

  private getMaxInline(): number {
    if (!this.isOverflowEnabled()) {
      return Number.MAX_SAFE_INTEGER;
    }
    const behavior = this.config.actions?.row?.behavior;
    const defaults = { xs: 1, sm: 2, md: 3, lg: 4 };
    const maxInline = behavior?.maxInline ?? defaults;
    if (maxInline === 'auto') {
      if (behavior?.autoStrategy === 'measure') {
        return this.measuredInline || this.getBreakpointMaxInline(defaults);
      }
      return this.getBreakpointMaxInline(defaults);
    }
    if (typeof maxInline === 'number') {
      return maxInline;
    }
    // Merge with defaults to ensure all properties are defined
    const breakpointConfig = {
      xs: maxInline.xs ?? defaults.xs,
      sm: maxInline.sm ?? defaults.sm,
      md: maxInline.md ?? defaults.md,
      lg: maxInline.lg ?? defaults.lg,
    };
    return this.getBreakpointMaxInline(breakpointConfig);
  }

  private getBreakpointMaxInline(b: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  }): number {
    const w = window.innerWidth;
    if (w >= this.breakpoints.lg) {
      return b.lg;
    }
    if (w >= this.breakpoints.md) {
      return b.md;
    }
    if (w >= this.breakpoints.sm) {
      return b.sm;
    }
    return b.xs;
  }

  private sortByPriority(actions: any[]): any[] {
    return [...actions].sort(
      (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
    );
  }

  isActionVisible(a: any, row: any): boolean {
    return typeof a.visible === 'function'
      ? !!a.visible(row)
      : a.visible !== false;
  }

  isActionDisabled(a: any, row: any): boolean {
    return typeof a.disabled === 'function' ? !!a.disabled(row) : !!a.disabled;
  }

  trackAction = (_: number, a: RowActionConfig) => this.getActionId(a);

  getInlineRowActions(row: any): any[] {
    const actions = this.sortByPriority(
      this.config.actions?.row?.actions ?? [],
    ).filter((a) => this.isActionVisible(a, row));
    const fixed = actions.filter((a) => a.alwaysInline);
    const remaining = actions.filter((a) => !a.alwaysInline);
    if (!this.isOverflowEnabled()) {
      return [...fixed, ...remaining];
    }
    const max = Math.max(0, this.getMaxInline() - fixed.length);
    return [...fixed, ...remaining.slice(0, max)];
  }

  getOverflowRowActions(row: any): any[] {
    if (!this.isOverflowEnabled()) {
      return [];
    }
    const actions = this.sortByPriority(
      this.config.actions?.row?.actions ?? [],
    ).filter((a) => this.isActionVisible(a, row));

    const inline = this.getInlineRowActions(row).map((a) =>
      this.getActionId(a),
    );
    return actions.filter((a) => !inline.includes(this.getActionId(a)));
  }

  hasOverflowRowActions(row: any): boolean {
    return (
      this.isOverflowEnabled() && this.getOverflowRowActions(row).length > 0
    );
  }

  private updateMeasuredInline(): void {
    if (!this.actionsHeaderCell) {
      return;
    }
    const width = this.actionsHeaderCell.nativeElement.offsetWidth;
    const iconWidth = this.dense ? 40 : 48;
    this.measuredInline = Math.floor(width / iconWidth);
  }

  private setupResizeObserver(): void {
    const behavior = this.config.actions?.row?.behavior;
    if (
      behavior?.maxInline === 'auto' &&
      behavior?.autoStrategy === 'measure' &&
      this.actionsHeaderCell
    ) {
      this.resizeObserver = new ResizeObserver(() =>
        this.updateMeasuredInline(),
      );
      this.resizeObserver.observe(this.actionsHeaderCell.nativeElement);
      this.updateMeasuredInline();
    }
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private crudService: GenericCrudService<any>,
    private cdr: ChangeDetectorRef,
    private settingsPanel: SettingsPanelService,
    private formattingService: DataFormattingService,
    @Inject(CONFIG_STORAGE) private configStorage: ConfigStorage,
    private tableDefaultsProvider: TableDefaultsProvider,
    private snackBar: MatSnackBar,
    private filterConfig: FilterConfigService,
  ) {
    this.subscriptions.push(
      this.dataSubject.subscribe((data) => {
        this.dataSource.data = data;
        this.selection.clear();
      }),
    );
  }

  ngOnInit(): void {
    const storedConfig = this.configStorage.loadConfig<TableConfig>(
      `table-config:${this.tableId}`,
    );
    if (storedConfig) {
      this.config = storedConfig;
    }
    this.showToolbar = !!(
      this.config.toolbar?.visible ||
      this.config.behavior?.filtering?.advancedFilters?.enabled
    );
    console.debug('[PraxisTable] Toolbar visibility on init', this.showToolbar);
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
      this.showToolbar = !!(
        this.config.toolbar?.visible ||
        this.config.behavior?.filtering?.advancedFilters?.enabled
      );
      console.debug(
        '[PraxisTable] Toolbar visibility on config change',
        this.showToolbar,
      );
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
    this.setupResizeObserver();
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
    console.debug('[PraxisTable] onRowClicked', { index, rowId: row?.id });
    this.rowClick.emit({ row, index });
  }

  onRowAction(action: string, row: any, event: Event): void {
    console.debug('[PraxisTable] onRowAction: click received', {
      action,
      rowId: row?.id,
      target: (event?.target as HTMLElement)?.tagName,
    });
    event.stopPropagation();
    (event.target as HTMLElement).blur?.();

    const cfg = this.config.actions?.row?.actions.find(
      (a) => this.getActionId(a) === action,
    );
    const cfgAutoDelete = cfg?.autoDelete;
    const willAutoDelete = action === 'delete' && !!(this.autoDelete || cfgAutoDelete);
    console.debug('[PraxisTable] onRowAction: resolved config', {
      foundConfig: !!cfg,
      cfgAutoDelete,
      inputAutoDelete: this.autoDelete,
      willAutoDelete,
    });

    if (willAutoDelete) {
      try {
        this.beforeDelete.emit(row);
        console.debug('[PraxisTable] onRowAction: beforeDelete emitted', { rowId: row?.id });
      } catch (e) {
        console.warn('[PraxisTable] onRowAction: beforeDelete emit error', e);
      }

      this.snackBar.open(
        this.config.messages?.actions?.progress?.delete || 'Removendo...',
      );
      console.debug('[PraxisTable] onRowAction: calling crudService.delete', { id: row?.id });
      this.crudService.delete(row.id).subscribe({
        next: () => {
          console.debug('[PraxisTable] onRowAction: delete success', { id: row?.id });
          this.snackBar.open(
            this.config.messages?.actions?.success?.delete || 'Registro removido',
            undefined,
            { duration: 3000 },
          );
          try {
            this.afterDelete.emit(row);
            console.debug('[PraxisTable] onRowAction: afterDelete emitted', { id: row?.id });
          } catch (e) {
            console.warn('[PraxisTable] onRowAction: afterDelete emit error', e);
          }
          this.fetchData();
        },
        error: (error) => {
          console.error('[PraxisTable] onRowAction: delete error', { id: row?.id, error });
          this.snackBar.open(
            this.config.messages?.actions?.errors?.delete || 'Erro ao remover',
            undefined,
            { duration: 3000 },
          );
          try {
            this.deleteError.emit({ row, error });
          } catch (e) {
            console.warn('[PraxisTable] onRowAction: deleteError emit error', e);
          }
        },
      });
    } else {
      console.debug('[PraxisTable] onRowAction: emitting rowAction', { action, rowId: row?.id });
      this.rowAction.emit({ action, row });
    }
  }

  onToolbarAction(event: { action: string }): void {
    console.debug('[PraxisTable] onToolbarAction received', event);
    const bulk = this.config.actions?.bulk?.actions.find(
      (a) => this.getActionId(a) === event.action,
    );
    if (bulk) {
      if (event.action === 'delete' && (this.autoDelete || bulk.autoDelete)) {
        const rows = this.selection.selected.slice();
        const ids = rows.map((r) => r.id);
        console.debug('[PraxisTable] onToolbarAction: bulk delete requested', { count: rows.length, ids });
        this.beforeBulkDelete.emit(rows);
        const progress = (e: BatchDeleteProgress) => {
          this.snackBar.open(
            (this.config.messages?.actions?.progress?.deleteMultiple || 'Removendo...') + ` ${e.index}/${e.total}`,
            undefined,
            { duration: 1000 },
          );
        };
        this.crudService.deleteMany(ids, { progress }).subscribe({
          next: (result: BatchDeleteResult) => {
            console.debug('[PraxisTable] onToolbarAction: bulk delete result', result);
            if (result.errors.length) {
              this.snackBar.open(
                this.config.messages?.actions?.errors?.delete || 'Erro ao remover',
                undefined,
                { duration: 3000 },
              );
              const failedIds = new Set(result.errors.map((e) => e.id));
              const failedRows = rows.filter((r) => failedIds.has(r.id));
              this.selection.clear();
              failedRows.forEach((r) => this.selection.select(r));
              this.bulkDeleteError.emit({ rows: failedRows, error: result.errors });
            } else {
              this.snackBar.open(
                this.config.messages?.actions?.success?.delete || 'Registros removidos',
                undefined,
                { duration: 3000 },
              );
              this.afterBulkDelete.emit(rows);
              this.selection.clear();
            }
            this.fetchData();
          },
          error: (error) => {
            console.error('[PraxisTable] onToolbarAction: bulk delete error', error);
            this.snackBar.open(
              this.config.messages?.actions?.errors?.delete || 'Erro ao remover',
              undefined,
              { duration: 3000 },
            );
            this.bulkDeleteError.emit({ rows, error });
          },
        });
      } else {
        console.debug('[PraxisTable] onToolbarAction: emitting bulkAction', { action: event.action, selected: this.selection.selected.length });
        this.bulkAction.emit({ action: event.action, rows: this.selection.selected });
      }
    } else {
      console.debug('[PraxisTable] onToolbarAction: emitting toolbarAction', event);
      this.toolbarAction.emit(event);
    }
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
    const filterSettings =
      cfg.behavior?.filtering?.advancedFilters?.settings ?? {};
    this.filterConfig.save(`${this.tableId}-filter`, filterSettings);
    this.showToolbar = !!(
      cfg.toolbar?.visible || cfg.behavior?.filtering?.advancedFilters?.enabled
    );
    console.debug(
      '[PraxisTable] Toolbar visibility after apply',
      this.showToolbar,
    );
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
    if (this.config.behavior?.selection?.enabled) {
      this.displayedColumns.unshift('_select');
    }
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
        console.error('PTABLE:formula:error', error, column);
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
        console.error('PTABLE:format:error', error, { value, column });
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
      console.error('PTABLE:property:access:error', error, { obj, path });
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

  /**
   * Obtém configurações de i18n para o filtro baseado na configuração da tabela
   */
  getFilterI18n(): Partial<I18n> | undefined {
    const placeholder =
      this.config.behavior?.filtering?.advancedFilters?.settings?.placeholder;
    return placeholder ? { searchPlaceholder: placeholder } : undefined;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];

    // Complete the data subject
    this.dataSubject.complete();
  }
}
