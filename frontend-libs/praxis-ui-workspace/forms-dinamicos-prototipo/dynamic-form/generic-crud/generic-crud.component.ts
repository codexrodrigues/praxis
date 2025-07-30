import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DynamicFormBuilderComponent} from '../form/dynamic-form-builder.component';
import {DynamicTableComponent} from '../../dynamic-table/dynamic-table.component';
import {FieldMetadata} from '../../models/field-metadata.model';
import {EndpointConfig, GenericCrudService} from '../../services/generic-crud.service';
import {MenuService} from '../../services/menu.service';
import {NavigationHandler, RouterNavigationHandler, DashboardNavigationHandler, NavigationEvents} from './navigation/navigation-handler';
import {WindowService} from '@progress/kendo-angular-dialog';
import {IComponentEditor} from '../../interfaces/component-editor.interface';

/**
 * ===== INTERFACES DE EVENTOS DO GENERIC CRUD =====
 * Interfaces tipadas para todos os eventos emitidos pelo componente
 */

/**
 * Evento emitido quando um item é selecionado
 */
export interface CrudItemSelectedEvent {
  /** Item selecionado */
  item: any;
  /** ID do item */
  itemId: string | number;
  /** Índice do item na lista (se aplicável) */
  itemIndex?: number;
  /** Modo atual do CRUD */
  currentMode: 'list' | 'create' | 'edit' | 'view';
  /** Metadados do schema */
  schema?: FieldMetadata[];
  /** Timestamp da seleção */
  timestamp: Date;
}

/**
 * Evento emitido quando um item é criado
 */
export interface CrudItemCreatedEvent {
  /** Item criado */
  item: any;
  /** ID do novo item */
  itemId: string | number;
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Dados do formulário usado na criação */
  formData?: any;
  /** Resultado da operação do servidor */
  serverResponse?: any;
  /** Erro (se houver) */
  error?: any;
  /** Timestamp da criação */
  timestamp: Date;
}

/**
 * Evento emitido quando um item é atualizado
 */
export interface CrudItemUpdatedEvent {
  /** Item atualizado */
  item: any;
  /** ID do item */
  itemId: string | number;
  /** Dados anteriores do item */
  previousData?: any;
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Dados do formulário usado na atualização */
  formData?: any;
  /** Resultado da operação do servidor */
  serverResponse?: any;
  /** Erro (se houver) */
  error?: any;
  /** Timestamp da atualização */
  timestamp: Date;
}

/**
 * Evento emitido quando um item é deletado
 */
export interface CrudItemDeletedEvent {
  /** Item deletado */
  item: any;
  /** ID do item deletado */
  itemId: string | number;
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Resultado da operação do servidor */
  serverResponse?: any;
  /** Erro (se houver) */
  error?: any;
  /** Timestamp da exclusão */
  timestamp: Date;
}

/**
 * Evento emitido quando o modo do CRUD muda
 */
export interface CrudModeChangedEvent {
  /** Modo anterior */
  previousMode: 'list' | 'create' | 'edit' | 'view';
  /** Novo modo */
  currentMode: 'list' | 'create' | 'edit' | 'view';
  /** ID do registro (se aplicável) */
  recordId?: string | number | null;
  /** Se a mudança foi iniciada pelo usuário ou programaticamente */
  triggeredBy: 'user' | 'programmatic';
  /** Contexto adicional da mudança */
  context?: {
    /** Se está em modo dashboard */
    dashboardMode: boolean;
    /** ResourcePath atual */
    resourcePath: string;
    /** Título do formulário */
    formTitle?: string;
  };
  /** Timestamp da mudança */
  timestamp: Date;
}

/**
 * Evento emitido quando o schema é carregado
 */
export interface CrudSchemaLoadedEvent {
  /** Schema carregado */
  schema: FieldMetadata[];
  /** ResourcePath do schema */
  resourcePath: string;
  /** Número de campos no schema */
  fieldCount: number;
  /** Tipos de campos presentes */
  fieldTypes: string[];
  /** Se o schema tem campos obrigatórios */
  hasRequiredFields: boolean;
  /** Timestamp do carregamento */
  timestamp: Date;
}

/**
 * Evento emitido para solicitações de navegação (dashboard mode)
 */
export interface CrudNavigationRequestEvent {
  /** Tipo de requisição */
  action: 'create' | 'edit' | 'view' | 'list';
  /** ID do item (para edit/view) */
  itemId?: string | number;
  /** Dados do item (se disponível) */
  itemData?: any;
  /** Contexto da requisição */
  context: {
    /** Modo atual antes da requisição */
    currentMode: 'list' | 'create' | 'edit' | 'view';
    /** ResourcePath */
    resourcePath: string;
    /** Se está em modo dashboard */
    dashboardMode: boolean;
  };
  /** Timestamp da requisição */
  timestamp: Date;
}

/**
 * @description
 * Componente genérico para operações CRUD (Create, Read, Update, Delete).
 * Este componente exibe um formulário dinâmico baseado em um layout obtido
 * de um endpoint de API e permite realizar operações de criação, leitura,
 * atualização e exclusão de itens para um recurso específico.
 *
 * O `resourcePath` é fundamental para identificar o recurso da API com o qual
 * este componente irá interagir. Ele é projetado para receber este caminho
 * via Input, tornando-o reutilizável para diferentes entidades.
 *
 * @usageNotes
 * ```html
 * <app-generic-crud [resourcePath]="'seu/caminho/api'"></app-generic-crud>
 * ```
 *
 * @publicApi
 */
@Component({
  selector: 'th-generic-crud',
  standalone: true,
  imports: [
    DynamicFormBuilderComponent,
    CommonModule,
    DynamicTableComponent,
    MatButtonModule,
    MatIconModule
  ],
  providers: [
    GenericCrudService
  ],
  templateUrl: 'generic-crud.component.html',
  styleUrls: ['generic-crud.component.css']
})
export class GenericCrudComponent<T> implements OnInit, AfterViewInit, IComponentEditor {
  @Input() listTitle: string = 'Registros';
  @Input() formTitle: string = '';
  @Input() resourcePath: string = '';
  @Input() editMode: boolean = true;

  // === DASHBOARD MODE INPUTS ===
  @Input() dashboardMode: boolean = false;
  @Input() resourcePathInput: string = '';
  @Input() initialMode: 'list' | 'create' | 'edit' | 'view' = 'list';
  @Input() recordIdInput: string | null = null;

  // === DASHBOARD MODE OUTPUTS (tipados) ===
  @Output() requestCreate = new EventEmitter<CrudNavigationRequestEvent>();
  @Output() requestEdit = new EventEmitter<CrudNavigationRequestEvent>();
  @Output() requestView = new EventEmitter<CrudNavigationRequestEvent>();
  @Output() requestList = new EventEmitter<CrudNavigationRequestEvent>();

  // === INTEGRATION OUTPUTS (tipados) ===
  @Output() itemSelected = new EventEmitter<CrudItemSelectedEvent>();
  @Output() itemCreated = new EventEmitter<CrudItemCreatedEvent>();
  @Output() itemUpdated = new EventEmitter<CrudItemUpdatedEvent>();
  @Output() itemDeleted = new EventEmitter<CrudItemDeletedEvent>();
  @Output() modeChanged = new EventEmitter<CrudModeChangedEvent>();
  @Output() schemaLoaded = new EventEmitter<CrudSchemaLoadedEvent>();

  @ViewChild('dynamicTable') dynamicTable!: DynamicTableComponent;
  @ViewChild('formBuilder') formBuilder!: DynamicFormBuilderComponent;

  mode: 'list' | 'create' | 'edit' | 'view' = 'list';
  private previousMode: 'list' | 'create' | 'edit' | 'view' = 'list';
  recordId: string | null = null;
  schema: FieldMetadata[] = [];

  // === NAVIGATION ABSTRACTION ===
  private navigationHandler!: NavigationHandler;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private windowService: WindowService
  ) {
  }

  ngOnInit(): void {
    // Inicializar handler de navegação baseado no modo
    this.initializeNavigationHandler();

    // Obter o caminho do recurso usando propriedades efetivas
    if (!this.resourcePath) {
      this.resourcePath = this.effectiveResourcePath;
    }

    // Determinar o modo baseado na rota atual ou dashboard mode
    this.determineMode();

    // Emitir evento de mudança de modo se em dashboard mode
    if (this.dashboardMode) {
      const initialModeEvent: CrudModeChangedEvent = {
        previousMode: 'list', // Assumir lista como estado inicial
        currentMode: this.effectiveMode,
        recordId: this.effectiveRecordId,
        triggeredBy: 'programmatic',
        context: {
          dashboardMode: this.dashboardMode,
          resourcePath: this.effectiveResourcePath,
          formTitle: this.getFormTitle()
        },
        timestamp: new Date()
      };
      this.modeChanged.emit(initialModeEvent);
    }

    // Obter schema do router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['schema']) {
      this.schema = navigation.extras.state['schema'];
    }

    this.menuService.getEditMode().subscribe(editMode => {
      this.editMode = editMode;
      // Atualize a visualização se necessário
    });

  }

  // === EFFECTIVE PROPERTIES (DASHBOARD MODE SUPPORT) ===

  /**
   * Retorna o resourcePath efetivo, priorizando dashboard mode input
   */
  get effectiveResourcePath(): string {
    if (this.dashboardMode && this.resourcePathInput) {
      return this.resourcePathInput;
    }
    return this.resourcePath || this.activatedRoute.snapshot.data['resourcePath'] || '';
  }

  /**
   * Retorna o recordId efetivo, priorizando dashboard mode input
   */
  get effectiveRecordId(): string | null {
    if (this.dashboardMode && this.recordIdInput !== null) {
      return this.recordIdInput;
    }
    return this.activatedRoute.snapshot.paramMap.get('id');
  }

  /**
   * Retorna o modo efetivo de operação
   */
  get effectiveMode(): 'list' | 'create' | 'edit' | 'view' {
    if (this.dashboardMode) {
      return this.initialMode;
    }
    // Usar modo determinado pela URL (comportamento original)
    return this.mode;
  }

  // === NAVIGATION HANDLER INITIALIZATION ===

  /**
   * Inicializa o handler de navegação baseado no modo de operação
   */
  private initializeNavigationHandler(): void {
    if (this.dashboardMode) {
      const events: NavigationEvents = {
        requestCreate: this.requestCreate,
        requestEdit: this.requestEdit,
        requestView: this.requestView,
        requestList: this.requestList
      };
      this.navigationHandler = new DashboardNavigationHandler(events);
    } else {
      this.navigationHandler = new RouterNavigationHandler(
        this.router,
        () => this.schema
      );
    }
  }

  determineMode(): void {
    if (this.dashboardMode) {
      // Em dashboard mode, usar propriedades efetivas
      this.mode = this.effectiveMode;
      this.recordId = this.effectiveRecordId;
    } else {
      // Comportamento original: determinar pela URL
      const url = this.router.url;

      if (url.includes('/novo')) {
        this.mode = 'create';
      } else if (url.includes('/editar/')) {
        this.mode = 'edit';
        this.recordId = this.activatedRoute.snapshot.paramMap.get('id');
      } else if (url.includes('/visualizar/')) {
        this.mode = 'view';
        this.recordId = this.activatedRoute.snapshot.paramMap.get('id');
      } else {
        this.mode = 'list';
      }
    }
  }

  getFormTitle(): string {
    if (this.formTitle) return this.formTitle;

    switch (this.mode) {
      case 'create':
        return 'Novo Registro';
      case 'edit':
        return 'Editar Registro';
      case 'view':
        return 'Visualizar Registro';
      default:
        return 'Registro';
    }
  }

  onSchemaChange(schema: FieldMetadata[]): void {
    this.schema = schema;

    // Emitir evento tipado de schema carregado
    const schemaEvent: CrudSchemaLoadedEvent = {
      schema,
      resourcePath: this.effectiveResourcePath,
      fieldCount: schema.length,
      fieldTypes: [...new Set(schema.map(field => field['fieldType'] || 'unknown'))],
      hasRequiredFields: schema.some(field => field.required),
      timestamp: new Date()
    };
    this.schemaLoaded.emit(schemaEvent);
  }

  onRowDoubleClick(event: any): void {
    if (event && event.uuid) {
      // Emitir evento tipado de seleção de item
      const selectionEvent: CrudItemSelectedEvent = {
        item: event,
        itemId: event.uuid,
        itemIndex: event.rowIndex,
        currentMode: this.mode,
        schema: this.schema,
        timestamp: new Date()
      };
      this.itemSelected.emit(selectionEvent);
      this.goToEdit(event.uuid);
    }
  }

  goToCreate(): void {
    this.previousMode = this.mode;
    this.mode = 'create';
    this.recordId = null;

    // Emitir evento tipado de mudança de modo
    const modeChangeEvent: CrudModeChangedEvent = {
      previousMode: this.previousMode,
      currentMode: 'create',
      recordId: null,
      triggeredBy: 'user',
      context: {
        dashboardMode: this.dashboardMode,
        resourcePath: this.effectiveResourcePath,
        formTitle: this.getFormTitle()
      },
      timestamp: new Date()
    };
    this.modeChanged.emit(modeChangeEvent);

    // Emitir requisição de navegação se em dashboard mode
    if (this.dashboardMode) {
      const navigationEvent: CrudNavigationRequestEvent = {
        action: 'create',
        context: {
          currentMode: this.previousMode,
          resourcePath: this.effectiveResourcePath,
          dashboardMode: this.dashboardMode
        },
        timestamp: new Date()
      };
      this.requestCreate.emit(navigationEvent);
    }

    this.navigationHandler.goToCreate();
  }

  goToEdit(id: any): void {
    this.previousMode = this.mode;
    this.mode = 'edit';
    this.recordId = id;

    // Emitir evento tipado de mudança de modo
    const modeChangeEvent: CrudModeChangedEvent = {
      previousMode: this.previousMode,
      currentMode: 'edit',
      recordId: id,
      triggeredBy: 'user',
      context: {
        dashboardMode: this.dashboardMode,
        resourcePath: this.effectiveResourcePath,
        formTitle: this.getFormTitle()
      },
      timestamp: new Date()
    };
    this.modeChanged.emit(modeChangeEvent);

    // Emitir requisição de navegação se em dashboard mode
    if (this.dashboardMode) {
      const navigationEvent: CrudNavigationRequestEvent = {
        action: 'edit',
        itemId: id,
        context: {
          currentMode: this.previousMode,
          resourcePath: this.effectiveResourcePath,
          dashboardMode: this.dashboardMode
        },
        timestamp: new Date()
      };
      this.requestEdit.emit(navigationEvent);
    }

    this.navigationHandler.goToEdit(id);
  }

  goToView(id: any): void {
    this.previousMode = this.mode;
    this.mode = 'view';
    this.recordId = id;

    // Emitir evento tipado de mudança de modo
    const modeChangeEvent: CrudModeChangedEvent = {
      previousMode: this.previousMode,
      currentMode: 'view',
      recordId: id,
      triggeredBy: 'user',
      context: {
        dashboardMode: this.dashboardMode,
        resourcePath: this.effectiveResourcePath,
        formTitle: this.getFormTitle()
      },
      timestamp: new Date()
    };
    this.modeChanged.emit(modeChangeEvent);

    // Emitir requisição de navegação se em dashboard mode
    if (this.dashboardMode) {
      const navigationEvent: CrudNavigationRequestEvent = {
        action: 'view',
        itemId: id,
        context: {
          currentMode: this.previousMode,
          resourcePath: this.effectiveResourcePath,
          dashboardMode: this.dashboardMode
        },
        timestamp: new Date()
      };
      this.requestView.emit(navigationEvent);
    }

    this.navigationHandler.goToView(id);
  }

  goToList(): void {
    this.previousMode = this.mode;
    this.mode = 'list';
    this.recordId = null;

    // Emitir evento tipado de mudança de modo
    const modeChangeEvent: CrudModeChangedEvent = {
      previousMode: this.previousMode,
      currentMode: 'list',
      recordId: null,
      triggeredBy: 'user',
      context: {
        dashboardMode: this.dashboardMode,
        resourcePath: this.effectiveResourcePath,
        formTitle: this.getFormTitle()
      },
      timestamp: new Date()
    };
    this.modeChanged.emit(modeChangeEvent);

    // Emitir requisição de navegação se em dashboard mode
    if (this.dashboardMode) {
      const navigationEvent: CrudNavigationRequestEvent = {
        action: 'list',
        context: {
          currentMode: this.previousMode,
          resourcePath: this.effectiveResourcePath,
          dashboardMode: this.dashboardMode
        },
        timestamp: new Date()
      };
      this.requestList.emit(navigationEvent);
    }

    this.navigationHandler.goToList();
  }

  onDeleteItem(item: any): void {
    // A exclusão já é tratada internamente pelo DynamicTableComponent
    // Este método é chamado após a exclusão bem-sucedida
    console.log('Item excluído:', item);

    // Emitir evento tipado de item deletado
    const deleteEvent: CrudItemDeletedEvent = {
      item,
      itemId: item.uuid || item.id,
      success: true,
      serverResponse: item,
      timestamp: new Date()
    };
    this.itemDeleted.emit(deleteEvent);
  }

  onFormSave(data: any): void {
    // Evento geral de save (create ou update)
    if (this.mode === 'create') {
      const createEvent: CrudItemCreatedEvent = {
        item: data,
        itemId: data.uuid || data.id,
        success: true,
        formData: data,
        serverResponse: data,
        timestamp: new Date()
      };
      this.itemCreated.emit(createEvent);
    } else if (this.mode === 'edit') {
      const updateEvent: CrudItemUpdatedEvent = {
        item: data,
        itemId: data.uuid || data.id,
        success: true,
        formData: data,
        serverResponse: data,
        timestamp: new Date()
      };
      this.itemUpdated.emit(updateEvent);
    }

    // Em dashboard mode, permanecer no formulário; caso contrário, voltar à lista
    if (!this.dashboardMode) {
      this.goToList();
    }
  }

  onFormCreate(data: any): void {
    // Emitir evento tipado de item criado
    const createEvent: CrudItemCreatedEvent = {
      item: data,
      itemId: data.uuid || data.id,
      success: true,
      formData: data,
      serverResponse: data,
      timestamp: new Date()
    };
    this.itemCreated.emit(createEvent);

    // Em dashboard mode, permanecer no formulário; caso contrário, voltar à lista
    if (!this.dashboardMode) {
      this.goToList();
    }
  }

  onFormUpdate(data: any): void {
    // Emitir evento tipado de item atualizado
    const updateEvent: CrudItemUpdatedEvent = {
      item: data,
      itemId: data.uuid || data.id,
      success: true,
      formData: data,
      serverResponse: data,
      timestamp: new Date()
    };
    this.itemUpdated.emit(updateEvent);

    // Em dashboard mode, permanecer no formulário; caso contrário, voltar à lista
    if (!this.dashboardMode) {
      this.goToList();
    }
  }

// Adicione um botão "Novo" no template para chamar este método
  createNew(): void {
    this.goToCreate();
  }

  /**
   * Abre o editor de configuração do GenericCrud
   * Chama o editor correspondente ao modo atual
   */
  openEditor(): void {
    if (this.mode === 'list') {
      // Modo lista - abre editor da tabela
      if (this.dynamicTable && this.dynamicTable.hasEditor()) {
        this.dynamicTable.openEditor();
      } else {
        console.warn('Editor da tabela não disponível');
      }
    } else if (this.mode === 'create' || this.mode === 'edit' || this.mode === 'view') {
      // Modo formulário - abre editor do formulário
      if (this.formBuilder && this.formBuilder.hasEditor()) {
        this.formBuilder.openEditor();
      } else {
        console.warn('Editor do formulário não disponível');
      }
    } else {
      console.warn('Modo atual não reconhecido para abertura de editor:', this.mode);
    }
  }

  /**
   * Indica se o componente tem um editor implementado
   * @returns true se o componente atual (tabela ou formulário) tem editor
   */
  hasEditor(): boolean {
    if (this.mode === 'list') {
      return this.dynamicTable ? this.dynamicTable.hasEditor() : false;
    } else if (this.mode === 'create' || this.mode === 'edit' || this.mode === 'view') {
      return this.formBuilder ? this.formBuilder.hasEditor() : false;
    }
    return false;
  }

  /**
   * Aplica as configurações vindas do editor
   */
  private applyConfiguration(config: any): void {
    if (config.dashboardMode !== undefined) {
      this.dashboardMode = config.dashboardMode;
    }
    if (config.resourcePathInput) {
      this.resourcePathInput = config.resourcePathInput;
    }
    if (config.initialMode) {
      this.initialMode = config.initialMode;
    }
    if (config.listTitle) {
      this.listTitle = config.listTitle;
    }
    if (config.formTitle) {
      this.formTitle = config.formTitle;
    }
    if (config.editMode !== undefined) {
      this.editMode = config.editMode;
    }

    // Reconfigurar o serviço se o resourcePath mudou
    if (config.resourcePathInput && config.resourcePathInput !== this.resourcePath) {
      this.resourcePath = config.resourcePathInput;
    }

    // Emitir evento de configuração alterada se em dashboard mode
    if (this.dashboardMode) {
      // Aqui poderia emitir um evento para notificar o dashboard da mudança
      console.log('Configuração do GenericCrud atualizada:', config);
    }
  }

  ngAfterViewInit(): void {
  }
}
