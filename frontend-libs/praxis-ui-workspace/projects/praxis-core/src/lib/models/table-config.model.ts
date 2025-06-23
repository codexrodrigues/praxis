export interface ColumnDefinition {
  field: string;
  title: string;
  /** Column render order */
  order?: number;
  /** Column visibility */
  visible?: boolean;
  /** Text alignment inside the cells */
  align?: string;
  /** Column width */
  width?: string;
  /** Extra CSS style applied to the cells */
  style?: string;
  /** Extra CSS style applied to the column header */
  headerStyle?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
}

export interface ToolbarAction {
  label: string;
  action: string;
  icon?: string;
  /** Material color palette */
  color?: string;
  /** Whether the action is currently disabled */
  disabled?: boolean;
}

export interface ToolbarConfig {
  /** Whether the toolbar should be shown */
  visible?: boolean;
  actions?: ToolbarAction[];
  /** Show default new record button */
  showNewButton?: boolean;
  newButtonText?: string;
  newButtonIcon?: string;
  newButtonColor?: string;
}

export interface RowAction {
  label: string;
  action: string;
  icon?: string;
  /** Material color palette */
  color?: string;
  /** Whether the action is currently disabled */
  disabled?: boolean;
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

  /** Row level actions configuration */
  rowActions?: RowAction[];
}
