import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { 
  TableConfig, 
  isTableConfigV2
} from '@praxis/core';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface MessagesLocalizationChange {
  type: 'messages' | 'localization' | 'formatting';
  property: string;
  value: any;
  fullConfig: TableConfig;
}

@Component({
  selector: 'messages-localization-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule
  ],
  template: `
    <div class="messages-localization-container">
      <form [formGroup]="messagesForm">
        
        <!-- Mensagens de Estado -->
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">message</mat-icon>
              Mensagens de Estado
            </mat-panel-title>
            <mat-panel-description>
              Textos exibidos em diferentes estados da tabela
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Carregando dados</mat-label>
                <input matInput formControlName="loadingMessage" 
                       placeholder="Carregando...">
                <mat-hint>Mensagem exibida durante o carregamento</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Nenhum dado encontrado</mat-label>
                <input matInput formControlName="emptyMessage" 
                       placeholder="Nenhum dado disponível">
                <mat-hint>Mensagem quando não há registros</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Erro ao carregar</mat-label>
                <input matInput formControlName="errorMessage" 
                       placeholder="Erro ao carregar dados">
                <mat-hint>Mensagem de erro genérica</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Nenhum resultado</mat-label>
                <input matInput formControlName="noResultsMessage" 
                       placeholder="Nenhum resultado encontrado">
                <mat-hint>Mensagem quando filtros não retornam resultados</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline" *ngIf="isV2">
                <mat-label>Carregando mais</mat-label>
                <input matInput formControlName="loadingMoreMessage" 
                       placeholder="Carregando mais dados...">
                <mat-hint>Mensagem para carregamento incremental</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Mensagens de Ação -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">help</mat-icon>
              Mensagens de Ação
            </mat-panel-title>
            <mat-panel-description>
              Confirmações, sucessos e mensagens de erro
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <mat-tab-group>
              <!-- Confirmações -->
              <mat-tab label="Confirmações">
                <div class="tab-content">
                  <div class="config-fields">
                    <mat-form-field appearance="outline">
                      <mat-label>Confirmação de exclusão</mat-label>
                      <input matInput formControlName="deleteConfirmation" 
                             placeholder="Tem certeza que deseja excluir este item?">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Confirmação de exclusão múltipla</mat-label>
                      <input matInput formControlName="deleteMultipleConfirmation" 
                             placeholder="Tem certeza que deseja excluir os itens selecionados?">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Confirmação de salvar</mat-label>
                      <input matInput formControlName="saveConfirmation" 
                             placeholder="Deseja salvar as alterações?">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Confirmação de cancelar</mat-label>
                      <input matInput formControlName="cancelConfirmation" 
                             placeholder="Deseja cancelar as alterações?">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Confirmação de exportação</mat-label>
                      <input matInput formControlName="exportConfirmation" 
                             placeholder="Deseja exportar os dados selecionados?">
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>
              
              <!-- Sucessos -->
              <mat-tab label="Sucessos">
                <div class="tab-content">
                  <div class="config-fields">
                    <mat-form-field appearance="outline">
                      <mat-label>Salvo com sucesso</mat-label>
                      <input matInput formControlName="saveSuccess" 
                             placeholder="Item salvo com sucesso!">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Excluído com sucesso</mat-label>
                      <input matInput formControlName="deleteSuccess" 
                             placeholder="Item excluído com sucesso!">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Exportação concluída</mat-label>
                      <input matInput formControlName="exportSuccess" 
                             placeholder="Exportação concluída com sucesso!">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Importação concluída</mat-label>
                      <input matInput formControlName="importSuccess" 
                             placeholder="Importação concluída com sucesso!">
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>
              
              <!-- Erros -->
              <mat-tab label="Erros">
                <div class="tab-content">
                  <div class="config-fields">
                    <mat-form-field appearance="outline">
                      <mat-label>Erro ao salvar</mat-label>
                      <input matInput formControlName="saveError" 
                             placeholder="Erro ao salvar item">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Erro ao excluir</mat-label>
                      <input matInput formControlName="deleteError" 
                             placeholder="Erro ao excluir item">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Erro na exportação</mat-label>
                      <input matInput formControlName="exportError" 
                             placeholder="Erro na exportação">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Erro de rede</mat-label>
                      <input matInput formControlName="networkError" 
                             placeholder="Erro de conexão">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Erro de permissão</mat-label>
                      <input matInput formControlName="permissionError" 
                             placeholder="Sem permissão para esta ação">
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </mat-expansion-panel>
        
        <!-- Localização -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">language</mat-icon>
              Configurações de Localização
            </mat-panel-title>
            <mat-panel-description>
              Idioma, região e formatação
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Idioma/Região</mat-label>
                <mat-select formControlName="locale">
                  <mat-option value="pt-BR">Português (Brasil)</mat-option>
                  <mat-option value="en-US">English (US)</mat-option>
                  <mat-option value="en-GB">English (UK)</mat-option>
                  <mat-option value="es-ES">Español</mat-option>
                  <mat-option value="fr-FR">Français</mat-option>
                  <mat-option value="de-DE">Deutsch</mat-option>
                  <mat-option value="it-IT">Italiano</mat-option>
                  <mat-option value="ja-JP">日本語</mat-option>
                  <mat-option value="zh-CN">中文</mat-option>
                </mat-select>
                <mat-hint>Define o idioma e região para formatação</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Direção do texto</mat-label>
                <mat-select formControlName="direction">
                  <mat-option value="ltr">Esquerda para direita (LTR)</mat-option>
                  <mat-option value="rtl">Direita para esquerda (RTL)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Primeiro dia da semana</mat-label>
                <mat-select formControlName="firstDayOfWeek">
                  <mat-option value="0">Domingo</mat-option>
                  <mat-option value="1">Segunda-feira</mat-option>
                  <mat-option value="6">Sábado</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-slide-toggle formControlName="relativeTime" class="toggle-field">
                Usar tempo relativo
                <mat-icon class="info-icon" matTooltip="Ex: 'há 2 horas' ao invés de horário específico">
                  info_outline
                </mat-icon>
              </mat-slide-toggle>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Formatação de Data e Hora -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">schedule</mat-icon>
              Formatação de Data e Hora
            </mat-panel-title>
            <mat-panel-description>
              Padrões de exibição de datas e horários
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Formato de data</mat-label>
                <mat-select formControlName="dateFormat">
                  <mat-option value="dd/MM/yyyy">dd/MM/yyyy (31/12/2023)</mat-option>
                  <mat-option value="MM/dd/yyyy">MM/dd/yyyy (12/31/2023)</mat-option>
                  <mat-option value="yyyy-MM-dd">yyyy-MM-dd (2023-12-31)</mat-option>
                  <mat-option value="dd-MM-yyyy">dd-MM-yyyy (31-12-2023)</mat-option>
                  <mat-option value="dd.MM.yyyy">dd.MM.yyyy (31.12.2023)</mat-option>
                  <mat-option value="MMM dd, yyyy">MMM dd, yyyy (Dec 31, 2023)</mat-option>
                  <mat-option value="MMMM dd, yyyy">MMMM dd, yyyy (December 31, 2023)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Formato de hora</mat-label>
                <mat-select formControlName="timeFormat">
                  <mat-option value="HH:mm:ss">HH:mm:ss (24h)</mat-option>
                  <mat-option value="HH:mm">HH:mm (24h)</mat-option>
                  <mat-option value="hh:mm:ss a">hh:mm:ss a (12h)</mat-option>
                  <mat-option value="hh:mm a">hh:mm a (12h)</mat-option>
                  <mat-option value="h:mm a">h:mm a (12h)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Formato de data e hora</mat-label>
                <input matInput formControlName="dateTimeFormat" 
                       placeholder="dd/MM/yyyy HH:mm:ss">
                <mat-hint>Combinação dos formatos de data e hora</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Formatação de Números -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">pin</mat-icon>
              Formatação de Números
            </mat-panel-title>
            <mat-panel-description>
              Separadores, moeda e precisão decimal
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Separador decimal</mat-label>
                <mat-select formControlName="decimalSeparator">
                  <mat-option value=",">, (vírgula)</mat-option>
                  <mat-option value=".">. (ponto)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Separador de milhares</mat-label>
                <mat-select formControlName="thousandsSeparator">
                  <mat-option value=".">. (ponto)</mat-option>
                  <mat-option value=",">, (vírgula)</mat-option>
                  <mat-option value=" "> (espaço)</mat-option>
                  <mat-option value="">(nenhum)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Precisão decimal padrão</mat-label>
                <input matInput type="number" formControlName="defaultPrecision" 
                       min="0" max="10">
                <mat-hint>Número padrão de casas decimais</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Sinal negativo</mat-label>
                <mat-select formControlName="negativeSign">
                  <mat-option value="-">- (hífen)</mat-option>
                  <mat-option value="−">− (menos matemático)</mat-option>
                  <mat-option value="()">(parênteses)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Posição do sinal negativo</mat-label>
                <mat-select formControlName="negativeSignPosition">
                  <mat-option value="before">Antes do número</mat-option>
                  <mat-option value="after">Depois do número</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Formatação de Moeda -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">attach_money</mat-icon>
              Formatação de Moeda
            </mat-panel-title>
            <mat-panel-description>
              Símbolo, posição e formato monetário
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Código da moeda</mat-label>
                <mat-select formControlName="currencyCode">
                  <mat-option value="BRL">BRL (Real Brasileiro)</mat-option>
                  <mat-option value="USD">USD (Dólar Americano)</mat-option>
                  <mat-option value="EUR">EUR (Euro)</mat-option>
                  <mat-option value="GBP">GBP (Libra Esterlina)</mat-option>
                  <mat-option value="JPY">JPY (Iene)</mat-option>
                  <mat-option value="CAD">CAD (Dólar Canadense)</mat-option>
                  <mat-option value="AUD">AUD (Dólar Australiano)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Símbolo da moeda</mat-label>
                <input matInput formControlName="currencySymbol" 
                       placeholder="R$">
                <mat-hint>Símbolo exibido junto aos valores</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Posição do símbolo</mat-label>
                <mat-select formControlName="currencyPosition">
                  <mat-option value="before">Antes (R$ 100,00)</mat-option>
                  <mat-option value="after">Depois (100,00 R$)</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-slide-toggle formControlName="currencySpacing" class="toggle-field">
                Espaço entre símbolo e valor
              </mat-slide-toggle>
              
              <mat-form-field appearance="outline">
                <mat-label>Precisão decimal (moeda)</mat-label>
                <input matInput type="number" formControlName="currencyPrecision" 
                       min="0" max="4">
                <mat-hint>Casas decimais para valores monetários</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
        
        <!-- Validação -->
        <mat-expansion-panel *ngIf="isV2">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">rule</mat-icon>
              Mensagens de Validação
            </mat-panel-title>
            <mat-panel-description>
              Textos para validação de formulários (V2 only)
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="config-section">
            <div class="config-fields">
              <mat-form-field appearance="outline">
                <mat-label>Campo obrigatório</mat-label>
                <input matInput formControlName="requiredField" 
                       placeholder="Este campo é obrigatório">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Valor inválido</mat-label>
                <input matInput formControlName="invalidValue" 
                       placeholder="Valor inválido">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Muito longo</mat-label>
                <input matInput formControlName="tooLong" 
                       placeholder="Valor muito longo">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Muito curto</mat-label>
                <input matInput formControlName="tooShort" 
                       placeholder="Valor muito curto">
              </mat-form-field>
              
              <div class="subsection">
                <h4>Validações por Tipo</h4>
                <div class="config-fields">
                  <mat-form-field appearance="outline">
                    <mat-label>E-mail inválido</mat-label>
                    <input matInput formControlName="invalidEmail" 
                           placeholder="E-mail inválido">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>URL inválida</mat-label>
                    <input matInput formControlName="invalidUrl" 
                           placeholder="URL inválida">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Deve ser um número</mat-label>
                    <input matInput formControlName="mustBeNumber" 
                           placeholder="Deve ser um número">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Data inválida</mat-label>
                    <input matInput formControlName="invalidDate" 
                           placeholder="Data inválida">
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
        
      </form>
    </div>
  `,
  styles: [`
    .messages-localization-container {
      width: 100%;
      padding: 8px;
    }
    
    .config-section {
      padding: 16px;
    }
    
    .config-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    
    .toggle-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      margin-right: 8px;
      color: var(--mat-sys-primary);
    }
    
    .info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-on-surface-variant);
      cursor: help;
    }
    
    .subsection {
      margin-top: 24px;
      padding: 16px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
    }
    
    .subsection h4 {
      margin: 0 0 16px 0;
      color: var(--mat-sys-on-surface);
      font-weight: 500;
    }
    
    .tab-content {
      padding: 16px 0;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    mat-expansion-panel {
      margin-bottom: 8px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    mat-expansion-panel-header {
      min-height: 56px;
    }
    
    mat-panel-description {
      color: var(--mat-sys-on-surface-variant);
    }
    
    mat-tab-group {
      margin-top: 16px;
    }
  `]
})
export class MessagesLocalizationEditorComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() messagesLocalizationChange = new EventEmitter<MessagesLocalizationChange>();
  
  messagesForm!: FormGroup;
  isV2 = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.isV2 = isTableConfigV2(this.config);
    this.initializeForm();
    this.setupFormListeners();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    // Use type guards to safely access properties
    const v1Config = this.isV2 ? null : this.config as any;
    const messages = v1Config?.messages || {};
    
    this.messagesForm = this.fb.group({
      // State messages
      loadingMessage: [messages.loading || 'Carregando...'],
      emptyMessage: [messages.empty || 'Nenhum dado disponível'],
      errorMessage: [messages.error || 'Erro ao carregar dados'],
      noResultsMessage: [messages.noResults || 'Nenhum resultado encontrado'],
      loadingMoreMessage: ['Carregando mais dados...'],
      
      // Action messages - Confirmations
      deleteConfirmation: ['Tem certeza que deseja excluir este item?'],
      deleteMultipleConfirmation: ['Tem certeza que deseja excluir os itens selecionados?'],
      saveConfirmation: ['Deseja salvar as alterações?'],
      cancelConfirmation: ['Deseja cancelar as alterações?'],
      exportConfirmation: ['Deseja exportar os dados selecionados?'],
      
      // Action messages - Success
      saveSuccess: ['Item salvo com sucesso!'],
      deleteSuccess: ['Item excluído com sucesso!'],
      exportSuccess: ['Exportação concluída com sucesso!'],
      importSuccess: ['Importação concluída com sucesso!'],
      
      // Action messages - Errors
      saveError: ['Erro ao salvar item'],
      deleteError: ['Erro ao excluir item'],
      exportError: ['Erro na exportação'],
      networkError: ['Erro de conexão'],
      permissionError: ['Sem permissão para esta ação'],
      
      // Localization
      locale: ['pt-BR'],
      direction: ['ltr'],
      firstDayOfWeek: [0],
      relativeTime: [true],
      
      // Date/Time formatting
      dateFormat: ['dd/MM/yyyy'],
      timeFormat: ['HH:mm:ss'],
      dateTimeFormat: ['dd/MM/yyyy HH:mm:ss'],
      
      // Number formatting
      decimalSeparator: [','],
      thousandsSeparator: ['.'],
      defaultPrecision: [2],
      negativeSign: ['-'],
      negativeSignPosition: ['before'],
      
      // Currency formatting
      currencyCode: ['BRL'],
      currencySymbol: ['R$'],
      currencyPosition: ['before'],
      currencySpacing: [true],
      currencyPrecision: [2],
      
      // Validation messages (V2 only)
      requiredField: ['Este campo é obrigatório'],
      invalidValue: ['Valor inválido'],
      tooLong: ['Valor muito longo'],
      tooShort: ['Valor muito curto'],
      invalidEmail: ['E-mail inválido'],
      invalidUrl: ['URL inválida'],
      mustBeNumber: ['Deve ser um número'],
      invalidDate: ['Data inválida']
    });
    
    // If V2, load advanced settings
    if (this.isV2) {
      const v2Config = this.config as TableConfig;
      
      if (v2Config.messages) {
        this.messagesForm.patchValue({
          loadingMessage: v2Config.messages.states?.loading || 'Carregando...',
          emptyMessage: v2Config.messages.states?.empty || 'Nenhum dado disponível',
          errorMessage: v2Config.messages.states?.error || 'Erro ao carregar dados',
          noResultsMessage: v2Config.messages.states?.noResults || 'Nenhum resultado encontrado',
          loadingMoreMessage: v2Config.messages.states?.loadingMore || 'Carregando mais dados...',
          
          // Action messages
          deleteConfirmation: v2Config.messages.actions?.confirmations?.delete || 'Tem certeza que deseja excluir este item?',
          deleteMultipleConfirmation: v2Config.messages.actions?.confirmations?.deleteMultiple || 'Tem certeza que deseja excluir os itens selecionados?',
          saveConfirmation: v2Config.messages.actions?.confirmations?.save || 'Deseja salvar as alterações?',
          cancelConfirmation: v2Config.messages.actions?.confirmations?.cancel || 'Deseja cancelar as alterações?',
          exportConfirmation: v2Config.messages.actions?.confirmations?.export || 'Deseja exportar os dados selecionados?',
          
          saveSuccess: v2Config.messages.actions?.success?.save || 'Item salvo com sucesso!',
          deleteSuccess: v2Config.messages.actions?.success?.delete || 'Item excluído com sucesso!',
          exportSuccess: v2Config.messages.actions?.success?.export || 'Exportação concluída com sucesso!',
          importSuccess: v2Config.messages.actions?.success?.import || 'Importação concluída com sucesso!',
          
          saveError: v2Config.messages.actions?.errors?.save || 'Erro ao salvar item',
          deleteError: v2Config.messages.actions?.errors?.delete || 'Erro ao excluir item',
          exportError: v2Config.messages.actions?.errors?.export || 'Erro na exportação',
          networkError: v2Config.messages.actions?.errors?.network || 'Erro de conexão',
          permissionError: v2Config.messages.actions?.errors?.permission || 'Sem permissão para esta ação',
          
          // Validation messages
          requiredField: v2Config.messages.validation?.required || 'Este campo é obrigatório',
          invalidValue: v2Config.messages.validation?.invalid || 'Valor inválido',
          tooLong: v2Config.messages.validation?.tooLong || 'Valor muito longo',
          tooShort: v2Config.messages.validation?.tooShort || 'Valor muito curto',
          invalidEmail: v2Config.messages.validation?.types?.email || 'E-mail inválido',
          invalidUrl: v2Config.messages.validation?.types?.url || 'URL inválida',
          mustBeNumber: v2Config.messages.validation?.types?.number || 'Deve ser um número',
          invalidDate: v2Config.messages.validation?.types?.date || 'Data inválida'
        });
      }
      
      if (v2Config.localization) {
        this.messagesForm.patchValue({
          locale: v2Config.localization.locale || 'pt-BR',
          direction: v2Config.localization.direction || 'ltr',
          firstDayOfWeek: v2Config.localization.dateTime?.firstDayOfWeek ?? 0,
          relativeTime: v2Config.localization.dateTime?.relativeTime !== false,
          
          dateFormat: v2Config.localization.dateTime?.dateFormat || 'dd/MM/yyyy',
          timeFormat: v2Config.localization.dateTime?.timeFormat || 'HH:mm:ss',
          dateTimeFormat: v2Config.localization.dateTime?.dateTimeFormat || 'dd/MM/yyyy HH:mm:ss',
          
          decimalSeparator: v2Config.localization.number?.decimalSeparator || ',',
          thousandsSeparator: v2Config.localization.number?.thousandsSeparator || '.',
          defaultPrecision: v2Config.localization.number?.defaultPrecision ?? 2,
          negativeSign: v2Config.localization.number?.negativeSign || '-',
          negativeSignPosition: v2Config.localization.number?.negativeSignPosition || 'before',
          
          currencyCode: v2Config.localization.currency?.code || 'BRL',
          currencySymbol: v2Config.localization.currency?.symbol || 'R$',
          currencyPosition: v2Config.localization.currency?.position || 'before',
          currencySpacing: v2Config.localization.currency?.spacing !== false,
          currencyPrecision: v2Config.localization.currency?.precision ?? 2
        });
      }
    }
  }
  
  private setupFormListeners(): void {
    this.messagesForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.updateConfig(values);
      });
  }
  
  private updateConfig(values: any): void {
    const updatedConfig = { ...this.config };
    
    if (this.isV2) {
      // Update V2 config structure
      const v2Config = updatedConfig as TableConfig;
      
      // Messages
      v2Config.messages = {
        states: {
          loading: values.loadingMessage,
          empty: values.emptyMessage,
          error: values.errorMessage,
          noResults: values.noResultsMessage,
          loadingMore: values.loadingMoreMessage
        },
        actions: {
          confirmations: {
            delete: values.deleteConfirmation,
            deleteMultiple: values.deleteMultipleConfirmation,
            save: values.saveConfirmation,
            cancel: values.cancelConfirmation,
            export: values.exportConfirmation
          },
          success: {
            save: values.saveSuccess,
            delete: values.deleteSuccess,
            export: values.exportSuccess,
            import: values.importSuccess
          },
          errors: {
            save: values.saveError,
            delete: values.deleteError,
            export: values.exportError,
            network: values.networkError,
            permission: values.permissionError
          }
        },
        validation: {
          required: values.requiredField,
          invalid: values.invalidValue,
          tooLong: values.tooLong,
          tooShort: values.tooShort,
          types: {
            email: values.invalidEmail,
            url: values.invalidUrl,
            number: values.mustBeNumber,
            date: values.invalidDate
          }
        }
      };
      
      // Localization
      v2Config.localization = {
        locale: values.locale,
        direction: values.direction,
        dateTime: {
          dateFormat: values.dateFormat,
          timeFormat: values.timeFormat,
          dateTimeFormat: values.dateTimeFormat,
          firstDayOfWeek: values.firstDayOfWeek,
          relativeTime: values.relativeTime
        },
        number: {
          decimalSeparator: values.decimalSeparator,
          thousandsSeparator: values.thousandsSeparator,
          defaultPrecision: values.defaultPrecision,
          negativeSign: values.negativeSign,
          negativeSignPosition: values.negativeSignPosition
        },
        currency: {
          code: values.currencyCode,
          symbol: values.currencySymbol,
          position: values.currencyPosition,
          spacing: values.currencySpacing,
          precision: values.currencyPrecision
        },
        formatting: {
          percentageFormat: '#0.00%',
          fileSizeFormat: 'binary'
        }
      };
      
    } else {
      // Update V1 config structure
      const v1UpdatedConfig = updatedConfig as any;
      v1UpdatedConfig.messages = {
        loading: values.loadingMessage,
        empty: values.emptyMessage,
        error: values.errorMessage,
        noResults: values.noResultsMessage
      };
    }
    
    this.configChange.emit(updatedConfig);
  }
}