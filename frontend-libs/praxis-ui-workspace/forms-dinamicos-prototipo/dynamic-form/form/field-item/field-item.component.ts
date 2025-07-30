// field-item.component.ts
import {FormGroup} from '@angular/forms';
import {CdkDragPlaceholder, CdkDragPreview} from '@angular/cdk/drag-drop';
import {
  DynamicFieldLoaderDirective
} from '../../../directives/dynamic-field-loader.directive';
import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import { BaseDynamicFieldComponent } from '../../../dynamic-fields/base-dynamic-field.component';
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import { FieldMetadata } from '../../../models/field-metadata.model';
import {DialogService} from '@progress/kendo-angular-dialog';
import {
  FieldMetadataEditorComponent
} from '../../field-configurator/field-metadata-editor/field-metadata-editor.component';

import {animate, state, style, transition, trigger} from '@angular/animations';
import {debounceTime, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {CompositeFilterDescriptor, filterBy} from '@progress/kendo-data-query';
import { FormContextService } from '../../services/form-context.service';
import { BaseDynamicListComponent } from '../../../dynamic-fields/base-dynamic-list.component';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';


@Component({
  selector: 'field-item',
  templateUrl: './field-item.component.html',
  styleUrls: ['./field-item.component.scss'],
  standalone: true,
  imports: [DynamicFieldLoaderDirective, CdkDragPreview, CdkDragPlaceholder, NgClass, NgIf, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('removeAnimation', [
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0) scale(1)'
      })),
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(-20px) scale(0.8)'
      })),
      transition('visible => hidden', [
        animate('0.3s ease-out')
      ]),
      transition('hidden => visible', [
        animate('0.3s ease-in')
      ])
    ])
  ]
})
export class FieldItemComponent implements AfterViewInit {
  @Input({ required: true }) field!: FieldMetadata;
  @Input() editMode: boolean = false;
  @Input() formGroup: FormGroup = new FormGroup({});

  animationState = 'visible';

  // Add output event emitter for field removal
  @Output() removeFieldEvent = new EventEmitter<FieldMetadata>();

  // Referência à diretiva para acessar os componentes criados
  @ViewChild(DynamicFieldLoaderDirective) fieldLoader!: DynamicFieldLoaderDirective;

  // Armazena o componente do campo atual quando for criado
  fieldComponent?: ComponentRef<BaseDynamicFieldComponent>;

  // Armazena a referência do campo
  private valueChangesSubscription: Subscription | null = null;

  // Propriedade para controlar o estado de hover
  isHovered: boolean = false;

  // Flag para controlar a visibilidade baseada em hiddenCondition
  isHiddenByCondition: boolean = false;

  private valueChangeSubscription: Subscription | null = null;
  private lastFormValues: any = {}; // Cache to track relevant changes

constructor(private dialogService: DialogService,
            private dynamicFormGroupService: DynamicFormGroupService,
            private formContextService: FormContextService,
            private changeDetectorRef: ChangeDetectorRef,
            private el: ElementRef<HTMLElement>,
            private renderer: Renderer2) {}


  ngOnInit() {
    // Initial evaluations
    this.evaluateHiddenCondition();
    this.evaluateRequiredCondition();

    // Register component
    if (this.field && this.field.name) {
      this.formContextService.registerFieldComponent(this.field.name, this);
    }

    // Set up optimized form subscription
    this.subscribeToFormChanges();
  }

  ngOnDestroy() {
    this.unsubscribeFromForm();

    // Unregister this component when it's destroyed
    if (this.field && this.field.name) {
      this.formContextService.unregisterFieldComponent(this.field.name);
    }
  }

  ngAfterViewInit(): void {
  }

  // Método para acessar os componentes da diretiva
  getFieldComponentInstance(): void {
    // Se já temos o componente, não precisamos buscá-lo novamente
    if (this.fieldComponent) return;

    if (this.fieldLoader && this.field) {
      this.fieldComponent = this.fieldLoader.getComponentByFieldName(this.field.name);
      if (this.fieldComponent) {
        //console.log(`Componente do campo ${this.field.name} obtido com sucesso:`, this.fieldComponent.instance);
      } else {
        console.log(`Componente ainda não disponível para ${this.field.name}`);
        // Podemos programar uma tentativa posterior
        setTimeout(() => this.getFieldComponentInstance(), 0);
      }
    }
  }

  // Manipulador de evento para quando os componentes são criados
  onComponentsCreated(components: Map<string, ComponentRef<BaseDynamicFieldComponent>>): void {
    if (this.field) {
      this.fieldComponent = components.get(this.field.name);
      if (this.fieldComponent) {
        //console.log(`Componente do campo ${this.field.name} recebido via evento:`, this.fieldComponent.instance);
      }
    }
  }

  toggleVisibility(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.field) return;

    // Toggle the hidden state
    this.field.formHidden = !this.field.formHidden;

    // Get the form control
    const control = this.formGroup.get(this.field.name);
    if (!control) return;

    // Update control state based on visibility
    if (this.field.formHidden) {
      // When hidden: disable the control to exclude it from form validation
      control.disable({emitEvent: false});
      // Optionally, clear the value when hiding
      // control.setValue(null, {emitEvent: false});
    } else {
      // When visible: enable the control to include it in form validation
      // Only enable if the field is not explicitly disabled
      if (!this.field.disabled) {
        control.enable({emitEvent: false});
      }
    }

    /* Exemplo de acesso ao nativeElement: Update field appearance if the component reference is available
    if (this.fieldComponent?.instance) {
      const instance = this.fieldComponent.instance;
      // Apply CSS class for hidden state
      if ((instance as any).elementRef?.nativeElement) {
        const element = (instance as any).elementRef.nativeElement;
        if (this.field.hidden) {
          element.classList.add('field-hidden');
        } else {
          element.classList.remove('field-hidden');
        }
      }
    }
     // Se o componente tiver uma referência ao ElementRef, você pode aplicar classes CSS diretamente
     */

    console.log(`Campo ${this.field.name} agora está ${this.field.formHidden ? 'oculto' : 'visível'}`);
  }

  toggleLock(event: MouseEvent): void {
    event.stopPropagation();
    if (this.field) {
      this.field.disabled = !this.field.disabled;
      console.log(`Campo ${this.field.name} está ${this.field.disabled ? 'bloqueado' : 'desbloqueado'}`);
      // Chamada para atualizar o FormControl APÓS modificar 'field.disabled'
      this.dynamicFormGroupService.updateFieldControl(this.formGroup, this.field);
    }
  }

  toggleRequired(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.field) return;

    // Se não existir o objeto validators, cria um
    if (!this.field.validators) {
      this.field.validators = {};
    }

    // Alterna o valor booleano
    const newValue = !this.field.validators.required;

    // Seta tanto no validators.required quanto em field.required,
    // para manter coerência (se você quiser usar field.required em outro lugar)
    this.field.validators.required = newValue;
    this.field.required = newValue;

    console.log(
      `Campo ${this.field.name} agora está ${newValue ? 'obrigatório' : 'não obrigatório'}`
    );

    //Chamada para atualizar o FormControl APÓS modificar 'field.validators.required'
    this.dynamicFormGroupService.updateFieldControl(this.formGroup, this.field);
  }

  onRemoveField(event: MouseEvent) {
    event.stopPropagation();
    this.animationState = 'hidden';
    setTimeout(() => {
      this.removeField();
    }, 300); // Aguarda a animação completar antes de emitir o evento
  }

  removeField(): void {
    if (this.field) {
      console.log(`Removendo campo ${this.field.name}`);
      // Emit the removeFieldEvent with the current field
      this.removeFieldEvent.emit(this.field);
    }
  }

  openSettings(event: MouseEvent): void {
    event.stopPropagation();
    if (this.field) {
      console.log(`Abrindo configurações para o campo ${this.field.name}`);
      // Aqui você pode implementar a lógica para abrir um modal ou painel de configurações.
      this.openFieldWizardDialog();
    }
  }

  canToggleRequired(field: FieldMetadata | null): boolean {
    if (!field) {
      return false;
    }

    // If conditionalRequired is set, don't allow manual toggling
    if (field.conditionalRequired) {
      return false;
    }

    // Se for um tipo que suporte 'required', retorne true
    const canBeRequired = ['input', 'textarea', 'select', 'multiSelect', 'date', 'dateTime',  'select', 'checkbox', 'radio' // etc...
    ].includes(field.controlType);

    return canBeRequired;
  }

  openFieldWizardDialog(): void {
    const dialogRef = this.dialogService.open({
      title: 'Configurações do Field',
      content: FieldMetadataEditorComponent,
    });

    // Acessa a instância do componente dentro do diálogo
    const componentInstance = dialogRef.content.instance;

    // Passa o field para a propriedade fieldMetadata
    componentInstance.fieldMetadata = this.field;

    dialogRef.result
      .subscribe((dialogResult) => {
        const result = dialogResult as FieldMetadata | null;
        if (result) {
          // Atualiza o field com os novos valores do editor
          Object.assign(this.field, result);

          // Atualiza o form control com as novas configurações
          if (this.formGroup && this.field.name) {
            this.dynamicFormGroupService.updateFieldControl(this.formGroup, this.field);
          }

          // Força a atualização da visualização do componente do campo, nos meus testes isso não foi necessário, estou a deixar comentado, caso
          // precise fazer isso em algum momento.
          if (this.fieldComponent?.instance) {
            this.fieldComponent.instance.metadata = this.field;
            this.fieldComponent.instance.updateFieldDisplay?.();
          }

          console.log('Field atualizado:', result);

          // Recupera a referência ao componente para garantir atualização da UI
          setTimeout(() => this.getFieldComponentInstance(), 0);
        }
      });
  }

  private shouldEvaluateConditions(): boolean {
    if (!this.field) return false;

    // Get all field names used in conditions
    const conditionFields = this.extractFieldNamesFromConditions([
      this.field.hiddenCondition,
      this.field.conditionalRequired
    ]);

    // If any condition field exists and has a changed value, return true
    return conditionFields.length > 0;
  }

  private extractFieldNamesFromConditions(conditions: (CompositeFilterDescriptor | undefined | null)[]): string[] {
    const fieldNames: string[] = [];

    conditions.forEach(condition => {
      if (!condition || !condition.filters) return;

      condition.filters.forEach(filter => {
        if ('field' in filter && typeof filter.field === 'string') {
          fieldNames.push(filter.field);
        } else if ('filters' in filter) {
          this.extractFieldNamesFromConditions([filter as CompositeFilterDescriptor])
            .forEach(name => fieldNames.push(name));
        }
      });
    });

    return [...new Set(fieldNames)]; // Return unique field names
  }

  private evaluateFieldConditions(): void {
    if (!this.field || !this.formGroup) return;

    // Evaluate hidden condition
    this.evaluateHiddenCondition();

    // Evaluate required condition
    this.evaluateRequiredCondition();
  }

  evaluateHiddenCondition() {
    // If no field, formGroup exists, make sure the field is visible
    if (!this.field || !this.formGroup) {
      this.isHiddenByCondition = false;
      this.animationState = 'visible';
      return;
    }

    // When there's no hiddenCondition, the field should be visible
    if (!this.field.hiddenCondition) {
      this.isHiddenByCondition = false;
      this.animationState = 'visible';

      // Make sure the control is enabled (unless explicitly disabled)
      const control = this.formGroup.get(this.field.name);
      // Pressupõe que formGroup seja disabled caso rota seja 'visualizar' e formGroup seja enabled caso rota seja 'editar'
      if (control && this.formGroup.enabled) {
        // Garante o estado correto para o campo dependendo do estado do formulário e do layout
        if (this.field.disabled) {
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
      return;
    }

    const condition = this.field.hiddenCondition;
    const formValues = this.formGroup.value;

    // Normalize empty strings to null for condition evaluation
    const normalizedValues = Object.keys(formValues).reduce((result, key) => {
      result[key] = formValues[key] === "" ? null : formValues[key];
      return result;
    }, {} as Record<string, any>);

    // INVERTED LOGIC: The field should be VISIBLE when the condition is met
    const shouldBeVisible = filterBy([normalizedValues], condition).length > 0;
    const shouldHide = !shouldBeVisible; // Invert for compatibility with existing variable names

    // Update visibility flag
    this.isHiddenByCondition = shouldHide;

    // Update control state and animation
    const control = this.formGroup.get(this.field.name);
    if (control) {
      if (shouldHide) {
        control.disable({ emitEvent: false });
        this.animationState = 'hidden';
      } else {
        // Enable only if not explicitly disabled
        if (!this.field.disabled) {
          control.enable({ emitEvent: false });
        }
        this.animationState = 'visible';
      }
    }

    // Force change detection if needed
    this.changeDetectorRef.detectChanges();
  }

  private evaluateRequiredCondition(): void {
    // If no field, formGroup, or conditionalRequired exists, exit early
    if (!this.field || !this.formGroup || !this.field.conditionalRequired) {
      return;
    }

    const condition = this.field.conditionalRequired;
    const formValues = this.formGroup.value;

    // Normalize empty strings to null for condition evaluation
    const normalizedValues = Object.keys(formValues).reduce((result, key) => {
      result[key] = formValues[key] === "" ? null : formValues[key];
      return result;
    }, {} as Record<string, any>);

    // The field should be required when the condition is met
    const shouldBeRequired = filterBy([normalizedValues], condition).length > 0;

    // Only update if the required state would change
    if (!this.field.validators) {
      this.field.validators = {};
    }

    if (shouldBeRequired !== !!this.field.validators.required) {
      this.field.validators.required = shouldBeRequired;
      this.field.required = shouldBeRequired;

      // Update form validation
      this.dynamicFormGroupService.updateFieldControl(this.formGroup, this.field);
    }
  }

  private evaluateCondition(condition: CompositeFilterDescriptor, data: any): boolean {
    // Create a copy of data with empty strings converted to null for condition evaluation
    const normalizedData = Object.keys(data).reduce((result, key) => {
      result[key] = data[key] === "" ? null : data[key];
      return result;
    }, {} as Record<string, any>);

    const filteredData = filterBy([normalizedData], condition);
    return filteredData.length > 0;
  }

  // Method that can be called by other components through the service
  updateFieldDisplay(): void {
    // Implement any logic needed to update the field display
    this.changeDetectorRef.detectChanges();
  }

  // Add these getters to the FieldItemComponent class
  /**
   * Acessa a propriedade data do componente carregado se for uma instância de BaseDynamicListComponent
   */
  get fieldData(): any[] {
    if (this.fieldComponent?.instance instanceof BaseDynamicListComponent) {
      return (this.fieldComponent.instance as BaseDynamicListComponent).data;
    }
    return [];
  }

  /**
   * Verifica se o componente é uma instância de BaseDynamicListComponent
   */
  get isListComponent(): boolean {
    return this.fieldComponent?.instance instanceof BaseDynamicListComponent;
  }

  /**
   * Acessa o componente de campo carregado com tipagem adequada
   */
  get fieldInstance(): BaseDynamicFieldComponent | null {
    return this.fieldComponent?.instance || null;
  }

  /**
   * Acessa o componente de lista carregado com tipagem adequada
   */
  get listFieldInstance(): BaseDynamicListComponent | null {
    console.log('listFieldInstance getter called', {
      hasComponent: !!this.fieldComponent,
      hasInstance: !!this.fieldComponent?.instance,
      isListComponent: this.isListComponent
    });

    if (this.isListComponent) {
      return this.fieldComponent?.instance as BaseDynamicListComponent;
    }
    return null;
  }

  /**
   * Gets the field width from metadata or returns default "100%"
   */
  get fieldWidth(): string {
    return this.field?.width || '100%';
  }

  // Define common width presets
  private readonly widthPresets = ['25%', '50%', '75%', '100%'];

  /**
   * Cycles through predefined width values for the field
   */
  cycleWidth(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.field) return;

    // Get current width or default to 100%
    const currentWidth = this.field.width || '100%';

    // Find index of current width in presets
    const currentIndex = this.widthPresets.indexOf(currentWidth);

    // Get next width in the cycle
    const nextIndex = (currentIndex + 1) % this.widthPresets.length;
    this.field.width = this.widthPresets[nextIndex];

    // Update the DOM element style directly
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'width', this.field.width);

    // Force change detection
    this.changeDetectorRef.detectChanges();
  }
  /**
   * Gets the next width value that will be used when cycling
   */
  get nextWidth(): string {
    if (!this.field) return '25%'; // Default first width if no field

    // Get current width or default to 100%
    const currentWidth = this.field.width || '100%';

    // Find index of current width in presets
    const currentIndex = this.widthPresets.indexOf(currentWidth);

    // Get next width in the cycle
    const nextIndex = (currentIndex + 1) % this.widthPresets.length;
    return this.widthPresets[nextIndex];
  }

  /**
   * Sets field width to a specific value
   */
  setWidth(width: string): void {
    if (!this.field) return;
    this.field.width = width;

    // Update the DOM element style directly
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'width', this.field.width);

    // Force change detection
    this.changeDetectorRef.detectChanges();
  }

  toggleWidth(event: Event) {
    event.stopPropagation();
    this.setWidth(this.fieldWidth === '100%' ? '50%' : '100%');
  }

  private subscribeToFormChanges(): void {
    if (!this.formGroup || !this.field) return;

    // Clean up any existing subscription
    this.unsubscribeFromForm();

    // Set up subscription with performance optimizations
    this.valueChangesSubscription = this.formGroup.valueChanges.pipe(
      // Wait 200ms after changes before processing
      debounceTime(200),
      // Filter to only evaluate when relevant fields change
      filter(() => {
        if (!this.field) return false;

        // Get all fields this component depends on for conditions
        const dependentFields = this.extractFieldNamesFromConditions([
          this.field.hiddenCondition,
          this.field.conditionalRequired
        ]);

        if (dependentFields.length === 0) return true;

        // Check if any dependent field values changed
        const currentValues = this.formGroup.value;
        let hasChanges = false;

        for (const fieldName of dependentFields) {
          const prevValue = this.lastFormValues[fieldName];
          const currValue = currentValues[fieldName];

          // Compare values with null/empty handling
          if (prevValue !== currValue &&
            !((prevValue === '' && currValue === null) ||
              (prevValue === null && currValue === ''))) {
            hasChanges = true;
          }
        }

        // Update cache and return result
        this.lastFormValues = {...currentValues};
        return hasChanges;
      })
    ).subscribe(() => {
      this.evaluateHiddenCondition();
      this.evaluateRequiredCondition();
    });
  }

  private unsubscribeFromForm(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
      this.valueChangesSubscription = null;
    }
  }

}

//Em resumo, qualquer validação que seja “liga/desliga” é boa candidata a ficar no header (se for muito usada). Já validações que exigem valores ou expressões (número, texto, regex, funções) costumam ir para configurações avançadas — que você já tem mapeadas para o “botão de engrenagem”
