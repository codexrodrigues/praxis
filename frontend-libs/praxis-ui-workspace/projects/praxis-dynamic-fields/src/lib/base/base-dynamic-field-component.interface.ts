/**
 * @fileoverview Interface base para todos os componentes de campos dinâmicos
 * 
 * Define o contrato comum que todos os componentes dinâmicos devem implementar
 * para garantir compatibilidade com o DynamicFieldLoaderDirective e outros
 * serviços do sistema.
 */

import { WritableSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { ComponentMetadata } from '@praxis/core';

// =============================================================================
// INTERFACES DE SUPORTE
// =============================================================================

/**
 * Eventos de lifecycle que os componentes podem emitir
 */
export interface ComponentLifecycleEvent {
  phase: 'init' | 'afterInit' | 'change' | 'destroy';
  timestamp: number;
  componentId: string;
  metadata?: any;
}

/**
 * Opções para métodos de controle de valor
 */
export interface ValueChangeOptions {
  emitEvent?: boolean;
  updateUI?: boolean;
}

// =============================================================================
// INTERFACE PRINCIPAL
// =============================================================================

/**
 * Interface base que todos os componentes de campos dinâmicos devem implementar.
 * 
 * Esta interface define o contrato mínimo necessário para que um componente
 * seja compatível com o sistema de renderização dinâmica do Praxis.
 * 
 * ## Responsabilidades Principais
 * 
 * - Gerenciar metadata do componente através de signals
 * - Integrar com Angular Reactive Forms
 * - Fornecer controles de foco e blur
 * - Implementar lifecycle hooks customizados
 * - Manter identificação única do componente
 * 
 * ## Implementação
 * 
 * Componentes podem implementar esta interface diretamente ou herdar de:
 * - SimpleBaseInputComponent (para campos de entrada)
 * - SimpleBaseButtonComponent (para ações/botões)
 */
export interface BaseDynamicFieldComponent {

  // =============================================================================
  // PROPRIEDADES OBRIGATÓRIAS
  // =============================================================================

  /**
   * Metadata do componente que define sua configuração e comportamento.
   * 
   * Contém informações como label, tipo de controle, validações,
   * propriedades visuais e outras configurações específicas.
   */
  readonly metadata: WritableSignal<ComponentMetadata | null>;

  /**
   * ID único do componente para identificação e debugging.
   * 
   * Gerado automaticamente durante a inicialização e usado
   * para logging, testes e identificação em runtime.
   */
  readonly componentId: WritableSignal<string>;

  // =============================================================================
  // PROPRIEDADES OPCIONAIS
  // =============================================================================

  /**
   * FormControl associado ao componente para integração com Angular Reactive Forms.
   * 
   * Opcional porque nem todos os componentes precisam de FormControl
   * (ex: botões, labels, componentes de exibição).
   */
  readonly formControl?: WritableSignal<AbstractControl | null>;

  /**
   * Observable de eventos de lifecycle do componente.
   * 
   * Permite monitorar o ciclo de vida do componente externamente
   * para debugging, analytics ou integração com outros sistemas.
   */
  readonly lifecycleEvents$?: Observable<ComponentLifecycleEvent | null>;

  // =============================================================================
  // MÉTODOS OBRIGATÓRIOS
  // =============================================================================

  /**
   * Foca no elemento principal do componente.
   * 
   * Deve focar no input, botão ou elemento interativo principal.
   * Implementação deve ser robusta e não falhar se elemento não existir.
   */
  focus(): void;

  /**
   * Remove o foco do elemento principal do componente.
   * 
   * Útil para controle programático de foco e navegação por teclado.
   */
  blur(): void;

  // =============================================================================
  // MÉTODOS OPCIONAIS - LIFECYCLE
  // =============================================================================

  /**
   * Hook chamado após a inicialização completa do componente.
   * 
   * Executado depois que metadata e formControl foram configurados.
   * Ideal para configurações específicas do componente.
   */
  onComponentInit?(): void;

  /**
   * Hook chamado antes da destruição do componente.
   * 
   * Usado para limpeza de recursos, cancelamento de subscriptions,
   * ou salvamento de estado.
   */
  onComponentDestroy?(): void;

  // =============================================================================
  // MÉTODOS OPCIONAIS - CONTROLE DE VALOR (para componentes com FormControl)
  // =============================================================================

  /**
   * Define o valor do campo programaticamente.
   * 
   * Implementação opcional para componentes que gerenciam valores.
   * Deve atualizar tanto o FormControl quanto o estado interno.
   */
  setValue?(value: any, options?: ValueChangeOptions): void;

  /**
   * Obtém o valor atual do campo.
   * 
   * @returns Valor atual ou null se não aplicável
   */
  getValue?(): any;

  /**
   * Marca o componente como tocado (touched).
   * 
   * Usado para controle de validação e exibição de mensagens de erro.
   */
  markAsTouched?(): void;

  /**
   * Marca o componente como modificado (dirty).
   * 
   * Indica que o valor foi alterado pelo usuário.
   */
  markAsDirty?(): void;

  // =============================================================================
  // MÉTODOS OPCIONAIS - ESTADO E CONTROLE
  // =============================================================================

  /**
   * Define o estado de loading do componente.
   * 
   * Útil para botões e componentes que executam ações assíncronas.
   */
  setLoading?(loading: boolean): void;

  /**
   * Define o estado de desabilitado do componente.
   */
  setDisabled?(disabled: boolean): void;

  /**
   * Força a validação do componente.
   * 
   * @returns Promise com erros de validação ou null se válido
   */
  validateField?(): Promise<any>;

  /**
   * Reseta o componente para seu estado inicial.
   */
  resetField?(): void;
}

// =============================================================================
// TYPES UTILITÁRIOS
// =============================================================================

/**
 * Type guard para verificar se um objeto implementa BaseDynamicFieldComponent
 */
export function isBaseDynamicFieldComponent(obj: any): obj is BaseDynamicFieldComponent {
  return obj &&
    typeof obj === 'object' &&
    'metadata' in obj &&
    'componentId' in obj &&
    typeof obj.focus === 'function' &&
    typeof obj.blur === 'function' &&
    typeof obj.metadata === 'function' &&
    typeof obj.componentId === 'function';
}

/**
 * Type guard para verificar se componente suporta valores (tem FormControl)
 */
export function isValueBasedComponent(component: BaseDynamicFieldComponent): component is BaseDynamicFieldComponent & { formControl: WritableSignal<AbstractControl | null> } {
  return 'formControl' in component && component.formControl !== undefined;
}

/**
 * Type guard para verificar se componente suporta loading
 */
export function isLoadingCapableComponent(component: BaseDynamicFieldComponent): component is BaseDynamicFieldComponent & { setLoading: (loading: boolean) => void } {
  return typeof (component as any).setLoading === 'function';
}