import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Optional,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, isTableConfigV2, TableConfigService } from '@praxis/core';
import {
  SETTINGS_PANEL_DATA,
  SETTINGS_PANEL_REF,
  SettingsPanelRef,
  SettingsValueProvider,
} from '@praxis/settings-panel';
import {
  JsonConfigEditorComponent,
  JsonValidationResult,
  JsonEditorEvent,
} from './json-config-editor/json-config-editor.component';
import {
  ColumnsConfigEditorComponent,
  ColumnChange,
} from './columns-config-editor/columns-config-editor.component';
import {
  BehaviorConfigEditorComponent,
  BehaviorConfigChange,
} from './behavior-config-editor/behavior-config-editor.component';
import {
  ToolbarActionsEditorComponent,
  ToolbarActionsChange,
} from './toolbar-actions-editor/toolbar-actions-editor.component';
import {
  MessagesLocalizationEditorComponent,
  MessagesLocalizationChange,
} from './messages-localization-editor/messages-localization-editor.component';
import { FilterSettingsComponent } from './filter-settings/filter-settings.component';
import { FilterConfig } from './services/filter-config.service';
import { FieldMetadata, FieldControlType } from '@praxis/core';

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  styleUrls: ['./praxis-table-config-editor.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    JsonConfigEditorComponent,
    ColumnsConfigEditorComponent,
    BehaviorConfigEditorComponent,
    ToolbarActionsEditorComponent,
    MessagesLocalizationEditorComponent,
    FilterSettingsComponent,
  ],
  template: `
    <div class="config-editor-container">
      <mat-tab-group class="config-tabs" [(selectedIndex)]="activeSectionIndex">
        <mat-tab *ngFor="let section of sections">
          <ng-template mat-tab-label>
            <mat-icon *ngIf="section.icon">{{ section.icon }}</mat-icon>
            <span>{{ section.label }}</span>
          </ng-template>
          <div class="tab-content">
            <ng-container [ngSwitch]="section.id">
              <behavior-config-editor
                *ngSwitchCase="'overview'"
                [config]="editedConfig"
                (configChange)="onBehaviorConfigChange($event)"
                (behaviorChange)="onBehaviorChange($event)"
              ></behavior-config-editor>

              <columns-config-editor
                *ngSwitchCase="'columns'"
                [config]="editedConfig"
                (configChange)="onColumnsConfigChange($event)"
                (columnChange)="onColumnChange($event)"
              ></columns-config-editor>

              <toolbar-actions-editor
                *ngSwitchCase="'toolbar'"
                [config]="editedConfig"
                (configChange)="onToolbarActionsConfigChange($event)"
                (toolbarActionsChange)="onToolbarActionsChange($event)"
              ></toolbar-actions-editor>

              <filter-settings
                *ngSwitchCase="'filters'"
                [metadata]="columnMetas"
                [settings]="
                  editedConfig.behavior?.filtering?.advancedFilters?.settings
                "
                (settingsChange)="onFilterSettingsChange($event)"
              ></filter-settings>

              <messages-localization-editor
                *ngSwitchCase="'messages'"
                [config]="editedConfig"
                (configChange)="onMessagesLocalizationConfigChange($event)"
                (messagesLocalizationChange)="
                  onMessagesLocalizationChange($event)
                "
              ></messages-localization-editor>

              <json-config-editor
                *ngSwitchCase="'json'"
                [config]="editedConfig"
                (configChange)="onJsonConfigChange($event)"
                (editorEvent)="onJsonEditorEvent($event)"
              ></json-config-editor>
            </ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    <div class="config-editor-status" *ngIf="statusMessage">
      <span
        class="status-text"
        [class.error]="hasErrors"
        [class.success]="hasSuccess"
        >{{ statusMessage }}</span
      >
    </div>
  `,
  providers: [TableConfigService],
})
export class PraxisTableConfigEditor
  implements OnInit, OnDestroy, SettingsValueProvider
{
  @ViewChild(BehaviorConfigEditorComponent)
  behaviorEditor?: BehaviorConfigEditorComponent;
  sections = [
    {
      id: 'overview',
      label: 'Visão Geral & Comportamento',
      icon: 'tune',
    },
    { id: 'columns', label: 'Colunas', icon: 'view_column' },
    { id: 'toolbar', label: 'Barra de Ferramentas & Ações', icon: 'build' },
    { id: 'filters', label: 'Filtros', icon: 'filter_alt' },
    { id: 'messages', label: 'Mensagens & Localização', icon: 'chat' },
    { id: 'json', label: 'JSON', icon: 'code' },
  ];
  activeSectionIndex = 0;
  // Configurações
  private originalConfig!: TableConfig;
  editedConfig!: TableConfig;

  // V2 specific configs for advanced editing
  isV2Config = false;

  // Estado do componente
  canSave = false;
  hasErrors = false;
  hasSuccess = false;
  statusMessage = '';
  private isValidJson = true;

  // Observables obrigatórios da interface SettingsValueProvider
  isDirty$ = new BehaviorSubject<boolean>(false);
  isValid$ = new BehaviorSubject<boolean>(true);
  isBusy$ = new BehaviorSubject<boolean>(false);
  columnMetas: FieldMetadata[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private configService: TableConfigService,
    @Inject(SETTINGS_PANEL_DATA) private panelData: any,
    @Optional() @Inject(SETTINGS_PANEL_REF) private panelRef?: SettingsPanelRef,
  ) {}

  ngOnInit(): void {
    try {
      // Inicializar configurações
      const config = this.panelData || { columns: [] };

      // Validar configuração recebida
      if (!config || typeof config !== 'object') {
        console.error('PTABLE:config:invalid', config);
        this.showError('Erro ao carregar configuração');
        return;
      }

      console.debug(
        '[PraxisTableConfigEditor] ngOnInit received config',
        config,
      );

      // Normalizar ambas as configurações antes de armazenar para garantir comparação consistente
      this.originalConfig = this.normalizeTableConfig(config);
      this.editedConfig = this.normalizeTableConfig(config);

      console.debug('[PraxisTableConfigEditor] ngOnInit normalized configs', {
        original: this.originalConfig,
        edited: this.editedConfig,
      });

      // Sempre usar V2 (arquitetura unificada)
      this.isV2Config = true;

      this.statusMessage = 'Pronto para configurar';

      // Configurar estado inicial - detectar versão sem modificar editedConfig
      this.updateConfigurationVersionInfo();
      this.updateColumnMetas();

      // updateCanSaveState deve mostrar que não há mudanças após a normalização inicial
      this.updateCanSaveState();
    } catch (error) {
      console.error('PTABLE:config:init:error', error);
      this.showError('Erro ao inicializar editor');
    }
  }

  // Event handlers para o JsonConfigEditorComponent
  onJsonConfigChange(newConfig: TableConfig): void {
    console.debug(
      '[PraxisTableConfigEditor] onJsonConfigChange received',
      newConfig,
    );
    this.editedConfig = newConfig;

    // Update state directly
    this.updateConfigurationVersion();
    this.updateCanSaveState();
  }

  onJsonValidationChange(result: JsonValidationResult): void {
    this.isValidJson = result.isValid;
    // Atualizar diretamente o observable de validação
    this.isValid$.next(result.isValid);
    this.updateCanSaveState();
  }

  onJsonEditorEvent(event: JsonEditorEvent): void {
    switch (event.type) {
      case 'apply':
        if (event.payload.isValid && event.payload.config) {
          this.showSuccess('Configuração JSON aplicada com sucesso!');
        } else {
          this.showError(
            event.payload.error || 'Erro ao aplicar configuração JSON',
          );
        }
        break;
      case 'format':
        if (event.payload.isValid) {
          this.showSuccess('JSON formatado!');
        } else {
          this.showError(event.payload.error || 'Erro ao formatar JSON');
        }
        break;
    }
  }

  // Event handlers para o ColumnsConfigEditorComponent
  onColumnsConfigChange(newConfig: TableConfig): void {
    console.debug(
      '[PraxisTableConfigEditor] onColumnsConfigChange received',
      newConfig,
    );
    this.editedConfig = newConfig;
    this.updateConfigurationVersion();
    this.updateColumnMetas();
    this.updateCanSaveState();
  }

  onColumnChange(change: ColumnChange): void {
    // Update can save state when columns change
    this.updateCanSaveState();

    // Show feedback based on column change type
    switch (change.type) {
      case 'add':
        this.showSuccess('Nova coluna adicionada');
        break;
      case 'remove':
        this.showSuccess('Coluna removida');
        break;
      case 'reorder':
        this.showSuccess('Colunas reordenadas');
        break;
      case 'global':
        this.showSuccess('Configurações globais aplicadas');
        break;
      case 'update':
        // Don't show message for every property update to avoid spam
        break;
    }
  }

  onFilterSettingsChange(cfg: FilterConfig): void {
    console.debug(
      '[PraxisTableConfigEditor] onFilterSettingsChange received',
      cfg,
    );

    // Create a new config object to ensure change detection
    const newConfig = {
      ...this.editedConfig,
      behavior: {
        ...this.editedConfig.behavior,
        filtering: {
          ...(this.editedConfig.behavior?.filtering || {
            enabled: true,
            strategy: 'client' as const,
            debounceTime: 300,
          }),
          advancedFilters: {
            ...(this.editedConfig.behavior?.filtering?.advancedFilters || {
              enabled: false,
            }),
            settings: cfg,
          },
        },
      },
    };

    this.editedConfig = newConfig;
    console.debug(
      '[PraxisTableConfigEditor] onFilterSettingsChange updated editedConfig',
      this.editedConfig,
    );

    this.updateCanSaveState();
  }

  private updateColumnMetas(): void {
    this.columnMetas = (this.editedConfig.columns || []).map((c) => ({
      name: c.field,
      label: c.header,
      controlType: FieldControlType.INPUT,
    }));
  }

  private updateCanSaveState(): void {
    // Normalizar configurações antes da comparação para evitar falsos positivos
    const normalizedOriginal = this.normalizeTableConfig(this.originalConfig);
    const normalizedEdited = this.normalizeTableConfig(this.editedConfig);

    // Verificar se há alterações válidas usando comparação robusta
    const hasChanges = !this.deepEqual(normalizedOriginal, normalizedEdited);
    const isValid = this.isValidJson;
    const canSave = hasChanges && isValid;

    console.debug('[PraxisTableConfigEditor] updateCanSaveState', {
      hasChanges,
      isValid,
      canSave,
      originalConfigKeys: Object.keys(normalizedOriginal),
      editedConfigKeys: Object.keys(normalizedEdited),
    });

    this.canSave = canSave;

    // Atualizar observables da interface SettingsValueProvider
    this.isDirty$.next(hasChanges);
    this.isValid$.next(isValid);
    // isBusy$ será atualizado em operações específicas

    this.cdr.markForCheck();
  }

  private showSuccess(message: string): void {
    this.statusMessage = message;
    this.hasSuccess = true;
    this.hasErrors = false;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  private showError(message: string): void {
    this.statusMessage = message;
    this.hasErrors = true;
    this.hasSuccess = false;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  private clearMessages(): void {
    this.statusMessage = '';
    this.hasSuccess = false;
    this.hasErrors = false;
    this.cdr.markForCheck();
  }

  /**
   * Normaliza uma configuração de tabela para comparação consistente
   * Remove propriedades undefined, ordena arrays e objetos de forma consistente
   */
  private normalizeTableConfig(config: TableConfig): TableConfig {
    if (!config) {
      return { columns: [] };
    }

    // Deep clone and normalize
    const normalized = JSON.parse(
      JSON.stringify(config, (key, value) => {
        // Convert undefined to null for consistent comparison
        if (value === undefined) {
          return null;
        }
        return value;
      }),
    );

    // Ensure required properties exist
    if (!normalized.columns) {
      normalized.columns = [];
    }

    // Sort columns by field name for consistent comparison
    if (Array.isArray(normalized.columns)) {
      normalized.columns.sort((a: any, b: any) =>
        (a.field || '').localeCompare(b.field || ''),
      );
    }

    // Normalize behavior section
    if (normalized.behavior) {
      // Remove empty nested objects
      Object.keys(normalized.behavior).forEach((key) => {
        if (
          normalized.behavior[key] &&
          typeof normalized.behavior[key] === 'object' &&
          Object.keys(normalized.behavior[key]).length === 0
        ) {
          delete normalized.behavior[key];
        }
      });

      // If behavior is empty, remove it
      if (Object.keys(normalized.behavior).length === 0) {
        delete normalized.behavior;
      }
    }

    // Normalize filtering advanced settings
    if (normalized.behavior?.filtering?.advancedFilters?.settings) {
      const settings = normalized.behavior.filtering.advancedFilters.settings;

      // Remove undefined/null values from settings
      Object.keys(settings).forEach((key) => {
        if (
          settings[key] === undefined ||
          settings[key] === null ||
          settings[key] === ''
        ) {
          delete settings[key];
        }
      });

      // Sort arrays consistently
      if (Array.isArray(settings.alwaysVisibleFields)) {
        settings.alwaysVisibleFields.sort();
      }
    }

    return normalized;
  }

  /**
   * Realiza comparação profunda de objetos, ignorando ordem de propriedades
   */
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }

    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    if (typeof obj1 !== 'object') {
      return obj1 === obj2;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      return false;
    }

    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!this.deepEqual(obj1[i], obj2[i])) {
          return false;
        }
      }
      return true;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }
      if (!this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  getSettingsValue(): TableConfig {
    console.debug(
      '[PraxisTableConfigEditor] getSettingsValue',
      this.editedConfig,
    );
    return this.editedConfig;
  }

  reset(): void {
    this.onResetToDefaults();
  }

  onResetToDefaults(): void {
    // Indicar que está processando
    this.isBusy$.next(true);

    try {
      // Reset para configuração padrão unificada
      const defaultConfig: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          filtering: {
            enabled: false,
            strategy: 'client',
            debounceTime: 300,
          },
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25, 50],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
        toolbar: {
          visible: false,
          position: 'top',
        },
      };

      this.editedConfig = defaultConfig;
      this.updateConfigurationVersion();
      this.updateCanSaveState();
      this.showSuccess('Configurações resetadas para padrão');
    } finally {
      this.isBusy$.next(false);
    }
  }

  /**
   * Called by the settings panel when the user chooses to persist changes.
   *
   * The returned configuration is sent back to the panel via
   * `panelRef.save(returnedConfig)` and subsequently emitted on `saved$`.
   * Returning the current `TableConfig` is therefore required for the table to
   * apply the new settings.
   */
  onSave(): TableConfig | undefined {
    this.behaviorEditor?.applyFormChanges();
    if (!this.canSave) {
      this.showError('Não há alterações válidas para salvar');
      console.debug(
        '[PraxisTableConfigEditor] onSave blocked - cannot save',
        this.editedConfig,
      );
      return;
    }

    try {
      // Indicar que está ocupado durante salvamento
      this.isBusy$.next(true);

      if (!this.editedConfig || !Array.isArray(this.editedConfig.columns)) {
        throw new Error('Configuração inválida');
      }

      this.showSuccess('Configurações salvas com sucesso!');
      console.debug(
        '[PraxisTableConfigEditor] onSave returning config',
        this.editedConfig,
      );

      return this.editedConfig;
    } catch (error) {
      this.showError('Configuração inválida. Verifique os campos.');
      console.error('[PraxisTableConfigEditor] onSave error', error);
      return;
    } finally {
      // Sempre restaurar estado não-ocupado
      this.isBusy$.next(false);
    }
  }

  /**
   * Atualiza as flags de versão baseado na configuração atual
   * Esta versão pode modificar a configuração, deve ser usada após mudanças
   */
  private updateConfigurationVersion(): void {
    this.isV2Config = isTableConfigV2(this.editedConfig);

    // Atualizar mensagem de status baseado na versão
    if (this.isV2Config) {
      this.statusMessage = 'Configuração V2 - Recursos avançados disponíveis';
    }
  }

  /**
   * Apenas detecta a versão da configuração sem modificá-la
   * Usado durante inicialização para evitar marcar como dirty
   */
  private updateConfigurationVersionInfo(): void {
    this.isV2Config = isTableConfigV2(this.editedConfig);

    // Atualizar mensagem de status baseado na versão sem modificar a configuração
    if (this.isV2Config) {
      this.statusMessage = 'Configuração V2 - Recursos avançados disponíveis';
    }
  }

  /**
   * Retorna a configuração atual (unified architecture)
   */
  getV1Config(): TableConfig {
    return this.editedConfig as TableConfig;
  }

  /**
   * Legacy migration handler. In the unified architecture this is a no-op
   * and simply refreshes the configuration version information.
   */
  onMigrateToV2(): void {
    this.updateConfigurationVersion();
  }

  /**
   * Verifica se um recurso está disponível na versão atual
   */
  isFeatureAvailable(feature: string): boolean {
    // Direct feature check - no adapter needed in unified architecture
    switch (feature) {
      case 'multiSort':
        return this.editedConfig.behavior?.sorting?.multiSort ?? false;
      case 'bulkActions':
        return this.editedConfig.actions?.bulk?.enabled ?? false;
      case 'export':
        return this.editedConfig.export?.enabled ?? false;
      default:
        return false;
    }
  }

  // Event handlers para o BehaviorConfigEditorComponent
  onBehaviorConfigChange(newConfig: TableConfig): void {
    this.editedConfig = newConfig;
    // Ensure toolbar is visible when advanced filters are enabled
    const advancedEnabled =
      this.editedConfig.behavior?.filtering?.advancedFilters?.enabled;
    if (advancedEnabled) {
      this.editedConfig.toolbar = {
        ...this.editedConfig.toolbar,
        position: this.editedConfig.toolbar?.position ?? 'top',
        visible: true,
      };
    }
    this.updateConfigurationVersion();
    this.updateCanSaveState();
  }

  onBehaviorChange(change: BehaviorConfigChange): void {
    // Show feedback based on behavior change type
    switch (change.type) {
      case 'pagination':
        this.showSuccess('Configurações de paginação atualizadas');
        break;
      case 'sorting':
        this.showSuccess('Configurações de ordenação atualizadas');
        break;
      case 'filtering':
        this.showSuccess('Configurações de filtragem atualizadas');
        break;
      case 'selection':
        this.showSuccess('Configurações de seleção atualizadas');
        break;
      case 'interaction':
        this.showSuccess('Configurações de interação atualizadas');
        break;
    }
  }

  // Event handlers para o ToolbarActionsEditorComponent
  onToolbarActionsConfigChange(newConfig: TableConfig): void {
    this.editedConfig = newConfig;

    // Update state directly
    this.updateConfigurationVersion();
    this.updateCanSaveState();
  }

  onToolbarActionsChange(change: ToolbarActionsChange): void {
    // Show feedback based on toolbar action change type
    switch (change.type) {
      case 'toolbar':
        this.showSuccess('Configurações de toolbar atualizadas');
        break;
      case 'rowActions':
        this.showSuccess('Ações por linha atualizadas');
        break;
      case 'bulkActions':
        this.showSuccess('Ações em lote atualizadas');
        break;
      case 'export':
        this.showSuccess('Configurações de exportação atualizadas');
        break;
    }
  }

  // Event handlers para o MessagesLocalizationEditorComponent
  onMessagesLocalizationConfigChange(newConfig: TableConfig): void {
    this.editedConfig = newConfig;

    // Update state directly
    this.updateConfigurationVersion();
    this.updateCanSaveState();
  }

  onMessagesLocalizationChange(change: MessagesLocalizationChange): void {
    // Show feedback based on messages/localization change type
    switch (change.type) {
      case 'messages':
        this.showSuccess('Mensagens atualizadas');
        break;
      case 'localization':
        this.showSuccess('Configurações de localização atualizadas');
        break;
      case 'formatting':
        this.showSuccess('Configurações de formatação atualizadas');
        break;
    }
  }

  ngOnDestroy(): void {
    // Finalizar observables para evitar memory leaks
    this.isDirty$.complete();
    this.isValid$.complete();
    this.isBusy$.complete();
  }
}
