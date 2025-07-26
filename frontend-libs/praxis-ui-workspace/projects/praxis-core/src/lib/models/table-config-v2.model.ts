/**
 * Nova arquitetura modular do TableConfig v2.0
 * Preparada para crescimento exponencial e alinhada com as 5 abas do editor
 */

// =============================================================================
// DEFINIÇÕES DE COLUNA
// =============================================================================

export interface ColumnDefinition {
  /** Campo da fonte de dados */
  field: string;
  
  /** Cabeçalho da coluna */
  header: string;
  
  /** Tipo de dados para formatação */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'custom';
  
  /** Largura da coluna */
  width?: string;
  
  /** Visibilidade da coluna */
  visible?: boolean;
  
  /** Permitir ordenação */
  sortable?: boolean;
  
  /** Permitir filtragem */
  filterable?: boolean;
  
  /** Permitir redimensionamento */
  resizable?: boolean;
  
  /** Coluna fixa (sticky) */
  sticky?: boolean;
  
  /** Alinhamento do conteúdo */
  align?: 'left' | 'center' | 'right';
  
  /** Ordem de exibição */
  order?: number;
  
  /** Estilo CSS personalizado */
  style?: string;
  
  /** Estilo CSS do cabeçalho */
  headerStyle?: string;
  
  /** Classe CSS personalizada */
  cssClass?: string;
  
  /** Classe CSS do cabeçalho */
  headerCssClass?: string;
  
  /** Formato de exibição dos dados */
  format?: any;
  
  /** Mapeamento de valores para exibição */
  valueMapping?: { [key: string | number]: string };
  
  /** Getter personalizado para valor calculado */
  _generatedValueGetter?: string;
  
  /** Tipo original da API */
  _originalApiType?: string;
  
  /** Flag indicando se veio da API */
  _isApiField?: boolean;
}

// =============================================================================
// METADADOS E VERSIONAMENTO
// =============================================================================

export interface ConfigMetadata {
  /** Versão da configuração para migração automática */
  version?: string;
  
  /** Identificador único da configuração */
  id?: string;
  
  /** Nome amigável da configuração */
  name?: string;
  
  /** Descrição da configuração */
  description?: string;
  
  /** Tags para categorização e busca */
  tags?: string[];
  
  /** Data de criação */
  createdAt?: string;
  
  /** Data de última modificação */
  updatedAt?: string;
  
  /** Autor da configuração */
  author?: string;
  
  /** Se é um template ou configuração específica */
  isTemplate?: boolean;
  
  /** Configuração derivada de outra (parent ID) */
  derivedFrom?: string;
}

// =============================================================================
// ABA: VISÃO GERAL & COMPORTAMENTO
// =============================================================================

export interface TableBehaviorConfig {
  /** Configurações de paginação */
  pagination?: PaginationConfig;
  
  /** Configurações de ordenação */
  sorting?: SortingConfig;
  
  /** Configurações de filtragem */
  filtering?: FilteringConfig;
  
  /** Configurações de seleção de linhas */
  selection?: SelectionConfig;
  
  /** Configurações de interação do usuário */
  interaction?: InteractionConfig;
  
  /** Configurações de carregamento e estados */
  loading?: LoadingConfig;
  
  /** Configurações para estado vazio */
  emptyState?: EmptyStateConfig;
  
  /** Configurações de virtualização para performance */
  virtualization?: VirtualizationConfig;
  
  /** Configurações de redimensionamento */
  resizing?: ResizingConfig;
  
  /** Configurações de reorganização por drag & drop */
  dragging?: DraggingConfig;
}

export interface PaginationConfig {
  /** Habilitar paginação */
  enabled: boolean;
  
  /** Tamanho inicial da página */
  pageSize: number;
  
  /** Opções de tamanho de página disponíveis */
  pageSizeOptions: number[];
  
  /** Mostrar botões primeira/última página */
  showFirstLastButtons: boolean;
  
  /** Mostrar números das páginas */
  showPageNumbers: boolean;
  
  /** Mostrar info de página (ex: "1-10 de 100") */
  showPageInfo: boolean;
  
  /** Posição da paginação */
  position: 'top' | 'bottom' | 'both';
  
  /** Estilo da paginação */
  style: 'default' | 'simple' | 'advanced' | 'compact';
  
  /** Total de itens (para paginação server-side) */
  totalItems?: number;
  
  /** Estratégia de paginação */
  strategy: 'client' | 'server';
  
  /** Configurações avançadas */
  advanced?: {
    /** Jump to page input */
    showJumpToPage?: boolean;
    /** Page size customization */
    allowCustomPageSize?: boolean;
    /** Maximum page size allowed */
    maxPageSize?: number;
  };
}

export interface SortingConfig {
  /** Habilitar ordenação */
  enabled: boolean;
  
  /** Ordenação padrão inicial */
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
  
  /** Permitir ordenação múltipla */
  multiSort: boolean;
  
  /** Estratégia de ordenação */
  strategy: 'client' | 'server';
  
  /** Mostrar indicadores visuais de ordenação */
  showSortIndicators: boolean;
  
  /** Posição dos indicadores */
  indicatorPosition: 'start' | 'end';
  
  /** Permitir remover ordenação (terceiro clique) */
  allowClearSort: boolean;
  
  /** Configurações avançadas */
  advanced?: {
    /** Função de comparação customizada para ordenação client-side */
    customComparators?: { [column: string]: (a: any, b: any) => number };
    /** Preservar ordenação entre atualizações de dados */
    preserveSort?: boolean;
  };
}

export interface FilteringConfig {
  /** Habilitar filtragem global */
  enabled: boolean;
  
  /** Filtro global (search box) */
  globalFilter?: {
    enabled: boolean;
    placeholder: string;
    position: 'toolbar' | 'top' | 'bottom';
    /** Colunas incluídas no filtro global */
    searchableColumns?: string[];
    /** Busca case-sensitive */
    caseSensitive?: boolean;
    /** Busca usando regex */
    allowRegex?: boolean;
  };
  
  /** Filtros por coluna */
  columnFilters?: {
    enabled: boolean;
    /** Tipo de filtro padrão */
    defaultType: 'text' | 'select' | 'date' | 'number' | 'boolean';
    /** Posição dos filtros */
    position: 'header' | 'subheader' | 'sidebar';
  };
  
  /** Filtros avançados */
  advancedFilters?: {
    enabled: boolean;
    /** Interface de query builder */
    queryBuilder?: boolean;
    /** Salvar filtros como presets */
    savePresets?: boolean;
  };
  
  /** Estratégia de filtragem */
  strategy: 'client' | 'server';
  
  /** Debounce para filtros em tempo real (ms) */
  debounceTime: number;
}

export interface SelectionConfig {
  /** Habilitar seleção de linhas */
  enabled: boolean;
  
  /** Tipo de seleção */
  type: 'single' | 'multiple';
  
  /** Modo de seleção */
  mode: 'checkbox' | 'row' | 'both';
  
  /** Permitir selecionar todas as linhas */
  allowSelectAll: boolean;
  
  /** Posição do checkbox de seleção */
  checkboxPosition: 'start' | 'end';
  
  /** Manter seleção entre páginas */
  persistSelection: boolean;
  
  /** Manter seleção entre atualizações de dados */
  persistOnDataUpdate: boolean;
  
  /** Máximo de itens selecionáveis */
  maxSelections?: number;
  
  /** Configurações visuais */
  visual?: {
    /** Highlight da linha selecionada */
    highlightSelected: boolean;
    /** Cor do highlight */
    highlightColor?: string;
    /** Mostrar contador de selecionados */
    showSelectionCount: boolean;
  };
}

export interface InteractionConfig {
  /** Ação ao clicar na linha */
  rowClick?: {
    enabled: boolean;
    action: 'select' | 'edit' | 'view' | 'custom';
    /** Função customizada para row click */
    customAction?: string;
  };
  
  /** Ação ao dar duplo clique na linha */
  rowDoubleClick?: {
    enabled: boolean;
    action: 'edit' | 'view' | 'custom';
    customAction?: string;
  };
  
  /** Hover effects */
  hover?: {
    enabled: boolean;
    /** Highlight na linha */
    highlightRow: boolean;
    /** Mostrar ações no hover */
    showActionsOnHover: boolean;
  };
  
  /** Configurações de teclado */
  keyboard?: {
    enabled: boolean;
    /** Navegação com setas */
    arrowNavigation: boolean;
    /** Seleção com espaço */
    spaceSelection: boolean;
    /** Atalhos personalizados */
    customShortcuts?: { [key: string]: string };
  };
}

export interface LoadingConfig {
  /** Tipo de loading indicator */
  type: 'spinner' | 'skeleton' | 'progress' | 'custom';
  
  /** Posição do loading */
  position: 'overlay' | 'inline' | 'replace';
  
  /** Texto durante carregamento */
  text?: string;
  
  /** Mostrar loading para operações rápidas */
  showForQuickOperations: boolean;
  
  /** Delay antes de mostrar loading (ms) */
  delay: number;
  
  /** Configurações de skeleton loading */
  skeleton?: {
    rows: number;
    /** Animar skeleton */
    animated: boolean;
    /** Cor base do skeleton */
    baseColor?: string;
    /** Cor do highlight */
    highlightColor?: string;
  };
}

export interface EmptyStateConfig {
  /** Mensagem para estado vazio */
  message: string;
  
  /** Ícone para estado vazio */
  icon?: string;
  
  /** Imagem para estado vazio */
  image?: string;
  
  /** Ações disponíveis no estado vazio */
  actions?: Array<{
    label: string;
    action: string;
    icon?: string;
    primary?: boolean;
  }>;
  
  /** Template customizado */
  customTemplate?: string;
  
  /** Configurações específicas por contexto */
  contexts?: {
    /** Estado inicial (sem dados carregados) */
    initial?: Partial<EmptyStateConfig>;
    /** Após filtros aplicados */
    filtered?: Partial<EmptyStateConfig>;
    /** Após busca sem resultados */
    searched?: Partial<EmptyStateConfig>;
  };
}

export interface VirtualizationConfig {
  /** Habilitar virtualização */
  enabled: boolean;
  
  /** Altura de cada linha (px) */
  itemHeight: number;
  
  /** Número de itens para buffer */
  bufferSize: number;
  
  /** Altura mínima do container */
  minContainerHeight: number;
  
  /** Estratégia de virtualização */
  strategy: 'fixed' | 'dynamic';
}

export interface ResizingConfig {
  /** Habilitar redimensionamento de colunas */
  enabled: boolean;
  
  /** Largura mínima das colunas */
  minColumnWidth: number;
  
  /** Largura máxima das colunas */
  maxColumnWidth?: number;
  
  /** Auto-fit ao conteúdo */
  autoFit: boolean;
  
  /** Preservar larguras entre sessões */
  persistWidths: boolean;
}

export interface DraggingConfig {
  /** Habilitar reorganização de colunas */
  columns: boolean;
  
  /** Habilitar reorganização de linhas */
  rows: boolean;
  
  /** Indicador visual durante drag */
  showDragIndicator: boolean;
  
  /** Zona de drop para colunas */
  columnDropZones?: string[];
}

// =============================================================================
// ABA: VISÃO GERAL & COMPORTAMENTO - APARÊNCIA
// =============================================================================

export interface TableAppearanceConfig {
  /** Densidade da tabela */
  density: 'compact' | 'comfortable' | 'spacious';
  
  /** Configurações de bordas */
  borders?: BorderConfig;
  
  /** Configurações de cores */
  colors?: ColorConfig;
  
  /** Configurações de fonte */
  typography?: TypographyConfig;
  
  /** Configurações de espaçamento */
  spacing?: SpacingConfig;
  
  /** Configurações de animações */
  animations?: AnimationConfig;
  
  /** Configurações de responsividade */
  responsive?: ResponsiveConfig;
  
  /** Configurações de elevação/sombra */
  elevation?: ElevationConfig;
}

export interface BorderConfig {
  /** Mostrar bordas entre linhas */
  showRowBorders: boolean;
  
  /** Mostrar bordas entre colunas */
  showColumnBorders: boolean;
  
  /** Mostrar borda externa */
  showOuterBorder: boolean;
  
  /** Estilo da borda */
  style: 'solid' | 'dashed' | 'dotted';
  
  /** Largura da borda */
  width: number;
  
  /** Cor da borda */
  color?: string;
  
  /** Bordas específicas */
  specific?: {
    header?: Partial<BorderConfig>;
    footer?: Partial<BorderConfig>;
    sticky?: Partial<BorderConfig>;
  };
}

export interface ColorConfig {
  /** Cor de fundo da tabela */
  background?: string;
  
  /** Cor de fundo do cabeçalho */
  headerBackground?: string;
  
  /** Cor de fundo de linhas alternadas */
  alternateRowBackground?: string;
  
  /** Cor de fundo no hover */
  hoverBackground?: string;
  
  /** Cor de fundo para linhas selecionadas */
  selectedBackground?: string;
  
  /** Cor do texto */
  textColor?: string;
  
  /** Cor do texto do cabeçalho */
  headerTextColor?: string;
  
  /** Paleta de cores para estados */
  states?: {
    error?: string;
    warning?: string;
    success?: string;
    info?: string;
  };
}

export interface TypographyConfig {
  /** Família da fonte */
  fontFamily?: string;
  
  /** Tamanho da fonte do conteúdo */
  fontSize?: string;
  
  /** Tamanho da fonte do cabeçalho */
  headerFontSize?: string;
  
  /** Peso da fonte */
  fontWeight?: number | string;
  
  /** Peso da fonte do cabeçalho */
  headerFontWeight?: number | string;
  
  /** Altura da linha */
  lineHeight?: string;
  
  /** Espaçamento entre letras */
  letterSpacing?: string;
}

export interface SpacingConfig {
  /** Padding das células */
  cellPadding?: string;
  
  /** Padding do cabeçalho */
  headerPadding?: string;
  
  /** Altura das linhas */
  rowHeight?: number;
  
  /** Altura do cabeçalho */
  headerHeight?: number;
  
  /** Espaçamento entre tabela e container */
  containerSpacing?: string;
}

export interface AnimationConfig {
  /** Habilitar animações */
  enabled: boolean;
  
  /** Duração das animações (ms) */
  duration: number;
  
  /** Função de easing */
  easing: string;
  
  /** Animações específicas */
  specific?: {
    /** Animação ao carregar */
    loading?: boolean;
    /** Animação de hover */
    hover?: boolean;
    /** Animação de seleção */
    selection?: boolean;
    /** Animação de ordenação */
    sorting?: boolean;
  };
}

export interface ResponsiveConfig {
  /** Pontos de quebra */
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  
  /** Comportamento em dispositivos móveis */
  mobile?: {
    /** Scroll horizontal */
    horizontalScroll?: boolean;
    /** Colapsar colunas */
    collapseColumns?: boolean;
    /** Colunas prioritárias */
    priorityColumns?: string[];
    /** Modo de cards em mobile */
    cardMode?: boolean;
  };
  
  /** Ajustes automáticos */
  autoAdjust?: {
    /** Ocultar colunas automaticamente */
    hideColumns?: boolean;
    /** Reduzir font size */
    scaleFontSize?: boolean;
    /** Ajustar padding */
    adjustPadding?: boolean;
  };
}

export interface ElevationConfig {
  /** Nível de elevação */
  level: number;
  
  /** Cor da sombra */
  shadowColor?: string;
  
  /** Elevação no hover */
  hoverElevation?: number;
}

// =============================================================================
// ABA: BARRA DE FERRAMENTAS & AÇÕES
// =============================================================================

export interface ToolbarConfig {
  /** Visibilidade da toolbar */
  visible: boolean;
  
  /** Posição da toolbar */
  position: 'top' | 'bottom' | 'both';
  
  /** Configurações de layout */
  layout?: ToolbarLayoutConfig;
  
  /** Título da tabela */
  title?: string;
  
  /** Subtítulo da tabela */
  subtitle?: string;
  
  /** Ações da toolbar */
  actions?: ToolbarAction[];
  
  /** Configurações de busca na toolbar */
  search?: ToolbarSearchConfig;
  
  /** Configurações de filtros na toolbar */
  filters?: ToolbarFilterConfig;
  
  /** Menu de configurações */
  settingsMenu?: ToolbarSettingsConfig;
}

export interface ToolbarLayoutConfig {
  /** Alinhamento do conteúdo */
  alignment: 'start' | 'center' | 'end' | 'space-between';
  
  /** Altura da toolbar */
  height?: number;
  
  /** Padding da toolbar */
  padding?: string;
  
  /** Cor de fundo */
  backgroundColor?: string;
  
  /** Mostrar separador */
  showSeparator: boolean;
}

export interface ToolbarAction {
  /** ID único da ação */
  id: string;
  
  /** Label da ação */
  label: string;
  
  /** Ícone da ação */
  icon?: string;
  
  /** Tipo do botão */
  type: 'button' | 'icon' | 'fab' | 'menu';
  
  /** Cor do Material */
  color?: 'primary' | 'accent' | 'warn';
  
  /** Ação desabilitada */
  disabled?: boolean;
  
  /** Função a executar */
  action: string;
  
  /** Tooltip */
  tooltip?: string;
  
  /** Tecla de atalho */
  shortcut?: string;
  
  /** Posição na toolbar */
  position: 'start' | 'end';
  
  /** Ordem de exibição */
  order?: number;
  
  /** Visibilidade condicional */
  visibleWhen?: string;
  
  /** Sub-ações (para menus) */
  children?: ToolbarAction[];
}

export interface ToolbarSearchConfig {
  /** Habilitar busca na toolbar */
  enabled: boolean;
  
  /** Placeholder da busca */
  placeholder: string;
  
  /** Posição da busca */
  position: 'start' | 'center' | 'end';
  
  /** Largura da busca */
  width?: string;
  
  /** Ícone da busca */
  icon?: string;
  
  /** Busca em tempo real */
  realtime: boolean;
  
  /** Delay para busca em tempo real (ms) */
  delay: number;
}

export interface ToolbarFilterConfig {
  /** Habilitar filtros rápidos na toolbar */
  enabled: boolean;
  
  /** Filtros rápidos disponíveis */
  quickFilters?: Array<{
    id: string;
    label: string;
    filter: any;
    icon?: string;
  }>;
  
  /** Mostrar botão de filtros avançados */
  showAdvancedButton: boolean;
}

export interface ToolbarSettingsConfig {
  /** Habilitar menu de configurações */
  enabled: boolean;
  
  /** Configurações disponíveis */
  options?: Array<{
    id: string;
    label: string;
    type: 'toggle' | 'select' | 'action';
    value?: any;
    options?: any[];
  }>;
}

export interface TableActionsConfig {
  /** Ações por linha */
  row?: RowActionsConfig;
  
  /** Ações em lote */
  bulk?: BulkActionsConfig;
  
  /** Ações de contexto (menu com botão direito) */
  context?: ContextActionsConfig;
  
  /** Configurações de confirmação */
  confirmations?: ConfirmationConfig;
}

export interface RowActionsConfig {
  /** Habilitar ações por linha */
  enabled: boolean;
  
  /** Posição das ações */
  position: 'start' | 'end';
  
  /** Largura da coluna de ações */
  width?: string;
  
  /** Ações disponíveis */
  actions: RowAction[];
  
  /** Formato de exibição */
  display: 'menu' | 'buttons' | 'icons';
  
  /** Trigger para mostrar ações */
  trigger: 'hover' | 'always' | 'click';
  
  /** Ícone do menu de ações */
  menuIcon?: string;
  
  /** Número máximo de ações visíveis */
  maxVisibleActions?: number;
}

export interface RowAction {
  /** ID único da ação */
  id: string;
  
  /** Label da ação */
  label: string;
  
  /** Ícone da ação */
  icon?: string;
  
  /** Cor da ação */
  color?: string;
  
  /** Ação desabilitada */
  disabled?: boolean;
  
  /** Função a executar */
  action: string;
  
  /** Tooltip */
  tooltip?: string;
  
  /** Requer confirmação */
  requiresConfirmation?: boolean;
  
  /** Visibilidade condicional */
  visibleWhen?: string;
  
  /** Separador após esta ação */
  separator?: boolean;
}

export interface BulkActionsConfig {
  /** Habilitar ações em lote */
  enabled: boolean;
  
  /** Posição das ações em lote */
  position: 'toolbar' | 'floating' | 'both';
  
  /** Ações disponíveis */
  actions: BulkAction[];
  
  /** Configurações do floating action button */
  floating?: {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** Ocultar quando nada selecionado */
    hideWhenEmpty: boolean;
  };
}

export interface BulkAction {
  /** ID único da ação */
  id: string;
  
  /** Label da ação */
  label: string;
  
  /** Ícone da ação */
  icon?: string;
  
  /** Cor da ação */
  color?: string;
  
  /** Função a executar */
  action: string;
  
  /** Requer confirmação */
  requiresConfirmation?: boolean;
  
  /** Mínimo de itens selecionados */
  minSelections?: number;
  
  /** Máximo de itens selecionados */
  maxSelections?: number;
}

export interface ContextActionsConfig {
  /** Habilitar menu de contexto */
  enabled: boolean;
  
  /** Ações do menu de contexto */
  actions: ContextAction[];
  
  /** Trigger para menu de contexto */
  trigger: 'right-click' | 'long-press' | 'both';
}

export interface ContextAction {
  /** ID único da ação */
  id: string;
  
  /** Label da ação */
  label: string;
  
  /** Ícone da ação */
  icon?: string;
  
  /** Função a executar */
  action: string;
  
  /** Separador após esta ação */
  separator?: boolean;
  
  /** Visibilidade condicional */
  visibleWhen?: string;
}

export interface ConfirmationConfig {
  /** Configurações padrão de confirmação */
  default?: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  };
  
  /** Configurações específicas por ação */
  specific?: { [actionId: string]: Partial<ConfirmationConfig['default']> };
}

// =============================================================================
// ABA: BARRA DE FERRAMENTAS & AÇÕES - EXPORTAÇÃO
// =============================================================================

export interface ExportConfig {
  /** Habilitar exportação */
  enabled: boolean;
  
  /** Formatos disponíveis */
  formats: ExportFormat[];
  
  /** Configurações por formato */
  excel?: ExcelExportConfig;
  pdf?: PdfExportConfig;
  csv?: CsvExportConfig;
  json?: JsonExportConfig;
  
  /** Configurações gerais */
  general?: GeneralExportConfig;
  
  /** Templates personalizados */
  templates?: ExportTemplate[];
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json' | 'print';

export interface GeneralExportConfig {
  /** Incluir cabeçalhos */
  includeHeaders: boolean;
  
  /** Incluir filtros aplicados na exportação */
  respectFilters: boolean;
  
  /** Incluir apenas linhas selecionadas */
  selectedRowsOnly?: boolean;
  
  /** Máximo de linhas para exportar */
  maxRows?: number;
  
  /** Nome do arquivo padrão */
  defaultFileName?: string;
  
  /** Colunas a incluir na exportação */
  includeColumns?: string[] | 'all' | 'visible';
  
  /** Aplicar formatações das colunas */
  applyFormatting: boolean;
}

export interface ExcelExportConfig {
  /** Nome da planilha */
  sheetName: string;
  
  /** Incluir fórmulas nas células */
  includeFormulas: boolean;
  
  /** Congelar linha de cabeçalho */
  freezeHeaders: boolean;
  
  /** Auto-ajustar largura das colunas */
  autoFitColumns: boolean;
  
  /** Configurações de estilo */
  styling?: ExcelStylingConfig;
  
  /** Múltiplas planilhas */
  multipleSheets?: boolean;
}

export interface ExcelStylingConfig {
  /** Estilo do cabeçalho */
  headerStyle?: {
    backgroundColor?: string;
    fontColor?: string;
    fontWeight?: 'bold' | 'normal';
    fontSize?: number;
  };
  
  /** Estilo das células */
  cellStyle?: {
    fontSize?: number;
    borderStyle?: 'thin' | 'medium' | 'thick';
  };
  
  /** Linhas alternadas */
  alternateRows?: {
    enabled: boolean;
    color?: string;
  };
}

export interface PdfExportConfig {
  /** Orientação da página */
  orientation: 'portrait' | 'landscape';
  
  /** Tamanho da página */
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  
  /** Margens da página */
  margins: MarginConfig;
  
  /** Cabeçalho do documento */
  header?: string;
  
  /** Rodapé do documento */
  footer?: string;
  
  /** Marca d'água */
  watermark?: string;
  
  /** Configurações de fonte */
  font?: {
    family?: string;
    size?: number;
  };
  
  /** Quebra de página automática */
  autoPageBreak: boolean;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CsvExportConfig {
  /** Separador de campos */
  delimiter: ',' | ';' | '|' | '\t';
  
  /** Caractere de escape */
  escapeChar: string;
  
  /** Encoding do arquivo */
  encoding: 'utf-8' | 'utf-16' | 'iso-8859-1';
  
  /** Incluir BOM */
  includeBOM: boolean;
}

export interface JsonExportConfig {
  /** Formato do JSON */
  format: 'pretty' | 'compact';
  
  /** Incluir metadados */
  includeMetadata: boolean;
  
  /** Estrutura dos dados */
  structure: 'array' | 'object';
}

export interface ExportTemplate {
  /** ID único do template */
  id: string;
  
  /** Nome do template */
  name: string;
  
  /** Descrição */
  description?: string;
  
  /** Formato do template */
  format: ExportFormat;
  
  /** Configurações específicas */
  config: any;
  
  /** Template padrão do sistema */
  isDefault?: boolean;
}

// =============================================================================
// ABA: MENSAGENS & LOCALIZAÇÃO
// =============================================================================

export interface MessagesConfig {
  /** Mensagens de estado */
  states?: StateMessagesConfig;
  
  /** Mensagens de ações */
  actions?: ActionMessagesConfig;
  
  /** Mensagens de validação */
  validation?: ValidationMessagesConfig;
  
  /** Mensagens de exportação */
  export?: ExportMessagesConfig;
  
  /** Mensagens customizadas */
  custom?: { [key: string]: string };
  
  /** Templates de mensagem com interpolação */
  templates?: MessageTemplate[];
}

export interface StateMessagesConfig {
  /** Carregando dados */
  loading: string;
  
  /** Nenhum dado disponível */
  empty: string;
  
  /** Erro ao carregar */
  error: string;
  
  /** Nenhum resultado encontrado */
  noResults: string;
  
  /** Carregando mais dados */
  loadingMore: string;
  
  /** Mensagens dinâmicas com contador */
  dynamic?: {
    /** Função para mensagem de loading com contagem */
    loadingWithCount?: (count: number) => string;
    /** Função para estado vazio com filtros */
    emptyWithFilter?: (filterCount: number) => string;
    /** Função para resultado de busca */
    searchResults?: (resultCount: number, searchTerm: string) => string;
  };
}

export interface ActionMessagesConfig {
  /** Mensagens de confirmação */
  confirmations?: {
    delete: string;
    deleteMultiple: string;
    save: string;
    cancel: string;
    export: string;
  };
  
  /** Mensagens de sucesso */
  success?: {
    save: string;
    delete: string;
    export: string;
    import: string;
  };
  
  /** Mensagens de erro */
  errors?: {
    save: string;
    delete: string;
    export: string;
    network: string;
    permission: string;
  };
}

export interface ValidationMessagesConfig {
  /** Mensagens de validação de dados */
  required: string;
  invalid: string;
  tooLong: string;
  tooShort: string;
  
  /** Mensagens específicas por tipo */
  types?: {
    email: string;
    url: string;
    number: string;
    date: string;
  };
}

export interface ExportMessagesConfig {
  /** Iniciando exportação */
  starting: string;
  
  /** Processando dados */
  processing: string;
  
  /** Download pronto */
  ready: string;
  
  /** Erro na exportação */
  error: string;
  
  /** Mensagens por formato */
  formats?: {
    excel: string;
    pdf: string;
    csv: string;
    json: string;
  };
}

export interface MessageTemplate {
  /** ID único do template */
  id: string;
  
  /** Template da mensagem com placeholders */
  template: string;
  
  /** Variáveis disponíveis */
  variables?: string[];
  
  /** Função de interpolação customizada */
  interpolate?: (template: string, data: any) => string;
}

export interface LocalizationConfig {
  /** Idioma principal */
  locale: string;
  
  /** Idiomas disponíveis */
  availableLocales?: string[];
  
  /** Direção do texto */
  direction: 'ltr' | 'rtl';
  
  /** Configurações de data/hora */
  dateTime?: DateTimeLocaleConfig;
  
  /** Configurações de números */
  number?: NumberLocaleConfig;
  
  /** Configurações de moeda */
  currency?: CurrencyLocaleConfig;
  
  /** Dicionário de traduções */
  translations?: { [locale: string]: { [key: string]: string } };
  
  /** Configurações de formatação */
  formatting?: FormattingLocaleConfig;
}

export interface DateTimeLocaleConfig {
  /** Formato de data padrão */
  dateFormat: string;
  
  /** Formato de hora padrão */
  timeFormat: string;
  
  /** Formato de data e hora */
  dateTimeFormat: string;
  
  /** Primeiro dia da semana (0 = domingo) */
  firstDayOfWeek: number;
  
  /** Nomes dos meses */
  monthNames?: string[];
  
  /** Nomes dos dias da semana */
  dayNames?: string[];
  
  /** Formato relativo (há 2 dias) */
  relativeTime?: boolean;
}

export interface NumberLocaleConfig {
  /** Separador decimal */
  decimalSeparator: string;
  
  /** Separador de milhares */
  thousandsSeparator: string;
  
  /** Número de casas decimais padrão */
  defaultPrecision: number;
  
  /** Símbolo de negativo */
  negativeSign: string;
  
  /** Posição do símbolo de negativo */
  negativeSignPosition: 'before' | 'after';
}

export interface CurrencyLocaleConfig {
  /** Código da moeda (ISO 4217) */
  code: string;
  
  /** Símbolo da moeda */
  symbol: string;
  
  /** Posição do símbolo */
  position: 'before' | 'after';
  
  /** Espaço entre símbolo e valor */
  spacing: boolean;
  
  /** Precisão padrão */
  precision: number;
}

export interface FormattingLocaleConfig {
  /** Formato de porcentagem */
  percentageFormat: string;
  
  /** Formato de arquivos/tamanhos */
  fileSizeFormat: 'binary' | 'decimal';
  
  /** Unidades de medida */
  units?: {
    [type: string]: {
      [unit: string]: string;
    };
  };
}

// =============================================================================
// CONFIGURAÇÕES AVANÇADAS
// =============================================================================

export interface DataConfig {
  /** Estratégia de carregamento */
  loadingStrategy: 'eager' | 'lazy' | 'on-demand';
  
  /** Configurações de cache */
  cache?: CacheConfig;
  
  /** Configurações de sincronização */
  sync?: SyncConfig;
  
  /** Configurações de validação */
  validation?: DataValidationConfig;
  
  /** Transformações de dados */
  transformations?: DataTransformation[];
  
  /** Configurações de polling */
  polling?: PollingConfig;
}

export interface CacheConfig {
  /** Habilitar cache */
  enabled: boolean;
  
  /** Tempo de vida do cache (ms) */
  ttl: number;
  
  /** Tamanho máximo do cache */
  maxSize: number;
  
  /** Estratégia de invalidação */
  invalidationStrategy: 'ttl' | 'manual' | 'on-update';
}

export interface SyncConfig {
  /** Sincronização automática */
  autoSync: boolean;
  
  /** Intervalo de sincronização (ms) */
  interval: number;
  
  /** Sincronizar apenas mudanças */
  deltaSync: boolean;
  
  /** Resolver conflitos */
  conflictResolution: 'client' | 'server' | 'manual';
}

export interface DataValidationConfig {
  /** Validação no cliente */
  clientSide: boolean;
  
  /** Validação no servidor */
  serverSide: boolean;
  
  /** Regras de validação */
  rules?: ValidationRule[];
  
  /** Mostrar erros inline */
  showInlineErrors: boolean;
}

export interface ValidationRule {
  /** Campo a validar */
  field: string;
  
  /** Tipo de validação */
  type: 'required' | 'format' | 'range' | 'custom';
  
  /** Parâmetros da validação */
  params?: any;
  
  /** Mensagem de erro */
  message: string;
}

export interface DataTransformation {
  /** ID da transformação */
  id: string;
  
  /** Campo a transformar */
  field: string;
  
  /** Tipo de transformação */
  type: 'format' | 'calculate' | 'aggregate' | 'custom';
  
  /** Função de transformação */
  transform: string;
  
  /** Aplicar na exibição ou nos dados */
  applyTo: 'display' | 'data' | 'both';
}

export interface PollingConfig {
  /** Habilitar polling */
  enabled: boolean;
  
  /** Intervalo de polling (ms) */
  interval: number;
  
  /** Polling apenas quando ativo */
  onlyWhenActive: boolean;
  
  /** Backoff exponencial em caso de erro */
  exponentialBackoff: boolean;
}

export interface ThemeConfig {
  /** Tema principal */
  primary?: string;
  
  /** Tema secundário */
  secondary?: string;
  
  /** Modo escuro */
  darkMode?: boolean;
  
  /** Tema customizado */
  custom?: {
    [property: string]: string;
  };
  
  /** Variáveis CSS personalizadas */
  cssVariables?: {
    [variable: string]: string;
  };
}

export interface PerformanceConfig {
  /** Configurações de virtualização */
  virtualization?: VirtualizationConfig;
  
  /** Configurações de debounce */
  debounce?: DebounceConfig;
  
  /** Configurações de memória */
  memory?: MemoryConfig;
  
  /** Otimizações de renderização */
  rendering?: RenderingConfig;
  
  /** Lazy loading de recursos */
  lazyLoading?: LazyLoadingConfig;
}

export interface DebounceConfig {
  /** Debounce para busca (ms) */
  search: number;
  
  /** Debounce para filtros (ms) */
  filter: number;
  
  /** Debounce para redimensionamento (ms) */
  resize: number;
  
  /** Debounce para scroll (ms) */
  scroll: number;
}

export interface MemoryConfig {
  /** Máximo de linhas em memória */
  maxRows: number;
  
  /** Limpeza automática */
  autoCleanup: boolean;
  
  /** Intervalo de limpeza (ms) */
  cleanupInterval: number;
}

export interface RenderingConfig {
  /** Usar requestAnimationFrame */
  useRAF: boolean;
  
  /** Batch de updates */
  batchUpdates: boolean;
  
  /** Tamanho do batch */
  batchSize: number;
  
  /** Otimizar re-renders */
  optimizeReRenders: boolean;
}

export interface LazyLoadingConfig {
  /** Lazy loading de imagens */
  images: boolean;
  
  /** Lazy loading de componentes */
  components: boolean;
  
  /** Distância para carregar (px) */
  threshold: number;
}

export interface PluginConfig {
  /** ID único do plugin */
  id: string;
  
  /** Nome do plugin */
  name: string;
  
  /** Versão do plugin */
  version: string;
  
  /** Plugin habilitado */
  enabled: boolean;
  
  /** Configurações específicas do plugin */
  settings?: any;
  
  /** Hooks do plugin */
  hooks?: {
    [eventName: string]: string;
  };
}

export interface AccessibilityConfig {
  /** Habilitar recursos de acessibilidade */
  enabled: boolean;
  
  /** Anúncios para screen readers */
  announcements?: AnnouncementConfig;
  
  /** Navegação por teclado */
  keyboard?: KeyboardAccessibilityConfig;
  
  /** Contraste alto */
  highContrast?: boolean;
  
  /** Reduzir movimento */
  reduceMotion?: boolean;
  
  /** Labels ARIA personalizados */
  ariaLabels?: { [key: string]: string };
}

export interface AnnouncementConfig {
  /** Anunciar mudanças de dados */
  dataChanges: boolean;
  
  /** Anunciar ações do usuário */
  userActions: boolean;
  
  /** Anunciar estados de carregamento */
  loadingStates: boolean;
  
  /** Região live para anúncios */
  liveRegion: 'polite' | 'assertive';
}

export interface KeyboardAccessibilityConfig {
  /** Navegação com Tab */
  tabNavigation: boolean;
  
  /** Navegação com setas */
  arrowNavigation: boolean;
  
  /** Atalhos de teclado */
  shortcuts: boolean;
  
  /** Skip links */
  skipLinks: boolean;
  
  /** Focus trap em modais */
  focusTrap: boolean;
}

// =============================================================================
// NOVA INTERFACE PRINCIPAL - MODULAR E EXTENSÍVEL
// =============================================================================

/**
 * Configuração principal da tabela - Nova arquitetura v2.0
 * Estrutura modular alinhada com as 5 abas do editor
 * Preparada para crescimento exponencial
 */
export interface TableConfigV2 {
  /** Metadados da configuração */
  meta?: ConfigMetadata;
  
  /** Definições de colunas */
  columns: ColumnDefinition[];
  
  /** Comportamento geral da tabela (Aba: Visão Geral & Comportamento) */
  behavior?: TableBehaviorConfig;
  
  /** Configurações de aparência e layout (Aba: Visão Geral & Comportamento) */
  appearance?: TableAppearanceConfig;
  
  /** Barra de ferramentas (Aba: Barra de Ferramentas & Ações) */
  toolbar?: ToolbarConfig;
  
  /** Ações por linha e em lote (Aba: Barra de Ferramentas & Ações) */
  actions?: TableActionsConfig;
  
  /** Configurações de exportação (Aba: Barra de Ferramentas & Ações) */
  export?: ExportConfig;
  
  /** Mensagens personalizadas (Aba: Mensagens & Localização) */
  messages?: MessagesConfig;
  
  /** Localização e i18n (Aba: Mensagens & Localização) */
  localization?: LocalizationConfig;
  
  /** Configurações avançadas de dados */
  data?: DataConfig;
  
  /** Temas e customização visual */
  theme?: ThemeConfig;
  
  /** Configurações de performance */
  performance?: PerformanceConfig;
  
  /** Plugins e extensões */
  plugins?: PluginConfig[];
  
  /** Configurações de acessibilidade */
  accessibility?: AccessibilityConfig;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Type guard to check if config is V2
 */
export function isTableConfigV2(config: any): config is TableConfigV2 {
  return config && 
         typeof config === 'object' && 
         Array.isArray(config.columns) &&
         (!config.meta || config.meta.version === '2.0.0' || !config.meta.version);
}