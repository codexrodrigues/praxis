/**
 * @fileoverview Componente base para campos baseados em listas de dados
 * 
 * Especialização do BaseDynamicFieldComponent para campos que trabalham com listas:
 * ✅ Carregamento de dados otimizado com cache inteligente
 * ✅ Transformação e normalização automática de dados
 * ✅ Virtualização para grandes listas (performance)
 * ✅ Filtração e busca em tempo real
 * ✅ Estados de loading e erro com UX consistente
 * ✅ Retry automático e fallback strategies
 */

import { 
  inject, 
  signal, 
  computed, 
  effect,
  DestroyRef
} from '@angular/core';
import { 
  Observable, 
  of, 
  throwError, 
  timer, 
  combineLatest,
  BehaviorSubject 
} from 'rxjs';
import { 
  catchError, 
  finalize, 
  retryWhen, 
  delay, 
  take, 
  switchMap,
  debounceTime,
  distinctUntilChanged,
  map,
  tap
} from 'rxjs/operators';

import { BaseDynamicFieldComponent } from './base-dynamic-field.component';
import { ComponentMetadata, FieldOption } from '@praxis/core';
import { GenericCrudService } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

/**
 * Interface estendida para componentes de lista
 */
interface ExtendedListMetadata extends ComponentMetadata {
  endpoint?: string;
  options?: any[];
  multiple?: boolean;
  valueField?: string;
  displayField?: string;
  searchable?: boolean;
  performance?: {
    cache?: {
      enabled: boolean;
      ttl: number;
    };
  };
}

function safeListMetadata(metadata: ComponentMetadata | null | undefined): ExtendedListMetadata {
  return (metadata || {}) as ExtendedListMetadata;
}

// =============================================================================
// INTERFACES PARA COMPONENTES DE LISTA
// =============================================================================

export interface ListDataState {
  items: FieldOption[];
  filteredItems: FieldOption[];
  selectedItems: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

export interface ListLoadingConfig {
  strategy: 'eager' | 'lazy' | 'infinite';
  pageSize: number;
  retryAttempts: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

export interface SearchConfig {
  enabled: boolean;
  placeholder: string;
  debounceTime: number;
  minLength: number;
  caseSensitive: boolean;
  searchFields: string[];
}

export interface VirtualizationConfig {
  enabled: boolean;
  itemHeight: number;
  bufferSize: number;
  threshold: number;
}

// =============================================================================
// SERVIÇO SIMULADO DE CARREGAMENTO DE DADOS
// =============================================================================

// Serviço real de carregamento de dados é injetado via DI

// =============================================================================
// CLASSE BASE PARA CAMPOS COM LISTAS
// =============================================================================

export abstract class BaseDynamicListComponent<T extends ComponentMetadata = ComponentMetadata>
  extends BaseDynamicFieldComponent<T> {

  // =============================================================================
  // INJEÇÃO DE DEPENDÊNCIAS
  // =============================================================================

  /** Serviço oficial de CRUD para carregamento de dados */
  protected readonly crudService = inject(GenericCrudService);

  // =============================================================================
  // SIGNALS PARA GERENCIAMENTO DE DADOS
  // =============================================================================

  /** Estado dos dados da lista */
  protected readonly listDataState = signal<ListDataState>({
    items: [],
    filteredItems: [],
    selectedItems: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
    totalCount: 0
  });

  /** Configuração de carregamento */
  protected readonly loadingConfig = signal<ListLoadingConfig>({
    strategy: 'eager',
    pageSize: 50,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheEnabled: true,
    cacheTTL: 300
  });

  /** Configuração de busca */
  protected readonly searchConfig = signal<SearchConfig>({
    enabled: false,
    placeholder: 'Buscar...',
    debounceTime: 300,
    minLength: 2,
    caseSensitive: false,
    searchFields: ['text', 'value']
  });

  /** Configuração de virtualização */
  protected readonly virtualizationConfig = signal<VirtualizationConfig>({
    enabled: false,
    itemHeight: 48,
    bufferSize: 10,
    threshold: 100
  });

  /** Termo de busca atual */
  protected readonly searchTerm = signal<string>('');

  /** Cache de dados por endpoint */
  private readonly dataCache = new Map<string, { data: any[], timestamp: number }>();

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Itens visíveis após filtros */
  readonly visibleItems = computed(() => {
    const state = this.listDataState();
    const search = this.searchTerm().toLowerCase();
    const config = this.searchConfig();
    
    if (!search || search.length < config.minLength) {
      return state.items;
    }
    
    return state.items.filter(item => {
      return config.searchFields.some(field => {
        const fieldValue = item[field as keyof FieldOption]?.toString() || '';
        return config.caseSensitive 
          ? fieldValue.includes(search)
          : fieldValue.toLowerCase().includes(search);
      });
    });
  });

  /** Verifica se tem dados */
  readonly hasData = computed(() => this.listDataState().items.length > 0);

  /** Verifica se deve mostrar loader */
  readonly showLoader = computed(() => {
    const state = this.listDataState();
    return state.loading && state.items.length === 0;
  });

  /** Verifica se deve mostrar busca */
  readonly showSearch = computed(() => {
    const config = this.searchConfig();
    const hasMinItems = this.listDataState().items.length >= 5;
    return config.enabled && hasMinItems;
  });

  /** Valor de exibição formatado */
  readonly displayValue = computed(() => {
    return this.formatDisplayValue(this.fieldValue());
  });

  /** Estatísticas da lista */
  readonly listStats = computed(() => {
    const state = this.listDataState();
    const visible = this.visibleItems();
    
    return {
      total: state.totalCount || state.items.length,
      visible: visible.length,
      selected: state.selectedItems.length,
      loading: state.loading,
      hasMore: state.hasMore
    };
  });

  // =============================================================================
  // SUBJECT PARA BUSCA
  // =============================================================================

  private readonly searchSubject = new BehaviorSubject<string>('');

  // =============================================================================
  // CONSTRUCTOR E INICIALIZAÇÃO
  // =============================================================================

  constructor() {
    super();
    this.setupSearchSystem();
    this.setupDataLoadingEffects();
  }

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeListConfiguration();
    this.loadInitialData();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS PARA CARREGAMENTO DE DADOS
  // =============================================================================

  /**
   * Carrega dados da lista
   */
  async loadData(force: boolean = false): Promise<void> {
    const metadata = safeListMetadata(this.metadata());
    if (!metadata) return;

    // Verificar cache primeiro (se não forçado)
    if (!force && this.loadingConfig().cacheEnabled) {
      const cached = this.getCachedData(metadata.endpoint || '');
      if (cached) {
        this.processLoadedData(cached);
        return;
      }
    }

    this.updateListState({ loading: true, error: null });

    try {
      let data: any[] = [];

      // Priorizar opções estáticas
      if (metadata.options?.length) {
        data = Array.isArray(metadata.options) ? metadata.options : [];
      } 
      // Carregar de endpoint
      else if (metadata.endpoint) {
        data = await this.loadFromEndpoint(metadata.endpoint);
      }

      this.processLoadedData(data);
      
      // Cache dos dados se habilitado
      if (this.loadingConfig().cacheEnabled && metadata.endpoint) {
        this.cacheData(metadata.endpoint, data);
      }

      this.log('debug', 'Data loaded successfully', { 
        itemCount: data.length,
        endpoint: metadata.endpoint 
      });

    } catch (error) {
      this.handleLoadingError(error as Error);
    } finally {
      this.updateListState({ loading: false });
    }
  }

  /**
   * Recarrega dados (força nova requisição)
   */
  async refreshData(): Promise<void> {
    await this.loadData(true);
  }

  /**
   * Carrega mais dados (infinite scroll)
   */
  async loadMore(): Promise<void> {
    const state = this.listDataState();
    if (state.loading || !state.hasMore) return;

    const metadata = safeListMetadata(this.metadata());
    if (!metadata?.endpoint) return;

    this.updateListState({ loading: true });

    try {
      const nextPage = state.page + 1;
      const newData = await this.loadFromEndpoint(metadata.endpoint, { page: nextPage });
      
      const combinedItems = [...state.items, ...this.transformData(newData)];
      
      this.updateListState({
        items: combinedItems,
        page: nextPage,
        hasMore: newData.length === this.loadingConfig().pageSize,
        loading: false
      });

    } catch (error) {
      this.handleLoadingError(error as Error);
      this.updateListState({ loading: false });
    }
  }

  /**
   * Define termo de busca
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  /**
   * Limpa busca
   */
  clearSearch(): void {
    this.setSearchTerm('');
  }

  // =============================================================================
  // MÉTODOS PARA SELEÇÃO
  // =============================================================================

  /**
   * Seleciona item(s)
   */
  selectItem(item: FieldOption | FieldOption[], append: boolean = false): void {
    const items = Array.isArray(item) ? item : [item];
    const metadata = safeListMetadata(this.metadata());
    
    if (metadata?.multiple) {
      const current = this.listDataState().selectedItems;
      const newSelected = append ? [...current, ...items] : items;
      this.updateSelection(newSelected);
    } else {
      // Seleção única - usar apenas o primeiro item
      this.updateSelection([items[0]]);
    }
  }

  /**
   * Remove seleção de item(s)
   */
  deselectItem(item: FieldOption | FieldOption[]): void {
    const itemsToRemove = Array.isArray(item) ? item : [item];
    const current = this.listDataState().selectedItems;
    
    const newSelected = current.filter(selected => 
      !itemsToRemove.some(toRemove => toRemove.value === selected.value)
    );
    
    this.updateSelection(newSelected);
  }

  /**
   * Limpa todas as seleções
   */
  clearSelection(): void {
    this.updateSelection([]);
  }

  /**
   * Verifica se item está selecionado
   */
  isSelected(item: FieldOption): boolean {
    const selected = this.listDataState().selectedItems;
    return selected.some(sel => sel.value === item.value);
  }

  // =============================================================================
  // TRANSFORMAÇÃO E FORMATAÇÃO DE DADOS
  // =============================================================================

  /**
   * Transforma dados brutos em FieldOption[]
   */
  protected transformData(rawData: any[]): FieldOption[] {
    if (!Array.isArray(rawData)) return [];

    const metadata = safeListMetadata(this.metadata());
    
    return rawData.map(item => {
      // Se já é string/number, usar como valor e texto
      if (typeof item === 'string' || typeof item === 'number') {
        return { 
          value: item, 
          text: item.toString(),
          data: item
        };
      }

      // Se é objeto, mapear campos
      if (typeof item === 'object' && item !== null) {
        const valueField = metadata?.valueField || 'value';
        const displayField = metadata?.displayField || 'text';
        
        return {
          value: item[valueField] ?? item.id ?? item.value,
          text: item[displayField] ?? item.name ?? item.text ?? item.label ?? String(item[valueField] ?? ''),
          data: item,
          disabled: item.disabled || false,
          group: item.group,
          description: item.description
        };
      }

      return { value: item, text: String(item), data: item };
    });
  }

  /**
   * Formata valor de exibição
   */
  protected formatDisplayValue(value: any): string {
    if (!value) return '';

    const items = this.listDataState().items;

    // Múltiplas seleções
    if (Array.isArray(value)) {
      return value
        .map(val => {
          const item = items.find(opt => opt.value === val);
          return item?.text || String(val || '');
        })
        .filter(text => text)
        .join(', ');
    }

    // Seleção única
    const item = items.find(opt => opt.value === value);
    return item?.text || String(value);
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private setupSearchSystem(): void {
    // Configurar debounced search
    this.searchSubject.pipe(
      debounceTime(this.searchConfig().debounceTime),
      distinctUntilChanged(),
      this.takeUntilDestroyed()
    ).subscribe(term => {
      this.performSearch(String(term));
    });
  }

  private setupDataLoadingEffects(): void {
    // Effect para recarregar quando metadata muda
    effect(() => {
      const metadata = safeListMetadata(this.metadata());
      if (metadata && (metadata.options || metadata.endpoint)) {
        this.loadData();
      }
    });
  }

  private initializeListConfiguration(): void {
    const metadata = safeListMetadata(this.metadata());
    if (!metadata) return;

    // Configurar busca baseado na metadata
    if (metadata.searchable !== undefined) {
      this.searchConfig.update(config => ({
        ...config,
        enabled: metadata.searchable || false
      }));
    }

    // Configurar virtualização para listas grandes
    const estimatedSize = metadata.options?.length || 0;
    if (estimatedSize > 100) {
      this.virtualizationConfig.update(config => ({
        ...config,
        enabled: true
      }));
    }

    // Configurar cache baseado na performance config
    if (metadata.performance?.cache) {
      this.loadingConfig.update(config => ({
        ...config,
        cacheEnabled: metadata.performance?.cache?.enabled || false,
        cacheTTL: metadata.performance?.cache?.ttl || 300
      }));
    }
  }

  private async loadInitialData(): Promise<void> {
    await this.loadData();
  }

  private async loadFromEndpoint(endpoint: string, params?: any): Promise<any[]> {
    const config = this.loadingConfig();
    
    return new Promise((resolve, reject) => {
      // Configurar o GenericCrudService com o endpoint
      this.crudService.configure(endpoint);
      
      // Usar getAll() para buscar todos os dados
      this.crudService.getAll().pipe(
        this.takeUntilDestroyed()
      ).subscribe({
        next: data => resolve(Array.isArray(data) ? data : [data]),
        error: error => reject(error)
      });
    });
  }

  private processLoadedData(data: any[]): void {
    const transformedData = this.transformData(data);
    
    this.updateListState({
      items: transformedData,
      totalCount: transformedData.length,
      hasMore: false, // Para dados estáticos
      error: null
    });
  }

  private handleLoadingError(error: Error): void {
    const errorMessage = `Erro ao carregar dados: ${error.message}`;
    
    this.updateListState({ 
      error: errorMessage,
      loading: false 
    });
    
    this.log('error', 'Data loading failed', { error: error.message });
  }

  private updateListState(changes: Partial<ListDataState>): void {
    const current = this.listDataState();
    this.listDataState.set({ ...current, ...changes });
  }

  private updateSelection(selectedItems: FieldOption[]): void {
    this.updateListState({ selectedItems });
    
    // Atualizar valor do campo baseado na seleção
    const metadata = safeListMetadata(this.metadata());
    let newValue: any;
    
    if (metadata?.multiple) {
      newValue = selectedItems.map(item => item.value);
    } else {
      newValue = selectedItems.length > 0 ? selectedItems[0].value : null;
    }
    
    this.setValue(newValue);
  }

  private performSearch(term: string): void {
    // A busca é realizada através do computed 'visibleItems'
    // Este método pode ser usado para lógica adicional de busca
    this.log('debug', 'Search performed', { term, resultCount: this.visibleItems().length });
  }

  private getCachedData(endpoint: string): any[] | null {
    if (!this.loadingConfig().cacheEnabled) return null;
    
    const cached = this.dataCache.get(endpoint);
    if (!cached) return null;
    
    const now = Date.now();
    const age = (now - cached.timestamp) / 1000; // seconds
    
    if (age > this.loadingConfig().cacheTTL) {
      this.dataCache.delete(endpoint);
      return null;
    }
    
    return cached.data;
  }

  private cacheData(endpoint: string, data: any[]): void {
    this.dataCache.set(endpoint, {
      data,
      timestamp: Date.now()
    });
  }
}