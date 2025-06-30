import {
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TableConfig } from '@praxis/core';
import { JsonConfigEditorComponent, JsonValidationResult, JsonEditorEvent } from './json-config-editor/json-config-editor.component';
import { ColumnsConfigEditorComponent, ColumnChange } from './columns-config-editor/columns-config-editor.component';
import { EducationalCardComponent } from './components/educational-card/educational-card.component';
import { HelpButtonComponent } from './components/help-button/help-button.component';
import { EducationalCardsService, TabCardKey } from './services/educational-cards.service';

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatCardModule,
    MatToolbarModule,
    JsonConfigEditorComponent,
    ColumnsConfigEditorComponent,
    EducationalCardComponent,
    HelpButtonComponent
  ],
  template: `
    <div class="config-editor-container">
      <!-- Header -->
      <div class="config-editor-header">
        <h2 mat-dialog-title>Configurações da Tabela Dinâmica</h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="config-editor-content" mat-dialog-content>
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

              <!-- Placeholder para conteúdo futuro -->
              <div class="content-placeholder">
                <p class="placeholder-text">Formulários de configuração serão implementados em próximas etapas</p>
              </div>
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

              <!-- Placeholder para conteúdo futuro -->
              <div class="content-placeholder">
                <p class="placeholder-text">Configurações de toolbar serão implementadas em próximas etapas</p>
              </div>
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

              <!-- Placeholder para conteúdo futuro -->
              <div class="content-placeholder">
                <p class="placeholder-text">Editor de mensagens será implementado em próximas etapas</p>
              </div>
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
      <div class="config-editor-actions" mat-dialog-actions>
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
  styles: [`
    .config-editor-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      max-height: 90vh;
      min-height: 600px;
      width: 90vw;
      max-width: 1200px;
    }

    .config-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      background-color: var(--mat-sys-surface-container);
      flex-shrink: 0;
    }

    .config-editor-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .close-button {
      color: var(--mat-sys-on-surface-variant);
    }

    .config-editor-content {
      flex: 1;
      overflow: hidden;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .config-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-group {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-header {
      flex-shrink: 0;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
      display: flex;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-body {
      height: 100%;
      overflow: hidden;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow-y: auto;
      padding: 0;
    }

    .tab-content {
      padding: 24px;
      min-height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }

    .tab-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 8px 0;
      flex-shrink: 0;
    }

    .tab-content columns-config-editor,
    .tab-content json-config-editor {
      flex: 1;
      height: 100%;
      min-height: 0;
    }

    .tab-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .educational-card {
      margin-bottom: 24px;
      background-color: var(--mat-sys-surface-container-low);
      border-left: 4px solid var(--mat-sys-primary);
      flex-shrink: 0;
    }

    .educational-card .mat-mdc-card-header {
      padding-bottom: 8px;
    }

    .card-icon {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .educational-card .mat-mdc-card-title {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .educational-card .mat-mdc-card-content {
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
    }

    .content-placeholder {
      padding: 48px 24px;
      text-align: center;
      background-color: var(--mat-sys-surface-variant);
      border-radius: 8px;
      border: 2px dashed var(--mat-sys-outline-variant);
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .placeholder-text {
      color: var(--mat-sys-on-surface-variant);
      font-style: italic;
      margin: 0;
    }

    .config-editor-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      background-color: var(--mat-sys-surface-container);
      flex-shrink: 0;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }

    .status-messages {
      flex: 1;
      min-height: 20px;
    }

    .status-text {
      font-size: 0.875rem;
      line-height: 1.2;

      &.error {
        color: var(--mat-sys-error);
      }

      &.success {
        color: var(--mat-sys-primary);
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .reset-button {
      color: var(--mat-sys-secondary);
      border-color: var(--mat-sys-secondary);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .config-editor-container {
        height: 100vh;
        max-height: 100vh;
        min-height: 100vh;
        width: 100vw;
        max-width: 100vw;
      }

      .config-editor-header {
        padding: 12px 16px;
      }

      .config-editor-header h2 {
        font-size: 1.25rem;
      }

      .tab-content {
        padding: 16px;
      }

      .config-editor-actions {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        padding: 12px 16px;
      }

      .status-messages {
        text-align: center;
        order: 1;
      }

      .action-buttons {
        justify-content: center;
        order: 2;
      }
    }

    @media (max-width: 480px) {
      .action-buttons {
        flex-direction: column;
        width: 100%;
      }

      .action-buttons button {
        width: 100%;
      }
    }

    /* Global dialog overrides */
    :host-context(.config-editor-dialog) .mat-mdc-dialog-container {
      padding: 0;
      overflow: hidden;
    }

    :host-context(.config-editor-dialog) .mat-mdc-dialog-surface {
      padding: 0;
      overflow: hidden;
      border-radius: 12px;
    }
  `]
})
export class PraxisTableConfigEditor implements OnInit, OnDestroy {

  // Configurações
  private originalConfig: TableConfig;
  editedConfig: TableConfig;

  // Estado do componente
  canSave = false;
  hasErrors = false;
  hasSuccess = false;
  statusMessage = '';
  private isValidJson = true;

  constructor(
    private dialogRef: MatDialogRef<PraxisTableConfigEditor>,
    @Inject(MAT_DIALOG_DATA) public data: { config?: TableConfig },
    private cdr: ChangeDetectorRef,
    private cardsService: EducationalCardsService
  ) {
    // Inicializar configurações
    this.originalConfig = data?.config || { columns: [] };
    this.editedConfig = JSON.parse(JSON.stringify(this.originalConfig));
  }

  ngOnInit(): void {
    this.statusMessage = 'Pronto para configurar';
    this.updateCanSaveState();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Event handlers para o JsonConfigEditorComponent
  onJsonConfigChange(newConfig: TableConfig): void {
    this.editedConfig = newConfig;
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
    this.dialogRef.close();
  }

  onResetToDefaults(): void {
    // Reset para configuração padrão (vazia com colunas básicas)
    const defaultConfig: TableConfig = {
      columns: [],
      gridOptions: {
        sortable: true,
        filterable: false,
        pagination: {
          pageSize: 10,
          pageSizeOptions: [5, 10, 25, 50],
          showFirstLastButtons: true
        }
      },
      toolbar: {
        visible: false
      }
    };

    this.editedConfig = defaultConfig;
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

      // Fechar modal após 1 segundo retornando a configuração editada
      setTimeout(() => {
        this.dialogRef.close(this.editedConfig);
      }, 1000);

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
}
