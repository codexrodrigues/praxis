export interface ColumnDefinition {
  field: string;
  title: string;
  /** Enable sorting for this column */
  sortable?: boolean;
}

export interface ToolbarAction {
  label: string;
  action: string;
  icon?: string;
}

export interface ToolbarConfig {
  /** Whether the toolbar should be shown */
  visible?: boolean;
  actions?: ToolbarAction[];
}

export interface ExportOptions {
  excel?: boolean;
  pdf?: boolean;
}

export interface GridMessageConfig {
  empty?: string;
  loading?: string;
  error?: string;
}

export interface PaginationOptions {
  pageSize: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  /** Total number of items for server side pagination */
  length?: number;
}

export interface GridOptions {
  pagination?: PaginationOptions;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
}

export interface TableConfig {
  /**
   * Column definitions describing how data should be displayed
   */
  columns: ColumnDefinition[];

  /**
   * Data to be rendered in the table
   */
  data: any[];

  /**
   * Whether an actions column should be added at the end
   */
  showActionsColumn?: boolean;

  /**
   * Grid behaviour configuration such as pagination and sorting
   */
  gridOptions?: GridOptions;

  /** Toolbar configuration */
  toolbar?: ToolbarConfig;

  /** Export options */
  exportOptions?: ExportOptions;

  /** Custom grid messages */
  messages?: GridMessageConfig;
}
