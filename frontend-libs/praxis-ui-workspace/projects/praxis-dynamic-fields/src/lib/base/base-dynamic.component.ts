/**
 * @fileoverview Componente base universal para campos dinâmicos
 * 
 * Este componente fornece funcionalidades fundamentais para todos os campos dinâmicos:
 * ✅ Gerenciamento moderno de lifecycle com DestroyRef (Angular 19+)
 * ✅ Suporte a signals para reatividade otimizada
 * ✅ Sistema de logging e debugging integrado
 * ✅ Performance monitoring nativo
 * ✅ Extensibilidade com plugin architecture
 * ✅ Compatibilidade com frameworks de teste
 */

import { 
  DestroyRef, 
  OnDestroy, 
  OnInit,
  inject, 
  signal, 
  computed,
  effect,
  Injector,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Subscription, Observable, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Import das interfaces do core
import { ComponentMetadata, FieldControlType } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

/**
 * Interface estendida para acessar propriedades comuns de metadata
 */
interface ExtendedMetadata extends ComponentMetadata {
  name?: string;
  [key: string]: any;
}

function safeMetadata(metadata: ComponentMetadata | null | undefined): ExtendedMetadata {
  return (metadata || {}) as ExtendedMetadata;
}

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

export interface ComponentLifecycleEvent {
  phase: 'init' | 'afterInit' | 'change' | 'destroy';
  timestamp: number;
  componentId: string;
  metadata?: any;
}

export interface PerformanceMetrics {
  renderTime: number;
  lastUpdateTime: number;
  changeCount: number;
  memoryUsage?: number;
}

export interface ComponentState {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  dirty: boolean;
  touched: boolean;
  focused: boolean;
  disabled: boolean;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// =============================================================================
// CLASSE BASE UNIVERSAL
// =============================================================================

export abstract class BaseDynamicComponent<T extends ComponentMetadata = ComponentMetadata> 
  implements OnInit, OnDestroy {

  // =============================================================================
  // INJEÇÕES MODERNAS ANGULAR 19+
  // =============================================================================
  
  /** DestroyRef moderno para cleanup automático */
  protected readonly destroyRef = inject(DestroyRef);
  
  /** Injector para serviços dinâmicos */
  protected readonly injector = inject(Injector);
  
  /** ElementRef para manipulação DOM */
  protected readonly elementRef = inject(ElementRef);
  
  /** Renderer2 para manipulação DOM segura */
  protected readonly renderer = inject(Renderer2);
  
  /** ChangeDetectorRef para controle de detecção de mudanças */
  protected readonly cdr = inject(ChangeDetectorRef);
  
  /** ViewContainerRef para componentes dinâmicos */
  protected readonly viewContainer = inject(ViewContainerRef);

  // =============================================================================
  // SIGNALS REACTIVOS (Angular 19+)
  // =============================================================================
  
  /** Metadata do componente como signal */
  protected readonly metadata = signal<T | null>(null);
  
  /** Estado interno do componente */
  protected readonly componentState = signal<ComponentState>({
    initialized: false,
    loading: false,
    error: null,
    dirty: false,
    touched: false,
    focused: false,
    disabled: false
  });
  
  /** Métricas de performance */
  protected readonly performanceMetrics = signal<PerformanceMetrics>({
    renderTime: 0,
    lastUpdateTime: 0,
    changeCount: 0
  });
  
  /** Nível de log atual */
  protected readonly logLevel = signal<LogLevel>('info');
  
  /** ID único do componente */
  protected readonly componentId = signal<string>('');

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================
  
  /** Verifica se o componente está pronto */
  readonly isReady = computed(() => 
    this.componentState().initialized && !this.componentState().loading
  );
  
  /** Verifica se há erro */
  readonly hasError = computed(() => 
    this.componentState().error !== null
  );
  
  /** Verifica se foi modificado */
  readonly isDirty = computed(() => 
    this.componentState().dirty
  );
  
  /** Verifica se está em modo debug */
  readonly isDebugMode = computed(() => 
    this.logLevel() === 'debug' || this.logLevel() === 'trace'
  );
  
  /** CSS classes computadas baseadas no estado */
  readonly cssClasses = computed(() => {
    const state = this.componentState();
    const classes: string[] = ['pdx-dynamic-component'];
    
    if (state.loading) classes.push('pdx-loading');
    if (state.error) classes.push('pdx-error');
    if (state.dirty) classes.push('pdx-dirty');
    if (state.touched) classes.push('pdx-touched');
    if (state.focused) classes.push('pdx-focused');
    
    return classes.join(' ');
  });

  // =============================================================================
  // SUBJECTS E OBSERVABLES
  // =============================================================================
  
  /** Subject para cleanup legado */
  protected readonly destroy$ = new Subject<void>();
  
  /** Subject para eventos de lifecycle */
  protected readonly lifecycleEvents$ = new BehaviorSubject<ComponentLifecycleEvent | null>(null);
  
  /** Subject para logs */
  protected readonly logs$ = new Subject<{level: LogLevel; message: string; data?: any}>();
  
  /** Array de subscriptions para cleanup manual */
  protected readonly subscriptions: Subscription[] = [];

  // =============================================================================
  // CONSTRUCTOR E LIFECYCLE
  // =============================================================================
  
  constructor() {
    // Gerar ID único do componente
    this.componentId.set(this.generateUniqueId());
    
    // Setup automático de cleanup
    this.setupDestroyHandling();
    
    // Setup de logging se em debug mode
    this.setupLogging();
    
    // Setup de performance monitoring
    this.setupPerformanceMonitoring();
    
    // Aplicar CSS classes reativas
    this.setupReactiveStyling();
  }

  ngOnInit(): void {
    const startTime = performance.now();
    
    try {
      // Marcar como inicializado
      this.updateComponentState({ initialized: true });
      
      // Emitir evento de lifecycle
      this.emitLifecycleEvent('init');
      
      // Inicialização específica do componente
      this.onComponentInit();
      
      // Calcular tempo de inicialização
      const initTime = performance.now() - startTime;
      this.updatePerformanceMetrics({ renderTime: initTime });
      
      this.log('debug', 'Component initialized', { 
        id: this.componentId(),
        initTime: `${initTime.toFixed(2)}ms`
      });
      
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  ngOnDestroy(): void {
    this.emitLifecycleEvent('destroy');
    
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Complete subjects
    this.destroy$.next();
    this.destroy$.complete();
    this.lifecycleEvents$.complete();
    
    this.log('debug', 'Component destroyed', { id: this.componentId() });
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS PARA SUBCOMPONENTES
  // =============================================================================
  
  /**
   * Configura metadata do componente
   */
  setMetadata(metadata: T): void {
    const previousMetadata = this.metadata();
    this.metadata.set(metadata);
    
    this.onMetadataChange(metadata, previousMetadata);
    
    this.log('debug', 'Metadata updated', { 
      componentId: this.componentId(),
      metadata: safeMetadata(metadata).name 
    });
  }
  
  /**
   * Atualiza estado do componente
   */
  updateComponentState(stateChanges: Partial<ComponentState>): void {
    const currentState = this.componentState();
    const newState = { ...currentState, ...stateChanges };
    this.componentState.set(newState);
    
    this.onStateChange(newState, currentState);
  }
  
  /**
   * Marca componente como tocado
   */
  markAsTouched(): void {
    this.updateComponentState({ touched: true });
  }
  
  /**
   * Marca componente como sujo
   */
  markAsDirty(): void {
    this.updateComponentState({ dirty: true });
  }
  
  /**
   * Foca no componente
   */
  focus(): void {
    this.updateComponentState({ focused: true });
    this.onFocus();
  }
  
  /**
   * Remove foco do componente
   */
  blur(): void {
    this.updateComponentState({ focused: false });
    this.onBlur();
  }

  // =============================================================================
  // SISTEMA DE LOGGING
  // =============================================================================
  
  /**
   * Sistema de logging integrado
   */
  protected log(level: LogLevel, message: string, data?: any): void {
    const currentLevel = this.logLevel();
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(level) >= levels.indexOf(currentLevel)) {
      const logEntry = {
        level,
        message: `[${this.componentId()}] ${message}`,
        timestamp: new Date().toISOString(),
        data
      };
      
      // Emitir para stream de logs
      this.logs$.next(logEntry);
      
      // Log no console baseado no nível
      const consoleFn = level === 'error' ? console.error :
                       level === 'warn' ? console.warn :
                       level === 'debug' ? console.debug : console.log;
      
      consoleFn(logEntry.message, data || '');
    }
  }

  // =============================================================================
  // HELPERS MODERNOS ANGULAR 19+
  // =============================================================================
  
  /**
   * Helper moderno para subscriptions com cleanup automático
   */
  protected takeUntilDestroyed() {
    return takeUntilDestroyed(this.destroyRef);
  }
  
  /**
   * Helper legado para compatibilidade
   */
  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }
  
  /**
   * Observable que emite quando o componente é destruído
   */
  protected get destroyed$(): Observable<void> {
    return this.destroy$.asObservable();
  }

  // =============================================================================
  // MÉTODOS ABSTRATOS PARA SUBCOMPONENTES
  // =============================================================================
  
  /**
   * Inicialização específica do componente
   */
  protected abstract onComponentInit(): void;
  
  /**
   * Callback quando metadata muda
   */
  protected onMetadataChange(newMetadata: T, oldMetadata: T | null): void {
    // Implementação padrão vazia - subcomponentes podem sobrescrever
  }
  
  /**
   * Callback quando estado muda
   */
  protected onStateChange(newState: ComponentState, oldState: ComponentState): void {
    // Implementação padrão vazia - subcomponentes podem sobrescrever
  }
  
  /**
   * Callback de foco
   */
  protected onFocus(): void {
    // Implementação padrão vazia - subcomponentes podem sobrescrever
  }
  
  /**
   * Callback de blur
   */
  protected onBlur(): void {
    // Implementação padrão vazia - subcomponentes podem sobrescrever
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================
  
  private setupDestroyHandling(): void {
    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });
  }
  
  private setupLogging(): void {
    // Configurar nível de log baseado no ambiente
    if (typeof window !== 'undefined' && (window as any)['pdxDebug']) {
      this.logLevel.set('debug');
    }
    
    // Subscribe aos logs para debugging
    this.logs$.pipe(
      this.takeUntilDestroyed()
    ).subscribe(logEntry => {
      // Aqui poderia enviar logs para serviço externo
      if (this.isDebugMode()) {
        console.groupCollapsed(`🎯 ${(logEntry as any).message}`);
        if ((logEntry as any).data) {
          console.log('Data:', (logEntry as any).data);
        }
        console.log('Timestamp:', (logEntry as any).timestamp);
        console.log('Component State:', this.componentState());
        console.groupEnd();
      }
    });
  }
  
  private setupPerformanceMonitoring(): void {
    // Effect para monitorar mudanças de estado
    effect(() => {
      const state = this.componentState();
      const metrics = this.performanceMetrics();
      
      this.updatePerformanceMetrics({
        ...metrics,
        lastUpdateTime: performance.now(),
        changeCount: metrics.changeCount + 1
      });
    });
  }
  
  private setupReactiveStyling(): void {
    // Effect para aplicar classes CSS reativas
    effect(() => {
      const classes = this.cssClasses();
      const element = this.elementRef.nativeElement;
      
      if (element) {
        element.className = classes;
      }
    });
  }
  
  private updatePerformanceMetrics(metricsUpdate: Partial<PerformanceMetrics>): void {
    const current = this.performanceMetrics();
    this.performanceMetrics.set({ ...current, ...metricsUpdate });
  }
  
  private emitLifecycleEvent(phase: ComponentLifecycleEvent['phase']): void {
    const event: ComponentLifecycleEvent = {
      phase,
      timestamp: Date.now(),
      componentId: this.componentId(),
      metadata: this.metadata()
    };
    
    this.lifecycleEvents$.next(event);
  }
  
  private handleError(error: Error): void {
    this.updateComponentState({ error, loading: false });
    this.log('error', 'Component error occurred', { error: error.message, stack: error.stack });
  }
  
  private generateUniqueId(): string {
    return `pdx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}