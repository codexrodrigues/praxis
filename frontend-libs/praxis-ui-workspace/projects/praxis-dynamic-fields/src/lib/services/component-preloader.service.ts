/**
 * @fileoverview Serviço de pré-carregamento de componentes dinâmicos
 * 
 * Responsável por inicializar e pré-carregar componentes do sistema
 * para melhorar a performance inicial dos formulários dinâmicos.
 * 
 * Focado apenas no TextInputComponent que é o único componente
 * sem herança que funciona corretamente.
 */

import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { ComponentRegistryService } from './component-registry/component-registry.service';
import { FieldControlType as FieldControlTypeEnum } from '@praxis/core';

// =============================================================================
// INTERFACES
// =============================================================================

export interface PreloadStatus {
  isPreloading: boolean;
  progress: number; // 0-100
  currentComponent: string | null;
  totalComponents: number;
  loadedComponents: number;
  failedComponents: number;
  errors: string[];
}

// =============================================================================
// SERVIÇO DE PRELOAD SIMPLIFICADO
// =============================================================================

@Injectable({
  providedIn: 'root'
})
export class ComponentPreloaderService {
  
  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly componentRegistry = inject(ComponentRegistryService);
  private readonly destroyRef = inject(DestroyRef);

  // =============================================================================
  // STATE
  // =============================================================================

  private preloadCompleted = false;
  private readonly preloadedComponents = new Set<string>();

  private readonly statusSubject = new BehaviorSubject<PreloadStatus>({
    isPreloading: false,
    progress: 0,
    currentComponent: null,
    totalComponents: 0,
    loadedComponents: 0,
    failedComponents: 0,
    errors: []
  });

  // =============================================================================
  // COMPONENTES PARA PRELOAD (APENAS TEXT-INPUT)
  // =============================================================================

  private readonly componentsToPreload = [
    FieldControlTypeEnum.INPUT,
    FieldControlTypeEnum.EMAIL_INPUT,
    FieldControlTypeEnum.PASSWORD,
    FieldControlTypeEnum.NUMERIC_TEXT_BOX
  ];

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Observable do status atual do preload
   */
  get status$(): Observable<PreloadStatus> {
    return this.statusSubject.asObservable();
  }

  /**
   * Verifica se o preload foi completado
   */
  isPreloadCompleted(): boolean {
    return this.preloadCompleted;
  }

  /**
   * Verifica se um componente específico foi precarregado
   */
  isComponentPreloaded(type: string): boolean {
    return this.preloadedComponents.has(type);
  }

  /**
   * Inicializa o sistema de componentes dinâmicos
   * Deve ser chamado na inicialização da aplicação
   */
  async initialize(): Promise<void> {
    if (this.preloadCompleted) {
      console.debug('[ComponentPreloader] Preload já foi completado');
      return;
    }

    console.info('[ComponentPreloader] Iniciando pré-carregamento de componentes...');
    
    this.updateStatus({
      isPreloading: true,
      progress: 0,
      totalComponents: this.componentsToPreload.length,
      loadedComponents: 0,
      failedComponents: 0,
      errors: []
    });

    try {
      await this.preloadComponents();
      this.preloadCompleted = true;
      
      const finalStatus = this.statusSubject.value;
      console.info(
        `[ComponentPreloader] ✅ Preload concluído: ${finalStatus.loadedComponents}/${finalStatus.totalComponents} componentes ` +
        `(${finalStatus.failedComponents} falhas)`
      );
    } catch (error) {
      console.error('[ComponentPreloader] ❌ Falha no preload:', error);
      this.updateStatus({
        errors: [...this.statusSubject.value.errors, `Falha geral no preload: ${error}`]
      });
    } finally {
      this.updateStatus({
        isPreloading: false,
        progress: 100,
        currentComponent: null
      });
    }
  }

  /**
   * Força um novo preload (útil para desenvolvimento)
   */
  async forceReload(): Promise<void> {
    console.info('[ComponentPreloader] Forçando novo preload...');
    
    this.preloadCompleted = false;
    this.preloadedComponents.clear();
    
    // Reset do status
    this.statusSubject.next({
      isPreloading: false,
      progress: 0,
      currentComponent: null,
      totalComponents: 0,
      loadedComponents: 0,
      failedComponents: 0,
      errors: []
    });

    await this.initialize();
  }

  /**
   * Preload de um componente específico (on-demand)
   */
  async preloadComponent(type: string): Promise<boolean> {
    if (this.preloadedComponents.has(type)) {
      return true;
    }

    console.debug(`[ComponentPreloader] Carregando componente on-demand: ${type}`);
    
    this.updateStatus({
      currentComponent: type
    });

    try {
      const startTime = performance.now();
      const component = await this.componentRegistry.getComponent(type as any);
      const loadTime = performance.now() - startTime;

      if (component) {
        this.preloadedComponents.add(type);
        console.debug(`[ComponentPreloader] ✅ ${type} carregado em ${loadTime.toFixed(2)}ms`);
        return true;
      } else {
        console.warn(`[ComponentPreloader] ❌ Falha ao carregar ${type}`);
        return false;
      }
    } catch (error) {
      console.error(`[ComponentPreloader] ❌ Erro ao carregar ${type}:`, error);
      return false;
    } finally {
      this.updateStatus({
        currentComponent: null
      });
    }
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  /**
   * Executa o preload de todos os componentes configurados
   */
  private async preloadComponents(): Promise<void> {
    let loadedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const componentType of this.componentsToPreload) {
      this.updateStatus({
        currentComponent: componentType,
        progress: Math.round((loadedCount + failedCount) / this.componentsToPreload.length * 100)
      });

      try {
        const startTime = performance.now();
        const component = await this.componentRegistry.getComponent(componentType);
        const loadTime = performance.now() - startTime;

        if (component) {
          this.preloadedComponents.add(componentType);
          loadedCount++;
          console.debug(`[ComponentPreloader] ✅ ${componentType} carregado em ${loadTime.toFixed(2)}ms`);
        } else {
          failedCount++;
          const errorMsg = `Componente ${componentType} não encontrado no registry`;
          errors.push(errorMsg);
          console.warn(`[ComponentPreloader] ❌ ${errorMsg}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = `Erro ao carregar ${componentType}: ${error}`;
        errors.push(errorMsg);
        console.error(`[ComponentPreloader] ❌ ${errorMsg}`, error);
      }

      // Pequeno delay para não bloquear a thread principal
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.updateStatus({
      loadedComponents: loadedCount,
      failedComponents: failedCount,
      errors
    });
  }

  /**
   * Atualiza o status interno do preload
   */
  private updateStatus(updates: Partial<PreloadStatus>): void {
    const current = this.statusSubject.value;
    this.statusSubject.next({
      ...current,
      ...updates
    });
  }
}

/**
 * Factory function para inicialização da aplicação
 * Usar no app.config.ts com APP_INITIALIZER
 * 
 * Executa de forma não-bloqueante para não atrasar o bootstrap da app,
 * mas garante que o TextInputComponent seja pré-carregado em background
 */
export function initializeComponentSystem() {
  return () => {
    const preloader = inject(ComponentPreloaderService);
    
    // Executar preload em background sem bloquear a aplicação
    setTimeout(() => {
      preloader.initialize().catch(error => {
        console.warn('[ComponentPreloader] Background initialization failed:', error);
      });
    }, 100); // Pequeno delay para permitir que a app inicialize primeiro

    // Retornar undefined para não bloquear o APP_INITIALIZER
    return undefined;
  };
}

/**
 * Factory function para inicialização síncrona (opcional)
 * Use apenas se quiser aguardar o preload antes da app inicializar
 */
export function initializeComponentSystemSync() {
  return async () => {
    const preloader = inject(ComponentPreloaderService);
    try {
      await preloader.initialize();
      console.info('[ComponentPreloader] Preload sincronizado concluído');
    } catch (error) {
      console.warn('[ComponentPreloader] Sync initialization failed:', error);
    }
  };
}