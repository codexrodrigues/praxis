/**
 * @fileoverview Componente Material Toggle dinâmico
 * 
 * Toggle switch com suporte a:
 * ✅ Estados true/false com valor customizável
 * ✅ Posicionamento do label (before/after)
 * ✅ Cores do tema Material
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialToggleMetadata, ComponentMetadata } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedToggleMetadata extends ComponentMetadata {
  color?: 'primary' | 'accent' | 'warn';
  labelPosition?: 'before' | 'after';
  hideIcon?: boolean;
  disableRipple?: boolean;
  trueValue?: any;
  falseValue?: any;
}

function safeToggleMetadata(metadata: ComponentMetadata | null | undefined): ExtendedToggleMetadata {
  return (metadata || {}) as ExtendedToggleMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO TOGGLE
// =============================================================================

interface ToggleState {
  checked: boolean;
  value: any;
}

// =============================================================================
// COMPONENTE MATERIAL TOGGLE
// =============================================================================

@Component({
  selector: 'pdx-material-toggle',
  standalone: true,
  templateUrl: './material-toggle.component.html',
  styleUrls: ['./material-toggle.component.scss'],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatIconModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialToggleComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"toggle"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialToggleComponent 
  extends BaseDynamicFieldComponent<MaterialToggleMetadata> {

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO TOGGLE
  // =============================================================================

  /** Estado específico do toggle */
  protected readonly toggleState = signal<ToggleState>({
    checked: false,
    value: false
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.color || 'primary';
  });

  /** Posição do label */
  readonly labelPosition = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.labelPosition || 'after';
  });

  /** Deve desabilitar ripple */
  readonly shouldDisableRipple = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.disableRipple || false;
  });

  /** Deve ocultar ícone */
  readonly shouldHideIcon = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.hideIcon || false;
  });

  /** Valor quando true */
  readonly trueValue = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.trueValue !== undefined ? metadata.trueValue : true;
  });

  /** Valor quando false */
  readonly falseValue = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return metadata.falseValue !== undefined ? metadata.falseValue : false;
  });

  /** Deve mostrar descrição */
  readonly shouldShowDescription = computed(() => {
    const metadata = safeToggleMetadata(this.metadata());
    return Boolean(metadata.description);
  });

  /** CSS classes específicas do toggle */
  readonly toggleSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = safeToggleMetadata(this.metadata());
    const state = this.toggleState();
    
    classes.push('pdx-toggle');
    classes.push(`pdx-toggle-color-${this.materialColor()}`);
    classes.push(`pdx-toggle-label-${this.labelPosition()}`);
    
    if (state.checked) {
      classes.push('pdx-toggle-checked');
    }
    
    if (this.shouldDisableRipple()) {
      classes.push('pdx-toggle-no-ripple');
    }
    
    if (this.shouldHideIcon()) {
      classes.push('pdx-toggle-no-icon');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeToggleState();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Toggle do estado
   */
  toggle(): void {
    const currentState = this.toggleState();
    const newChecked = !currentState.checked;
    const newValue = newChecked ? this.trueValue() : this.falseValue();
    
    this.updateToggleState({ 
      checked: newChecked,
      value: newValue
    });
    
    this.setValue(newValue);
  }

  // =============================================================================
  // EVENTOS DO TOGGLE
  // =============================================================================

  onToggleChange(event: any): void {
    const checked = event.checked;
    const value = checked ? this.trueValue() : this.falseValue();
    
    this.updateToggleState({ checked, value });
    this.setValue(value);
    
    this.log('debug', 'Toggle changed', { checked, value });
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeToggleState(): void {
    const currentValue = this.fieldValue();
    const trueVal = this.trueValue();
    const falseVal = this.falseValue();
    
    // Determinar se está checked baseado no valor atual
    let checked = false;
    if (currentValue === trueVal) {
      checked = true;
    } else if (currentValue === falseVal) {
      checked = false;
    } else {
      // Fallback para valores boolean
      checked = Boolean(currentValue);
    }
    
    this.updateToggleState({
      checked,
      value: checked ? trueVal : falseVal
    });
  }

  private updateToggleState(changes: Partial<ToggleState>): void {
    const current = this.toggleState();
    this.toggleState.set({ ...current, ...changes });
  }
}