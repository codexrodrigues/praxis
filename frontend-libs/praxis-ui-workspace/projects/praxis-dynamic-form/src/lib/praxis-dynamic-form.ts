import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  GenericCrudService,
  FieldMetadata,
  mapFieldDefinitionsToMetadata,
  EndpointConfig,
  FieldControlType,
  MaterialDatepickerMetadata,
  MaterialDateRangeMetadata,
  DateRangeValue,
  MaterialPriceRangeMetadata,
  PriceRangeValue,
} from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import {
  FormConfig,
  syncWithServerMetadata,
  mergeFieldMetadata,
  getReferencedFieldMetadata,
  SyncResult,
  FormLayout,
  FormSubmitEvent,
  FormReadyEvent,
  FormValueChangeEvent,
  FormInitializationError,
  FormSection,
  FormRow,
  FormColumn,
  FormActionButton,
  FormCustomActionEvent,
  FormActionConfirmationEvent,
} from '@praxis/core';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@praxis/dynamic-fields';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';
import { FormRulesService } from './services/form-rules.service';
import { CONFIG_STORAGE, ConfigStorage } from '@praxis/core';
import { PraxisDynamicFormConfigEditor } from './praxis-dynamic-form-config-editor';
import { SettingsPanelService } from '@praxis/settings-panel';
import { normalizeFormConfig } from './utils/normalize-form-config';

@Component({
  selector: 'praxis-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFieldLoaderDirective,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
  ],
  template: `
    @if (isLoading) {
      <!-- Loading State -->
      <div class="form-loading">
        <mat-progress-spinner diameter="40"></mat-progress-spinner>
        <p>Carregando formulário...</p>
      </div>
    } @else if (initializationStatus === 'error') {
      <!-- Error State -->
      <div class="form-error">
        <mat-icon color="warn">error</mat-icon>
        <h3>{{ getErrorTitle() }}</h3>
        <p>{{ currentErrorMessage }}</p>
        @if (isRecoverable) {
          <button mat-stroked-button (click)="retryInitialization()">
            <mat-icon>refresh</mat-icon>
            Tentar Novamente
          </button>
        }
        <button mat-button (click)="showDetailedError()" class="show-details">
          Ver Detalhes Técnicos
        </button>
      </div>
    } @else if (initializationStatus === 'success') {
      <!-- Configuration Controls -->
      @if (shouldShowConfigControls) {
        <div class="form-config-controls">
          <button
            type="button"
            mat-icon-button
            (click)="toggleEditMode()"
            [matTooltip]="
              effectiveEditModeEnabled
                ? 'Desabilitar customização do formulário'
                : 'Habilitar customização do formulário'
            "
            class="layout-customize-toggle"
            [class.active]="effectiveEditModeEnabled"
            [attr.aria-label]="
              effectiveEditModeEnabled
                ? 'Sair do modo de customização de layout'
                : 'Entrar no modo de customização de layout'
            "
          >
            <mat-icon>{{
              effectiveEditModeEnabled ? 'design_services' : 'tune'
            }}</mat-icon>
          </button>

          @if (effectiveEditModeEnabled) {
            <button
              type="button"
              mat-icon-button
              (click)="openConfigEditor()"
              matTooltip="Configurar formulário"
              [disabled]="isLoading"
              class="config-button"
            >
              <mat-icon>settings</mat-icon>
            </button>
          }
        </div>
      }

      <!-- Form Content -->
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="praxis-dynamic-form"
        [class.layout-edit-mode]="effectiveEditModeEnabled"
        [attr.aria-label]="'Formulário ' + (config.metadata?.version || '')"
      >
        @for (section of config.sections; track section.id) {
          <div
            class="form-section"
            [class.layout-editable]="effectiveEditModeEnabled"
            [attr.data-section-id]="section.id"
          >
            @if (section.title) {
              <h3 class="section-title">{{ section.title }}</h3>
            }
            @if (section.description) {
              <p class="section-description">{{ section.description }}</p>
            }

            @for (row of section.rows; track $index; let rowIndex = $index) {
              <div
                class="form-row"
                [class.layout-editable]="effectiveEditModeEnabled"
                [attr.data-row-index]="rowIndex"
                [attr.data-section-id]="section.id"
              >
                @for (
                  column of row.columns;
                  track $index;
                  let colIndex = $index
                ) {
                  @if (isColumnVisible(column)) {
                    <div
                      class="form-column"
                      [class.layout-editable]="effectiveEditModeEnabled"
                      [attr.data-column-index]="colIndex"
                      [attr.data-row-index]="rowIndex"
                      [attr.data-section-id]="section.id"
                    >
                      <ng-container
                        dynamicFieldLoader
                        [fields]="getColumnFields(column)"
                        [formGroup]="form"
                      >
                      </ng-container>
                    </div>
                  }
                }
              </div>
            }
          </div>
        }

        <div
          class="form-actions"
          [class.loading]="isLoading"
          [style.justify-content]="
            config.actions?.position === 'justified' ||
            config.actions?.position === 'split'
              ? 'space-between'
              : config.actions?.position
          "
          [ngClass]="[
            'position-' + (config.actions?.position || 'right'),
            'orientation-' + (config.actions?.orientation || 'horizontal'),
            'spacing-' + (config.actions?.spacing || 'normal'),
            {
              'mobile-menu-active':
                config.actions?.mobile?.collapseToMenu ?? false
            }
          ]"
        >
          <!-- Desktop/Normal View -->
          <div class="desktop-actions">
            @for (button of getActionButtons(); track button.id) {
              @if (button.visible) {
                <button
                  [type]="button.type || 'button'"
                  [mat-raised-button]="
                    button.variant === 'raised' || !button.variant
                  "
                  [mat-stroked-button]="button.variant === 'stroked'"
                  [mat-flat-button]="button.variant === 'flat'"
                  [mat-fab]="button.variant === 'fab'"
                  [color]="button.color"
                  [disabled]="
                    button.disabled ||
                    (button.type === 'submit' && form.invalid)
                  "
                  [matTooltip]="button.tooltip"
                  (click)="onActionButtonClick(button, $event)"
                  [attr.aria-label]="button.label"
                >
                  @if (button.icon) {
                    <mat-icon>{{ button.icon }}</mat-icon>
                  }
                  <span>{{ button.label }}</span>
                </button>
              }
            }
          </div>

          <!-- Mobile Collapsed View -->
          @if (config.actions?.mobile?.collapseToMenu) {
            <div class="mobile-actions">
              @for (button of getVisibleButtons(); track button.id) {
                <button
                  [type]="button.type || 'button'"
                  [mat-raised-button]="
                    button.variant === 'raised' || !button.variant
                  "
                  [mat-stroked-button]="button.variant === 'stroked'"
                  [mat-flat-button]="button.variant === 'flat'"
                  [mat-fab]="button.variant === 'fab'"
                  [color]="button.color"
                  [disabled]="
                    button.disabled ||
                    (button.type === 'submit' && form.invalid)
                  "
                  [matTooltip]="button.tooltip"
                  (click)="onActionButtonClick(button, $event)"
                  [attr.aria-label]="button.label"
                >
                  @if (button.icon) {
                    <mat-icon>{{ button.icon }}</mat-icon>
                  }
                  <span>{{ button.label }}</span>
                </button>
              }
              @if (getCollapsedButtons().length > 0) {
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="actionsMenu"
                  aria-label="More actions"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionsMenu="matMenu">
                  @for (button of getCollapsedButtons(); track button.id) {
                    <button
                      mat-menu-item
                      (click)="onActionButtonClick(button, $event)"
                      [disabled]="button.disabled"
                    >
                      @if (button.icon) {
                        <mat-icon>{{ button.icon }}</mat-icon>
                      }
                      <span>{{ button.label }}</span>
                    </button>
                  }
                </mat-menu>
              }
            </div>
          }
        </div>
      </form>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      .form-config-controls {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        gap: 0.5rem;
        z-index: 100;
        background-color: var(--md-sys-color-surface-container);
        padding: 0.5rem;
        border-radius: 0 0 0 8px;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-top: none;
        border-right: none;
        /* Fixar largura para evitar mudança de posição */
        min-width: 100px;
        justify-content: flex-end;
      }

      .layout-customize-toggle {
        transition: all 0.2s ease;
        /* Fixar tamanho para evitar mudança de posição */
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
      }

      .layout-customize-toggle.active {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        /* Remover animação que pode causar instabilidade */
      }

      .config-button {
        color: var(--md-sys-color-primary);
      }

      .form-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        color: var(--md-sys-color-on-surface);
        gap: 1rem;
      }

      .form-loading p {
        margin: 0;
        font-size: 0.875rem;
        opacity: 0.7;
      }

      .form-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        color: var(--md-sys-color-error);
        gap: 1rem;
        border: 1px solid var(--md-sys-color-error);
        border-radius: 8px;
        background-color: var(--md-sys-color-error-container);
        margin: 1rem;
      }

      .form-error h3 {
        margin: 0;
        color: var(--md-sys-color-on-error-container);
      }

      .form-error p {
        margin: 0;
        color: var(--md-sys-color-on-error-container);
        opacity: 0.8;
      }

      .form-error button {
        margin-top: 0.5rem;
      }

      .praxis-dynamic-form {
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
      }

      /* Layout Edit Mode - Visual Indicators */
      .layout-edit-mode {
        background-color: var(--md-sys-color-surface-container-low);
        border: 2px dashed var(--md-sys-color-primary);
        border-radius: 12px;
        padding: 1rem;
        position: relative;
      }

      .layout-edit-mode::before {
        content: '🎨 Modo de Customização';
        position: absolute;
        top: -8px;
        left: 16px;
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 500;
        z-index: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        /* Não interferir no layout */
        pointer-events: none;
      }

      .form-section {
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        padding: 1rem;
        background-color: var(--md-sys-color-surface-container-lowest);
        transition: all 0.2s ease;
        position: relative;
      }

      /* Layout Editable - Hover Effects (drag implementado futuramente) */
      .form-section.layout-editable {
        /* Border transparente para evitar layout shift */
        border: 1px solid transparent;
      }

      .form-section.layout-editable:hover {
        border: 1px dashed var(--md-sys-color-primary);
        /* Remover background que pode causar expansão visual */
      }

      .section-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface);
      }

      .section-description {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        color: var(--md-sys-color-on-surface-variant);
      }

      .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
        border-radius: 6px;
        position: relative;
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .form-row.layout-editable {
        position: relative;
        /* Border transparente para evitar layout shift */
        border: 1px solid transparent;
        border-radius: 4px;
        /* Remover padding para evitar expansão */
        margin: -1px;
      }

      .form-row.layout-editable:hover {
        border: 1px dashed var(--md-sys-color-secondary);
        /* Remover background que pode causar expansão visual */
      }

      .form-column {
        flex: 1;
        min-width: 0;
        transition: all 0.2s ease;
        border-radius: 4px;
        position: relative;
      }

      .form-column.layout-editable {
        position: relative;
        /* Border transparente para evitar layout shift */
        border: 1px solid transparent;
        border-radius: 4px;
        /* Remover padding para evitar expansão */
        margin: -1px;
      }

      .form-column.layout-editable:hover {
        border: 1px dashed var(--md-sys-color-tertiary);
        /* Remover background que pode causar expansão visual */
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border-top: 1px solid var(--md-sys-color-outline-variant);
        background-color: var(--md-sys-color-surface-container-lowest);
        position: sticky;
        bottom: 0;
        z-index: 1;
      }

      .form-actions.loading {
        pointer-events: none;
        opacity: 0.7;
      }

      .mobile-actions {
        display: none;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-section {
          padding: 1rem;
        }

        .form-actions {
          padding: 0.75rem;
        }

        .form-actions.mobile-menu-active {
          .desktop-actions {
            display: none;
          }
          .mobile-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
        }
      }
    `,
  ],
})
export class PraxisDynamicForm implements OnInit, OnChanges, OnDestroy {
  private readonly DEBUG =
    typeof window !== 'undefined' &&
    Boolean((window as any)['__PRAXIS_DEBUG__']);
  @Input() resourcePath?: string;
  @Input() resourceId?: string | number;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() config: FormConfig = { sections: [] };
  /**
   * CUSTOMIZAÇÃO DE LAYOUT - NÃO confundir com edição de dados do formulário
   *
   * Este flag controla se o usuário pode customizar a ESTRUTURA do formulário:
   * - Mover sections, rows, columns
   * - Configurar layout e aparência
   * - Acessar editor de configuração
   *
   * É INDEPENDENTE do mode (view/edit/create) que controla os DADOS do registro
   *
   * @example
   * // Formulário em modo VIEW de dados + customização HABILITADA
   * <praxis-dynamic-form mode="view" [editModeEnabled]="true">
   *
   * // Formulário em modo EDIT de dados + customização DESABILITADA
   * <praxis-dynamic-form mode="edit" [editModeEnabled]="false">
   */
  @Input() editModeEnabled = false;
  /** Identifier for persisting layouts */
  @Input() formId?: string;
  /** Optional layout to use instead of generated one */
  @Input() layout?: FormLayout;

  /** Custom endpoints for CRUD operations */
  private _customEndpoints: EndpointConfig = {};
  @Input()
  get customEndpoints(): EndpointConfig {
    return this._customEndpoints;
  }
  set customEndpoints(value: EndpointConfig) {
    this._customEndpoints = value;
    if (value && Object.keys(value).length > 0) {
      this.crud.configureEndpoints(value);
    }
  }

  @Output() formSubmit = new EventEmitter<FormSubmitEvent>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formReset = new EventEmitter<void>();
  @Output() configChange = new EventEmitter<FormConfig>();
  @Output() formReady = new EventEmitter<FormReadyEvent>();
  @Output() valueChange = new EventEmitter<FormValueChangeEvent>();
  @Output() syncCompleted = new EventEmitter<SyncResult>();
  @Output() initializationError = new EventEmitter<FormInitializationError>();
  @Output() editModeEnabledChange = new EventEmitter<boolean>();
  @Output() customAction = new EventEmitter<FormCustomActionEvent>();
  @Output() actionConfirmation = new EventEmitter<FormActionConfirmationEvent>();

  // Estado interno para UX
  isLoading = false;
  initializationStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  currentErrorMessage = '';
  currentErrorDetails: any = null;
  isRecoverable = false;
  private isInitialized = false;

  // ESTADO INTERNO para CUSTOMIZAÇÃO DE LAYOUT (não muta o @Input)
  // Este estado permite toggle da customização independente dos dados do formulário
  // Persiste entre sessões para experiência corporativa consistente
  private _internalEditModeEnabled: boolean = false;

  // Flag para indicar se houve interação do usuário (toggle manual)
  // Quando true, o estado interno tem precedência sobre o @Input
  private _userHasToggledEditMode: boolean = false;

  form!: FormGroup;
  fieldVisibility: { [fieldName: string]: boolean } = {};
  private pendingEntityId: string | number | null = null;
  private loadedEntityId: string | number | null = null;
  private loadedEntityData: Record<string, any> | null = null;
  private schemaCache: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private crud: GenericCrudService<any>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutService: FormLayoutService,
    private contextService: FormContextService,
    private rulesService: FormRulesService,
    private settingsPanel: SettingsPanelService,
    private dialog: MatDialog,
    @Inject(CONFIG_STORAGE) private configStorage: ConfigStorage,
  ) {
    this.form = this.fb.group({});
    console.debug('[PDF] ctor inputs', {
      formId: this.formId,
      resourcePath: this.resourcePath,
      mode: this.mode,
    });
  }

  // Getter para o estado efetivo de CUSTOMIZAÇÃO DE LAYOUT
  // Lógica de precedência:
  // 1. Se usuário fez toggle manual -> usar estado interno
  // 2. Senão -> usar @Input como fallback
  get effectiveEditModeEnabled(): boolean {
    return this._userHasToggledEditMode
      ? this._internalEditModeEnabled
      : this.editModeEnabled;
  }

  // Getter para determinar se deve mostrar os controles de configuração
  get shouldShowConfigControls(): boolean {
    // Sempre mostrar em contexto corporativo (quando tem formId)
    // editModeEnabled é independente do mode do formulário
    return !!this.formId;
  }

  ngOnInit(): void {
    console.debug('[PDF] ngOnInit gating', {
      formId: this.formId,
      resourcePath: this.resourcePath,
    });
    // Carregar estado persistido de CUSTOMIZAÇÃO DE LAYOUT (não confundir com dados)
    if (this.formId) {
      const customizationModeKey = `praxis-layout-customization-${this.formId}`;
      const userToggledKey = `praxis-user-toggled-${this.formId}`;

      const savedCustomizationMode =
        this.configStorage.loadConfig<boolean>(customizationModeKey);
      const savedUserToggled =
        this.configStorage.loadConfig<boolean>(userToggledKey);

      if (savedCustomizationMode !== null) {
        this._internalEditModeEnabled = savedCustomizationMode;
      }

      if (savedUserToggled !== null) {
        this._userHasToggledEditMode = savedUserToggled;
      }
    }

    // Initialize form based on the new flow
    if (
      this.formId &&
      this.resourcePath &&
      !this.isInitialized &&
      !this.isLoading
    ) {
      this.initializeForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourcePath'] && this.resourcePath) {
      console.debug(
        '[PDF] ngOnChanges resourcePath=',
        this.resourcePath,
        ' -> configure()',
      );
      this.crud.configure(this.resourcePath);
      // this.loadSchema(); // se houver
      if (!this.isInitialized && !this.isLoading && this.formId) {
        this.initializeForm();
      }
    }

    if (changes['resourceId']) {
      console.debug('[PDF] ngOnChanges resourceId=', this.resourceId);
      this.pendingEntityId = this.resourceId ?? null;
      if (this.config.fieldMetadata?.length && this.pendingEntityId != null) {
        this.loadEntity();
      }
    }
  }

  private async initializeForm(): Promise<void> {
    console.debug('[PDF] initializeForm:start', {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
    });
    // Prevent duplicate initialization
    if (this.isInitialized || this.isLoading) {
      this.debugLog('⚠️ Skipping duplicate initialization', {
        isInitialized: this.isInitialized,
        isLoading: this.isLoading,
      });
      return;
    }

    // Validação obrigatória para cenários corporativos
    if (!this.resourcePath || !this.formId) {
      const error = new Error(
        `Form initialization failed: ${!this.formId ? 'formId' : 'resourcePath'} is required for corporate form management`,
      );
      this.handleInitializationError('config-load', error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig: false,
      });
      return;
    }

    this.isLoading = true;
    this.initializationStatus = 'loading';

    try {
      // Step 1: Check for local saved config
      const configKey = `praxis-form-config-${this.formId}`;
      const localConfig = this.configStorage.loadConfig<FormConfig>(configKey);
      console.debug(
        '[PDF] initializeForm:flow',
        localConfig ? 'LOCAL_CONFIG_SYNC' : 'SERVER_DEFAULT',
      );

      if (localConfig) {
        // Flow 1: Has local config - load it and sync with server
        this.debugLog('🔄 Loading saved form configuration');
        this.config = localConfig;
        await this.syncWithServer();
      } else {
        // Flow 2: No local config - create default from server
        this.debugLog('🆕 Creating new form configuration from server');
        await this.createDefaultConfig();
      }

      console.debug('[PDF] initializeForm:buildForm');
      // Build the form
      this.buildFormFromConfig();

      // Load entity data if needed
      if (this.pendingEntityId != null) {
        this.loadEntity();
      }

      console.debug('[PDF] initializeForm:success');
      this.initializationStatus = 'success';
      this.isInitialized = true;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('[PDF] initializeForm:error', error);
      this.handleInitializationError('form-build', error as Error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig:
          this.configStorage.loadConfig(`praxis-form-config-${this.formId}`) !==
          null,
      });
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private handleInitializationError(
    stage: FormInitializationError['stage'],
    error: Error,
    context?: FormInitializationError['context'],
  ): void {
    this.initializationStatus = 'error';
    this.isLoading = false;
    this.cdr.detectChanges();

    const formError: FormInitializationError = {
      stage,
      error,
      context,
      recoverable: stage !== 'config-load',
      userMessage: this.getErrorMessage(stage, error),
    };

    // Update UX state
    this.currentErrorMessage = formError.userMessage;
    this.currentErrorDetails = { stage, error: error.message, context };
    this.isRecoverable = formError.recoverable;

    console.error(
      `[PraxisDynamicForm] Initialization error at ${stage}:`,
      error,
    );
    this.initializationError.emit(formError);
  }

  private getErrorMessage(
    stage: FormInitializationError['stage'],
    error: Error,
  ): string {
    const messages = {
      'config-load': !this.formId
        ? 'Erro: formId é obrigatório para persistência corporativa do formulário.'
        : !this.resourcePath
          ? 'Erro: resourcePath é obrigatório para carregar esquema do servidor.'
          : 'Erro na configuração do formulário. Verifique se os parâmetros formId e resourcePath estão definidos.',
      'schema-fetch':
        'Erro ao carregar campos do servidor. Verifique sua conexão e tente novamente.',
      sync: 'Erro na sincronização com o servidor. O formulário será carregado com dados locais.',
      'form-build':
        'Erro ao construir o formulário. Entre em contato com o suporte técnico.',
    };

    return (
      messages[stage] || 'Erro desconhecido na inicialização do formulário.'
    );
  }

  private async createDefaultConfig(): Promise<void> {
    try {
      const serverDefs = await this.getSchemaWithCache();
      const fieldMetadata = mapFieldDefinitionsToMetadata(serverDefs);

      if (!fieldMetadata || fieldMetadata.length === 0) {
        throw new Error('No field metadata received from server');
      }

      // Generate default layout from metadata
      this.config = this.generateFormConfigFromMetadata(fieldMetadata);

      // Save the generated config
      const configKey = `praxis-form-config-${this.formId}`;
      this.configStorage.saveConfig(configKey, this.config);
    } catch (error) {
      this.handleInitializationError('schema-fetch', error as Error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig: false,
      });
      throw error; // Re-throw to stop initialization
    }
  }

  private async syncWithServer(): Promise<void> {
    try {
      const serverDefs = await this.getSchemaWithCache();
      const serverMetadata = mapFieldDefinitionsToMetadata(serverDefs);

      const syncResult = syncWithServerMetadata(this.config, serverMetadata);

      this.config = syncResult.config;

      if (syncResult.syncResult.hasChanges) {
        this.debugLog('📋 Form sync detected changes:', syncResult.syncResult);
        // Save updated config after sync
        const configKey = `praxis-form-config-${this.formId}`;
        this.configStorage.saveConfig(configKey, this.config);
        this.syncCompleted.emit(syncResult.syncResult);
      }
    } catch (error) {
      // Sync errors are not critical - we can continue with local config
      this.handleInitializationError('sync', error as Error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig: true,
      });
      // Don't re-throw - continue with local config
    }
  }

  private loadEntity(): void {
    console.debug('[PDF] loadEntity:start', { id: this.pendingEntityId });
    if (this.pendingEntityId == null) {
      return;
    }

    // Avoid duplicate network requests but allow re-patching after form build
    if (this.loadedEntityId === this.pendingEntityId) {
      if (this.loadedEntityData && Object.keys(this.form.controls).length) {
        this.form.patchValue(this.loadedEntityData);
        console.debug('[PDF] loadEntity:repatch', { id: this.pendingEntityId });
      } else {
        console.debug('[PDF] loadEntity:duplicate', {
          id: this.pendingEntityId,
        });
      }
      return;
    }

    this.loadedEntityId = this.pendingEntityId;

    this.crud
      .getById(this.pendingEntityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Record<string, any>) => {
        if (data && typeof data === 'object') {
          this.loadedEntityData = data;
          if (Object.keys(this.form.controls).length) {
            this.form.patchValue(data);
          }
          console.debug('[PDF] loadEntity:success', {
            id: this.pendingEntityId,
          });
        } else {
          console.warn('Invalid entity data received:', data);
        }
      });
  }

  private buildFormFromConfig(): void {
    const controls: any = {};
    const fieldMetadata = this.config.fieldMetadata || [];
    this.fieldVisibility = {}; // Reset visibility state
    let field: FieldMetadata | undefined;

    try {
      for (field of fieldMetadata) {
        // All fields are visible by default unless a rule hides them
        this.fieldVisibility[field.name] = true;

        const validators: Array<
          (control: AbstractControl) => ValidationErrors | null
        > = [];
        let defaultValue: any = field.defaultValue ?? null;

        if (field.controlType === FieldControlType.DATE_PICKER) {
          const md = field as MaterialDatepickerMetadata;
          if (typeof defaultValue === 'string') {
            defaultValue = new Date(defaultValue);
          }
          const min = md.minDate
            ? typeof md.minDate === 'string'
              ? new Date(md.minDate)
              : md.minDate
            : null;
          if (min) {
            validators.push((control) => {
              const val = control.value ? new Date(control.value) : null;
              return !val || val >= min ? null : { minDate: true };
            });
          }
          const max = md.maxDate
            ? typeof md.maxDate === 'string'
              ? new Date(md.maxDate)
              : md.maxDate
            : null;
          if (max) {
            validators.push((control) => {
              const val = control.value ? new Date(control.value) : null;
              return !val || val <= max ? null : { maxDate: true };
            });
          }
        } else if (field.controlType === FieldControlType.DATE_RANGE) {
          const md = field as MaterialDateRangeMetadata;
          const parse = (d: Date | string | null | undefined): Date | null =>
            typeof d === 'string' ? new Date(d) : (d ?? null);
          const dv = defaultValue as DateRangeValue | null;
          defaultValue = {
            startDate: dv?.startDate ? parse(dv.startDate) : null,
            endDate: dv?.endDate ? parse(dv.endDate) : null,
          } as DateRangeValue;
          const min = parse(md.minDate);
          const max = parse(md.maxDate);
          validators.push((control) => {
            const val = control.value as DateRangeValue | null;
            if (!val) {
              return null;
            }
            const start = val.startDate ? new Date(val.startDate) : null;
            const end = val.endDate ? new Date(val.endDate) : null;
            if (start && end && start > end) {
              return { rangeOrder: true };
            }
            if (min && ((start && start < min) || (end && end < min))) {
              return { minDate: true };
            }
            if (max && ((start && start > max) || (end && end > max))) {
              return { maxDate: true };
            }
            return null;
          });
        } else if (field.controlType === FieldControlType.RANGE_SLIDER) {
          const md = field as MaterialPriceRangeMetadata;
          const dv = defaultValue as PriceRangeValue | null;
          defaultValue = {
            minPrice: dv?.minPrice ?? null,
            maxPrice: dv?.maxPrice ?? null,
          } as PriceRangeValue;
          const min = md.min ?? null;
          const max = md.max ?? null;
          validators.push((control) => {
            const val = control.value as PriceRangeValue | null;
            if (!val) {
              return null;
            }
            const start = val.minPrice;
            const end = val.maxPrice;
            if (start != null && end != null && start > end) {
              return { rangeOrder: true };
            }
            if (
              min != null &&
              ((start != null && start < min) || (end != null && end < min))
            ) {
              return { minValue: true };
            }
            if (
              max != null &&
              ((start != null && start > max) || (end != null && end > max))
            ) {
              return { maxValue: true };
            }
            return null;
          });
        }

        if (field.required) {
          if (field.controlType === FieldControlType.DATE_RANGE) {
            validators.push((control) => {
              const val = control.value as DateRangeValue | null;
              return val?.startDate && val?.endDate ? null : { required: true };
            });
          } else if (field.controlType === FieldControlType.RANGE_SLIDER) {
            validators.push((control) => {
              const val = control.value as PriceRangeValue | null;
              return val?.minPrice != null && val?.maxPrice != null
                ? null
                : { required: true };
            });
          } else {
            validators.push(Validators.required);
          }
        }
        if (field.validators?.minLength) {
          validators.push(Validators.minLength(field.validators.minLength));
        }
        if (field.validators?.maxLength) {
          validators.push(Validators.maxLength(field.validators.maxLength));
        }
        if (field.validators?.pattern) {
          validators.push(Validators.pattern(field.validators.pattern));
        }

        const isMultiple =
          field.controlType === FieldControlType.CHECKBOX ||
          field.controlType === FieldControlType.MULTI_SELECT ||
          (field as any).multiple;

        // Use the already processed defaultValue, or set array for multiple selection
        if (defaultValue == null && isMultiple) {
          defaultValue = [];
        }

        controls[field.name] = [defaultValue, validators];
      }
    } catch (e) {
      console.error('[PDF] buildForm:errorAtField', { field }, e);
      throw e;
    }
    this.form = this.fb.group(controls);

    // Set context for rules
    this.contextService.setAvailableFields(fieldMetadata);
    if (this.config.formRules) {
      this.contextService.setFormRules(this.config.formRules);
      // Perform initial rule evaluation
      this.evaluateAndApplyRules();
    }

    this.form.valueChanges
      .pipe(debounceTime(50), takeUntil(this.destroy$))
      .subscribe((values) => {
        // Re-evaluate rules on every value change
        this.evaluateAndApplyRules();

        this.valueChange.emit({
          formData: values,
          changedFields: Object.keys(values),
          isValid: this.form.valid,
          entityId: this.resourceId ?? undefined,
        });
      });

    this.formReady.emit({
      formGroup: this.form,
      fieldsMetadata: fieldMetadata,
      layout: this.layout,
      hasEntity: this.resourceId != null,
      entityId: this.resourceId ?? undefined,
    });
    console.debug('[PDF] buildForm:done', {
      fields: this.config.fieldMetadata?.length,
    });
  }

  private evaluateAndApplyRules(): void {
    if (!this.config.formRules || !this.form) {
      return;
    }

    const result = this.rulesService.applyRules(this.form, this.config.formRules);

    // Apply visibility rules and enable/disable controls
    for (const fieldName in result.visibility) {
      if (Object.prototype.hasOwnProperty.call(result.visibility, fieldName)) {
        const isVisible = result.visibility[fieldName];
        this.fieldVisibility[fieldName] = isVisible;
        const control = this.form.get(fieldName);
        if (control) {
          if (isVisible && control.disabled) {
            control.enable({ emitEvent: false });
          } else if (!isVisible && control.enabled) {
            control.disable({ emitEvent: false });
          }
        }
      }
    }

    // Apply required rules
    for (const fieldName in result.required) {
      if (Object.prototype.hasOwnProperty.call(result.required, fieldName)) {
        const control = this.form.get(fieldName);
        if (control) {
          const isRequired = result.required[fieldName];
          if (isRequired && !control.hasValidator(Validators.required)) {
            control.addValidators(Validators.required);
          } else if (!isRequired && control.hasValidator(Validators.required)) {
            control.removeValidators(Validators.required);
          }
          control.updateValueAndValidity({ emitEvent: false }); // Avoid infinite loop
        }
      }
    }
    this.cdr.detectChanges();
  }

  /**
   * Returns the buttons that should remain visible on mobile when collapseToMenu is true.
   * By default, this is the first button (usually submit).
   */
  getVisibleButtons(): FormActionButton[] {
    return this.getActionButtons().slice(0, 1);
  }

  /**
   * Returns the buttons that should be collapsed into a menu on mobile.
   */
  getCollapsedButtons(): FormActionButton[] {
    return this.getActionButtons().slice(1);
  }

  /**
   * Generates a complete FormConfig from FieldMetadata array
   * Includes both layout and field metadata
   */
  private generateFormConfigFromMetadata(
    fields: FieldMetadata[],
    options?: {
      fieldsPerRow?: number;
      defaultSectionTitle?: string;
    },
  ): FormConfig {
    const fieldsPerRow = options?.fieldsPerRow ?? 2;
    const defaultSectionTitle = options?.defaultSectionTitle ?? 'Informações';

    // Group fields by their 'group' property
    const groupedFields = new Map<string, FieldMetadata[]>();

    for (const field of fields) {
      const groupName = field.group || 'default';
      if (!groupedFields.has(groupName)) {
        groupedFields.set(groupName, []);
      }
      groupedFields.get(groupName)!.push(field);
    }

    // Sort fields within each group by order property
    groupedFields.forEach((fieldList) => {
      fieldList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Create sections from grouped fields
    const sections: FormSection[] = [];

    groupedFields.forEach((groupFields, groupName) => {
      const sectionTitle =
        groupName === 'default'
          ? defaultSectionTitle
          : this.capitalizeFirstLetter(groupName);

      sections.push({
        id: groupName,
        title: sectionTitle,
        rows: this.createRowsFromFields(groupFields, fieldsPerRow),
      });
    });

    // Return complete config with layout and metadata
    return {
      sections,
      fieldMetadata: fields,
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date(),
        source: 'default',
      },
    };
  }

  /**
   * Creates rows from a list of fields, organizing them into columns
   */
  private createRowsFromFields(
    fields: FieldMetadata[],
    fieldsPerRow: number = 2,
  ): FormRow[] {
    const rows: FormRow[] = [];

    for (let i = 0; i < fields.length; i += fieldsPerRow) {
      const rowFields = fields.slice(i, i + fieldsPerRow);
      const columns: FormColumn[] = rowFields.map((field) => ({
        fields: [field.name],
      }));

      rows.push({ columns });
    }

    return rows;
  }

  /**
   * Utility method to capitalize first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getColumnFields(column: { fields: string[] }): FieldMetadata[] {
    const fieldMetadata = this.config.fieldMetadata || [];
    return fieldMetadata.filter(
      (f) => column.fields.includes(f.name) && this.fieldVisibility[f.name]
    );
  }

  isColumnVisible(column: FormColumn): boolean {
    // A column is visible if at least one of its fields is visible.
    return column.fields.some((fieldName) => this.fieldVisibility[fieldName]);
  }

  /**
   * Constructs a unified list of action buttons for rendering.
   * Merges standard, custom, and legacy configurations.
   */
  getActionButtons(): FormActionButton[] {
    const actions = this.config.actions;
    if (!actions) {
      // Fallback to a single default submit button if no actions are configured
      return [
        {
          id: 'submit',
          label: 'Submit',
          visible: true,
          type: 'submit',
          color: 'primary',
        },
      ];
    }

    const buttons: FormActionButton[] = [];

    // 1. Submit Button
    const submitBtn = {
      id: 'submit',
      type: 'submit',
      color: 'primary',
      ...actions.submit,
    };
    if (actions.showSaveButton === false) submitBtn.visible = false;
    if (actions.submitButtonLabel) submitBtn.label = actions.submitButtonLabel;
    buttons.push(submitBtn);

    // 2. Cancel Button
    const cancelBtn = { id: 'cancel', type: 'button', ...actions.cancel };
    if (actions.showCancelButton === false) cancelBtn.visible = false;
    if (actions.cancelButtonLabel) cancelBtn.label = actions.cancelButtonLabel;
    buttons.push(cancelBtn);

    // 3. Reset Button
    const resetBtn = { id: 'reset', type: 'reset', ...actions.reset };
    if (actions.showResetButton === false) resetBtn.visible = false;
    if (actions.resetButtonLabel) resetBtn.label = actions.resetButtonLabel;
    buttons.push(resetBtn);

    // 4. Custom Buttons
    if (actions.custom) {
      buttons.push(...actions.custom);
    }

    return buttons;
  }

  onActionButtonClick(button: FormActionButton, event: Event): void {
    const actionId = button.id || button.action;
    if (!actionId) return;

    const confirmationMessage = this._getConfirmationMessage(actionId);

    if (confirmationMessage) {
      // Prevent default form submission if confirmation is needed
      if (button.type === 'submit') {
        event.preventDefault();
      }
      this._showConfirmationDialog(actionId, confirmationMessage, () =>
        this._executeAction(button),
      );
    } else {
      // No confirmation needed, execute directly
      this._executeAction(button);
    }
  }

  private _getConfirmationMessage(actionId: string): string | undefined {
    const messages = this.config.messages;
    if (!messages) return undefined;

    // Priority: customActions > confirmations
    const customMessage = messages.customActions?.[actionId]?.confirmation;
    if (customMessage) return customMessage;

    return messages.confirmations?.[actionId];
  }

  private _showConfirmationDialog(
    actionId: string,
    message: string,
    onConfirm: () => void,
  ): void {
    const dialogRef = this.dialog.open<
      ConfirmDialogComponent,
      ConfirmDialogData,
      boolean
    >(ConfirmDialogComponent, {
      data: {
        title: 'Confirmação',
        message: message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: actionId === 'cancel' || actionId === 'reset' ? 'warning' : 'info',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      this.actionConfirmation.emit({ actionId, message, confirmed: !!confirmed });
      if (confirmed) {
        onConfirm();
      }
    });
  }

  private _executeAction(button: FormActionButton): void {
    const actionId = button.id || button.action;
    if (!actionId) return;

    switch (actionId) {
      case 'submit':
        this.onSubmit();
        break;
      case 'cancel':
        this.formCancel.emit();
        break;
      case 'reset':
        this.form.reset();
        this.formReset.emit();
        break;
      default:
        // This is a custom action
        this.customAction.emit({
          actionId: actionId,
          formData: this.form.value,
          isValid: this.form.valid,
          source: 'button',
        });
        break;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const formData = this.form.value;
    const operation: 'create' | 'update' =
      this.mode === 'edit' && this.resourceId != null ? 'update' : 'create';

    this.formSubmit.emit({
      stage: 'before',
      formData,
      isValid: true,
      operation,
      entityId: this.resourceId ?? undefined,
    });

    const req$ =
      operation === 'update'
        ? this.crud.update(this.resourceId!, formData)
        : this.crud.create(formData);

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.formSubmit.emit({
          stage: 'after',
          formData,
          isValid: true,
          operation,
          entityId: this.resourceId ?? undefined,
          result,
        });
      },
      error: (error) => {
        this.formSubmit.emit({
          stage: 'error',
          formData,
          isValid: false,
          operation,
          entityId: this.resourceId ?? undefined,
          error,
        });
      },
    });
  }

  /**
   * TOGGLE DE CUSTOMIZAÇÃO DE LAYOUT - NÃO É EDIÇÃO DE DADOS
   *
   * Este método alterna entre:
   * - Modo normal: Usuário interage com dados do formulário (conforme mode: view/edit/create)
   * - Modo customização: Usuário pode mover sections/rows/columns e configurar layout
   *
   * IMPORTANTE: Independe completamente do mode do formulário
   */
  toggleEditMode(): void {
    // Marcar que usuário fez toggle manual (estado interno tem precedência)
    this._userHasToggledEditMode = true;

    // Toggle estado interno de CUSTOMIZAÇÃO (não o @Input de dados)
    this._internalEditModeEnabled = !this._internalEditModeEnabled;

    // Persistir estado corporativo para consistência entre sessões
    if (this.formId) {
      const customizationModeKey = `praxis-layout-customization-${this.formId}`;
      const userToggledKey = `praxis-user-toggled-${this.formId}`;

      this.configStorage.saveConfig(
        customizationModeKey,
        this._internalEditModeEnabled,
      );
      this.configStorage.saveConfig(
        userToggledKey,
        this._userHasToggledEditMode,
      );
    }

    // Emitir mudança para componente pai - usar o estado efetivo
    this.editModeEnabledChange.emit(this.effectiveEditModeEnabled);

    // Force change detection para aplicar estilos visuais imediatamente
    this.cdr.detectChanges();
  }

  openConfigEditor(): void {
    const initialConfig = normalizeFormConfig(this.config as FormConfig);
    const ref = this.settingsPanel.open({
      id: `form.${this.formId}`,
      title: 'Configuração do Formulário',
      content: {
        component: PraxisDynamicFormConfigEditor,
        inputs: initialConfig,
      },
    });

    ref.applied$.pipe(takeUntil(this.destroy$)).subscribe((cfg) => {
      if (cfg) {
        this.config = normalizeFormConfig(cfg as FormConfig);
        this.configChange.emit(this.config);
        this.buildFormFromConfig();
      }
    });

    ref.saved$.pipe(takeUntil(this.destroy$)).subscribe((cfg) => {
      if (cfg) {
        this.config = normalizeFormConfig(cfg as FormConfig);
        if (this.formId) {
          const key = `form-config:${this.formId}`;
          this.configStorage.saveConfig(key, this.config);
        }
        this.configChange.emit(this.config);
        this.buildFormFromConfig();
      }
    });

    ref.reset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.config = initialConfig;
      this.configChange.emit(this.config);
      this.buildFormFromConfig();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.schemaCache = null;
    this.isInitialized = false;
  }

  // TrackBy functions for performance optimization
  trackBySection(index: number, section: FormSection): string {
    return section.id;
  }

  trackByRow(index: number, row: FormRow): string {
    // Generate a simple hash of the row's column field names
    const fieldNames = row.columns.flatMap((col) => col.fields).join(',');
    return `row-${index}-${fieldNames}`;
  }

  trackByColumn(index: number, column: FormColumn): string {
    return `col-${index}-${column.fields.join(',')}`;
  }

  // Public method for template access
  retryInitialization(): void {
    // Reset state for retry
    this.isInitialized = false;
    this.schemaCache = null;
    this.loadedEntityId = null;
    this.initializationStatus = 'idle';
    this.initializeForm();
  }

  getErrorTitle(): string {
    const titles = {
      'config-load': 'Configuração Inválida',
      'schema-fetch': 'Erro de Conexão',
      sync: 'Sincronização Parcial',
      'form-build': 'Erro Interno',
    };

    const stage = this.currentErrorDetails?.stage || 'form-build';
    return titles[stage as keyof typeof titles] || 'Erro no Formulário';
  }

  showDetailedError(): void {
    const details = this.currentErrorDetails
      ? JSON.stringify(this.currentErrorDetails, null, 2)
      : 'Nenhum detalhe disponível';
    alert(
      `Detalhes técnicos:\n\n${details}\n\nPor favor, compartilhe estas informações com o suporte técnico.`,
    );
  }

  private async getSchemaWithCache(): Promise<any> {
    if (this.schemaCache) {
      console.debug('[PDF] schema:fromCache');
      return this.schemaCache;
    }

    try {
      const url = this.crud.schemaUrl?.();
      console.debug('[PDF] schema:fetching', { url });
    } catch {}

    const schema = await firstValueFrom(this.crud.getSchema());
    console.debug('[PDF] schema:fetched', {
      size: Array.isArray(schema) ? schema.length : 'n/a',
    });

    if (!schema) {
      throw new Error('No server schema received');
    }

    this.schemaCache = schema;
    return schema;
  }

  private debugLog(message: string, ...args: any[]): void {
    if (this.DEBUG) {
      console.log(`[PraxisDynamicForm] ${message}`, ...args);
    }
  }
}
