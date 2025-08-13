import {
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  Optional,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, isTableConfigV2, TableConfigService } from '@praxis/core';
import {
  SETTINGS_PANEL_DATA,
  SETTINGS_PANEL_REF,
  SettingsPanelRef,
  SettingsValueProvider,
  SettingsPanelSection,
  SettingsSectionsProvider,
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

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  styleUrls: ['./praxis-table-config-editor.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    JsonConfigEditorComponent,
    ColumnsConfigEditorComponent,
    BehaviorConfigEditorComponent,
    ToolbarActionsEditorComponent,
    MessagesLocalizationEditorComponent,
  ],
  template: `
    <ng-template #overviewSection>
      <behavior-config-editor
        [config]="editedConfig"
        (configChange)="onBehaviorConfigChange($event)"
        (behaviorChange)="onBehaviorChange($event)"
      ></behavior-config-editor>
    </ng-template>

    <ng-template #columnsSection>
      <columns-config-editor
        [config]="editedConfig"
        (configChange)="onColumnsConfigChange($event)"
        (columnChange)="onColumnChange($event)"
      ></columns-config-editor>
    </ng-template>

    <ng-template #toolbarSection>
      <toolbar-actions-editor
        [config]="editedConfig"
        (configChange)="onToolbarActionsConfigChange($event)"
        (toolbarActionsChange)="onToolbarActionsChange($event)"
      ></toolbar-actions-editor>
    </ng-template>

    <ng-template #messagesSection>
      <messages-localization-editor
        [config]="editedConfig"
        (configChange)="onMessagesLocalizationConfigChange($event)"
        (messagesLocalizationChange)="onMessagesLocalizationChange($event)"
      ></messages-localization-editor>
    </ng-template>

    <ng-template #jsonSection>
      <json-config-editor
        [config]="editedConfig"
        (configChange)="onJsonConfigChange($event)"
        (editorEvent)="onJsonEditorEvent($event)"
      ></json-config-editor>
    </ng-template>
  `,
  providers: [TableConfigService],
})
export class PraxisTableConfigEditor
  implements
    OnInit,
    SettingsValueProvider,
    SettingsSectionsProvider,
    AfterViewInit
{
  @ViewChild('overviewSection', { static: true })
  overviewSection!: TemplateRef<any>;
  @ViewChild('columnsSection', { static: true })
  columnsSection!: TemplateRef<any>;
  @ViewChild('toolbarSection', { static: true })
  toolbarSection!: TemplateRef<any>;
  @ViewChild('messagesSection', { static: true })
  messagesSection!: TemplateRef<any>;
  @ViewChild('jsonSection', { static: true })
  jsonSection!: TemplateRef<any>;

  sections: SettingsPanelSection[] = [];
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
  canSave$ = new BehaviorSubject<boolean>(false);

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
        // TODO: Implement proper error logging service
        this.showError('Erro ao carregar configuração');
        return;
      }

      this.originalConfig = config;

      // Safe JSON cloning with error handling
      try {
        this.editedConfig = JSON.parse(JSON.stringify(this.originalConfig));
      } catch (cloneError) {
        // TODO: Implement proper error logging service
        this.editedConfig = { columns: [] }; // fallback to empty config
      }

      // Sempre usar V2 (arquitetura unificada)
      this.isV2Config = true;

      this.statusMessage = 'Pronto para configurar';

      // Configurar estado inicial
      this.updateConfigurationVersion();
      this.updateCanSaveState();
    } catch (error) {
      // TODO: Implement proper error logging service
      this.showError('Erro ao inicializar editor');
    }
  }

  // Event handlers para o JsonConfigEditorComponent
  onJsonConfigChange(newConfig: TableConfig): void {
    this.editedConfig = newConfig;

    // Update state directly
    this.updateConfigurationVersion();
    this.updateCanSaveState();
  }

  ngAfterViewInit(): void {
    this.sections = [
      {
        id: 'overview',
        label: 'Visão Geral & Comportamento',
        icon: 'tune',
        template: this.overviewSection,
      },
      {
        id: 'columns',
        label: 'Colunas',
        icon: 'view_column',
        template: this.columnsSection,
      },
      {
        id: 'toolbar',
        label: 'Barra de Ferramentas & Ações',
        icon: 'build',
        template: this.toolbarSection,
      },
      {
        id: 'messages',
        label: 'Mensagens & Localização',
        icon: 'chat',
        template: this.messagesSection,
      },
      {
        id: 'json',
        label: 'JSON',
        icon: 'code',
        template: this.jsonSection,
      },
    ];
    this.cdr.markForCheck();
  }

  onJsonValidationChange(result: JsonValidationResult): void {
    this.isValidJson = result.isValid;
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
    this.editedConfig = newConfig;
    this.updateConfigurationVersion();
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

  private updateCanSaveState(): void {
    // Verificar se há alterações válidas
    const hasChanges =
      JSON.stringify(this.originalConfig) !== JSON.stringify(this.editedConfig);
    const canSave = hasChanges && this.isValidJson;
    this.canSave = canSave;
    this.canSave$.next(canSave);
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

  getSettingsValue(): TableConfig {
    return this.editedConfig;
  }

  reset(): void {
    this.onResetToDefaults();
  }

  onResetToDefaults(): void {
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
  }

  onSave(): void {
    if (!this.canSave) {
      this.showError('Não há alterações válidas para salvar');
      return;
    }

    // Validação final
    try {
      // Garantir que a configuração editada é válida
      if (!this.editedConfig || !Array.isArray(this.editedConfig.columns)) {
        throw new Error('Configuração inválida');
      }

      this.showSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      this.showError('Configuração inválida. Verifique os campos.');
    }
  }

  /**
   * Atualiza as flags de versão baseado na configuração atual
   */
  private updateConfigurationVersion(): void {
    this.isV2Config = isTableConfigV2(this.editedConfig);

    // Atualizar mensagem de status baseado na versão
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
}
