/**
 * @fileoverview Simple base component for button-type components
 * 
 * This is a specialized base component that provides:
 * ✅ Basic button state management
 * ✅ Action execution system
 * ✅ Loading states and feedback
 * ✅ Click handling and debouncing
 * ✅ Material Design properties
 * ✅ CSS classes for button states
 * ✅ Accessibility support
 * 
 * Unlike SimpleBaseInputComponent, this is focused on actions, not form values.
 */

import {
  signal,
  computed,
  output,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ComponentMetadata } from '@praxis/core';
import { BaseDynamicFieldComponent, ComponentLifecycleEvent } from './base-dynamic-field-component.interface';
import { BehaviorSubject } from 'rxjs';

// =============================================================================
// BASIC INTERFACES FOR BUTTONS
// =============================================================================

interface BasicButtonState {
  initialized: boolean;
  loading: boolean;
  disabled: boolean;
  focused: boolean;
  clicked: boolean;
  error: Error | null;
}

interface ButtonAction {
  type: 'navigation' | 'external-link' | 'custom' | 'form-action';
  target?: string;
  payload?: any;
  confirmation?: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
}

interface ClickMetrics {
  clickCount: number;
  lastClickTime: number;
  debounceTime: number;
}

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// =============================================================================
// SIMPLE BASE BUTTON COMPONENT
// =============================================================================

@Directive()
export abstract class SimpleBaseButtonComponent implements OnInit, OnDestroy, BaseDynamicFieldComponent {

  // =============================================================================
  // DEPENDENCY INJECTION
  // =============================================================================

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly elementRef = inject(ElementRef);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly router = inject(Router);
  protected readonly dialog = inject(MatDialog);
  
  /** Subject para eventos de lifecycle */
  readonly lifecycleEvents$ = new BehaviorSubject<ComponentLifecycleEvent | null>(null);

  // =============================================================================
  // SIGNALS
  // =============================================================================

  /** Metadata do componente */
  readonly metadata = signal<ComponentMetadata | null>(null);

  /** Estado básico do botão */
  protected readonly buttonState = signal<BasicButtonState>({
    initialized: false,
    loading: false,
    disabled: false,
    focused: false,
    clicked: false,
    error: null
  });

  /** Ação configurada para o botão */
  protected readonly buttonAction = signal<ButtonAction | null>(null);

  /** Métricas de clique */
  private readonly clickMetrics = signal<ClickMetrics>({
    clickCount: 0,
    lastClickTime: 0,
    debounceTime: 300
  });

  /** ID único do componente */
  readonly componentId = signal<string>('');

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  readonly actionExecuted = output<any>();
  readonly click = output<MouseEvent>();
  readonly focusChange = output<boolean>();

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** CSS classes básicas do botão */
  readonly baseButtonCssClasses = computed(() => {
    const state = this.buttonState();
    const classes: string[] = [];

    // Estados do botão
    if (state.loading) classes.push('pdx-loading');
    if (state.disabled) classes.push('pdx-disabled');
    if (state.focused) classes.push('pdx-focused');
    if (state.clicked) classes.push('pdx-clicked');
    if (state.error) classes.push('pdx-error');

    return classes;
  });

  /** CSS classes completas do botão (extensível por subclasses) */
  readonly componentCssClasses = computed(() => {
    const baseClasses = this.baseButtonCssClasses();
    const specificClasses = this.getSpecificCssClasses();
    
    return [...baseClasses, ...specificClasses].join(' ');
  });

  /** Tipo de botão Material */
  readonly buttonType = computed(() => {
    const meta = this.metadata();
    return meta?.controlType || 'basic';
  });

  /** Aparência Material */
  readonly materialAppearance = computed(() => {
    const meta = this.metadata();
    return meta?.materialDesign?.appearance || 'contained';
  });

  /** Cor Material */
  readonly materialColor = computed(() => {
    const meta = this.metadata();
    return meta?.materialDesign?.color || 'primary';
  });

  /** Se o botão está desabilitado */
  readonly isDisabled = computed(() => {
    const state = this.buttonState();
    const meta = this.metadata();
    return state.disabled || meta?.disabled || state.loading;
  });

  /** Se o botão está em loading */
  readonly isLoading = computed(() => {
    const state = this.buttonState();
    const meta = this.metadata();
    return state.loading || meta?.loading;
  });

  /** Texto a ser exibido no botão */
  readonly buttonText = computed(() => {
    const meta = this.metadata();
    const state = this.buttonState();
    
    if (state.loading && meta?.loadingText) {
      return meta.loadingText;
    }
    
    return meta?.label || 'Button';
  });

  /** Ícone a ser exibido */
  readonly buttonIcon = computed(() => {
    const meta = this.metadata();
    const state = this.buttonState();
    
    if (state.loading) {
      return null; // Spinner será mostrado
    }
    
    return meta?.icon || meta?.iconName;
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    this.componentId.set(this.generateUniqueId());
    this.initializeButtonAction();
    this.buttonState.update(state => ({ ...state, initialized: true }));
    this.emitLifecycleEvent('init');
    this.log('debug', 'Simple base button component initialized');
    
    // Chamar hook após inicialização completa
    if (this.onComponentInit) {
      this.onComponentInit();
    }
    this.emitLifecycleEvent('afterInit');
  }

  ngOnDestroy(): void {
    this.emitLifecycleEvent('destroy');
    
    // Chamar hook antes da destruição
    if (this.onComponentDestroy) {
      this.onComponentDestroy();
    }
    
    this.log('debug', 'Simple base button component destroyed');
  }

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  async handleClick(event: MouseEvent): Promise<void> {
    const state = this.buttonState();
    
    // Prevenir cliques se desabilitado ou em loading
    if (state.disabled || state.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Debounce protection
    if (!this.shouldAllowClick()) {
      return;
    }

    try {
      // Marcar como clicado
      this.buttonState.update(s => ({ ...s, clicked: true }));
      this.updateClickMetrics();

      // Emitir evento
      this.click.emit(event);

      // Executar ação se configurada
      const action = this.buttonAction();
      if (action) {
        await this.executeAction(action);
      }

      this.log('debug', 'Button clicked', { action: action?.type });

    } catch (error) {
      this.handleError(error as Error);
    } finally {
      // Reset clicked state
      setTimeout(() => {
        this.buttonState.update(s => ({ ...s, clicked: false }));
      }, 150);
    }
  }

  handleFocus(): void {
    this.buttonState.update(state => ({ ...state, focused: true }));
    this.focusChange.emit(true);
    this.log('debug', 'Button focused');
  }

  handleBlur(): void {
    this.buttonState.update(state => ({ ...state, focused: false }));
    this.focusChange.emit(false);
    this.log('debug', 'Button blurred');
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /**
   * Define loading state
   */
  setLoading(loading: boolean): void {
    this.buttonState.update(state => ({ ...state, loading }));
  }

  /**
   * Define disabled state
   */
  setDisabled(disabled: boolean): void {
    this.buttonState.update(state => ({ ...state, disabled }));
  }

  /**
   * Executa ação programaticamente
   */
  async triggerAction(): Promise<void> {
    const action = this.buttonAction();
    if (action) {
      await this.executeAction(action);
    }
  }

  /**
   * Foca no botão
   */
  focus(): void {
    const button = this.elementRef.nativeElement.querySelector('button');
    if (button) {
      button.focus();
    }
  }

  /**
   * Remove foco do botão
   */
  blur(): void {
    const button = this.elementRef.nativeElement.querySelector('button');
    if (button) {
      button.blur();
    }
  }

  // =============================================================================
  // PROTECTED METHODS - PARA SUBCLASSES
  // =============================================================================

  /**
   * Define metadata do componente
   */
  protected setMetadata(metadata: ComponentMetadata): void {
    this.metadata.set(metadata);
    this.initializeButtonAction();
    this.emitLifecycleEvent('change');
  }

  /**
   * Retorna classes CSS específicas da subclasse
   */
  protected getSpecificCssClasses(): string[] {
    return []; // Default implementation - subclasses can override
  }

  /**
   * Hook chamado após inicialização - implementação da interface BaseDynamicFieldComponent
   * Subclasses podem override para implementar comportamento específico
   */
  onComponentInit?(): void {
    // Default implementation - subclasses can override
  }
  
  /**
   * Hook chamado antes da destruição - implementação da interface BaseDynamicFieldComponent
   * Subclasses podem override para limpeza específica
   */
  onComponentDestroy?(): void {
    // Default implementation - subclasses can override
  }

  /**
   * Hook chamado antes da execução de ação - para subclasses implementarem
   */
  protected async onBeforeAction(action: ButtonAction): Promise<boolean> {
    return true; // Default: allow action
  }

  /**
   * Hook chamado após execução de ação - para subclasses implementarem
   */
  protected async onAfterAction(action: ButtonAction, result: any): Promise<void> {
    // Default implementation - subclasses can override
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeButtonAction(): void {
    const meta = this.metadata();
    if (!meta) return;

    let action: ButtonAction | null = null;

    // Determinar tipo de ação baseado no metadata
    if (meta.routerLink) {
      action = {
        type: 'navigation',
        target: meta.routerLink
      };
    } else if (meta.link || meta.href) {
      action = {
        type: 'external-link',
        target: meta.link || meta.href
      };
    } else if (meta.action) {
      action = {
        type: 'custom',
        payload: meta.action
      };
    }

    // Adicionar confirmação se configurada
    if (action && meta.confirmDialog) {
      action.confirmation = {
        title: meta.confirmDialog.title || 'Confirmar',
        message: meta.confirmDialog.message || 'Tem certeza?',
        confirmLabel: meta.confirmDialog.confirmLabel || 'Confirmar',
        cancelLabel: meta.confirmDialog.cancelLabel || 'Cancelar'
      };
    }

    this.buttonAction.set(action);
  }

  private async executeAction(action: ButtonAction): Promise<void> {
    // Hook pre-action
    const shouldProceed = await this.onBeforeAction(action);
    if (!shouldProceed) return;

    // Mostrar confirmação se necessária
    if (action.confirmation) {
      const confirmed = await this.showConfirmation(action.confirmation);
      if (!confirmed) return;
    }

    this.setLoading(true);

    try {
      let result: any = null;

      switch (action.type) {
        case 'navigation':
          if (action.target) {
            await this.router.navigateByUrl(action.target);
            result = { navigated: true, target: action.target };
          }
          break;

        case 'external-link':
          if (action.target) {
            window.open(action.target, '_blank');
            result = { opened: true, target: action.target };
          }
          break;

        case 'custom':
          result = await this.executeCustomAction(action.payload);
          break;

        case 'form-action':
          result = await this.executeFormAction(action.payload);
          break;
      }

      this.actionExecuted.emit(result);
      await this.onAfterAction(action, result);

    } finally {
      this.setLoading(false);
    }
  }

  private async showConfirmation(confirmation: ButtonAction['confirmation']): Promise<boolean> {
    // Implementação básica - subclasses podem override
    return window.confirm(`${confirmation?.title}\n\n${confirmation?.message}`);
  }

  private async executeCustomAction(payload: any): Promise<any> {
    // Hook para subclasses implementarem ações customizadas
    this.log('debug', 'Custom action executed', { payload });
    return payload;
  }

  private async executeFormAction(payload: any): Promise<any> {
    // Hook para ações relacionadas a formulário
    this.log('debug', 'Form action executed', { payload });
    return payload;
  }

  private shouldAllowClick(): boolean {
    const metrics = this.clickMetrics();
    const now = Date.now();
    const timeSinceLastClick = now - metrics.lastClickTime;
    
    return timeSinceLastClick >= metrics.debounceTime;
  }

  private updateClickMetrics(): void {
    const current = this.clickMetrics();
    this.clickMetrics.set({
      clickCount: current.clickCount + 1,
      lastClickTime: Date.now(),
      debounceTime: current.debounceTime
    });
  }

  private handleError(error: Error): void {
    this.buttonState.update(state => ({ ...state, error, loading: false }));
    this.log('error', 'Button action failed', { error: error.message });
  }

  private generateUniqueId(): string {
    return `pdx-simple-button-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sistema de logging básico
   */
  protected log(level: LogLevel, message: string, data?: any): void {
    if (level === 'error' || level === 'warn') {
      const logEntry = {
        level,
        message: `[${this.componentId()}] ${message}`,
        timestamp: new Date().toISOString(),
        data
      };

      const consoleFn = level === 'error' ? console.error : console.warn;
      consoleFn(logEntry.message, data || '');
    }
    // Para debug/info, só logamos em desenvolvimento
    else if (level === 'debug') {
      console.debug(`[${this.componentId()}] ${message}`, data || '');
    }
  }
  
  /**
   * Emite evento de lifecycle
   */
  private emitLifecycleEvent(phase: ComponentLifecycleEvent['phase']): void {
    const event: ComponentLifecycleEvent = {
      phase,
      timestamp: Date.now(),
      componentId: this.componentId(),
      metadata: this.metadata()
    };

    this.lifecycleEvents$.next(event);
  }
}