/**
 * @fileoverview Componente Material Button dinâmico - Versão Refatorada
 * 
 * Button avançado com suporte a:
 * ✅ Todos os variants Material (basic, raised, stroked, flat, icon, fab, mini-fab)
 * ✅ Ações configuráveis e navegação
 * ✅ Estados de loading com feedback visual
 * ✅ Diálogos de confirmação
 * ✅ Atalhos de teclado
 * ✅ Acessibilidade WCAG 2.1 AA
 */

import { 
  Component, 
  computed,
  signal,
  inject,
  OnDestroy
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { SimpleBaseButtonComponent } from '../../base/simple-base-button.component';
import { MaterialButtonMetadata } from '@praxis/core';
import { ActionResolverService } from '../../services/action-resolver.service';
import { KeyboardShortcutService } from '../../services/keyboard-shortcut.service';

// =============================================================================
// TYPE HELPERS
// =============================================================================

function safeButtonMetadata(metadata: any): MaterialButtonMetadata {
  return (metadata || {}) as MaterialButtonMetadata;
}

// =============================================================================
// COMPONENTE MATERIAL BUTTON
// =============================================================================

@Component({
  selector: 'pdx-material-button',
  standalone: true,
  templateUrl: './material-button.component.html',
  styleUrls: ['./material-button.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"button"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-button-variant]': 'buttonVariant()',
    '[attr.data-component-id]': 'componentId()'
  }
})
export class MaterialButtonComponent 
  extends SimpleBaseButtonComponent 
  implements OnDestroy {

  // =============================================================================
  // DEPENDENCIES ESPECÍFICAS
  // =============================================================================

  private readonly actionResolver = inject(ActionResolverService, { optional: true });
  private readonly keyboardService = inject(KeyboardShortcutService, { optional: true });
  
  private unregisterShortcut?: () => void;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO MATERIAL BUTTON
  // =============================================================================

  /** Estado adicional específico do Material Button */
  protected readonly materialButtonState = signal({
    isPressed: false,
    rippleDisabled: false
  });

  // =============================================================================
  // COMPUTED PROPERTIES ESPECÍFICAS
  // =============================================================================

  /** Variante do botão Material */
  readonly buttonVariant = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.variant || 'basic';
  });

  /** Deve desabilitar ripple */
  readonly shouldDisableRipple = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    const materialState = this.materialButtonState();
    return metadata?.disableRipple || materialState.rippleDisabled;
  });

  /** É botão somente ícone */
  readonly isIconOnlyButton = computed(() => {
    const variant = this.buttonVariant();
    return ['icon', 'fab', 'mini-fab'].includes(variant);
  });

  /** Deve mostrar ícone no texto */
  readonly shouldShowIcon = computed(() => {
    const iconName = this.buttonIcon();
    const loading = this.isLoading();
    
    return iconName && !loading && !this.isIconOnlyButton();
  });

  /** Atalho de teclado */
  readonly keyboardShortcut = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.shortcut;
  });

  /** Tooltip text */
  readonly tooltipText = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    const shortcut = this.keyboardShortcut();
    
    let tooltip = metadata?.description || '';
    
    if (shortcut && this.keyboardService) {
      const formattedShortcut = this.keyboardService.formatShortcut(shortcut);
      tooltip += tooltip ? ` (${formattedShortcut})` : formattedShortcut;
    }
    
    return tooltip;
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupKeyboardShortcuts();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Remover atalho de teclado ao destruir componente
    if (this.unregisterShortcut) {
      this.unregisterShortcut();
    }
  }

  /**
   * Classes CSS específicas do Material Button
   */
  protected override getSpecificCssClasses(): string[] {
    const classes: string[] = ['pdx-material-button'];
    
    classes.push(`pdx-button-variant-${this.buttonVariant()}`);
    
    if (this.isIconOnlyButton()) {
      classes.push('pdx-button-icon-only');
    }
    
    if (this.shouldShowIcon()) {
      classes.push('pdx-button-with-icon');
    }
    
    if (this.materialButtonState().isPressed) {
      classes.push('pdx-button-pressed');
    }
    
    if (this.shouldDisableRipple()) {
      classes.push('pdx-button-no-ripple');
    }
    
    return classes;
  }

  /**
   * Override do handleClick para adicionar comportamento específico do Material Button
   */
  override async handleClick(event: MouseEvent): Promise<void> {
    // Marcar como pressionado para feedback visual
    this.materialButtonState.update(state => ({ ...state, isPressed: true }));
    
    try {
      // Chamar implementação da base
      await super.handleClick(event);
    } finally {
      // Reset visual state
      setTimeout(() => {
        this.materialButtonState.update(state => ({ ...state, isPressed: false }));
      }, 150);
    }
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Define metadata específica do Material Button
   */
  setButtonMetadata(metadata: MaterialButtonMetadata): void {
    this.setMetadata(metadata);
  }

  /**
   * Alterna estado de ripple
   */
  toggleRipple(disabled: boolean): void {
    this.materialButtonState.update(state => ({ ...state, rippleDisabled: disabled }));
  }

  /**
   * Obtém informações do botão
   */
  getButtonInfo(): any {
    return {
      id: this.componentId(),
      variant: this.buttonVariant(),
      text: this.buttonText(),
      icon: this.buttonIcon(),
      isLoading: this.isLoading(),
      isDisabled: this.isDisabled(),
      isIconOnly: this.isIconOnlyButton()
    };
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private setupKeyboardShortcuts(): void {
    const shortcut = this.keyboardShortcut();
    
    if (shortcut && this.keyboardService) {
      this.unregisterShortcut = this.keyboardService.registerShortcut(
        shortcut,
        {
          callback: () => { this.triggerAction(); },
          description: `Execute ${this.metadata()?.label || 'button action'}`,
          componentId: this.componentId(),
          priority: 10
        }
      );
      
      this.log('debug', 'Keyboard shortcut registered', { shortcut });
    }
  }
}