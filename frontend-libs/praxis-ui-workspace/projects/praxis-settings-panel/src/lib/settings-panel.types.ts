import { Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsPanelConfig {
  id: string;
  title: string;
  content: { component: Type<any>; inputs?: Record<string, any> };
}

export interface SettingsValueProvider {
  // ===== MÉTODOS BÁSICOS =====
  /**
   * Retorna o valor atual das configurações para ser salvo/aplicado
   */
  getSettingsValue(): any;
  
  /**
   * Método chamado quando o usuário solicita salvamento.
   * Se omitido, getSettingsValue() será usado como fallback.
   */
  onSave?(): any;
  
  /**
   * Reseta as configurações para o estado inicial
   */
  reset?(): void;

  // ===== OBSERVABLES DE ESTADO (OBRIGATÓRIOS) =====
  /**
   * Observable que indica se há alterações não salvas.
   * Controla a habilitação dos botões Salvar e Aplicar.
   */
  isDirty$: Observable<boolean>;
  
  /**
   * Observable que indica se o estado atual é válido.
   * Impede salvamento quando há erros de validação.
   */
  isValid$: Observable<boolean>;
  
  /**
   * Observable que indica se há operação em andamento.
   * Desabilita botões durante operações assíncronas.
   */
  isBusy$: Observable<boolean>;

  // ===== CONTROLES DE PAINEL (OPCIONAIS) =====
  /**
   * Observable que sugere se o painel deve estar expandido.
   * O componente pode sugerir expansão baseado no conteúdo complexo.
   */
  suggestExpanded$?: Observable<boolean>;
  
  /**
   * Observable que define largura personalizada do painel.
   * Permite que componentes com muito conteúdo solicitem mais espaço.
   */
  preferredWidth$?: Observable<string | number>;
  
  /**
   * Observable que indica se o componente precisa de mais altura.
   * Pode ser usado para ajustar o layout do painel.
   */
  requiresFullHeight$?: Observable<boolean>;

  // ===== HOOKS DE CICLO DE VIDA (OPCIONAIS) =====
  /**
   * Chamado quando o painel é expandido/colapsado.
   * Permite que o componente ajuste seu layout interno.
   */
  onPanelResize?(expanded: boolean): void;
  
  /**
   * Chamado quando o painel está prestes a ser fechado.
   * Permite cleanup ou confirmação antes do fechamento.
   * Retornar false cancela o fechamento.
   */
  onBeforeClose?(reason: SettingsPanelCloseReason): boolean | Promise<boolean>;
  
  /**
   * Chamado quando o painel ganha/perde foco.
   * Útil para pausar validações custosas quando não está visível.
   */
  onFocusChange?(focused: boolean): void;

  // ===== CONFIGURAÇÕES AVANÇADAS (OPCIONAIS) =====
  /**
   * Observable que define ações customizadas na toolbar.
   * Permite adicionar botões específicos do componente.
   */
  customActions$?: Observable<SettingsPanelAction[]>;
  
  /**
   * Observable que controla a visibilidade de botões padrão.
   * Permite ocultar Salvar/Aplicar se o componente gerencia isso internamente.
   */
  hideDefaultButtons$?: Observable<boolean>;
}

// ===== TIPOS AUXILIARES =====
export interface SettingsPanelAction {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  action: () => void;
}

export type SettingsPanelCloseReason = 'cancel' | 'save' | 'backdrop' | 'esc';
