export type ColumnDataType = 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'custom';

export interface ColumnDefinition {
  field: string;
  header: string;
  /** Column render order */
  order?: number;
  /** Column visibility */
  visible?: boolean;
  /** Text alignment inside the cells */
  align?: 'left' | 'center' | 'right';
  /** Column width */
  width?: string;
  /** Extra CSS style applied to the cells */
  style?: string;
  /** Extra CSS style applied to the column header */
  headerStyle?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Type of data expected in this column (user-configurable) */
  type?: ColumnDataType;
  /** Format string specific to the column type */
  format?: string;
  /** Define se a coluna deve ser fixa ao rolar horizontalmente */
  sticky?: 'start' | 'end' | boolean;
  /** Mapeamento de valores para exibição personalizada (ex: {0: 'Inativo', 1: 'Ativo'}) */
  valueMapping?: { [key: string | number]: string };
  /**
   * Estilização condicional para células desta coluna através de classes CSS.
   * A chave é o nome da classe CSS e o valor é uma função que retorna true se a classe deve ser aplicada.
   * Exemplo: { 'text-danger': (rowData, cellValue) => cellValue > 100 }
   */
  cellClassCondition?: { [className: string]: (rowData: any, cellValue: any) => boolean };

  /**
   * Estilização condicional para células desta coluna (estilos inline).
   * A chave é a propriedade CSS e o valor é uma função que retorna o valor do estilo.
   * Exemplo: { 'background-color': (rowData, cellValue) => cellValue > 100 ? 'red' : 'green' }
   */
  cellStyleCondition?: { [styleProperty: string]: (rowData: any, cellValue: any) => string };

  /** Original API field type for reference (read-only) */
  _originalApiType?: ColumnDataType;
  /** Indicates if this column originated from the API schema */
  _isApiField?: boolean;
  /** Generated value getter expression for calculated columns */
  _generatedValueGetter?: string;

  valueGetter?: string;
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

export interface SelectionOptions {
  /** Habilita a seleção de linhas */
  enabled: boolean;
  /** Define o tipo de seleção permitida */
  type: 'single' | 'multiple';
}

export interface TableConfig {
  /**
   * Column definitions describing how data should be displayed
   */
  columns: ColumnDefinition[];

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

  /** Configuração para seleção de linhas */
  selection?: SelectionOptions;

  /** Habilita o redimensionamento das colunas */
  resizableColumns?: boolean;

  /** Habilita a reorganização de colunas através de drag and drop */
  draggableColumns?: boolean;

  /** Ação a ser executada quando uma linha é clicada */
  rowClickAction?: string;
}
