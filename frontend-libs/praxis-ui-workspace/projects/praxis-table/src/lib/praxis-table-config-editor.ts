import {
  Component,
  Inject,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Optional
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { 
  TableConfig,
  isTableConfigV2,
  TableConfigService,
  WINDOW_DATA,
  WINDOW_REF,
  PraxisResizableWindowRef
} from '@praxis/core';
import { JsonConfigEditorComponent, JsonValidationResult, JsonEditorEvent } from './json-config-editor/json-config-editor.component';
import { ColumnsConfigEditorComponent, ColumnChange } from './columns-config-editor/columns-config-editor.component';
import { BehaviorConfigEditorComponent, BehaviorConfigChange } from './behavior-config-editor/behavior-config-editor.component';
import { ToolbarActionsEditorComponent, ToolbarActionsChange } from './toolbar-actions-editor/toolbar-actions-editor.component';
import { MessagesLocalizationEditorComponent, MessagesLocalizationChange } from './messages-localization-editor/messages-localization-editor.component';
import { EducationalCardComponent } from './components/educational-card/educational-card.component';
import { HelpButtonComponent } from './components/help-button/help-button.component';
import { EducationalCardsService, TabCardKey } from './services/educational-cards.service';

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  styleUrls: ['./praxis-table-config-editor.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    JsonConfigEditorComponent,
    ColumnsConfigEditorComponent,
    BehaviorConfigEditorComponent,
    ToolbarActionsEditorComponent,
    MessagesLocalizationEditorComponent,
    EducationalCardComponent,
    HelpButtonComponent
  ],
  template: `
    <div class="config-editor-container">
      <!-- Content -->
      <div class="config-editor-content">
        <mat-tab-group class="config-tabs">

          <!-- Visão Geral & Comportamento -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">tune</mat-icon>
              <span>Visão Geral & Comportamento</span>
            </ng-template>
            <div class="tab-content">
              <div class="tab-header">
                <help-button
                  tabKey="overview"
                  tooltipText="Mostrar informações sobre configurações gerais"
                  (helpRequested)="onHelpRequested($event)">
                </help-button>
              </div>

              <educational-card
                tabKey="overview"
                icon="settings"
                title="Comportamento Geral da Tabela"
                description="Configure o comportamento essencial da sua tabela dinâmica para criar uma experiência de usuário otimizada."
                [benefits]="[
                  'Ativar paginação inteligente para grandes volumes de dados',
                  'Configurar ordenação automática por colunas',
                  'Habilitar filtros dinâmicos para facilitar a busca',
                  'Definir seleção de linhas para ações em lote'
                ]"
                [tips]="[
                  'Use paginação para tabelas com mais de 50 registros',
                  'A ordenação por ID ou data costuma ser mais útil como padrão'
                ]"
                (cardHidden)="onCardHidden($event)">
              </educational-card>

              <behavior-config-editor
                [config]="editedConfig"
                (configChange)="onBehaviorConfigChange($event)"
                (behaviorChange)="onBehaviorChange($event)">
              </behavior-config-editor>
            </div>
          </mat-tab>

          <!-- Colunas -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">view_column</mat-icon>
              <span>Colunas</span>
            </ng-template>
            <div class="tab-content">
              <div class="tab-header">
                <help-button
                  tabKey="columns"
                  tooltipText="Mostrar informações sobre configuração de colunas"
                  (helpRequested)="onHelpRequested($event)">
                </help-button>
              </div>

              <educational-card
                tabKey="columns"
                icon="table_chart"
                title="Personalização Avançada de Colunas"
                description="Transforme dados brutos em informações elegantes e compreensíveis com ferramentas poderosas de personalização."
                [benefits]="[
                  'Criar colunas calculadas com fórmulas personalizadas',
                  'Mapear códigos técnicos para textos amigáveis (ex: 1 → Ativo)',
                  'Aplicar formatação automática para datas, moedas e percentuais',
                  'Controlar visibilidade, largura e alinhamento de cada coluna',
                  'Reordenar colunas com arrastar e soltar'
                ]"
                [tips]="[
                  'Use mapeamento de valores para status e códigos',
                  'Formatação de data e moeda melhora muito a legibilidade',
                  'Colunas calculadas são úteis para concatenar nome + sobrenome'
                ]"
                (cardHidden)="onCardHidden($event)">
              </educational-card>

              <columns-config-editor
                [config]="editedConfig"
                (configChange)="onColumnsConfigChange($event)"
                (columnChange)="onColumnChange($event)">
              </columns-config-editor>
            </div>
          </mat-tab>

          <!-- Barra de Ferramentas & Ações -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">build</mat-icon>
              <span>Barra de Ferramentas & Ações</span>
            </ng-template>
            <div class="tab-content">
              <div class="tab-header">
                <help-button
                  tabKey="toolbar"
                  tooltipText="Mostrar informações sobre barra de ferramentas"
                  (helpRequested)="onHelpRequested($event)">
                </help-button>
              </div>

              <educational-card
                tabKey="toolbar"
                icon="handyman"
                title="Ferramentas e Ações Personalizadas"
                description="Adicione poder e praticidade à sua tabela com uma barra de ferramentas personalizada e ações específicas por linha."
                [benefits]="[
                  'Criar botões personalizados na barra superior',
                  'Configurar ações rápidas para cada linha (editar, excluir, etc.)',
                  'Ativar exportação para Excel e PDF',
                  'Adicionar botão Novo registro personalizado',
                  'Controlar visibilidade da barra de ferramentas'
                ]"
                [tips]="[
                  'Limite a 3-5 ações principais para evitar sobrecarga visual',
                  'Use ícones intuitivos para ações comuns',
                  'Ações destrutivas (excluir) devem ter confirmação'
                ]"
                (cardHidden)="onCardHidden($event)">
              </educational-card>

              <toolbar-actions-editor
                [config]="editedConfig"
                (configChange)="onToolbarActionsConfigChange($event)"
                (toolbarActionsChange)="onToolbarActionsChange($event)">
              </toolbar-actions-editor>
            </div>
          </mat-tab>

          <!-- Mensagens & Localização -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">message</mat-icon>
              <span>Mensagens & Localização</span>
            </ng-template>
            <div class="tab-content">
              <div class="tab-header">
                <help-button
                  tabKey="messages"
                  tooltipText="Mostrar informações sobre mensagens e textos"
                  (helpRequested)="onHelpRequested($event)">
                </help-button>
              </div>

              <educational-card
                tabKey="messages"
                icon="language"
                title="Comunicação Clara com o Usuário"
                description="Personalize todas as mensagens da tabela para criar uma experiência de usuário consistente e profissional."
                [benefits]="[
                  'Personalizar mensagem de Nenhum dado encontrado',
                  'Configurar textos de carregamento e estados de erro',
                  'Adaptar mensagens para diferentes idiomas',
                  'Definir labels dos botões de paginação',
                  'Customizar tooltips e mensagens de ajuda'
                ]"
                [tips]="[
                  'Use mensagens positivas: Ainda não há dados ao invés de Vazio',
                  'Mantenha consistência no tom da comunicação',
                  'Considere o contexto do seu público-alvo'
                ]"
                (cardHidden)="onCardHidden($event)">
              </educational-card>

              <messages-localization-editor
                [config]="editedConfig"
                (configChange)="onMessagesLocalizationConfigChange($event)"
                (messagesLocalizationChange)="onMessagesLocalizationChange($event)">
              </messages-localization-editor>
            </div>
          </mat-tab>

          <!-- Edição de Código JSON -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">code</mat-icon>
              <span>Edição de Código JSON</span>
            </ng-template>
            <div class="tab-content">
              <div class="tab-header">
                <help-button
                  tabKey="json"
                  tooltipText="Mostrar informações sobre edição JSON"
                  (helpRequested)="onHelpRequested($event)">
                </help-button>
              </div>

              <educational-card
                tabKey="json"
                icon="code"
                title="Edição Avançada por Código"
                description="Para usuários técnicos: edite diretamente a configuração JSON para controle total e configurações avançadas."
                [benefits]="[
                  'Acesso a todas as opções de configuração avançada',
                  'Copiar e colar configurações entre projetos',
                  'Fazer alterações em lote rapidamente',
                  'Backup e versionamento de configurações',
                  'Integração com ferramentas de desenvolvimento'
                ]"
                [tips]="[
                  'Use o botão Formatar para organizar o código',
                  'Sempre valide antes de aplicar as mudanças',
                  'Mantenha backup das configurações que funcionam'
                ]"
                (cardHidden)="onCardHidden($event)">
              </educational-card>

              <json-config-editor
                [config]="editedConfig"
                (configChange)="onJsonConfigChange($event)"
                (validationChange)="onJsonValidationChange($event)"
                (editorEvent)="onJsonEditorEvent($event)">
              </json-config-editor>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

      <!-- Bottom Toolbar -->
      <div class="config-editor-actions">
        <div class="status-messages">
          <span class="status-text" [class.error]="hasErrors" [class.success]="hasSuccess">
            {{ statusMessage }}
          </span>
        </div>

        <div class="action-buttons">
          <button mat-button (click)="onCancel()">
            Cancelar
          </button>
          <button mat-stroked-button (click)="onResetToDefaults()" class="reset-button">
            Redefinir para Padrões
          </button>
          <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!canSave">
            Salvar
          </button>
        </div>
      </div>
    </div>
  `,
  providers: [
    TableConfigService
  ]
})
export class PraxisTableConfigEditor implements OnInit, OnDestroy {
  
  // Outputs
  @Output() configSaved = new EventEmitter<TableConfig>();
  @Output() cancelled = new EventEmitter<void>();
  
  // Component lifecycle
  private isDestroyed = false;
  
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

  constructor(
    private cdr: ChangeDetectorRef,
    private cardsService: EducationalCardsService,
    private configService: TableConfigService,
    @Optional() @Inject(WINDOW_DATA) private windowData: any,
    @Optional() @Inject(WINDOW_REF) private windowRef: PraxisResizableWindowRef
  ) {}

  ngOnInit(): void {
    try {
      // Inicializar configurações
      const config = this.windowData || { columns: [] };
      
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
          this.showError(event.payload.error || 'Erro ao aplicar configuração JSON');
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
    const hasChanges = JSON.stringify(this.originalConfig) !== JSON.stringify(this.editedConfig);
    this.canSave = hasChanges && this.isValidJson;
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

  onCancel(): void {
    this.cancelled.emit();
    if (this.windowRef && !this.isDestroyed) {
      this.windowRef.close();
    }
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
          allowClearSort: true
        },
        filtering: { 
          enabled: false,
          strategy: 'client',
          debounceTime: 300
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
          strategy: 'client'
        }
      },
      toolbar: {
        visible: false,
        position: 'top'
      }
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

      // Emitir evento e fechar janela imediatamente para melhor UX
      this.configSaved.emit(this.editedConfig);
      
      // Safe window closing with null check and component lifecycle check
      if (this.windowRef && !this.isDestroyed) {
        // Pequeno delay apenas para mostrar a mensagem de sucesso
        setTimeout(() => {
          if (this.windowRef && !this.isDestroyed) {
            this.windowRef.close(this.editedConfig);
          }
        }, 500);
      }

    } catch (error) {
      this.showError('Configuração inválida. Verifique os campos.');
    }
  }

  // Event handlers para Educational Cards
  onHelpRequested(tabKey: TabCardKey): void {
    // O card já foi reexibido pelo HelpButtonComponent
    // Apenas forçar detecção de mudanças se necessário
    this.cdr.markForCheck();
  }

  onCardHidden(tabKey: TabCardKey): void {
    // O card já foi ocultado pelo EducationalCardComponent
    // Apenas forçar detecção de mudanças se necessário
    this.cdr.markForCheck();
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

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }
}
