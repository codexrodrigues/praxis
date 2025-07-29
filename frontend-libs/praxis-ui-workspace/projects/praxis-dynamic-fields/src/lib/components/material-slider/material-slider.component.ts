/**
 * @fileoverview Componente Material Slider dinâmico
 * 
 * Slider com suporte a:
 * ✅ Valores min/max customizáveis
 * ✅ Step configurável
 * ✅ Range slider (duplo)
 * ✅ Orientação vertical/horizontal
 * ✅ Thumbs customizados
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
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialSliderMetadata, ComponentMetadata } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedSliderMetadata extends ComponentMetadata {
  min?: number;
  max?: number;
  step?: number;
  discrete?: boolean;
  showTickMarks?: boolean;
  thumbLabel?: boolean;
  vertical?: boolean;
  range?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  displayWith?: (value: number) => string;
}

function safeSliderMetadata(metadata: ComponentMetadata | null | undefined): ExtendedSliderMetadata {
  return (metadata || {}) as ExtendedSliderMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO SLIDER
// =============================================================================

interface SliderState {
  value: number | [number, number];
  min: number;
  max: number;
  step: number;
  isDragging: boolean;
}

// =============================================================================
// COMPONENTE MATERIAL SLIDER
// =============================================================================

@Component({
  selector: 'pdx-material-slider',
  standalone: true,
  templateUrl: './material-slider.component.html',
  styleUrls: ['./material-slider.component.scss'],
  imports: [
    CommonModule,
    MatSliderModule,
    MatFormFieldModule,
    MatIconModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialSliderComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"slider"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialSliderComponent 
  extends BaseDynamicFieldComponent<MaterialSliderMetadata> {

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO SLIDER
  // =============================================================================

  /** Estado específico do slider */
  protected readonly sliderState = signal<SliderState>({
    value: 0,
    min: 0,
    max: 100,
    step: 1,
    isDragging: false
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.color || 'primary';
  });

  /** Valor mínimo */
  readonly minValue = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.min ?? 0;
  });

  /** Valor máximo */
  readonly maxValue = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.max ?? 100;
  });

  /** Passo do slider */
  readonly stepValue = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.step ?? 1;
  });

  /** É slider discreto (com steps visíveis) */
  readonly isDiscrete = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.discrete ?? false;
  });

  /** Deve mostrar tick marks */
  readonly shouldShowTickMarks = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.showTickMarks ?? false;
  });

  /** Deve mostrar thumb label */
  readonly shouldShowThumbLabel = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.thumbLabel ?? true;
  });

  /** É vertical */
  readonly isVertical = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.vertical ?? false;
  });

  /** É range slider (duplo) */
  readonly isRange = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    return metadata.range ?? false;
  });

  /** Valor atual formatado */
  readonly formattedValue = computed(() => {
    const metadata = safeSliderMetadata(this.metadata());
    const state = this.sliderState();
    
    if (metadata.displayWith && typeof metadata.displayWith === 'function') {
      if (Array.isArray(state.value)) {
        return `${metadata.displayWith(state.value[0])} - ${metadata.displayWith(state.value[1])}`;
      }
      return metadata.displayWith(state.value as number);
    }
    
    if (Array.isArray(state.value)) {
      return `${state.value[0]} - ${state.value[1]}`;
    }
    
    return state.value.toString();
  });

  /** CSS classes específicas do slider */
  readonly sliderSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = safeSliderMetadata(this.metadata());
    const state = this.sliderState();
    
    classes.push('pdx-slider');
    classes.push(`pdx-slider-color-${this.materialColor()}`);
    
    if (this.isVertical()) {
      classes.push('pdx-slider-vertical');
    } else {
      classes.push('pdx-slider-horizontal');
    }
    
    if (this.isRange()) {
      classes.push('pdx-slider-range');
    } else {
      classes.push('pdx-slider-single');
    }
    
    if (this.isDiscrete()) {
      classes.push('pdx-slider-discrete');
    }
    
    if (this.shouldShowTickMarks()) {
      classes.push('pdx-slider-with-ticks');
    }
    
    if (state.isDragging) {
      classes.push('pdx-slider-dragging');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeSliderState();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Define valor do slider
   */
  setSliderValue(value: number | [number, number]): void {
    this.updateSliderState({ value });
    this.setValue(value);
  }

  /**
   * Incrementa valor
   */
  increment(): void {
    const state = this.sliderState();
    const step = this.stepValue();
    
    if (Array.isArray(state.value)) {
      const newValue: [number, number] = [
        Math.min(state.value[0] + step, this.maxValue()),
        Math.min(state.value[1] + step, this.maxValue())
      ];
      this.setSliderValue(newValue);
    } else {
      const newValue = Math.min(state.value + step, this.maxValue());
      this.setSliderValue(newValue);
    }
  }

  /**
   * Decrementa valor
   */
  decrement(): void {
    const state = this.sliderState();
    const step = this.stepValue();
    
    if (Array.isArray(state.value)) {
      const newValue: [number, number] = [
        Math.max(state.value[0] - step, this.minValue()),
        Math.max(state.value[1] - step, this.minValue())
      ];
      this.setSliderValue(newValue);
    } else {
      const newValue = Math.max(state.value - step, this.minValue());
      this.setSliderValue(newValue);
    }
  }

  // =============================================================================
  // EVENTOS DO SLIDER
  // =============================================================================

  onSliderInput(event: any): void {
    const value = event.value;
    this.updateSliderState({ value });
    this.setValue(value);
    
    this.log('debug', 'Slider input changed', { value });
  }

  onSliderChange(event: any): void {
    const value = event.value;
    this.updateSliderState({ value, isDragging: false });
    this.setValue(value);
    
    this.log('debug', 'Slider value committed', { value });
  }

  onSliderStart(): void {
    this.updateSliderState({ isDragging: true });
    this.log('debug', 'Slider drag started');
  }

  onSliderEnd(): void {
    this.updateSliderState({ isDragging: false });
    this.log('debug', 'Slider drag ended');
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeSliderState(): void {
    const metadata = safeSliderMetadata(this.metadata());
    const currentValue = this.fieldValue();
    
    let initialValue: number | [number, number];
    
    if (this.isRange()) {
      if (Array.isArray(currentValue) && currentValue.length === 2) {
        initialValue = [currentValue[0], currentValue[1]];
      } else {
        // Default range
        const min = this.minValue();
        const max = this.maxValue();
        const quarter = (max - min) / 4;
        initialValue = [min + quarter, max - quarter];
      }
    } else {
      initialValue = typeof currentValue === 'number' ? currentValue : this.minValue();
    }
    
    this.updateSliderState({
      value: initialValue,
      min: this.minValue(),
      max: this.maxValue(),
      step: this.stepValue(),
      isDragging: false
    });
    
    // Sincronizar com o campo se necessário
    if (this.fieldValue() !== initialValue) {
      this.setValue(initialValue);
    }
  }

  private updateSliderState(changes: Partial<SliderState>): void {
    const current = this.sliderState();
    this.sliderState.set({ ...current, ...changes });
  }
}