/**
 * @fileoverview Componente Material Input dinâmico
 * 
 * Implementação completa de um campo de input Material Design com:
 * ✅ Suporte completo a Angular Material 19+
 * ✅ Integração com sistema de metadata unificado
 * ✅ Edição inline de labels
 * ✅ Validação enterprise integrada
 * ✅ Acessibilidade WCAG 2.1 AA
 * ✅ Performance otimizada com signals
 */

import { 
  Component, 
  ElementRef, 
  forwardRef,
  ViewChild,
  AfterViewInit,
  computed,
  signal
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialInputMetadata, ComponentMetadata } from '@praxis/core';
import { getErrorStateMatcherForField } from '../../utils/error-state-matcher';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedInputMetadata extends ComponentMetadata {
  allowNegative?: boolean;
}

function safeInputMetadata(metadata: ComponentMetadata | null | undefined): ExtendedInputMetadata {
  return (metadata || {}) as ExtendedInputMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO INPUT
// =============================================================================

interface InputState {
  showClearButton: boolean;
  showPasswordToggle: boolean;
  passwordVisible: boolean;
  characterCount: number;
  maxLength: number | null;
}

// =============================================================================
// COMPONENTE MATERIAL INPUT
// =============================================================================

@Component({
  selector: 'pdx-material-input',
  standalone: true,
  templateUrl: './material-input.component.html',
  styleUrls: ['./material-input.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialInputComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"input"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialInputComponent 
  extends BaseDynamicFieldComponent<MaterialInputMetadata> 
  implements AfterViewInit {

  // =============================================================================
  // VIEW CHILDREN
  // =============================================================================

  @ViewChild('inputElement', { static: false }) 
  private inputElement?: ElementRef<HTMLInputElement>;

  @ViewChild('labelEditor', { static: false })
  private labelEditor?: ElementRef<HTMLInputElement>;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO INPUT
  // =============================================================================

  /** Estado específico do input */
  protected readonly inputState = signal<InputState>({
    showClearButton: false,
    showPasswordToggle: false,
    passwordVisible: false,
    characterCount: 0,
    maxLength: null
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Tipo efetivo do input (considerando toggle de senha) */
  readonly effectiveInputType = computed(() => {
    const metadata = this.metadata();
    const state = this.inputState();
    
    if (metadata?.inputType === 'password' && state.passwordVisible) {
      return 'text';
    }
    
    return metadata?.inputType || 'text';
  });

  /** Configuração da aparência do Material */
  readonly materialAppearance = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    return materialDesign?.appearance || 'outline';
  });

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    return materialDesign?.color || 'primary';
  });

  /** Comportamento do float label */
  readonly floatLabelBehavior = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    const label = materialDesign?.floatLabel;
    return label ?? 'auto';
  });

  /** Error state matcher personalizado */
  readonly errorStateMatcher = computed(() => {
    const metadata = this.metadata();
    return getErrorStateMatcherForField(metadata);
  });

  /** Computed property for disabled interactive state */
  readonly isDisabledInteractive = computed(() => {
    const metadata = this.metadata();
    const componentState = this.componentState();
    
    return componentState.disabled && metadata?.disabledInteractive === true;
  });

  /** Effective disabled state (considering disabledInteractive) */
  readonly effectiveDisabled = computed(() => {
    const componentState = this.componentState();
    const isDisabledInteractive = this.isDisabledInteractive();
    
    // If disabledInteractive is true, don't actually disable the input
    // but maintain disabled styling through CSS
    return componentState.disabled && !isDisabledInteractive;
  });

  /** Deve mostrar contador de caracteres */
  readonly shouldShowCharacterCount = computed(() => {
    const metadata = this.metadata();
    const state = this.inputState();
    
    return metadata?.showCharacterCount && 
           state.maxLength !== null && 
           state.maxLength > 0;
  });

  /** Deve mostrar botão limpar */
  readonly shouldShowClearButton = computed(() => {
    const metadata = this.metadata();
    const hasValue = Boolean(this.fieldValue());
    const clearConfig = metadata?.clearButton;
    
    if (!clearConfig?.enabled || this.componentState().disabled) {
      return false;
    }
    
    // If showOnlyWhenFilled is true (or undefined), only show when has value
    if (clearConfig.showOnlyWhenFilled !== false) {
      return hasValue;
    }
    
    // If showOnlyWhenFilled is explicitly false, always show when enabled
    return true;
  });

  /** Deve mostrar toggle de senha */
  readonly shouldShowPasswordToggle = computed(() => {
    const metadata = this.metadata();
    return metadata?.inputType === 'password' && 
           Boolean(this.fieldValue());
  });

  /** Label sendo editado */
  readonly editingLabel = computed(() => {
    const editState = this.labelEditingState();
    return editState.isEditing ? editState.currentLabel : '';
  });

  /** Classes CSS específicas do input */
  readonly inputSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();
    
    if (metadata?.inputType) {
      classes.push(`pdx-input-${metadata.inputType}`);
    }
    
    if (this.shouldShowCharacterCount()) {
      classes.push('pdx-has-counter');
    }
    
    if (this.shouldShowClearButton()) {
      classes.push('pdx-has-clear');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeInputState();
  }

  ngAfterViewInit(): void {
    this.setupInputEventListeners();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Foca no input
   */
  override focus(): void {
    super.focus();
    
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  /**
   * Seleciona todo o texto do input
   */
  selectAll(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.select();
    }
  }

  /**
   * Limpa o valor do input
   */
  clearValue(): void {
    this.setValue('', { emitEvent: true });
    this.focus();
  }

  /**
   * Toggle da visibilidade da senha
   */
  togglePasswordVisibility(): void {
    const currentState = this.inputState();
    this.inputState.set({
      ...currentState,
      passwordVisible: !currentState.passwordVisible
    });
    
    this.log('debug', 'Password visibility toggled', { 
      visible: !currentState.passwordVisible 
    });
  }

  // =============================================================================
  // EVENTOS DE INPUT
  // =============================================================================

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Prevent changes if in disabled interactive mode
    if (this.isDisabledInteractive()) {
      event.preventDefault();
      return;
    }
    
    this.setValue(value);
    this.updateCharacterCount(value);
  }

  onInputFocus(event: FocusEvent): void {
    this.focus();
  }

  onInputBlur(event: FocusEvent): void {
    this.blur();
  }

  onKeyDown(event: KeyboardEvent): void {
    const metadata = this.metadata();
    
    // Allow copy operations (Ctrl+C, Ctrl+A) in disabled interactive mode
    if (this.isDisabledInteractive()) {
      const allowedKeys = ['c', 'a', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      const isCtrlKey = event.ctrlKey || event.metaKey;
      const isCopyOperation = isCtrlKey && allowedKeys.includes(event.key.toLowerCase());
      const isNavigationKey = allowedKeys.slice(2).includes(event.key);
      
      if (!isCopyOperation && !isNavigationKey) {
        event.preventDefault();
        return;
      }
    }
    
    // Enter para finalizar edição de label
    if (event.key === 'Enter' && this.labelEditingState().isEditing) {
      event.preventDefault();
      this.finishLabelEditing();
      return;
    }
    
    // Escape para cancelar edição de label
    if (event.key === 'Escape' && this.labelEditingState().isEditing) {
      event.preventDefault();
      this.cancelLabelEditing();
      return;
    }
    
    // Validações específicas de tipo
    if (metadata?.inputType === 'number') {
      this.handleNumericInput(event);
    }
  }

  // =============================================================================
  // EVENTOS DE LABEL
  // =============================================================================

  onLabelDoubleClick(): void {
    if (!this.componentState().disabled) {
      this.startLabelEditing();
      
      // Focar no editor após um tick
      setTimeout(() => {
        if (this.labelEditor) {
          this.labelEditor.nativeElement.focus();
          this.labelEditor.nativeElement.select();
        }
      });
    }
  }

  onLabelEditorBlur(): void {
    this.finishLabelEditing();
  }

  onLabelEditorKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishLabelEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelLabelEditing();
    }
  }

  updateLabelText(event: Event): void {
    const target = event.target as HTMLInputElement;
    const editState = this.labelEditingState();
    
    this.labelEditingState.set({
      ...editState,
      currentLabel: target.value
    });
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeInputState(): void {
    const metadata = this.metadata();
    if (!metadata) return;

    this.inputState.set({
      showClearButton: metadata.clearButton?.enabled || false,
      showPasswordToggle: metadata.inputType === 'password',
      passwordVisible: false,
      characterCount: 0,
      maxLength: metadata.maxLength || null
    });

    this.updateCharacterCount(this.fieldValue() || '');
  }

  private setupInputEventListeners(): void {
    if (!this.inputElement) return;

    const input = this.inputElement.nativeElement;
    
    // Listener para paste events
    input.addEventListener('paste', (event) => {
      setTimeout(() => {
        this.updateCharacterCount(input.value);
      });
    });

    // Listener para cut events
    input.addEventListener('cut', (event) => {
      setTimeout(() => {
        this.updateCharacterCount(input.value);
      });
    });
  }

  private updateCharacterCount(value: string): void {
    const count = value ? value.length : 0;
    const currentState = this.inputState();
    
    this.inputState.set({
      ...currentState,
      characterCount: count
    });
  }

  private handleNumericInput(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    const metadata = this.metadata();
    
    // Permitir teclas de controle
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }

    // Permitir números
    if (/^[0-9]$/.test(event.key)) {
      return;
    }

    // Permitir ponto decimal (apenas um)
    if (event.key === '.' && metadata?.step !== undefined) {
      const currentValue = (event.target as HTMLInputElement).value;
      if (!currentValue.includes('.')) {
        return;
      }
    }

    // Permitir sinal negativo no início (se permitido)
    const safeMetadata = safeInputMetadata(metadata);
    if (event.key === '-' && safeMetadata?.allowNegative) {
      const currentValue = (event.target as HTMLInputElement).value;
      const selectionStart = (event.target as HTMLInputElement).selectionStart;
      if (selectionStart === 0 && !currentValue.includes('-')) {
        return;
      }
    }

    // Bloquear todas as outras teclas
    event.preventDefault();
  }
}