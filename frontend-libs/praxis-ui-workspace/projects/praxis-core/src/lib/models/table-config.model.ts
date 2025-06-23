export interface TableColumn {
  field: string;
  title: string;
}

export interface PaginationOptions {
  pageSize: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
}

export interface GridOptions {
  pagination?: PaginationOptions;
  sortable?: boolean;
}

export interface TableConfig {
  /**
   * Column definitions describing how data should be displayed
   */
  columns: TableColumn[];

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
}
