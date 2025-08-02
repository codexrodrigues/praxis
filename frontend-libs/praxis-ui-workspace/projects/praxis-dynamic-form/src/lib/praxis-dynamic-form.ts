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
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  GenericCrudService,
  FieldMetadata,
  mapFieldDefinitionsToMetadata,
  EndpointConfig,
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
  PraxisResizableWindowService,
} from '@praxis/core';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';
import { CONFIG_STORAGE, ConfigStorage } from '@praxis/core';
import { PraxisDynamicFormConfigEditor } from './praxis-dynamic-form-config-editor';

@Component({
  selector: 'praxis-dynamic-form',
  standalone: true,
  providers: [GenericCrudService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFieldLoaderDirective,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
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
      <!-- Form Content -->
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="praxis-dynamic-form"
        [attr.aria-label]="'Formulário ' + (config.metadata?.version || '')"
      >
        @for (section of config.sections; track section.id) {
          <div class="form-section" [attr.data-section-id]="section.id">
            @if (section.title) {
              <h3 class="section-title">{{ section.title }}</h3>
            }
            @if (section.description) {
              <p class="section-description">{{ section.description }}</p>
            }
            
            @for (row of section.rows; track $index) {
              <div class="form-row">
                @for (column of row.columns; track $index) {
                  <div class="form-column">
                    <ng-container
                      dynamicFieldLoader
                      [fields]="getColumnFields(column)"
                      [formGroup]="form"
                    >
                    </ng-container>
                  </div>
                }
              </div>
            }
          </div>
        }
      
      <div class="form-actions" [class.loading]="isLoading">
        <button
          type="submit"
          mat-raised-button
          color="primary"
          [disabled]="form.invalid || isLoading"
          [attr.aria-label]="mode === 'edit' ? 'Atualizar registro' : 'Criar novo registro'"
        >
          @if (isLoading) {
            <mat-icon>hourglass_empty</mat-icon>
          }
          {{ isLoading ? 'Processando...' : (mode === 'edit' ? 'Atualizar' : 'Criar') }}
        </button>

        @if (editModeEnabled) {
          <button
            type="button"
            mat-icon-button
            (click)="openConfigEditor()"
            matTooltip="Configurar formulário"
            [disabled]="isLoading"
          >
            <mat-icon>settings</mat-icon>
          </button>
        }
      </div>
      </form>
    }
  `,
  styles: [
    `
      :host {
        display: block;
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
        gap: 1.5rem;
      }

      .form-section {
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 8px;
        padding: 1.5rem;
        background-color: var(--md-sys-color-surface-container-lowest);
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
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .form-column {
        flex: 1;
        min-width: 0;
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
      }
    `,
  ],
})
export class PraxisDynamicForm implements OnInit, OnChanges, OnDestroy {
  private readonly DEBUG = typeof window !== 'undefined' && ((window as any)['__PRAXIS_DEBUG__'] || true); // Temporariamente true para debug
  @Input() resourcePath?: string;
  @Input() resourceId?: string | number;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() config: FormConfig = { sections: [] };
  /** Shows the configuration editor button */
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

  // Estado interno para UX
  isLoading = false;
  initializationStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  currentErrorMessage = '';
  currentErrorDetails: any = null;
  isRecoverable = false;
  private isInitialized = false;

  form!: FormGroup;
  private pendingEntityId: string | number | null = null;
  private loadedEntityId: string | number | null = null;
  private schemaCache: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private crud: GenericCrudService<any>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutService: FormLayoutService,
    private contextService: FormContextService,
    private windowService: PraxisResizableWindowService,
    @Inject(CONFIG_STORAGE) private configStorage: ConfigStorage,
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    // Initialize form based on the new flow
    if (this.formId && this.resourcePath && !this.isInitialized) {
      this.initializeForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourcePath'] && this.resourcePath) {
      this.crud.configure(this.resourcePath);
      
      // Only initialize if not already initialized or if resourcePath actually changed
      if (!this.isInitialized && this.formId) {
        this.initializeForm();
      }
    }
    
    if (changes['resourceId']) {
      this.pendingEntityId = this.resourceId ?? null;
      if (this.config.fieldMetadata?.length && this.pendingEntityId != null) {
        this.loadEntity();
      }
    }
  }

  private async initializeForm(): Promise<void> {
    // Prevent duplicate initialization
    if (this.isInitialized || this.isLoading) {
      this.debugLog('⚠️ Skipping duplicate initialization', { isInitialized: this.isInitialized, isLoading: this.isLoading });
      return;
    }

    // Validação obrigatória para cenários corporativos
    if (!this.resourcePath || !this.formId) {
      const error = new Error(
        `Form initialization failed: ${!this.formId ? 'formId' : 'resourcePath'} is required for corporate form management`
      );
      this.handleInitializationError('config-load', error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig: false
      });
      return;
    }

    this.isLoading = true;
    this.initializationStatus = 'loading';

    try {
      // Step 1: Check for local saved config
      const configKey = `praxis-form-config-${this.formId}`;
      const localConfig = this.configStorage.loadConfig<FormConfig>(configKey);
      
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
      
      // Build the form
      this.buildFormFromConfig();
      
      // Load entity data if needed
      if (this.pendingEntityId != null) {
        this.loadEntity();
      }
      
      this.initializationStatus = 'success';
      this.isInitialized = true;
      this.cdr.detectChanges();
    } catch (error) {
      this.handleInitializationError('form-build', error as Error, {
        formId: this.formId,
        resourcePath: this.resourcePath,
        hasLocalConfig: this.configStorage.loadConfig(`praxis-form-config-${this.formId}`) !== null
      });
    } finally {
      this.isLoading = false;
    }
  }

  private handleInitializationError(stage: FormInitializationError['stage'], error: Error, context?: FormInitializationError['context']): void {
    this.initializationStatus = 'error';
    this.isLoading = false;
    
    const formError: FormInitializationError = {
      stage,
      error,
      context,
      recoverable: stage !== 'config-load',
      userMessage: this.getErrorMessage(stage, error)
    };
    
    // Update UX state
    this.currentErrorMessage = formError.userMessage;
    this.currentErrorDetails = { stage, error: error.message, context };
    this.isRecoverable = formError.recoverable;
    
    console.error(`[PraxisDynamicForm] Initialization error at ${stage}:`, error);
    this.initializationError.emit(formError);
  }

  private getErrorMessage(stage: FormInitializationError['stage'], error: Error): string {
    const messages = {
      'config-load': !this.formId ? 
        'Erro: formId é obrigatório para persistência corporativa do formulário.' :
        !this.resourcePath ?
        'Erro: resourcePath é obrigatório para carregar esquema do servidor.' :
        'Erro na configuração do formulário. Verifique se os parâmetros formId e resourcePath estão definidos.',
      'schema-fetch': 'Erro ao carregar campos do servidor. Verifique sua conexão e tente novamente.',
      'sync': 'Erro na sincronização com o servidor. O formulário será carregado com dados locais.',
      'form-build': 'Erro ao construir o formulário. Entre em contato com o suporte técnico.'
    };
    
    return messages[stage] || 'Erro desconhecido na inicialização do formulário.';
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
        hasLocalConfig: false
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
        console.log('📋 Form sync detected changes:', syncResult.syncResult);
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
        hasLocalConfig: true
      });
      // Don't re-throw - continue with local config
    }
  }

  private loadEntity(): void {
    if (this.pendingEntityId == null) {
      return;
    }
    
    // Avoid duplicate entity loading
    if (this.loadedEntityId === this.pendingEntityId) {
      this.debugLog('⚠️ Skipping duplicate entity load', { entityId: this.pendingEntityId });
      return;
    }
    
    this.debugLog('📥 Loading entity', { entityId: this.pendingEntityId });
    this.loadedEntityId = this.pendingEntityId;
    
    this.crud
      .getById(this.pendingEntityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Record<string, any>) => {
        if (data && typeof data === 'object') {
          this.form.patchValue(data);
          this.debugLog('✅ Entity loaded successfully', { entityId: this.pendingEntityId });
        } else {
          console.warn('Invalid entity data received:', data);
        }
      });
  }

  private buildFormFromConfig(): void {
    const controls: any = {};
    const fieldMetadata = this.config.fieldMetadata || [];
    
    for (const field of fieldMetadata) {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
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
      controls[field.name] = [field.defaultValue ?? null, validators];
    }
    this.form = this.fb.group(controls);

    // Set context for rules
    this.contextService.setAvailableFields(fieldMetadata);
    if (this.config.formRules) {
      this.contextService.setFormRules(this.config.formRules);
    }

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values) => {
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
        source: 'default'
      }
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
    return fieldMetadata.filter((f) => column.fields.includes(f.name));
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

  openConfigEditor(): void {
    console.log('🔧 [PraxisDynamicForm] Abrindo editor de configuração');
    console.log('🔧 [PraxisDynamicForm] Config atual:', this.config);
    
    // Config already has everything needed (layout + metadata)
    const ref = this.windowService.open({
      title: 'Configuração do Formulário Dinâmico',
      contentComponent: PraxisDynamicFormConfigEditor,
      data: this.config,
      initialWidth: '90vw',
      initialHeight: '90vh',
      minWidth: '320px',
      minHeight: '600px',
      autoCenterAfterResize: false,
      enableTouch: true,
      disableResize: false,
      disableMaximize: false,
    });

    ref.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        console.log('🔧 [PraxisDynamicForm] Nova configuração recebida do editor:', result);
        this.config = result as FormConfig;
        
        // Save updated config
        if (this.formId) {
          const configKey = `praxis-form-config-${this.formId}`;
          this.configStorage.saveConfig(configKey, this.config);
        }
        
        this.configChange.emit(this.config);
        
        // Rebuild form with new config
        this.buildFormFromConfig();
      }
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
    const fieldNames = row.columns.flatMap(col => col.fields).join(',');
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
      'sync': 'Sincronização Parcial',
      'form-build': 'Erro Interno'
    };
    
    const stage = this.currentErrorDetails?.stage || 'form-build';
    return titles[stage as keyof typeof titles] || 'Erro no Formulário';
  }

  showDetailedError(): void {
    const details = this.currentErrorDetails ? JSON.stringify(this.currentErrorDetails, null, 2) : 'Nenhum detalhe disponível';
    alert(`Detalhes técnicos:\n\n${details}\n\nPor favor, compartilhe estas informações com o suporte técnico.`);
  }

  private async getSchemaWithCache(): Promise<any> {
    if (this.schemaCache) {
      this.debugLog('📋 Using cached schema');
      return this.schemaCache;
    }
    
    this.debugLog('🌐 Fetching schema from server');
    const schema = await this.crud.getSchema().toPromise();
    
    if (!schema) {
      throw new Error('No server schema received');
    }
    
    this.schemaCache = schema;
    this.debugLog('✅ Schema cached successfully');
    return schema;
  }

  private debugLog(message: string, ...args: any[]): void {
    if (this.DEBUG) {
      console.log(`[PraxisDynamicForm] ${message}`, ...args);
    }
  }
}
