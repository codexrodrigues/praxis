import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TableConfig } from '@praxis/core';

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
    MatToolbarModule
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
        <mat-tab-group class="config-tabs" [dynamicHeight]="true">
          
          <!-- Visão Geral & Comportamento -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">tune</mat-icon>
              <span>Visão Geral & Comportamento</span>
            </ng-template>
            <div class="tab-content">
              <mat-card class="educational-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">settings</mat-icon>
                  <mat-card-title>Comportamento Geral da Tabela</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Configure o comportamento geral da tabela, como paginação, ordenação, filtragem e seleção de linhas. 
                     Estas opções afetam a funcionalidade global da tabela.</p>
                </mat-card-content>
              </mat-card>
              
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
              <mat-card class="educational-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">table_chart</mat-icon>
                  <mat-card-title>Personalização de Colunas</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Personalize cada coluna da tabela individualmente. Defina visibilidade, cabeçalhos, largura, 
                     tipo de dado, formatação e estilos condicionais para uma exibição perfeita.</p>
                </mat-card-content>
              </mat-card>
              
              <!-- Placeholder para conteúdo futuro -->
              <div class="content-placeholder">
                <p class="placeholder-text">Editor de colunas será implementado em próximas etapas</p>
              </div>
            </div>
          </mat-tab>

          <!-- Barra de Ferramentas & Ações -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">build</mat-icon>
              <span>Barra de Ferramentas & Ações</span>
            </ng-template>
            <div class="tab-content">
              <mat-card class="educational-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">handyman</mat-icon>
                  <mat-card-title>Ferramentas e Ações</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Gerencie as opções da barra de ferramentas superior da tabela e as ações disponíveis para cada linha. 
                     Adicione botões personalizados e controle a exibição de funcionalidades.</p>
                </mat-card-content>
              </mat-card>
              
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
              <mat-card class="educational-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">language</mat-icon>
                  <mat-card-title>Mensagens e Textos</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Edite as mensagens exibidas em diferentes estados da tabela, como 'dados vazios', 'carregando' ou 'erro'. 
                     Garanta uma comunicação clara com o usuário.</p>
                </mat-card-content>
              </mat-card>
              
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
              <mat-card class="educational-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">data_object</mat-icon>
                  <mat-card-title>Edição Avançada JSON</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p><strong>Para usuários avançados:</strong> Esta aba permite ajustar todas as configurações da tabela 
                     diretamente via JSON. <strong>Atenção:</strong> Alterações aqui podem sobrescrever configurações 
                     visuais nas outras abas.</p>
                </mat-card-content>
              </mat-card>
              
              <!-- Placeholder para conteúdo futuro -->
              <div class="content-placeholder">
                <p class="placeholder-text">Editor JSON será implementado em próximas etapas</p>
              </div>
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
      height: 100%;
      max-height: 90vh;
    }

    .config-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      background-color: var(--mat-sys-surface-container);
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
    }

    .config-tabs {
      height: 100%;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-group {
      height: 100%;
    }

    .config-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: auto;
    }

    .tab-content {
      padding: 24px;
      min-height: 400px;
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
      .config-editor-header h2 {
        font-size: 1.25rem;
      }
      
      .tab-content {
        padding: 16px;
      }
      
      .config-editor-actions {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .status-messages {
        text-align: center;
      }
      
      .action-buttons {
        justify-content: center;
      }
    }
  `]
})
export class PraxisTableConfigEditor implements OnInit {
  
  // Estado do componente
  canSave = false; // Será habilitado quando detectar alterações
  hasErrors = false;
  hasSuccess = false;
  statusMessage = '';

  constructor(
    private dialogRef: MatDialogRef<PraxisTableConfigEditor>,
    @Inject(MAT_DIALOG_DATA) public data: { config?: TableConfig }
  ) {}

  ngOnInit(): void {
    // Inicialização do componente
    this.statusMessage = 'Pronto para configurar';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onResetToDefaults(): void {
    // TODO: Implementar reset para configurações padrão
    this.statusMessage = 'Configurações resetadas para padrão';
    this.hasSuccess = true;
    this.hasErrors = false;
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      this.statusMessage = '';
      this.hasSuccess = false;
    }, 3000);
  }

  onSave(): void {
    // TODO: Implementar salvamento das configurações
    if (this.canSave) {
      this.statusMessage = 'Configurações salvas com sucesso!';
      this.hasSuccess = true;
      this.hasErrors = false;
      
      // Fechar modal após 1 segundo
      setTimeout(() => {
        this.dialogRef.close(this.data.config);
      }, 1000);
    }
  }
}