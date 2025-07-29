/**
 * @fileoverview Componente Material Radio dinâmico
 * 
 * Radio button group com suporte a:
 * ✅ Grupos de radio buttons com valores customizados
 * ✅ Layout horizontal e vertical
 * ✅ Validação de seleção obrigatória
 * ✅ Posicionamento de labels flexível
 * ✅ Integração com formulários reativos
 * ✅ Acessibilidade WCAG 2.1 AA
 */

import { 
  Component, 
  forwardRef,
  computed,
  signal
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialRadioMetadata, FieldOption, ComponentMetadata } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedRadioMetadata extends ComponentMetadata {
  labelPosition?: 'before' | 'after';
  radioGroupName?: string;
  disableRipple?: boolean;
  allowDeselect?: boolean;
  requiredSelection?: boolean;
  required?: boolean;
}

function safeRadioMetadata(metadata: ComponentMetadata | null | undefined): ExtendedRadioMetadata {
  return (metadata || {}) as ExtendedRadioMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO RADIO
// =============================================================================

interface RadioState {
  selectedValue: any;
  focusedIndex: number | null;
  hasBeenTouched: boolean;
}

// =============================================================================
// COMPONENTE MATERIAL RADIO
// =============================================================================

@Component({
  selector: 'pdx-material-radio',
  standalone: true,
  templateUrl: './material-radio.component.html',
  styleUrls: ['./material-radio.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialRadioComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"radio"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.role]': '"radiogroup"',
    '[attr.aria-labelledby]': 'componentId() + "-label"'
  }
})
export class MaterialRadioComponent 
  extends BaseDynamicFieldComponent<MaterialRadioMetadata> {

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO RADIO
  // =============================================================================

  /** Estado específico do radio */
  protected readonly radioState = signal<RadioState>({
    selectedValue: null,
    focusedIndex: -1,
    hasBeenTouched: false
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const metadata = this.metadata();
    return metadata?.color || 'primary';
  });

  /** Posição do label */
  readonly labelPosition = computed(() => {
    const metadata = safeRadioMetadata(this.metadata());
    return metadata?.labelPosition || 'after';
  });

  /** Layout do grupo de radio */
  readonly groupLayout = computed(() => {
    const metadata = this.metadata();
    return metadata?.layout || 'vertical';
  });

  /** Nome do grupo de radio */
  readonly radioGroupName = computed(() => {
    const metadata = safeRadioMetadata(this.metadata());
    return metadata?.radioGroupName || this.componentId() + '-group';
  });

  /** Deve desabilitar ripple */
  readonly shouldDisableRipple = computed(() => {
    const metadata = safeRadioMetadata(this.metadata());
    return metadata?.disableRipple || false;
  });

  /** Permite desseleção */
  readonly allowDeselection = computed(() => {
    const metadata = safeRadioMetadata(this.metadata());
    return metadata?.allowDeselect || false;
  });

  /** Opções disponíveis */
  readonly radioOptions = computed(() => {
    const metadata = this.metadata();
    return metadata?.options || [];
  });

  /** Valor selecionado atual */
  readonly selectedValue = computed(() => {
    return this.radioState().selectedValue;
  });

/** Deve validar seleção obrigatória */
  readonly shouldValidateRequiredSelection = computed(() => {
    const metadata = safeRadioMetadata(this.metadata());
    return metadata?.requiredSelection || metadata?.required;
  });

  /** Possui erro de seleção obrigatória */
  readonly hasRequiredSelectionError = computed(() => {
    const metadata = this.metadata();
    const state = this.radioState();
    const selectedValue = this.selectedValue();
    
    return this.shouldValidateRequiredSelection() && 
           state.hasBeenTouched && 
           (selectedValue === null || selectedValue === undefined);
  });

  /** CSS classes específicas do radio */
  readonly radioSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();
    
    classes.push('pdx-radio-group');
    classes.push(`pdx-radio-layout-${this.groupLayout()}`);
    
    if (metadata?.required || this.shouldValidateRequiredSelection()) {
      classes.push('pdx-radio-required');
    }
    
    if (this.shouldDisableRipple()) {
      classes.push('pdx-radio-no-ripple');
    }
    
    if (this.hasRequiredSelectionError()) {
      classes.push('pdx-radio-invalid');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeRadioState();
    this.setupRequiredSelectionValidation();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Seleciona uma opção específica
   */
selectOption(value: any): void {
    const currentSelected = this.radioState().selectedValue;
    
    // Se permite desseleção e clicou na opção já selecionada
    if (this.allowDeselection() && currentSelected === value) {
      this.updateRadioState({ 
        selectedValue: null,
        hasBeenTouched: true 
      });
      this.setValue(null);
    } else {
      this.updateRadioState({ 
        selectedValue: value,
        hasBeenTouched: true 
      });
      this.setValue(value);
    }
    
    // Validar após seleção
    this.validateRequiredSelection();
    
    this.log('debug', 'Radio option selected', { value });
  }

  /**
   * Verifica se uma opção está selecionada
   */
  isOptionSelected(value: any): boolean {
    return this.radioState().selectedValue === value;
  }

  /**
   * Verifica se uma opção está desabilitada
   */
  isOptionDisabled(option: FieldOption): boolean {
    return option.disabled || this.componentState().disabled || false;
  }

  /**
   * Obtém o texto de exibição para uma opção
   */
  getOptionDisplayText(option: FieldOption): string {
    return option.text || String(option.value);
  }

  // =============================================================================
  // EVENTOS DO RADIO
  // =============================================================================

  onRadioChange(value: any): void {
    this.selectOption(value);
  }

  onRadioFocus(index: number): void {
    this.updateRadioState({ focusedIndex: index });
    this.focus();
  }

onRadioBlur(): void {
    this.updateRadioState({ 
      focusedIndex: -1,
      hasBeenTouched: true 
    });
    this.blur();
    this.validateRequiredSelection();
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

private initializeRadioState(): void {
    const fieldValue = this.fieldValue();
    
    this.updateRadioState({
      selectedValue: fieldValue,
      focusedIndex: -1,
      hasBeenTouched: false
    });
  }

  private setupRequiredSelectionValidation(): void {
    // Removed circular effect - validation now handled directly in event handlers
    // Effect was causing circular dependency: effect -> validation -> formControl.setErrors -> effect
    // Simple event-driven validation is more predictable and avoids infinite loops
  }

  private validateRequiredSelection(): void {
    if (!this.shouldValidateRequiredSelection()) return;
    
    const selectedValue = this.selectedValue();
    const hasError = selectedValue === null || selectedValue === undefined;
    
    if (hasError) {
      const metadata = this.metadata();
      const errorMessage = `Selection is required for ${metadata?.label || 'this field'}`;
      
      // Atualizar FormControl com erro customizado
      this.formControl.setErrors({ 
        requiredSelection: { message: errorMessage } 
      });
      
      this.log('debug', 'Required selection validation failed', { 
        selectedValue,
        label: metadata?.label 
      });
    } else {
      // Remover erro de seleção obrigatória se existir
      const currentErrors = this.formControl.errors;
      if (currentErrors?.['requiredSelection']) {
        const { requiredSelection, ...otherErrors } = currentErrors;
        const hasOtherErrors = Object.keys(otherErrors).length > 0;
        this.formControl.setErrors(hasOtherErrors ? otherErrors : null);
      }
    }
  }

  private updateRadioState(changes: Partial<RadioState>): void {
    const current = this.radioState();
    this.radioState.set({ ...current, ...changes });
  }

  // =============================================================================
  // MÉTODO TRACKBY PARA PERFORMANCE
  // =============================================================================

  trackByValue(index: number, option: FieldOption): any {
    return option.value;
  }
}