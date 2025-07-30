// Dynamic Form Builder Component

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {FieldsetLayout, FormLayout, FormLayoutRule, NestedFieldsetLayout} from '../../models/form-layout.model';
import {FieldMetadata} from '../../models/field-metadata.model';
import {DynamicFormGroupService} from '../../services/dynamic-form-group.service';
import {EndpointConfig, GenericCrudService} from '../../services/generic-crud.service';
import {FormLayoutService} from '../../services/form-layout.service';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {KENDO_BUTTONS} from '@progress/kendo-angular-buttons';
import {KENDO_CARD} from '@progress/kendo-angular-layout';
import {FormButtonsActionsComponent} from './form-buttons-actions/form-buttons-actions.component';
import {animate, keyframes, style, transition, trigger} from '@angular/animations';
import {KENDO_WINDOW, WindowService} from '@progress/kendo-angular-dialog';
import {FormRowComponent} from './form-row/form-row.component';
import {FieldsetHeaderComponent} from './fieldset-header/fieldset-header.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormContextService} from '../services/form-context.service';
import {distinctUntilChanged} from 'rxjs/operators';
import {filterBy} from '@progress/kendo-data-query';
import {debounceTime, Subscription, BehaviorSubject} from 'rxjs';
import {FormSettingsEditorComponent} from './form-settings-editor/form-settings-editor.component';
import {ThNotificationService} from '../../services/th-notification.service';
import {MenuService} from '../../services/menu.service';
import { FormEntityMapperService } from '../services/form-entity-mapper.service';
import { KENDO_INDICATORS } from "@progress/kendo-angular-indicators";
import {IComponentEditor} from '../../interfaces/component-editor.interface';

/**
 * ===== INTERFACES DE EVENTOS DO DYNAMIC FORM =====
 * Interfaces tipadas para todos os eventos emitidos pelo componente
 */

/**
 * Evento emitido quando valores do formulário mudam
 */
export interface FormValueChangeEvent {
  /** Valores atuais do formulário */
  formData: any;
  /** Campo específico que mudou (se aplicável) */
  changedField?: string;
  /** Valor anterior do campo */
  previousValue?: any;
  /** Valor atual do campo */
  currentValue?: any;
  /** Campos que foram alterados */
  changedFields: string[];
  /** Se o formulário é válido */
  isValid: boolean;
  /** ID da entidade sendo editada */
  entityId?: string | number;
}

/**
 * Evento emitido durante submissão do formulário
 */
export interface FormSubmitEvent {
  /** Estágio do submit */
  stage: 'before' | 'after' | 'error';
  /** Dados do formulário */
  formData: any;
  /** Se o formulário é válido */
  isValid: boolean;
  /** Erros de validação */
  validationErrors?: ValidationError[];
  /** ID da entidade */
  entityId?: string | number;
  /** Operação sendo executada */
  operation: 'create' | 'update';
  /** Resultado da operação (para stage 'after') */
  result?: any;
  /** Erro ocorrido (para stage 'error') */
  error?: any;
}

/**
 * Evento emitido quando há mudanças no status de validação
 */
export interface FormValidationEvent {
  /** Se o formulário é válido */
  isValid: boolean;
  /** Erros de validação por campo */
  errors: { [fieldName: string]: ValidationError[] };
  /** Campos que foram validados */
  validatedFields: string[];
  /** Campos que falharam na validação */
  invalidFields: string[];
  /** Status de validação do formulário */
  formStatus: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
}

/**
 * Evento emitido durante operações de entidade (CRUD)
 */
export interface FormEntityEvent {
  /** Operação realizada */
  operation: 'load' | 'create' | 'update' | 'delete';
  /** ID da entidade */
  entityId?: string | number;
  /** Dados da entidade */
  entityData?: any;
  /** Se a operação foi bem-sucedida */
  success: boolean;
  /** Resultado da operação */
  result?: any;
  /** Erro (se houver) */
  error?: any;
  /** Timestamp da operação */
  timestamp: Date;
}

/**
 * Evento emitido quando o formulário está pronto para uso
 */
export interface FormReadyEvent {
  /** Instância do FormGroup */
  formGroup: FormGroup;
  /** Metadados dos campos carregados */
  fieldsMetadata: any[];
  /** Layout aplicado */
  layout?: FormLayout;
  /** Se foi carregado com uma entidade */
  hasEntity: boolean;
  /** ID da entidade carregada */
  entityId?: string | number;
}

/**
 * Erro de validação detalhado
 */
export interface ValidationError {
  /** Campo que contém o erro */
  field: string;
  /** Tipo do erro */
  type: 'required' | 'pattern' | 'min' | 'max' | 'email' | 'custom';
  /** Mensagem amigável do erro */
  message: string;
  /** Valor que causou o erro */
  currentValue?: any;
  /** Valor esperado ou regra violada */
  expectedValue?: any;
}

@Component({
  selector: 'dynamic-form-builder',
  templateUrl: './dynamic-form-builder.component.html',
  styleUrls: ['./dynamic-form-builder.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, NgClass, CdkDrag, NgStyle, NgForOf, NgIf, ReactiveFormsModule, CdkDragPreview, CdkDragPlaceholder, FormsModule, KENDO_CARD, FormButtonsActionsComponent, KENDO_WINDOW, FormRowComponent, FieldsetHeaderComponent, KENDO_BUTTONS, KENDO_INDICATORS],
  providers: [GenericCrudService, FormLayoutService],
  animations: [trigger('thanosAnimation', [transition(':leave', [animate('600ms ease-in-out', keyframes([style({
    offset: 0,
    opacity: 1,
    transform: 'scale(1)',
    filter: 'blur(0)'
  }), style({ offset: 0.5, opacity: 0.5, transform: 'scale(0.8)', filter: 'blur(2px)' }), style({
    offset: 1,
    opacity: 0,
    transform: 'scale(0.4)',
    filter: 'blur(5px)'
  })]))])])],
})
export class DynamicFormBuilderComponent implements OnInit, IComponentEditor {
  // Eventos tipados com interfaces específicas
  @Output() afterSave = new EventEmitter<FormEntityEvent>();
  @Output() afterCreate = new EventEmitter<FormEntityEvent>();
  @Output() afterUpdate = new EventEmitter<FormEntityEvent>();
  @Output() beforeSubmit = new EventEmitter<FormSubmitEvent>(); // Emitido antes da submissão
  @Output() formError = new EventEmitter<FormValidationEvent>(); // Emitido quando há erros de validação
  @Output() afterLoad = new EventEmitter<FormEntityEvent>(); // Emitido após carregar uma entidade
  @Output() formReady = new EventEmitter<FormReadyEvent>(); // Emitido quando o formulário está pronto
  @Output() statusChange = new EventEmitter<FormValidationEvent>(); // Emitido quando o status do formulário muda (valid/invalid)
  @Output() valueChange = new EventEmitter<FormValueChangeEvent>(); // Emitido quando valores do formulário mudam
  @Output() layoutChange = new EventEmitter<FormLayout>(); // Emitido quando o layout muda (mantém interface existente)
  @Output() backPageClick = new EventEmitter<void>(); // Emitido quando clica no botão voltar

  private menuServiceSubscription: Subscription | undefined;
  private layoutServiceSubscription: Subscription | undefined;
  private formStatusSubscription: Subscription | undefined;

  /*
    O entityId pode ser recebido antes de resourcePath ou antes do serviço estar devidamente configurado.
    Se tentar buscar a entidade antes do serviço/rota estar pronto, pode dar erro (ou buscar no endpoint errado).
    Isso aconte quando os componentes são criados dinamicamente ou quando o resourcePath é configurado após o entityId.
    Solução  Fila + Retry
   */
  private readyToLoad$ = new BehaviorSubject<boolean>(false);
  private pendingLoadId: string | number | null = null;

  // Novo input para configurações de endpoints
  private _customEndpoints: EndpointConfig = {};
  @Input()
  get customEndpoints(): EndpointConfig {
    return this._customEndpoints;
  }
  set customEndpoints(value: EndpointConfig) {
    this._customEndpoints = value;

    // Aplicar a configuração imediatamente se o serviço já estiver disponível
    if (this.crudService && Object.keys(value).length > 0) {
      this.crudService.configureEndpoints(value);
    }
  }

  /**
   * Endpoint ou rota do recurso que será utilizado para recuperar e atualizar dados.
   */
  private _resourcePath: string = '';
  @Input()
  set resourcePath(value: string) {
    if (this._resourcePath !== value) {
      this._resourcePath = value;
      if (value) {
        this.crudService.configure(value);
        this.readyToLoad$.next(true);

        // Tenta carregar uma entidade pendente se houver
        if (this.pendingLoadId) {
          this.loadEntity(this.pendingLoadId);
          this.pendingLoadId = null;
        }
      }
    }
  }
  get resourcePath(): string {
    return this._resourcePath;
  }

  /**
   * Permite receber diretamente os metadados dos campos.
   * Se este input for fornecido, o schema é usado diretamente, sem precisar buscar via resourcePath.
   */
  @Input() fieldsMetadataInput: FieldMetadata[] | undefined;

  /**
   * Id do recurso a ser editado.
   * Se não for fornecido, o formulário será considerado em modo de inclusão.
   */
  private _entityId: string | number | null = null;
  @Input()
  get entityId(): string | number | null {
    return this._entityId;
  }
  set entityId(value: string | number | null) {
    // EntityId setter called

    // Se o valor mudou
    if (this._entityId !== value) {
      this._entityId = value;

      // Se temos um novo ID válido e o resourcePath está configurado, carrega a entidade
      // Mas apenas se já temos inicializado (para evitar dupla carga com ngOnInit)
      if (value && this.hasInitialized) {
        // Loading entity for new entityId
        this.loadEntity(value);
      } else if (!value) {
        // Se o ID foi removido ou é nulo/indefinido, limpa o formulário
        this.handleReset();
        this.originalEntity = null;
      }

      // Atualiza o modo do formulário com base no ID
      if (value) {
        if (this._formMode === 'create') {
          this._formMode = 'edit';
        }
      } else {
        if (this._formMode === 'edit' || this._formMode === 'view') {
          this._formMode = 'create';
        }
      }
    }
  }


  formGroup: FormGroup = new FormGroup({});
  formLayout!: FormLayout;
  fieldsMetadata: FieldMetadata[] = [];
  // Mapa para rastrear o estado de visibilidade das rows por ID
  hiddenRowsMap: Map<string, boolean> = new Map<string, boolean>();
  // Novo mapa para rastrear o estado de visibilidade dos fieldsets por ID
  hiddenFieldsetsMap: Map<string, boolean> = new Map<string, boolean>();
  hasPreviousRoute: boolean = false;
  // Controla a exibição do editor de JSON
  showJsonEditor: boolean = false;
  // Armazena o JSON como string para edição
  jsonEditorText: string = '';
  // Permite acesso ao objeto global Object para uso no template (ex.: Object.keys)
  protected readonly Object = Object;
  /**
   * Armazena a entidade original carregada do servidor.
   * Usada para comparações e verificação de mudanças não salvas.
   */
  private originalEntity: any = null;
  // Armazena o estado do layout do formulário
  private formSubscription: Subscription | null = null;

  isLoading: boolean = false;
  private isLoadingEntity: boolean = false;  // Separado do isLoading geral
  private isInitializing: boolean = false;
  private hasInitialized: boolean = false;
  private visibilityUpdateTimeout: any = null;

  @Input() showBackButton = true;
  @Input() forceHasPreviousRoute = false; // Para forçar a exibição do botão voltar em contextos sem rota pai (ex: dashboard)

  private get navigateAfterSave(): boolean {
    return this.formLayout?.behavior?.redirectAfterSave !== undefined;
  }

  private get navigateToPath(): string | undefined {
    return this.formLayout?.behavior?.redirectAfterSave;
  }

  get shouldShowBackButton(): boolean {
    return this.hasPreviousRoute || this.forceHasPreviousRoute;
  }

  constructor(private activatedRoute: ActivatedRoute, private router: Router, // injeta o Router
              private fb: FormBuilder, private dynamicFormGroupService: DynamicFormGroupService, private crudService: GenericCrudService<any>, // Inject GenericCrudService
              protected formLayoutService: FormLayoutService, // Injete o FormLayoutService
              private changeDetectorRef: ChangeDetectorRef,  // Injeção do ChangeDetectorRef para forçar detecção de mudanças
              private fieldMetadataSharingService: FormContextService,// Injeta o FieldMetadataSharingService
              private windowService: WindowService, private notificationService: ThNotificationService, private menuService: MenuService,
              private formEntityMapperService: FormEntityMapperService,
              ) {
  }

  /**
   * Modifique o setter para editMode para acionar o autoSave
   */
  private _editMode: boolean = false;

  get editMode(): boolean {
    return this._editMode;
  }

  @Input() set editMode(value: boolean) {
    // Se o valor realmente mudou
    if (this._editMode !== value) {
      this._editMode = value;

      // Configura o timer baseado no novo valor
      //this.configureAutoSave(value);

      // Se está saindo do modo edição, salva imediatamente
      if (!value) {
        this.saveCurrentLayout();
      }
    }
  }

  /**
   * Modo do formulário: 'create', 'edit' ou 'view'.
   * Define o comportamento do formulário e a exibição dos campos.
   */
  private _formMode: 'create' | 'edit' | 'view' = 'create';

  get formMode(): 'create' | 'edit' | 'view' {
    return this._formMode;
  }

  @Input() set formMode(mode: 'create' | 'edit' | 'view') {
    this._formMode = mode;
  }

  /**
   * Registra eventos de ciclo de vida do componente
   */
  ngOnInit(): void {
    // Component initialization

    // Configure o serviço CRUD com o resourcePath
    if (this.resourcePath) {
      this.crudService.configure(this.resourcePath);
    }

    // Inicializa o formLayout a partir do serviço
    this.initFormLayout();

    // Use a unique identifier for the form context
    this.fieldMetadataSharingService.setContext(this.getFormContextKey());

    // Inicializa o formulário
    this.initForm();

    // Marca como inicializado antes de carregar entidade (para evitar dupla carga via setter)
    this.hasInitialized = true;
    // Marking component as initialized

    if (this.entityId) {
      // Loading entity on initialization
      // Se já tiver um ID, carrega a entidade correspondente
      this.loadEntity(this.entityId);
    }

    if (this.activatedRoute.parent?.snapshot.data?.['breadcrumb']) {
      this.formLayoutService.setInitialFormTitle(this.activatedRoute.parent?.snapshot.data?.['breadcrumb']);
    }

    if (this.activatedRoute.parent?.snapshot.routeConfig?.path || this.forceHasPreviousRoute) {
      this.hasPreviousRoute = true;
    }

    this.menuServiceSubscription = this.menuService.getEditMode().subscribe(editMode => {
      this.editMode = editMode;
      // Atualize a visualização se necessário
    });

  }

  initFormLayout(): void {
    this.formLayoutService.setLayoutKey(this.getFormContextKey());

    // Inicializa o formLayout a partir do serviço
    this.layoutServiceSubscription = this.formLayoutService.layout$.subscribe(layout => {
      this.formLayout = layout;

      // Emitir evento de mudança no layout
      this.layoutChange.emit(layout);

      // Força a atualização da visibilidade após carregar o layout
      this.debouncedUpdateAllVisibility();
      this.changeDetectorRef.detectChanges();
    });
  }

ngOnDestroy(): void {
  this.unsubscribeFromForm();
  this.readyToLoad$.complete();

  if (this.menuServiceSubscription) {
    this.menuServiceSubscription.unsubscribe();
  }

  if (this.layoutServiceSubscription) {
    this.layoutServiceSubscription.unsubscribe();
  }

  if (this.formStatusSubscription) {
    this.formStatusSubscription.unsubscribe();
  }

  // Clear any pending visibility update timeout
  if (this.visibilityUpdateTimeout) {
    clearTimeout(this.visibilityUpdateTimeout);
  }
}

  /**
   * Inicializa o formulário a partir de um schema.
   *
   * Fluxo de inicialização:
   * 1. Se um schema é passado como parâmetro, ele é utilizado.
   * 2. Se não, verifica se há schema disponível no input fieldsMetadataInput.
   * 3. Se não houver, tenta buscar o schema via resourcePath.
   *
   * **Melhoria futura:**
   * - Implementar mecanismo para receber o endpoint para operações de leitura/atualização.
   * - Diferenciar as operações de inclusão e atualização.
   */
  private initForm(): void {
    this.isLoading = true;

    // Prioridade 1: Layout existente
    if (this.formLayout && this.formLayout.fieldsets?.length > 0) {
      this.initializeFormGroupWithLayout();
      return;
    }

    // Prioridade 2: Metadados fornecidos como input
    if (this.fieldsMetadataInput && this.fieldsMetadataInput.length > 0) {
      this.fieldsMetadata = [...this.fieldsMetadataInput];
    }

    // Prioridade 3: Buscar schema do servidor e aplicar layout padrão
    this.fetchSchemaAndInitializeForm();
  }

  /**
   * Busca o schema utilizando o recurso configurado no serviço CRUD.
   *
   * **Pontos de melhoria:**
   * - Adicionar tratamento de erros na chamada.
   * - Permitir configurar dinamicamente os endpoints para leitura e escrita.
   */
  fetchSchemaAndInitializeForm(): void {
    this.crudService.getSchema().subscribe((schema: FieldMetadata[]) => {
        this.fieldsMetadata = schema;
        this.initializeFormGroupWithSchema(); // Build form group after fetching schema
    });
  }

  /**
   * Inicializa o FormGroup com base no schema obtido.
   * Monta o layout (fieldsets e rows) utilizando os metadados dos campos.
   *
   * **Pontos de melhoria:**
   * - Documentar e possivelmente refatorar a lógica de construção do layout.
   * - Permitir customizações do layout via inputs ou serviço.
   */
  initializeFormGroupWithSchema(): void {

    // Se já existe um layout salvo com fieldsets e rows contendo fields, não sobrescreva.
    const hasConfiguredFieldsets = this.formLayout.fieldsets && this.formLayout.fieldsets.length > 0 && this.formLayout.fieldsets.some(fieldset => fieldset.rows && fieldset.rows.some(row => row.fields && row.fields.length > 0));

    if (hasConfiguredFieldsets) {
      // Using saved layout with existing fieldsets
      this.buildForm();
      return;
    }

    // Caso não haja fieldsets configurados, cria o fieldset padrão.
    if (!this.formLayout.fieldsets || this.formLayout.fieldsets.length === 0) {
      this.formLayout.fieldsets = [{
        id: this.generateUniqueId(), title: 'Geral', titleNew: 'Geral', titleView: 'Geral', titleEdit: 'Geral',
        orientation: 'vertical', rows: []
      }];
    }
    const firstFieldset = this.formLayout.fieldsets[0];

    // Garante que o primeiro fieldset tenha uma row; se não, cria uma nova
    let firstRow = firstFieldset.rows && firstFieldset.rows.length > 0 ? firstFieldset.rows[0] : null;
    if (!firstRow) {
      firstRow = {
        id: this.generateUniqueId(), orientation: 'vertical', fields: [], styles: {}
      };
      firstFieldset.rows = [firstRow];
    }

    // Limpa os campos existentes na primeira row e popula com os fields do schema
    firstRow.fields = [];
    this.fieldsMetadata.forEach(fieldMetadata => {
      if (fieldMetadata.hidden || fieldMetadata.formHidden) {
        // Hidden field ignored
        return;
      }
      if (!fieldMetadata.name) {
        // Warning: FieldMetadata without name attribute
      }
      firstRow.fields.push(fieldMetadata);
    });
    this.buildForm();

    // Força a atualização da visibilidade dos campos após a construção do formulário
    this.debouncedUpdateAllVisibility();
  }

  /**
   * Inicializa o FormGroup utilizando o layout atual.
   * Extraí os metadados dos campos do formLayout e constrói o grupo de controles.
   */
  initializeFormGroupWithLayout(): void {
    this.fieldsMetadata = this.extractFieldsMetadataFromLayout(this.formLayout);
    this.buildForm();
  }

  /**
   * Cria o FormGroup utilizando o serviço DynamicFormGroupService,
   * baseado nos metadados dos campos.
   */
  buildForm(): void {
    const fieldsMetadataForm = this.fieldsMetadata.filter(f => f.formHidden === false);
    this.formGroup = this.dynamicFormGroupService.createFormGroup(fieldsMetadataForm);

    // After fieldsMetadata is populated, publish it to the service
    this.fieldMetadataSharingService.setAvailableFields(fieldsMetadataForm);

    // Clean up any previous subscription
    this.unsubscribeFromForm();

    // Inicializa as regras do formulário
    this.initializeFormRules();

    // Emitir evento de formulário pronto
    const formReadyEvent: FormReadyEvent = {
      formGroup: this.formGroup,
      fieldsMetadata: this.formLayout?.fieldsets?.flatMap(fs => fs.rows.flatMap(r => r.fields)) || [],
      layout: this.formLayout,
      hasEntity: !!this.entityId,
      entityId: this.entityId || undefined
    };
    this.formReady.emit(formReadyEvent);

    // Monitorar status do formulário
    this.formStatusSubscription = this.formGroup.statusChanges.subscribe(status => {
      const validationEvent: FormValidationEvent = {
        isValid: this.formGroup.valid,
        errors: this.getValidationErrorsByField(),
        validatedFields: Object.keys(this.formGroup.controls),
        invalidFields: Object.keys(this.formGroup.controls).filter(field => {
          const control = this.formGroup.get(field);
          return control && control.invalid;
        }),
        formStatus: status as 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
      };
      this.statusChange.emit(validationEvent);
    });

    // Add the subscription with performance optimizations
    this.formSubscription = this.formGroup.valueChanges.pipe(// Wait 200ms after the last change before processing
      debounceTime(200), // Only process if values are actually different
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(values => {
        this.debouncedUpdateAllVisibility();

        const valueChangeEvent: FormValueChangeEvent = {
          formData: values,
          changedFields: Object.keys(values), // Note: For better accuracy, this would need comparison with previous values
          isValid: this.formGroup.valid,
          entityId: this.entityId || undefined
        };
        this.valueChange.emit(valueChangeEvent);
      });

    // Garantir que a visibilidade seja verificada mesmo sem mudanças nos valores
    this.debouncedUpdateAllVisibility();

    // Forçar detecção de mudanças para atualizar a UI
    this.changeDetectorRef.detectChanges();

    this.isLoading = false;
  }

  /**
   * Salva o layout atual no serviço
   */
  saveCurrentLayout(): void {
    this.formLayoutService.saveCurrentLayout();
    this.notificationService.success('Layout do formulário salvo com sucesso');
  }

  /**
   * Manipula o drop de um fieldset.
   */
  dropFieldset(event: CdkDragDrop<FormLayout['fieldsets']>): void {
    this.handleDrop(this.formLayout.fieldsets, event);
  }

  /**
   * Manipula o drop de uma row dentro de um fieldset.
   * @param event Evento de drop.
   * @param fieldset Fieldset onde a row está.
   */
  dropRow(event: CdkDragDrop<any[]>, fieldset: FieldsetLayout): void {
    this.handleDrop(fieldset.rows, event);
  }

  /**
   * Manipula o drop de um field dentro de uma row.
   * @param event Evento de drop.
   * @param fieldset Fieldset que contém a row.
   * @param row Row onde o field será inserido.
   */
  dropField(event: CdkDragDrop<any[]>, fieldset: FieldsetLayout, row: any): void {
    this.handleDrop(row.fields, event);
  }

  /**
   * Predicado para permitir drop apenas de fieldsets no nível top-level.
   */
  topLevelEnterPredicate = (drag: CdkDrag<any>, drop: CdkDropList<any>): boolean => drag.data?.type === 'fieldset';

  /**
   * Predicado para permitir drop apenas de rows em listas aninhadas.
   */
  nestedEnterPredicate = (drag: CdkDrag<any>, drop: CdkDropList<any>): boolean => drag.data?.type === 'row';

  /**
   * Recebe um Fieldset atualizado do componente filho e atualiza o formLayout de forma imutável.
   */
  onFieldsetOrientationChanged(updatedFieldset: FieldsetLayout): void {
    const updatedFieldsets = this.formLayout.fieldsets.map(f => f.id === updatedFieldset.id ? updatedFieldset : f);
    this.formLayoutService.updateLayout({ ...this.formLayout, fieldsets: updatedFieldsets });

    // Fieldset orientation updated
  }

  /**
   * Alterna a orientação de uma row.
   */
  toggleRowOrientation(row: any): void {
    // Toggling row orientation
    const newOrientation = row.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    row.orientation = newOrientation;

    this.formLayoutService.updateLayout({ ...this.formLayout });

    // Row orientation changed
  }

  /**
   * Adiciona uma nova row após a row atual.
   */
  handleAddRow(event: any): void {
    const { fieldset, row } = event;
    this.formLayoutService.addRow(fieldset.id, row?.id);
  }

  /**
   * Remove uma row do fieldset.
   */
  handleRemoveRow(event: { row: any; fieldset: FieldsetLayout }): void {
    // Usa row.data.id se existir, caso contrário usa row.id
    const rowId = event.row.data?.id || event.row.id;
    // Removing row
    // From fieldset
    this.formLayoutService.removeRow(event.fieldset.id, rowId);
  }

  /**
   * Adiciona um novo fieldset ao formulário.
   */
  handleAddFieldset(): void {
    this.formLayoutService.addFieldset();
  }

  /**
   * Remove um fieldset do formulário.
   * Apenas possível se o fieldset estiver vazio.
   */
  handleRemoveFieldset(fieldsetId: string): void {
    this.formLayoutService.removeFieldset(fieldsetId);
  }

  /**
   * Função trackBy para otimizar a renderização dos fieldsets.
   */
  trackByFieldset(index: number, fieldset: FieldsetLayout): any {
    return fieldset.id;
  }

  /**
   * Retorna um rótulo para a row com base na orientação do fieldset.
   */
  getRowLabel(fieldset: any, rowIndex: any): string {
    return fieldset.orientation === 'horizontal' ? `Column ${rowIndex + 1}` : `Linha ${rowIndex + 1}`;
  }

  /**
   * Manipula o envio do formulário.
   * Salva ou atualiza os dados dependendo do modo do formulário.
   */
  handleSubmit(): void {
    // No modo de visualização, não deve submeter o formulário
    if (this.formMode === 'view') {
      return;
    }

    if (!this.formGroup.valid) {
      // Form validation failed
      this.formGroup.markAllAsTouched();
      this.notificationService.warning('Verifique os campos destacados para continuar');
      // Emitir evento de erro no formulário
      const validationEvent: FormValidationEvent = {
        isValid: false,
        errors: this.getValidationErrorsByField(),
        validatedFields: Object.keys(this.formGroup.controls),
        invalidFields: Object.keys(this.formGroup.controls).filter(key =>
          this.formGroup.get(key)?.invalid
        ),
        formStatus: this.formGroup.status as any
      };
      this.formError.emit(validationEvent);
      return;
    }

    const formData = this.formGroup.value;
    // Submitting form data

    // Emitir evento antes da submissão
    const beforeSubmitEvent: FormSubmitEvent = {
      stage: 'before',
      formData,
      isValid: this.formGroup.valid,
      validationErrors: this.getValidationErrors(),
      entityId: this.entityId || undefined,
      operation: this.formMode === 'edit' ? 'update' : 'create'
    };
    this.beforeSubmit.emit(beforeSubmitEvent);

    // Decide entre criar ou atualizar
    if (this.formMode === 'edit' && this.entityId) {
      this.crudService.update(this.entityId, formData).subscribe({
        next: (updatedEntity) => {
          // Entity updated successfully
          this.originalEntity = updatedEntity;
          this.notificationService.success(this.formLayout.messages?.updateRegistrySuccess || 'Registro atualizado com sucesso!');

          // Emitir eventos após atualização
          const updateEvent: FormEntityEvent = {
            operation: 'update',
            entityId: this.entityId || undefined,
            entityData: updatedEntity,
            success: true,
            result: updatedEntity,
            timestamp: new Date()
          };
          this.afterUpdate.emit(updateEvent);
          this.afterSave.emit(updateEvent);

          // Navegação após salvar (se configurado)
          this.handleAfterSaveNavigation(updatedEntity);
        }, error: (error) => {
          console.error('Erro ao atualizar registro:', error);
          this.notificationService.error(this.formLayout.messages?.updateRegistryError || 'Erro ao atualizar registro');

          const errorEvent: FormValidationEvent = {
            isValid: false,
            errors: { general: [{ field: 'general', type: 'custom', message: error.message || 'Erro ao atualizar registro' }] },
            validatedFields: [],
            invalidFields: ['general'],
            formStatus: 'INVALID'
          };
          this.formError.emit(errorEvent);
        }
      });
    } else if (this.formMode === 'create') {
      this.crudService.create(formData).subscribe({
        next: (newEntity) => {
          if (!newEntity) {
            console.warn('[DynamicFormBuilder] create: received null/undefined entity from create operation');
          }
          
          // Entity created successfully
          this.formMode = 'edit';
          this.entityId = this.getEntityIdValue(newEntity);
          this.originalEntity = newEntity;
          this.notificationService.success(this.formLayout.messages?.createRegistrySuccess || 'Registro criado com sucesso!');

          // Emitir eventos após criação
          const createEvent: FormEntityEvent = {
            operation: 'create',
            entityId: this.getEntityIdValue(newEntity) || undefined,
            entityData: newEntity,
            success: true,
            result: newEntity,
            timestamp: new Date()
          };
          this.afterCreate.emit(createEvent);
          this.afterSave.emit(createEvent);

          // Navegação após salvar (se configurado)
          this.handleAfterSaveNavigation(newEntity);
        }, error: (error) => {
          console.error('Erro ao criar registro:', error);
          this.notificationService.error(this.formLayout.messages?.createRegistryError || 'Erro ao criar registro');

          const errorEvent: FormValidationEvent = {
            isValid: false,
            errors: { general: [{ field: 'general', type: 'custom', message: error.message || 'Erro ao criar registro' }] },
            validatedFields: [],
            invalidFields: ['general'],
            formStatus: 'INVALID'
          };
          this.formError.emit(errorEvent);
        }
      });
    }
  }

  /**
   * Cancela o preenchimento do formulário e restaura os dados originais
   */
  handleCancel(): void {
    // Cancel action triggered

    if (this.originalEntity && this.formMode === 'edit') {
      // Restaura os dados originais
      this.patchFormWithEntity(this.originalEntity);
      this.notificationService.info('Alterações descartadas');
    } else if (this.formMode === 'create') {
      // Limpa o formulário se estiver no modo de criação
      this.handleReset();
      this.notificationService.info('Formulário reiniciado');
    }

    /* Se uma função de callback foi configurada para o botão cancelar, atualmente não existe esta configuração no JSON
    para o futuro criar uma configuração de rota para o botão cancelar e para o botão salvar Limpar.
    if (this.navigateAfterCancel && this.navigateCancelToPath) {
      this.router.navigateByUrl(this.navigateCancelToPath.split('/:id')[0]);
    }
     */
  }

  /**
   * Reseta os controles do formulário.
   */
  handleReset(): void {
    // Resetting form
    this.formGroup.reset();
  }

  /**
   * Verifica se o formulário tem alterações não salvas
   * @returns {boolean} true se houver alterações
   */
  hasChanges(): boolean {
    // Usa o método do serviço em vez da implementação local
    return this.formEntityMapperService.hasChanges(
      this.formGroup,
      this.fieldsMetadata,
      this.originalEntity
    );
  }

  // Abre a janela modal de edição e preenche com o JSON atual formatado
  openJsonEditor(): void {
    this.jsonEditorText = JSON.stringify(this.formLayout, null, 2);
    this.showJsonEditor = true;
  }

  // Fecha a janela modal sem salvar alterações
  closeJsonEditor(): void {
    this.showJsonEditor = false;
  }

  /**
   * Handles the removal of a field from a row.
   */
  handleFieldRemove(event: { field: FieldMetadata, rowId: string }, fieldsetId: string): void {
    // Use the FormLayoutService to remove the field
    this.formLayoutService.removeField(fieldsetId, event.rowId, event.field.name);

    // Also remove the control from the FormGroup if needed
    if (this.formGroup.contains(event.field.name)) {
      this.formGroup.removeControl(event.field.name);
    }

    this.fieldMetadataSharingService.setAvailableFields(this.fieldsMetadata);
    console.log(`Field "${event.field.name}" removed from row "${event.rowId}" in fieldset "${fieldsetId}"`);
  }

  /**
   * Avalia a condição de visibilidade para uma row
   */
  evaluateRowVisibility(row: NestedFieldsetLayout): boolean {
    // Se não existir hiddenCondition, a row deve ser visível
    if (!row.hiddenCondition || !this.formGroup || !this.formGroup.value) {
      return true;
    }

    try {
      const condition = row.hiddenCondition;
      const formValues = this.formGroup.value;

      // Normaliza strings vazias para null
      const normalizedValues = Object.keys(formValues).reduce((result, key) => {
        result[key] = formValues[key] === "" ? null : formValues[key];
        return result;
      }, {} as Record<string, any>);

      // Verifica se a condição é atendida
      const matchesCondition = filterBy([normalizedValues], condition).length > 0;

      // A row deve ser visível quando a condição é atendida (lógica invertida)
      return matchesCondition;
    } catch (error) {
      console.error('Erro ao avaliar visibilidade da row:', error);
      return true; // Em caso de erro, mostrar a row
    }
  }

  /**
   * Atualiza a visibilidade de todas as rows em todos os fieldsets
   */
  updateAllRowsVisibility(): void {
    if (!this.formLayout?.fieldsets) return;

    this.formLayout.fieldsets.forEach(fieldset => {
      fieldset.rows.forEach(row => {
        this.hiddenRowsMap.set(row.id, !this.evaluateRowVisibility(row));
      });
    });

    this.changeDetectorRef.markForCheck();
  }

  /**
   * Avalia a condição de visibilidade para um fieldset
   */
  evaluateFieldsetVisibility(fieldset: FieldsetLayout): boolean {
    // Se não existir hiddenCondition, o fieldset deve ser visível
    if (!fieldset.hiddenCondition || !this.formGroup) {
      return true;
    }

    const condition = fieldset.hiddenCondition;
    const formValues = this.formGroup.value;

    // Normaliza strings vazias para null
    const normalizedValues = Object.keys(formValues).reduce((result, key) => {
      result[key] = formValues[key] === "" ? null : formValues[key];
      return result;
    }, {} as Record<string, any>);

    // Verifica se a condição é atendida
    const matchesCondition = filterBy([normalizedValues], condition).length > 0;

    // O fieldset deve ser visível quando a condição é atendida (lógica invertida)
    return matchesCondition;
  }

  /**
   * Debounced version of updateAllVisibility to prevent excessive calls
   */
  private debouncedUpdateAllVisibility(): void {
    if (this.visibilityUpdateTimeout) {
      clearTimeout(this.visibilityUpdateTimeout);
    }

    this.visibilityUpdateTimeout = setTimeout(() => {
      this.updateAllVisibility();
    }, 50);
  }

  /**
   * Atualiza a visibilidade de todos os fieldsets e rows
   */
  updateAllVisibility(): void {
    if (!this.formLayout?.fieldsets) {
        return;
    }
    // Atualiza visibilidade dos fieldsets
    this.formLayout.fieldsets.forEach(fieldset => {
      const isVisible = this.evaluateFieldsetVisibility(fieldset);
      this.hiddenFieldsetsMap.set(fieldset.id, !isVisible);

      // Atualiza visibilidade das rows dentro de cada fieldset
      fieldset.rows.forEach(row => {
        const isRowVisible = this.evaluateRowVisibility(row);
        this.hiddenRowsMap.set(row.id, !isRowVisible);
      });
    });

    // Desabilita o formulário imediatamente se estiver no modo de visualização
    if (this.formMode === 'view') {
      console.log('Modo view detectado, desabilitando formulário após patching...');
      setTimeout(() => {
        this.disableForm();
        this.changeDetectorRef.markForCheck();
      }, 100); // Um timeout um pouco maior para garantir que aconteça depois de outras operações
    }

  }

  /**
   * Obtém os erros de validação do formulário
   */
  private getValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!this.formGroup) {
      return errors;
    }

    Object.keys(this.formGroup.controls).forEach(fieldName => {
      const control = this.formGroup.get(fieldName);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorType => {
          errors.push({
            field: fieldName,
            type: errorType as any,
            message: this.getErrorMessage(fieldName, errorType, control.errors![errorType]),
            currentValue: control.value,
            expectedValue: control.errors![errorType]
          });
        });
      }
    });

    return errors;
  }

  /**
   * Obtém erros agrupados por campo
   */
  private getValidationErrorsByField(): { [fieldName: string]: ValidationError[] } {
    const errorsByField: { [fieldName: string]: ValidationError[] } = {};

    if (!this.formGroup) {
      return errorsByField;
    }

    Object.keys(this.formGroup.controls).forEach(fieldName => {
      const control = this.formGroup.get(fieldName);
      if (control && control.errors) {
        errorsByField[fieldName] = [];
        Object.keys(control.errors).forEach(errorType => {
          errorsByField[fieldName].push({
            field: fieldName,
            type: errorType as any,
            message: this.getErrorMessage(fieldName, errorType, control.errors![errorType]),
            currentValue: control.value,
            expectedValue: control.errors![errorType]
          });
        });
      }
    });

    return errorsByField;
  }

  /**
   * Gera mensagem de erro amigável
   */
  private getErrorMessage(fieldName: string, errorType: string, errorValue: any): string {
    switch (errorType) {
      case 'required':
        return `O campo ${fieldName} é obrigatório`;
      case 'email':
        return `O campo ${fieldName} deve conter um email válido`;
      case 'min':
        return `O campo ${fieldName} deve ter valor mínimo de ${errorValue.min}`;
      case 'max':
        return `O campo ${fieldName} deve ter valor máximo de ${errorValue.max}`;
      case 'pattern':
        return `O campo ${fieldName} não atende ao padrão exigido`;
      default:
        return `O campo ${fieldName} contém erro: ${errorType}`;
    }
  }

  //openFormSettings
  openFormSettings(): void {
    const windowRef = this.windowService.open({
      title: 'Configurações do Formulário', content: FormSettingsEditorComponent, width: 800, height: 600
    });

    const editor = windowRef.content.instance as FormSettingsEditorComponent;
    editor.formLayout = this.formLayout;
    editor.formLayoutChange.subscribe((updatedLayout: FormLayout) => {
      this.formLayout = updatedLayout;
      this.formLayoutService.saveCurrentLayout(updatedLayout);
    });
    editor.close.subscribe(() => windowRef.close());
  }

  // Método padronizado para abertura do editor
  openEditor(): void {
    this.openFormSettings();
  }

  /**
   * Indica se o componente tem um editor implementado
   * @returns true - este componente tem editor
   */
  hasEditor(): boolean {
    return true;
  }

  //openModificationHistory
  openModificationHistory(): void {
    // Lógica para abrir o histórico de modificações
    console.log('Abrindo histórico de modificações...');
    // Aqui você pode implementar a lógica para abrir um modal ou uma nova página com o histórico
  }

  //openActionsConfiguration
  openActionsConfiguration(): void {
    // Lógica para abrir as configurações de ações
    console.log('Abrindo configurações de ações...');
    // Aqui você pode implementar a lógica para abrir um modal ou uma nova página com as configurações
  }

  /**
   * Carrega os dados de uma entidade específica pelo ID.
   */

  /**
   * Carrega os dados de uma entidade específica pelo ID.
   * Implementa abordagem reativa para aguardar a configuração completa.
   */
loadEntity(id: string | number): void {
  // Verificação de ID válido
  if (!id || id === 'null' || id === 'undefined') {
    console.warn('[DynamicFormBuilder] loadEntity: invalid ID provided:', id);
    return;
  }

  // Loading entity for ID: ${id}

  if (!this.crudService || !this.resourcePath) {
    // Waiting for CRUD service configuration
    this.pendingLoadId = id;
    return;
  }

  // Previne carregamento duplo
  if (this.isLoadingEntity) {
    // Already loading entity, ignoring duplicate call
    return;
  }

  // Starting entity load
  this.isLoadingEntity = true;
  this.crudService.getById(id).subscribe({
    next: (entity) => {
      if (!entity) {
        console.warn('[DynamicFormBuilder] loadById: received null/undefined entity for id:', id);
      }
      
      this.originalEntity = entity;
      this.isLoadingEntity = false;

      // Verifica se o formulário já está pronto
      if (this.formGroup && Object.keys(this.formGroup.controls).length > 0) {
        this.patchFormWithEntity(entity);
        const loadEvent: FormEntityEvent = {
          operation: 'load',
          entityId: this.getEntityIdValue(entity) || undefined,
          entityData: entity,
          success: true,
          result: entity,
          timestamp: new Date()
        };
        this.afterLoad.emit(loadEvent);
      } else {
        // Se não estiver pronto, configura um listener de evento único para formReady
        const formReadySubscription = this.formReady.subscribe((formGroup) => {
          this.patchFormWithEntity(entity);
          const loadEvent: FormEntityEvent = {
            operation: 'load',
            entityId: this.getEntityIdValue(entity) || undefined,
            entityData: entity,
            success: true,
            result: entity,
            timestamp: new Date()
          };
          this.afterLoad.emit(loadEvent);
          formReadySubscription.unsubscribe(); // Importante para evitar memory leaks
        });
      }
    },
    error: (error) => {
      console.error('Erro ao carregar entidade:', error);
      this.isLoadingEntity = false;

      const errorEvent: FormValidationEvent = {
        isValid: false,
        errors: { general: [{ field: 'general', type: 'custom', message: error.message || 'Erro ao carregar entidade' }] },
        validatedFields: [],
        invalidFields: ['general'],
        formStatus: 'INVALID'
      };
      this.formError.emit(errorEvent);
    }
  });
}


  // Método para salvar o JSON editado
  saveJsonEditorChanges(): void {
    try {
      // Parse do texto JSON
      const newLayout = JSON.parse(this.jsonEditorText);

      // Valide se a estrutura básica está intacta
      if (!newLayout.fieldsets || !Array.isArray(newLayout.fieldsets)) {
        throw new Error("JSON inválido: estrutura de fieldsets não encontrada");
      }

      // Atualize o layout do formulário
      this.formLayout = newLayout;

      // Salve no serviço
      this.formLayoutService.updateLayout(newLayout);

      // Reconstrua o formulário se necessário
      this.initializeFormGroupWithLayout();

      // Feche o editor
      this.showJsonEditor = false;

      // Notifique o usuário
      this.notificationService.success("Layout do formulário atualizado com sucesso!");

    } catch (error) {
      console.error("Erro ao processar JSON:", error);
      this.notificationService.error("JSON inválido. Verifique a estrutura do documento.");
    }
  }

  /**
   * Atualiza as regras do formulário e dispara a revalidação do layout.
   * @param updatedRules Lista atualizada de regras do formulário
   */
  updateFormRules(updatedRules: FormLayoutRule[]): void {
    // Obter o layout atual
    const current = this.formLayoutService.currentLayout;

    // Criar novo layout com regras atualizadas
    const newLayout = { ...current, formRules: updatedRules };

    // Atualizar o layout no serviço
    this.formLayoutService.updateLayout(newLayout);

    // Atualizar as regras no serviço de contexto para aplicação imediata
    this.fieldMetadataSharingService.setFormRules(updatedRules);

    // Atualizar a visibilidade condicional dos elementos
    this.updateAllVisibility();

    // Disparar detecção de mudanças para garantir que a UI seja atualizada
    this.changeDetectorRef.detectChanges();

    // Emitir evento de mudança no layout
    this.layoutChange.emit(newLayout);

    // Notificar o usuário
    this.notificationService.success('Regras do formulário atualizadas com sucesso');

    console.log('Regras do formulário atualizadas:', updatedRules.length);
  }

  /*
  * Este método é responsável por gerenciar a navegação de volta à página anterior quando o usuário clica no botão de
  * voltar no formulário dinâmico. O método implementa uma lógica de fallback para garantir que a navegação ocorra mesmo
  * quando não há observadores externos configurados.
  * */
  handleBackToPrevious(): void {
    if (this.backPageClick.observed) {
      this.backPageClick.emit();
    } else {
      this.backToPreviousRoute();
    }
  }

  backToPreviousRoute(): void {
    let route = this.activatedRoute;
    let previousRoutes: string[] = [];

    while (route.parent) {
      console.table(route.snapshot.routeConfig?.path)
      route = route.parent;
      const routePath = route.snapshot.routeConfig?.path;

      if (routePath && routePath !== '') {
        previousRoutes.unshift(routePath);
      }
    }

    if (previousRoutes.length) {
      const completePreviousRoute = '/' + previousRoutes.join('/');
      this.router.navigate([completePreviousRoute]);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Extrai os metadados de todos os campos do formLayout.
   * @param formLayout Layout do formulário contendo fieldsets e rows.
   * @returns Array de FieldMetadata extraído do layout.
   */
  private extractFieldsMetadataFromLayout(formLayout: FormLayout): FieldMetadata[] {
    let metadata: FieldMetadata[] = [];
    formLayout.fieldsets.forEach(fieldset => {
      fieldset.rows.forEach(row => {
        metadata = [...metadata, ...row.fields];
      });
    });
    return metadata;
  }

  private unsubscribeFromForm(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
      this.formSubscription = null;
    }
  }

  /**
   * Inicializa as regras do formulário no FormContextService
   */
  private initializeFormRules(): void {
    if (this.formLayout?.formRules) {
      this.fieldMetadataSharingService.setFormRules(this.formLayout.formRules);
      console.log('Regras do formulário inicializadas:', this.formLayout.formRules.length);
    }
  }

  /**
   * Função genérica para manipular eventos de drop (arrastar e soltar).
   *
   * **Melhoria futura:** Validar tipos e adicionar tratamento de erros se necessário.
   */
  private handleDrop<T>(list: T[], event: CdkDragDrop<T[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(list, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, list, event.previousIndex, event.currentIndex);
    }

    // Força a atualização da view:
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Gera um ID único para identificar fieldsets e rows.
   *
   * **Melhoria futura:** Se necessário, implementar uma estratégia de geração de IDs mais robusta.
   */
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Gerencia a navegação após salvar um registro
   */
  private handleAfterSaveNavigation(entity: any): void {
    if (this.navigateAfterSave) {
      const entityId = this.getEntityIdValue(entity);

      if (this.navigateToPath) {
        // Se tem um caminho específico, navega para ele
        // Substitui :id pelo ID real do registro quando presente
        const path = this.navigateToPath.replace(':id', entityId?.toString() || 'new');
        this.router.navigateByUrl(path);
      } else {
        // Comportamento padrão: voltar para a listagem
        // Assume-se que estamos em "/resource/:id" e queremos voltar para "/resource"
        const currentUrl = this.router.url;
        const listUrl = currentUrl.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(listUrl);
      }
    }
  }

  /**
   * Habilita todos os controles do formulário para edição
   */
  private enableForm(): void {
    // Se estiver no modo view, não deve habilitar
    if (this.formMode === 'view') {
      console.log('Tentativa de habilitar formulário no modo view ignorada');
      return;
    }

    console.log('Habilitando formulário para edição...');
    Object.keys(this.formGroup.controls).forEach(controlName => {
      const control = this.formGroup.get(controlName);
      // Só habilita se não houver configuração específica para manter o campo desabilitado
      const fieldMetadata = this.fieldsMetadata.find(f => f.name === controlName);
      if (!fieldMetadata?.disabled) {
        control?.enable();
      }
    });
  }


  /**
   * Preenche o formulário com os dados da entidade e aplica configurações
   * de acordo com o modo do formulário.
   */
  private patchFormWithEntity(entity: any): void {
    if (!entity) {
      console.warn('[DynamicFormBuilder] patchFormWithEntity: entity is null or undefined');
      return;
    }
    
    try {
      // Usa o serviço para preencher o formulário
      this.formEntityMapperService.patchFormWithEntity(
        this.formGroup,
        this.fieldsMetadata,
        entity
      );

      // Atualiza visibilidade condicional após preencher
      this.updateAllVisibility();

    } catch (error) {
      console.error('Erro ao preencher o formulário com dados da entidade:', error);
      this.notificationService.warning('Alguns dados podem não ter sido carregados corretamente no formulário');
      // Continua a execução para não bloquear o formulário
    }
  }

  /**
   * Desabilita todos os controles do formulário para o modo de visualização
   */
  private disableForm(): void {
    if (!this.formGroup) return;
    Object.keys(this.formGroup.controls).forEach(controlName => {
      const control = this.formGroup.get(controlName);
      if (control) {
        control.disable({ emitEvent: false });
      }
    });

    // Marcar o formulário explicitamente como desabilitado
    this.formGroup.disable({ emitEvent: false });

    // Forçar detecção de mudanças para atualizar a UI
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Extracts the ID value from the entity object.
   * @param entity The entity object returned from the backend.
   * @returns The ID value of the entity.
   */
  private getEntityIdValue(entity: any): string | number | null {
    if (!entity) {
      console.warn('[DynamicFormBuilder] getEntityIdValue: entity is null or undefined');
      return null;
    }
    return entity.id || entity._id || null;
  }

  // Método para emitir evento quando houver mudança no layout
  private emitLayoutChange(): void {
    this.layoutChange.emit(this.formLayout);
  }
  /**
   * Obtém a chave única para identificar o contexto do formulário,
   * garantindo consistência entre diferentes serviços.
   *
   * @returns {string} A chave única para o contexto do formulário
   */
  private getFormContextKey(): string {
    return this.formLayoutService.generateFormLayoutKey(
      this.crudService.schemaUrl(),
      this.router.url,
      this.constructor.name
    );
  }

}
