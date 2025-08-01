/**
 * @fileoverview Componente Material Checkbox dinâmico
 * 
 * Checkbox simples com suporte a:
 * ✅ Estados básicos (checked, unchecked, indeterminate)
 * ✅ Validação customizada e regras de negócio
 * ✅ Checkbox com descrição
 * ✅ Integração com formulários reativos
 * ✅ Acessibilidade WCAG 2.1 AA
 */

import { 
  Component, 
  forwardRef,
  computed,
  signal,
  effect
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialCheckboxMetadata, FieldOption } from '@praxis/core';
import { DynamicComponentService } from '../../services/dynamic-component.service';

// =============================================================================
// INTERFACES ESPECÍFICAS DO CHECKBOX
// =============================================================================

interface CheckboxState {
  checked: boolean;
  indeterminate: boolean;
  showDescription: boolean;
}

// =============================================================================
// COMPONENTE MATERIAL CHECKBOX
// =============================================================================

@Component({
  selector: 'pdx-material-checkbox',
  standalone: true,
  templateUrl: './material-checkbox.component.html',
  styleUrls: ['./material-checkbox.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialCheckboxComponent),
      multi: true
    },
    DynamicComponentService
  ],
host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"checkbox"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialCheckboxComponent 
  extends BaseDynamicFieldComponent<MaterialCheckboxMetadata> {

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO CHECKBOX
  // =============================================================================

/** Estado específico do checkbox */
  protected readonly checkboxState = signal<CheckboxState>({
    checked: false,
    indeterminate: false,
    showDescription: true
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
    const metadata = this.metadata();
    return metadata?.labelPosition || 'after';
  });

  /** Deve mostrar descrição */
  readonly shouldShowDescription = computed(() => {
    const metadata = this.metadata();
    const state = this.checkboxState();
    return metadata?.description && state.showDescription;
  });

/** Valor formatado para exibição */
  readonly displayValue = computed(() => {
    return this.checkboxState().checked;
  });

  /** CSS classes específicas do checkbox */
  readonly checkboxSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();
    const state = this.checkboxState();
    
classes.push('pdx-checkbox-single');
    
    if (this.shouldShowDescription()) {
      classes.push('pdx-checkbox-with-description');
    }
    
    if (metadata?.required) {
      classes.push('pdx-checkbox-required');
    }
    
    if (state.indeterminate) {
      classes.push('pdx-checkbox-indeterminate');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeCheckboxState();
    this.setupCheckboxEffects();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

/**
   * Toggle do checkbox
   */
  toggle(): void {
    const currentState = this.checkboxState();
    this.updateCheckboxState({ 
      checked: !currentState.checked,
      indeterminate: false
    });
    this.setValue(!currentState.checked);
  }


  // =============================================================================
  // EVENTOS DO CHECKBOX
  // =============================================================================

  onSingleCheckboxChange(event: any): void {
    const checked = event.checked;
    
    this.updateCheckboxState({ 
      checked,
      indeterminate: false
    });
    
    this.setValue(checked);
    
    this.log('debug', 'Single checkbox changed', { checked });
  }


  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeCheckboxState(): void {
    const metadata = this.metadata();
    if (!metadata) return;

this.initializeSingleMode();
  }

private initializeSingleMode(): void {
    const fieldValue = this.fieldValue();
    const checked = Boolean(fieldValue);
    
    this.updateCheckboxState({
      checked,
      indeterminate: false,
      showDescription: true
    });
  }

  private setupCheckboxEffects(): void {
    // Effect para sincronizar com valor do campo
effect(() => {
      const fieldValue = this.fieldValue();
      const checked = Boolean(fieldValue);
      const currentState = this.checkboxState();
      
      if (currentState.checked !== checked) {
        this.updateCheckboxState({ checked, indeterminate: false });
      }
    });
  }


  private updateCheckboxState(changes: Partial<CheckboxState>): void {
    const current = this.checkboxState();
    this.checkboxState.set({ ...current, ...changes });
  }

}