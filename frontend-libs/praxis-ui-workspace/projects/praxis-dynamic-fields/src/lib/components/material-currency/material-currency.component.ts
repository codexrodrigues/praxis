/**
 * @fileoverview Componente Material Currency dinâmico especializado
 * 
 * Input de moeda com suporte a:
 * ✅ Formatação automática de moeda (BRL, USD, EUR, etc.)
 * ✅ Máscara de entrada com separadores
 * ✅ Validação de valores negativos configurável
 * ✅ Conversão automática string ↔ number
 * ✅ Símbolos de moeda customizáveis
 * ✅ Localização (pt-BR, en-US, etc.)
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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialCurrencyMetadata, ComponentMetadata } from '@praxis/core';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedCurrencyMetadata extends ComponentMetadata {
  currency?: string;
  locale?: string;
  allowNegative?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name';
  showCurrencySymbol?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

function safeCurrencyMetadata(metadata: ComponentMetadata | null | undefined): ExtendedCurrencyMetadata {
  return (metadata || {}) as ExtendedCurrencyMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO CURRENCY
// =============================================================================

interface CurrencyState {
  rawValue: number;
  formattedValue: string;
  isEditing: boolean;
  lastValidValue: number;
}

// =============================================================================
// COMPONENTE MATERIAL CURRENCY
// =============================================================================

@Component({
  selector: 'pdx-material-currency',
  standalone: true,
  templateUrl: './material-currency.component.html',
  styleUrls: ['./material-currency.component.scss'],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialCurrencyComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"currency"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialCurrencyComponent 
  extends BaseDynamicFieldComponent<MaterialCurrencyMetadata> {

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO CURRENCY
  // =============================================================================

  /** Estado específico do currency */
  protected readonly currencyState = signal<CurrencyState>({
    rawValue: 0,
    formattedValue: '',
    isEditing: false,
    lastValidValue: 0
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Código da moeda */
  readonly currencyCode = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.currency || 'BRL';
  });

  /** Locale para formatação */
  readonly locale = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.locale || 'pt-BR';
  });

  /** Permite valores negativos */
  readonly allowNegative = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.allowNegative ?? true;
  });

  /** Dígitos decimais mínimos */
  readonly minFractionDigits = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.minimumFractionDigits ?? 2;
  });

  /** Dígitos decimais máximos */
  readonly maxFractionDigits = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.maximumFractionDigits ?? 2;
  });

  /** Estilo de exibição da moeda */
  readonly currencyDisplay = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    if (metadata.currencyDisplay === 'narrow') {
      return 'narrowSymbol';
    }
    return (metadata.currencyDisplay ?? 'symbol') as 'code' | 'symbol' | 'narrowSymbol' | 'name';
  });

  /** Deve mostrar símbolo da moeda */
  readonly shouldShowCurrencySymbol = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.showCurrencySymbol ?? true;
  });

  /** Valor mínimo */
  readonly minValue = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.min ?? (this.allowNegative() ? -Infinity : 0);
  });

  /** Valor máximo */
  readonly maxValue = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    return metadata.max ?? Infinity;
  });

  /** Formatter de moeda */
  readonly currencyFormatter = computed(() => {
    try {
      return new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currencyCode(),
        currencyDisplay: this.currencyDisplay(),
        minimumFractionDigits: this.minFractionDigits(),
        maximumFractionDigits: this.maxFractionDigits()
      });
    } catch (error) {
      this.log('warn', 'Invalid currency configuration, using fallback', { error });
      // Fallback para BRL
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  });

  /** Símbolo da moeda */
  readonly currencySymbol = computed(() => {
    const formatter = this.currencyFormatter();
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart?.value || this.currencyCode();
  });

  /** Placeholder com símbolo */
  readonly effectivePlaceholder = computed(() => {
    const metadata = safeCurrencyMetadata(this.metadata());
    if (metadata.placeholder) {
      return metadata.placeholder;
    }
    
    const symbol = this.currencySymbol();
    return `${symbol} 0,00`;
  });

  /** Valor para display no input */
  readonly displayValue = computed(() => {
    const state = this.currencyState();
    
    if (state.isEditing) {
      return state.formattedValue;
    }
    
    return this.formatCurrency(state.rawValue);
  });

  /** CSS classes específicas do currency */
  readonly currencySpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = safeCurrencyMetadata(this.metadata());
    const state = this.currencyState();
    
    classes.push('pdx-currency');
    classes.push(`pdx-currency-${this.currencyCode().toLowerCase()}`);
    
    if (state.rawValue < 0) {
      classes.push('pdx-currency-negative');
    } else if (state.rawValue > 0) {
      classes.push('pdx-currency-positive');
    } else {
      classes.push('pdx-currency-zero');
    }
    
    if (state.isEditing) {
      classes.push('pdx-currency-editing');
    }
    
    if (this.shouldShowCurrencySymbol()) {
      classes.push('pdx-currency-with-symbol');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeCurrencyState();
    this.setupCurrencyEffects();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Formata valor como moeda
   */
  formatCurrency(value: number): string {
    if (isNaN(value)) return this.effectivePlaceholder();
    
    try {
      return this.currencyFormatter().format(value);
    } catch (error) {
      this.log('error', 'Currency formatting failed', { value, error });
      return `${this.currencySymbol()} ${value.toFixed(2)}`;
    }
  }

  /**
   * Parse string para número
   */
  parseCurrency(text: string): number {
    if (!text || text.trim() === '') return 0;
    
    // Remove todos os caracteres não numéricos exceto dígitos, vírgula, ponto e sinal negativo
    let cleanText = text.replace(/[^\\d\\.,\\-]/g, '');
    
    // Trata vírgula como separador decimal para pt-BR
    if (this.locale().startsWith('pt')) {
      // Se tem vírgula e ponto, vírgula é decimal
      if (cleanText.includes(',') && cleanText.includes('.')) {
        // Remove pontos (milhares) e usa vírgula como decimal
        cleanText = cleanText.replace(/\\./g, '').replace(',', '.');
      } else if (cleanText.includes(',')) {
        // Apenas vírgula, usa como decimal
        cleanText = cleanText.replace(',', '.');
      }
    }
    
    const parsed = parseFloat(cleanText);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Valida valor dentro dos limites
   */
  validateValue(value: number): number {
    if (!this.allowNegative() && value < 0) {
      return Math.abs(value);
    }
    
    const min = this.minValue();
    const max = this.maxValue();
    
    if (value < min) return min;
    if (value > max) return max;
    
    return value;
  }

  // =============================================================================
  // EVENTOS DO INPUT
  // =============================================================================

  onInputFocus(): void {
    const state = this.currencyState();
    this.updateCurrencyState({ 
      isEditing: true,
      formattedValue: state.rawValue.toString()
    });
  }

  onInputBlur(): void {
    const state = this.currencyState();
    const parsedValue = this.parseCurrency(state.formattedValue);
    const validatedValue = this.validateValue(parsedValue);
    
    this.updateCurrencyState({
      isEditing: false,
      rawValue: validatedValue,
      formattedValue: '',
      lastValidValue: validatedValue
    });
    
    this.setValue(validatedValue);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    
    this.updateCurrencyState({
      formattedValue: inputValue
    });

    // Parse e validação em tempo real apenas para feedback visual
    const parsedValue = this.parseCurrency(inputValue);
    const validatedValue = this.validateValue(parsedValue);
    
    // Atualizar apenas se válido
    if (!isNaN(validatedValue)) {
      this.updateCurrencyState({ rawValue: validatedValue });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const state = this.currencyState();
    
    // Permitir teclas de controle
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Permitir dígitos
    if (/^\\d$/.test(event.key)) {
      return;
    }
    
    // Permitir separadores decimais conforme locale
    if (this.locale().startsWith('pt') && event.key === ',') {
      return;
    }
    if (!this.locale().startsWith('pt') && event.key === '.') {
      return;
    }
    
    // Permitir sinal negativo se habilitado
    if (this.allowNegative() && event.key === '-' && state.formattedValue.indexOf('-') === -1) {
      return;
    }
    
    // Bloquear outras teclas
    event.preventDefault();
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeCurrencyState(): void {
    const currentValue = this.fieldValue();
    const rawValue = typeof currentValue === 'number' ? currentValue : 0;
    const validatedValue = this.validateValue(rawValue);
    
    this.updateCurrencyState({
      rawValue: validatedValue,
      formattedValue: '',
      isEditing: false,
      lastValidValue: validatedValue
    });
    
    // Sincronizar com o campo se necessário
    if (currentValue !== validatedValue) {
      this.setValue(validatedValue);
    }
  }

  private setupCurrencyEffects(): void {
    // Effect para sincronizar mudanças externas do fieldValue
    effect(() => {
      const fieldValue = this.fieldValue();
      const state = this.currencyState();
      
      if (typeof fieldValue === 'number' && fieldValue !== state.rawValue && !state.isEditing) {
        const validatedValue = this.validateValue(fieldValue);
        this.updateCurrencyState({
          rawValue: validatedValue,
          lastValidValue: validatedValue
        });
      }
    });
  }

  private updateCurrencyState(changes: Partial<CurrencyState>): void {
    const current = this.currencyState();
    this.currencyState.set({ ...current, ...changes });
  }
}