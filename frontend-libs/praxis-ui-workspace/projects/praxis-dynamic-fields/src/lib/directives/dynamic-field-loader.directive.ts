/**
 * @fileoverview Diretiva para renderização dinâmica de campos de formulário
 * 
 * Renderiza campos de formulário dinamicamente com base em metadados,
 * integrando com ComponentRegistryService para resolver tipos de componentes
 * e associando automaticamente com FormGroup controls.
 * 
 * @example Uso básico
 * ```html
 * <ng-container 
 *   dynamicFieldLoader 
 *   [fields]="fieldMetadata" 
 *   [formGroup]="userForm"
 *   (componentsCreated)="onComponentsReady($event)">
 * </ng-container>
 * ```
 * 
 * @example Uso avançado com template personalizado
 * ```html
 * <div class="dynamic-form-container">
 *   <ng-container 
 *     dynamicFieldLoader 
 *     [fields]="complexFields" 
 *     [formGroup]="complexForm"
 *     (componentsCreated)="handleComponents($event)">
 *   </ng-container>
 * </div>
 * ```
 */

import {
  Directive,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
  ComponentRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FieldMetadata } from '@praxis/core';
import { ComponentRegistryService } from '../services/component-registry/component-registry.service';
import { BaseDynamicFieldComponent } from '../base/base-dynamic-field.component';

/**
 * Diretiva que renderiza campos de formulário dinamicamente baseado em metadados.
 * 
 * Integra-se com ComponentRegistryService para resolver componentes por tipo,
 * associa automaticamente FormControls e emite referências dos componentes criados.
 * 
 * ## 🏗️ Funcionalidades Principais
 * 
 * - ✅ Renderização dinâmica baseada em FieldMetadata[]
 * - ✅ Integração automática com Angular Reactive Forms
 * - ✅ Resolução de componentes via ComponentRegistryService
 * - ✅ Validação robusta de inputs
 * - ✅ Emissão de ComponentRef para controle externo
 * - ✅ Lifecycle management completo
 * - ✅ Detecção automática de mudanças
 * 
 * ## 🎯 Casos de Uso
 * 
 * - Formulários dinâmicos baseados em configuração JSON
 * - Admin panels com campos configuráveis
 * - Workflows com etapas dinâmicas
 * - Formulários gerados por API/backend
 * - A/B testing de interfaces de formulário
 * 
 * @selector [dynamicFieldLoader]
 * @usageNotes
 * - Sempre fornecer tanto fields quanto formGroup
 * - FormGroup deve ter controls correspondentes aos field names
 * - Usar ViewChild para capturar referências se necessário
 * - Componentes são criados de forma lazy (apenas quando necessário)
 */
@Directive({
  selector: '[dynamicFieldLoader]',
  standalone: true
})
export class DynamicFieldLoaderDirective implements OnInit, OnDestroy, OnChanges {

  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly viewContainer = inject(ViewContainerRef);
  private readonly componentRegistry = inject(ComponentRegistryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // =============================================================================
  // INPUTS
  // =============================================================================

  /**
   * Metadados dos campos a serem renderizados.
   * 
   * Array de objetos FieldMetadata que define a estrutura,
   * validação e comportamento de cada campo do formulário.
   * 
   * @example
   * ```typescript
   * const fields: FieldMetadata[] = [
   *   {
   *     name: 'email',
   *     label: 'Email',
   *     controlType: 'input',
   *     required: true,
   *     validators: { email: true }
   *   },
   *   {
   *     name: 'password',
   *     label: 'Senha',
   *     controlType: 'input',
   *     inputType: 'password',
   *     required: true
   *   }
   * ];
   * ```
   */
  @Input({ required: true }) fields: FieldMetadata[] = [];

  /**
   * FormGroup que gerencia os controles dos campos.
   * 
   * Deve conter AbstractControl para cada campo definido no array fields.
   * A diretiva associa automaticamente cada componente ao control correspondente.
   * 
   * @example
   * ```typescript
   * const formGroup = this.fb.group({
   *   email: ['', [Validators.required, Validators.email]],
   *   password: ['', [Validators.required, Validators.minLength(8)]]
   * });
   * ```
   */
  @Input({ required: true }) formGroup: FormGroup | null = null;

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /**
   * Emite um mapa com as referências dos componentes criados.
   * 
   * Indexado pelo nome do campo (FieldMetadata.name).
   * Útil para controle externo, validação customizada ou manipulação direta.
   * 
   * @example
   * ```typescript
   * onComponentsCreated(components: Map<string, ComponentRef<BaseDynamicFieldComponent>>) {
   *   // Acessar componente específico
   *   const emailComponent = components.get('email');
   *   if (emailComponent) {
   *     emailComponent.instance.focus();
   *   }
   * 
   *   // Iterar todos os componentes
   *   components.forEach((componentRef, fieldName) => {
   *     console.log(`Campo ${fieldName} criado:`, componentRef.instance);
   *   });
   * }
   * ```
   */
  @Output() componentsCreated = new EventEmitter<Map<string, ComponentRef<BaseDynamicFieldComponent>>>();

  // =============================================================================
  // PRIVATE STATE
  // =============================================================================

  /** Mapa interno de componentes criados */
  private componentRefs = new Map<string, ComponentRef<BaseDynamicFieldComponent>>();

  /** Flag para evitar múltiplas renderizações simultâneas */
  private isRendering = false;

  /** Cache do último snapshot dos fields para evitar re-renderizações desnecessárias */
  private lastFieldsSnapshot: string | null = null;

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  ngOnInit(): void {
    this.validateInputs();
    this.renderFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-renderizar apenas se fields ou formGroup mudaram
    if (changes['fields'] || changes['formGroup']) {
      // Only re-render if there's an actual change in content, not just reference
      if (this.hasActualFieldChanges(changes)) {
        this.validateInputs();
        this.renderFields();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyComponents();
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /**
   * Re-renderiza todos os campos forçadamente.
   * 
   * Útil quando metadata ou FormGroup foram alterados externamente
   * e a detecção automática de mudanças não foi suficiente.
   * 
   * @example
   * ```typescript
   * @ViewChild(DynamicFieldLoaderDirective) 
   * fieldLoader!: DynamicFieldLoaderDirective;
   * 
   * updateFieldsExternally() {
   *   // Modificar fields ou formGroup externamente
   *   this.fields[0].disabled = true;
   *   
   *   // Forçar re-renderização
   *   this.fieldLoader.refresh();
   * }
   * ```
   */
  refresh(): void {
    this.renderFields();
  }

  /**
   * Obtém referência de componente específico por nome do campo.
   * 
   * @param fieldName - Nome do campo conforme FieldMetadata.name
   * @returns ComponentRef ou undefined se não encontrado
   * 
   * @example
   * ```typescript
   * const emailComponent = this.fieldLoader.getComponent('email');
   * if (emailComponent) {
   *   emailComponent.instance.setLoading(true);
   * }
   * ```
   */
  getComponent(fieldName: string): ComponentRef<BaseDynamicFieldComponent> | undefined {
    return this.componentRefs.get(fieldName);
  }

  /**
   * Obtém todos os componentes criados.
   * 
   * @returns Map com todas as referências de componentes indexadas por nome
   */
  getAllComponents(): Map<string, ComponentRef<BaseDynamicFieldComponent>> {
    return new Map(this.componentRefs);
  }

  // =============================================================================
  // PRIVATE METHODS - CHANGE DETECTION
  // =============================================================================

  /**
   * Verifica se houve mudança real no conteúdo dos fields, não apenas na referência.
   * Previne re-renderizações desnecessárias que podem causar loops infinitos.
   */
  private hasActualFieldChanges(changes: SimpleChanges): boolean {
    if (changes['fields']) {
      const fieldsChange = changes['fields'];
      
      // Se é primeira renderização, sempre renderizar
      if (fieldsChange.isFirstChange()) {
        return true;
      }

      const previousFields = fieldsChange.previousValue as FieldMetadata[] || [];
      const currentFields = fieldsChange.currentValue as FieldMetadata[] || [];

      // Se o número de campos mudou, re-renderizar
      if (previousFields.length !== currentFields.length) {
        return true;
      }

      // Verificar se algum campo mudou de fato
      for (let i = 0; i < currentFields.length; i++) {
        const current = currentFields[i];
        const previous = previousFields[i];

        if (!previous || current.name !== previous.name || current.controlType !== previous.controlType) {
          return true;
        }
      }

      // Se chegou até aqui, não houve mudança real
      console.debug('[DynamicFieldLoader] No actual field changes detected, skipping re-render');
      return false;
    }

    if (changes['formGroup']) {
      const formGroupChange = changes['formGroup'];
      return formGroupChange.isFirstChange() || formGroupChange.previousValue !== formGroupChange.currentValue;
    }

    return true;
  }

  // =============================================================================
  // PRIVATE METHODS - VALIDATION
  // =============================================================================

  /**
   * Valida as entradas da diretiva antes de processá-las.
   * 
   * Verifica se inputs obrigatórios estão presentes e válidos,
   * emite warnings para problemas não-críticos.
   * 
   * @throws Error se validação crítica falhar
   */
  private validateInputs(): void {
    // Validações críticas (throws Error)
    if (!this.fields) {
      throw new Error('[DynamicFieldLoader] Input "fields" is required');
    }

    if (!this.formGroup) {
      throw new Error('[DynamicFieldLoader] Input "formGroup" is required');
    }

    if (!Array.isArray(this.fields)) {
      throw new Error('[DynamicFieldLoader] Input "fields" must be an array');
    }

    // Validações não-críticas (warnings)
    if (this.fields.length === 0) {
      console.warn('[DynamicFieldLoader] Fields array is empty - no components will be rendered');
      return;
    }

    // Validar estrutura básica dos fields
    this.fields.forEach((field, index) => {
      if (!field.name) {
        console.error(`[DynamicFieldLoader] Field at index ${index} is missing required 'name' property:`, field);
        throw new Error(`Field at index ${index} must have a 'name' property`);
      }

      if (!field.controlType) {
        console.error(`[DynamicFieldLoader] Field '${field.name}' is missing required 'controlType' property:`, field);
        throw new Error(`Field '${field.name}' must have a 'controlType' property`);
      }

      // Verificar se FormControl existe
      if (!this.formGroup!.get(field.name)) {
        console.warn(`[DynamicFieldLoader] FormControl for field '${field.name}' not found in FormGroup`);
      }
    });

    // Verificar se há campos duplicados
    const fieldNames = this.fields.map(f => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.error(`[DynamicFieldLoader] Duplicate field names found:`, duplicates);
      throw new Error(`Duplicate field names are not allowed: ${duplicates.join(', ')}`);
    }
  }

  // =============================================================================
  // PRIVATE METHODS - RENDERING
  // =============================================================================

  /** Promise atual de renderização para evitar race conditions */
  private currentRenderingPromise: Promise<void> | null = null;

  /**
   * Carrega os campos dinâmicos no contêiner de visualização.
   * 
   * Processo completo:
   * 1. Validar inputs
   * 2. Limpar componentes existentes
   * 3. Resolver e criar cada componente
   * 4. Associar propriedades e FormControl
   * 5. Emitir mapa de componentes criados
   */
  private async renderFields(): Promise<void> {
    // Se já há um rendering em andamento, aguardar conclusão
    if (this.currentRenderingPromise) {
      console.debug('[DynamicFieldLoader] Waiting for current rendering to complete...');
      return this.currentRenderingPromise;
    }

    this.currentRenderingPromise = this.executeRendering();
    try {
      await this.currentRenderingPromise;
    } finally {
      this.currentRenderingPromise = null;
    }
  }

  /**
   * Executa a renderização dos campos com rollback em caso de erro.
   * 
   * @private
   */
  private async executeRendering(): Promise<void> {
    const fieldsSnapshot = [...this.fields]; // Snapshot para consistência
    const currentFieldsSignature = JSON.stringify(fieldsSnapshot.map(f => ({ name: f.name, controlType: f.controlType })));
    
    // Verificar se já não renderizamos este mesmo conjunto de fields
    if (this.lastFieldsSnapshot === currentFieldsSignature) {
      console.debug('[DynamicFieldLoader] Fields snapshot unchanged, skipping render');
      return;
    }
    
    try {
      // Limpar componentes existentes
      this.destroyComponents();
      this.viewContainer.clear();

      // Criar novos componentes com rollback em caso de erro
      const createdComponents: Array<{field: FieldMetadata, componentRef: ComponentRef<BaseDynamicFieldComponent>}> = [];
      
      for (const field of fieldsSnapshot) {
        try {
          const componentRef = await this.createFieldComponent(field);
          if (componentRef) {
            createdComponents.push({ field, componentRef });
            this.componentRefs.set(field.name, componentRef);
          }
        } catch (error) {
          console.error(`[DynamicFieldLoader] Failed to create component for '${field.name}', rolling back...`, error);
          
          // Rollback: destruir componentes criados até agora
          createdComponents.forEach(({ componentRef }) => {
            try {
              componentRef.destroy();
            } catch (rollbackError) {
              console.error('[DynamicFieldLoader] Error during rollback:', rollbackError);
            }
          });
          this.componentRefs.clear();
          this.viewContainer.clear();
          throw error;
        }
      }

      // Emitir mapa de componentes criados apenas se tudo deu certo
      this.componentsCreated.emit(new Map(this.componentRefs));

      // Armazenar snapshot apenas após sucesso
      this.lastFieldsSnapshot = currentFieldsSignature;

      console.debug(`[DynamicFieldLoader] Successfully rendered ${this.componentRefs.size} components`);

    } catch (error) {
      console.error('[DynamicFieldLoader] Error during field rendering:', error);
      throw error;
    } finally {
      this.cdr.detectChanges();
    }
  }

  /**
   * Cria um componente dinâmico para um campo específico.
   * 
   * @param field - Metadata do campo a ser criado
   * @returns Promise que resolve com ComponentRef quando componente está criado e configurado
   */
  private async createFieldComponent(field: FieldMetadata): Promise<ComponentRef<BaseDynamicFieldComponent> | null> {
    try {
      const componentType = await this.resolveComponentType(field.controlType);
      if (!componentType) {
        console.warn(`[DynamicFieldLoader] No component found for controlType '${field.controlType}', skipping field '${field.name}'`);
        return null;
      }

      const componentRef = this.viewContainer.createComponent(componentType);
      
      this.configureComponent(componentRef as any, field);

      console.debug(`[DynamicFieldLoader] Created component for field '${field.name}' with controlType '${field.controlType}'`);

      return componentRef as any;

    } catch (error) {
      console.error(`[DynamicFieldLoader] Failed to create component for field '${field.name}':`, error);
      throw error;
    }
  }

  /**
   * Retorna o componente dinâmico associado ao tipo de controle.
   * 
   * Utiliza ComponentRegistryService para resolver o tipo de componente
   * baseado no controlType do metadata.
   * 
   * @param controlType - Tipo de controle definido no FieldMetadata
   * @returns Promise com o tipo de componente ou null se não encontrado
   */
  private async resolveComponentType(controlType: string): Promise<any | null> {
    try {
      const componentType = await this.componentRegistry.getComponent(controlType);
      return componentType;
    } catch (error) {
      console.error(`[DynamicFieldLoader] Error resolving component type '${controlType}':`, error);
      return null;
    }
  }

  /**
   * Associa propriedades ao componente dinâmico.
   * 
   * Configura metadata e formControl no componente criado,
   * garantindo que o componente tenha acesso a todos os dados necessários.
   * 
   * @param componentRef - Referência do componente criado
   * @param field - Metadata do campo
   */
  private configureComponent(
    componentRef: ComponentRef<BaseDynamicFieldComponent>, 
    field: FieldMetadata
  ): void {
    const instance = componentRef.instance;

    try {
      // Associar metadata com verificação robusta
      if (instance && 'metadata' in instance) {
        const instanceWithMetadata = instance as any;
        if (typeof instanceWithMetadata.metadata === 'function' && 'set' in instanceWithMetadata.metadata) {
          instanceWithMetadata.metadata.set(field);
        } else {
          console.error(`[DynamicFieldLoader] Component '${field.name}' metadata property is not a WritableSignal`);
        }
      } else {
        console.warn(`[DynamicFieldLoader] Component for field '${field.name}' does not have metadata property`);
      }

      // Associar FormControl com verificação aprimorada
      const formControl = this.formGroup?.get(field.name);
      if (formControl) {
        if (instance && 'formControl' in instance) {
          const instanceWithFormControl = instance as any;
          if (typeof instanceWithFormControl.formControl === 'function' && 'set' in instanceWithFormControl.formControl) {
            instanceWithFormControl.formControl.set(formControl);
          } else {
            console.error(`[DynamicFieldLoader] Component '${field.name}' formControl property is not a WritableSignal`);
          }
        } else {
          console.warn(`[DynamicFieldLoader] Component for field '${field.name}' does not have formControl property`);
        }
      } else {
        console.warn(`[DynamicFieldLoader] No FormControl found for field '${field.name}' in FormGroup`);
      }

      // Configurar lifecycle do componente se disponível
      if (instance && 'onComponentInit' in instance) {
        const instanceWithLifecycle = instance as any;
        if (typeof instanceWithLifecycle.onComponentInit === 'function') {
          instanceWithLifecycle.onComponentInit();
        }
      }

      // Detectar mudanças após configuração
      componentRef.changeDetectorRef.detectChanges();

    } catch (error) {
      console.error(`[DynamicFieldLoader] Error configuring component for field '${field.name}':`, error);
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS - CLEANUP
  // =============================================================================

  /**
   * Destrói todos os componentes criados e limpa referências.
   * 
   * Chamado durante ngOnDestroy e antes de re-renderizar campos.
   * Garante que não há vazamentos de memória.
   */
  private destroyComponents(): void {
    this.componentRefs.forEach((componentRef, fieldName) => {
      try {
        componentRef.destroy();
        console.debug(`[DynamicFieldLoader] Destroyed component for field '${fieldName}'`);
      } catch (error) {
        console.error(`[DynamicFieldLoader] Error destroying component for field '${fieldName}':`, error);
      }
    });

    this.componentRefs.clear();
    this.lastFieldsSnapshot = null; // Reset snapshot quando destruir componentes
  }
}