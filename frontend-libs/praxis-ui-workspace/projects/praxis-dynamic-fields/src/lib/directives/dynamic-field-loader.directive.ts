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
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldMetadata } from '@praxis/core';
import { ComponentRegistryService } from '../services/component-registry/component-registry.service';
import { logger } from '../utils/logger';
import { mapPropertyToFieldMetadata } from '../utils/json-schema-mapper';
import { BaseDynamicFieldComponent } from '../base/base-dynamic-field-component.interface';
import { FieldShellComponent } from '../components/field-shell/field-shell.component';

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
  standalone: true,
})
export class DynamicFieldLoaderDirective
  implements OnInit, OnDestroy, OnChanges
{
  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly viewContainer = inject(ViewContainerRef);
  private readonly componentRegistry = inject(ComponentRegistryService);
  private readonly cdr = inject(ChangeDetectorRef);

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

  /**
   * Template opcional para embrulhar cada campo renderizado.
   *
   * O contexto fornece:
   * - `field`: metadata do campo
   * - `index`: posição do campo na lista
   * - `content`: `TemplateRef` com o conteúdo do campo a ser projetado
   *
   * @example
   * ```html
   * <ng-template #fieldItem let-field="field" let-index="index" let-content="content">
   *   <div class="field-wrapper">
   *     <button class="drag-handle">::</button>
   *     <ng-container [ngTemplateOutlet]="content"></ng-container>
   *     <button class="edit">⚙</button>
   *   </div>
   * </ng-template>
   *
   * <ng-container
   *   dynamicFieldLoader
   *   [fields]="fields"
   *   [formGroup]="form"
   *   [itemTemplate]="fieldItem">
   * </ng-container>
   * ```
   */
  @Input() itemTemplate?: TemplateRef<{
    field: FieldMetadata;
    index: number;
    content: TemplateRef<any>;
  }>;

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
  @Output() componentsCreated = new EventEmitter<
    Map<string, ComponentRef<BaseDynamicFieldComponent>>
  >();

  /** Evento emitido após a criação individual de um campo */
  @Output() fieldCreated = new EventEmitter<{
    field: FieldMetadata;
    componentRef: ComponentRef<any>;
    index: number;
  }>();

  /** Evento emitido quando um campo é destruído */
  @Output() fieldDestroyed = new EventEmitter<{ fieldName: string }>();

  // =============================================================================
  // PRIVATE STATE
  // =============================================================================

  /** Mapa interno de componentes criados */
  private componentRefs = new Map<
    string,
    ComponentRef<BaseDynamicFieldComponent>
  >();

  /** Mapa de shells criados */
  private shellRefs = new Map<string, ComponentRef<FieldShellComponent>>();

  /** Ordem atual dos nomes de campo renderizados */
  private currentOrder: string[] = [];
  /** Snapshot compacto para detectar mudanças de tipo */
  private lastFieldsSnapshot: Array<{
    name: string;
    controlType: string;
  }> = [];

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
  getComponent(
    fieldName: string,
  ): ComponentRef<BaseDynamicFieldComponent> | undefined {
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

      const previousFields =
        (fieldsChange.previousValue as FieldMetadata[]) || [];
      const currentFields =
        (fieldsChange.currentValue as FieldMetadata[]) || [];

      const prevNames = previousFields.map((f) => f.name);
      const currNames = currentFields.map((f) => f.name);

      // Mudança de tamanho ou ordem
      if (
        prevNames.length !== currNames.length ||
        prevNames.some((name, i) => name !== currNames[i])
      ) {
        return true;
      }

      // ControlType diferente para mesmo nome
      for (const curr of currentFields) {
        const prev = previousFields.find((f) => f.name === curr.name);
        if (!prev || prev.controlType !== curr.controlType) {
          return true;
        }
      }

      return false;
    }

    if (changes['formGroup']) {
      const formGroupChange = changes['formGroup'];
      return (
        formGroupChange.isFirstChange() ||
        formGroupChange.previousValue !== formGroupChange.currentValue
      );
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
      logger.warn(
        '[DynamicFieldLoader] Fields array is empty - no components will be rendered',
      );
      return;
    }

    // Validar e normalizar estrutura básica dos fields
    this.fields = this.fields.map((field, index) => {
      if (!field.name) {
        logger.error(
          `[DynamicFieldLoader] Field at index ${index} is missing required 'name' property:`,
          field,
        );
        throw new Error(`Field at index ${index} must have a 'name' property`);
      }

      // Se campo não tem controlType, tentar inferir baseado em propriedades do schema
      if (!field.controlType) {
        logger.debug(
          `[DynamicFieldLoader] Field '${field.name}' missing controlType, attempting to infer...`,
        );

        // Tentar mapear usando informações disponíveis no campo
        const inferredField = this.inferControlTypeFromField(field);
        if (inferredField) {
          logger.info(
            `[DynamicFieldLoader] Inferred controlType '${inferredField.controlType}' for field '${field.name}'`,
          );
          return inferredField;
        } else {
          logger.error(
            `[DynamicFieldLoader] Field '${field.name}' is missing required 'controlType' property and couldn't be inferred:`,
            field,
          );
          throw new Error(
            `Field '${field.name}' must have a 'controlType' property`,
          );
        }
      }

      // Verificar se FormControl existe
      if (!this.formGroup!.get(field.name)) {
        logger.warn(
          `[DynamicFieldLoader] FormControl for field '${field.name}' not found in FormGroup`,
        );
      }

      return field;
    });

    // Verificar se há campos duplicados
    const fieldNames = this.fields.map((f) => f.name);
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index,
    );
    if (duplicates.length > 0) {
      logger.error(
        `[DynamicFieldLoader] Duplicate field names found:`,
        duplicates,
      );
      throw new Error(
        `Duplicate field names are not allowed: ${duplicates.join(', ')}`,
      );
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
    const fieldsSnapshot = [...this.fields];
    const nextOrder = fieldsSnapshot.map((f) => f.name);

    // Primeira renderização: criar todos e emitir componentsCreated
    if (this.currentOrder.length === 0) {
      const createdFieldNames: string[] = [];
      try {
        for (const [index, field] of fieldsSnapshot.entries()) {
          const componentRef = await this.createFieldComponent(field, index);
          if (componentRef) {
            createdFieldNames.push(field.name);
          }
        }
        this.componentsCreated.emit(new Map(this.componentRefs));
        this.currentOrder = nextOrder;
        this.lastFieldsSnapshot = fieldsSnapshot.map((f) => ({
          name: f.name,
          controlType: f.controlType,
        }));
      } catch (error) {
        createdFieldNames.forEach((name) => this.destroySingle(name));
        this.viewContainer.clear();
        throw error;
      } finally {
        this.cdr.detectChanges();
      }
      return;
    }

    // Reconciliação incremental
    try {
      // Remoções e mudanças de tipo
      for (const name of [...this.currentOrder]) {
        const newField = fieldsSnapshot.find((f) => f.name === name);
        const prevField = this.lastFieldsSnapshot.find((f) => f.name === name);
        if (
          !newField ||
          !prevField ||
          newField.controlType !== prevField.controlType
        ) {
          this.destroySingle(name);
        }
      }

      // Inserções
      const createdNames: string[] = [];
      for (let i = 0; i < fieldsSnapshot.length; i++) {
        const field = fieldsSnapshot[i];
        if (!this.componentRefs.has(field.name)) {
          try {
            const ref = await this.createFieldComponent(field, i);
            if (ref) {
              createdNames.push(field.name);
            }
          } catch (error) {
            createdNames.forEach((n) => this.destroySingle(n));
            throw error;
          }
        }
      }

      // Movimentos e atualização de índices
      nextOrder.forEach((name, index) => {
        const shellRef = this.shellRefs.get(name);
        if (shellRef) {
          const currentIndex = this.viewContainer.indexOf(shellRef.hostView);
          if (currentIndex !== index && currentIndex !== -1) {
            this.viewContainer.move(shellRef.hostView, index);
          }
          if (shellRef.instance.index !== index) {
            shellRef.instance.index = index;
            shellRef.changeDetectorRef.detectChanges();
          }
        }
      });

      this.currentOrder = nextOrder;
      this.lastFieldsSnapshot = fieldsSnapshot.map((f) => ({
        name: f.name,
        controlType: f.controlType,
      }));
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
  private async createFieldComponent(
    field: FieldMetadata,
    index: number,
  ): Promise<ComponentRef<BaseDynamicFieldComponent> | null> {
    let shellRef: ComponentRef<FieldShellComponent> | null = null;
    try {
      // 1) cria shell
      shellRef = this.viewContainer.createComponent(FieldShellComponent, {
        index,
      });
      shellRef.instance.field = field;
      shellRef.instance.index = index;
      shellRef.instance.itemTemplate = this.itemTemplate;
      shellRef.changeDetectorRef.detectChanges();

      // 2) cria componente do campo dentro do shell
      const componentType = await this.resolveComponentType(field.controlType);
      if (!componentType) {
        logger.warn(
          `[DynamicFieldLoader] No component found for controlType '${field.controlType}', skipping field '${field.name}'`,
        );
        shellRef.destroy();
        // TODO (issue futura): this.fieldError.emit({ field, error: 'not-found' });
        return null;
      }

      const componentRef = shellRef.instance.vc.createComponent(componentType);

      this.configureComponent(componentRef as any, field);

      // 3) bookkeeping
      this.componentRefs.set(field.name, componentRef as any);
      this.shellRefs.set(field.name, shellRef);

      // 4) evento granular
      this.fieldCreated.emit({
        field,
        componentRef: componentRef as any,
        index,
      });

      return componentRef as any;
    } catch (error) {
      logger.error(
        `[DynamicFieldLoader] Failed to create component for field '${field.name}':`,
        error,
      );
      shellRef?.destroy();
      // TODO (issue futura): this.fieldError.emit({ field, error });
      return null;
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
      const componentType =
        await this.componentRegistry.getComponent(controlType);
      return componentType;
    } catch (error) {
      logger.error(
        `[DynamicFieldLoader] Error resolving component type '${controlType}':`,
        error,
      );
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
    field: FieldMetadata,
  ): void {
    const instance = componentRef.instance;

    try {
      // Associar metadata utilizando método público quando disponível
      let metadataAssigned = false;
      if (instance && 'setInputMetadata' in instance) {
        try {
          (instance as any).setInputMetadata(field);
          metadataAssigned = true;
        } catch (error) {
          logger.error(
            `[DynamicFieldLoader] Error calling setInputMetadata for field '${field.name}':`,
            error,
          );
        }
      }

      if (!metadataAssigned && instance && 'metadata' in instance) {
        // Fallback para componentes que expõem o signal diretamente
        const instanceWithMetadata = instance as any;
        if (
          typeof instanceWithMetadata.metadata === 'function' &&
          'set' in instanceWithMetadata.metadata
        ) {
          instanceWithMetadata.metadata.set(field);
          metadataAssigned = true;
        } else {
          logger.error(
            `[DynamicFieldLoader] Component '${field.name}' metadata property is not a WritableSignal`,
          );
        }
      }

      // Atribui label diretamente quando o componente expõe essa propriedade
      if ('label' in instance && field.label !== undefined) {
        try {
          (instance as any).label = field.label;
        } catch (error) {
          logger.error(
            `[DynamicFieldLoader] Error assigning label for field '${field.name}':`,
            error,
          );
        }
      }

      if (!metadataAssigned) {
        logger.warn(
          `[DynamicFieldLoader] Component for field '${field.name}' does not support metadata assignment`,
        );
      }

      // Associar FormControl com verificação aprimorada
      const formControl = this.formGroup?.get(field.name);
      if (formControl) {
        if (instance && 'formControl' in instance) {
          const instanceWithFormControl = instance as any;
          if (
            typeof instanceWithFormControl.formControl === 'function' &&
            'set' in instanceWithFormControl.formControl
          ) {
            instanceWithFormControl.formControl.set(formControl);
          } else {
            logger.error(
              `[DynamicFieldLoader] Component '${field.name}' formControl property is not a WritableSignal`,
            );
          }
        } else {
          logger.warn(
            `[DynamicFieldLoader] Component for field '${field.name}' does not have formControl property`,
          );
        }
      } else {
        logger.warn(
          `[DynamicFieldLoader] No FormControl found for field '${field.name}' in FormGroup`,
        );
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
      logger.error(
        `[DynamicFieldLoader] Error configuring component for field '${field.name}':`,
        error,
      );
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS - FIELD INFERENCE
  // =============================================================================

  /**
   * Tenta inferir controlType de um campo baseado em suas propriedades
   *
   * @param field - Campo com controlType ausente
   * @returns Campo com controlType inferido ou null se não conseguir inferir
   */
  private inferControlTypeFromField(
    field: FieldMetadata,
  ): FieldMetadata | null {
    try {
      // Criar um pseudo-schema property baseado no que temos disponível
      const pseudoProperty: any = {
        type: this.inferJsonTypeFromField(field),
        format: this.inferFormatFromField(field),
      };

      // Tentar mapear usando o utilitário de schema
      const mappedField = mapPropertyToFieldMetadata(
        field.name,
        pseudoProperty,
      );

      if (mappedField && mappedField.controlType) {
        // Mesclar propriedades originais com o controlType inferido
        return {
          ...field,
          controlType: mappedField.controlType,
          label: field.label || mappedField.label,
        };
      }

      return null;
    } catch (error) {
      logger.debug(
        `[DynamicFieldLoader] Error inferring controlType for '${field.name}':`,
        error,
      );
      return null;
    }
  }

  /**
   * Infere tipo JSON baseado nas propriedades do campo
   */
  private inferJsonTypeFromField(field: FieldMetadata): string {
    // Tentar inferir pelo nome do campo
    const fieldName = field.name.toLowerCase();

    if (fieldName.includes('email')) return 'string';
    if (fieldName.includes('phone') || fieldName.includes('telefone'))
      return 'string';
    if (fieldName.includes('date') || fieldName.includes('data'))
      return 'string';
    if (
      fieldName.includes('age') ||
      fieldName.includes('idade') ||
      fieldName.includes('numero')
    )
      return 'integer';
    if (
      fieldName.includes('price') ||
      fieldName.includes('valor') ||
      fieldName.includes('preco')
    )
      return 'number';
    if (
      fieldName.includes('active') ||
      fieldName.includes('ativo') ||
      fieldName.includes('enabled')
    )
      return 'boolean';
    if (fieldName === 'id') return 'integer';

    // Fallback: string
    return 'string';
  }

  /**
   * Infere format baseado nas propriedades do campo
   */
  private inferFormatFromField(field: FieldMetadata): string | undefined {
    const fieldName = field.name.toLowerCase();

    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('phone') || fieldName.includes('telefone'))
      return 'tel';
    if (fieldName.includes('date') || fieldName.includes('data')) return 'date';
    if (fieldName.includes('password') || fieldName.includes('senha'))
      return 'password';

    return undefined;
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
    const names = Array.from(this.componentRefs.keys());
    for (const name of names) this.destroySingle(name);
    this.currentOrder = [];
    this.lastFieldsSnapshot = [];
  }

  private destroySingle(fieldName: string): void {
    const comp = this.componentRefs.get(fieldName);
    const shell = this.shellRefs.get(fieldName);
    try {
      comp?.destroy();
    } catch {}
    try {
      shell?.destroy();
    } catch {}
    this.componentRefs.delete(fieldName);
    this.shellRefs.delete(fieldName);
    this.fieldDestroyed.emit({ fieldName });
  }
}
