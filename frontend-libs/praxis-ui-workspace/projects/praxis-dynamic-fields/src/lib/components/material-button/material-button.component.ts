/**
 * @fileoverview Componente Material Button dinâmico
 * 
 * Button avançado com suporte a:
 * ✅ Todos os variants Material (basic, raised, stroked, flat, icon, fab, mini-fab)
 * ✅ Ações configuráveis e navegação
 * ✅ Estados de loading com feedback visual
 * ✅ Diálogos de confirmação
 * ✅ Atalhos de teclado
 * ✅ Integração com formulários reativos
 * ✅ Acessibilidade WCAG 2.1 AA
 */

import { 
  Component, 
  forwardRef,
  computed,
  signal,
  inject,
  effect,
  OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialButtonMetadata, ComponentMetadata } from '@praxis/core';
import { DynamicComponentService } from '../../services/dynamic-component.service';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedButtonMetadata extends ComponentMetadata {
  buttonType?: string;
  iconName?: string;
  loadingText?: string;
  loading?: boolean;
  link?: string;
  openInNewTab?: boolean;
  confirmDialog?: any;
  shortcut?: string;
  label?: string;
}

function safeButtonMetadata(metadata: ComponentMetadata | null | undefined): ExtendedButtonMetadata {
  return (metadata || {}) as ExtendedButtonMetadata;
}
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { ActionResolverService, ActionContext } from '../../services/action-resolver.service';
import { KeyboardShortcutService } from '../../services/keyboard-shortcut.service';

// =============================================================================
// INTERFACES ESPECÍFICAS DO BUTTON
// =============================================================================

interface ButtonState {
  isLoading: boolean;
  isPressed: boolean;
  clickCount: number;
  lastClickTime: number;
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialButtonComponent),
      multi: true
    },
    DynamicComponentService
  ],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"button"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-button-variant]': 'buttonVariant()'
  }
})
export class MaterialButtonComponent 
  extends BaseDynamicFieldComponent<MaterialButtonMetadata> 
  implements OnDestroy {

  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly dialog = inject(MatDialog, { optional: true });
  private readonly router = inject(Router, { optional: true });
  private readonly actionResolver = inject(ActionResolverService, { optional: true });
  private readonly keyboardService = inject(KeyboardShortcutService, { optional: true });
  
  private unregisterShortcut?: () => void;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO BUTTON
  // =============================================================================

  /** Estado específico do button */
  protected readonly buttonState = signal<ButtonState>({
    isLoading: false,
    isPressed: false,
    clickCount: 0,
    lastClickTime: 0
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const metadata = this.metadata();
    return metadata?.color || 'primary';
  });

  /** Variante do botão */
  readonly buttonVariant = computed(() => {
    const metadata = this.metadata();
    return metadata?.variant || 'basic';
  });

  /** Tipo do botão HTML */
  readonly buttonType = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.buttonType || 'button';
  });

  /** Nome do ícone */
  readonly iconName = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.iconName;
  });

  /** Deve desabilitar ripple */
  readonly shouldDisableRipple = computed(() => {
    const metadata = this.metadata();
    return metadata?.disableRipple || false;
  });

  /** Texto do botão */
  readonly buttonText = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    const state = this.buttonState();
    
    if (state.isLoading && metadata?.loadingText) {
      return metadata.loadingText;
    }
    
    return metadata?.label || 'Button';
  });

  /** Está em estado de loading */
  readonly isLoading = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    const state = this.buttonState();
    return metadata?.loading || state.isLoading;
  });

  /** Deve mostrar ícone */
  readonly shouldShowIcon = computed(() => {
    const iconName = this.iconName();
    const variant = this.buttonVariant();
    const loading = this.isLoading();
    
    return iconName && !loading && !['icon', 'fab', 'mini-fab'].includes(variant);
  });

  /** Deve mostrar loading spinner */
  readonly shouldShowSpinner = computed(() => {
    return this.isLoading();
  });

  /** É botão apenas com ícone */
  readonly isIconOnlyButton = computed(() => {
    const variant = this.buttonVariant();
    return ['icon', 'fab', 'mini-fab'].includes(variant);
  });

  /** URL de navegação */
  readonly navigationLink = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.link;
  });

  /** Deve abrir em nova aba */
  readonly shouldOpenInNewTab = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.openInNewTab || false;
  });

  /** Configuração do diálogo de confirmação */
  readonly confirmDialogConfig = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.confirmDialog;
  });

  /** Atalho de teclado */
  readonly keyboardShortcut = computed(() => {
    const metadata = safeButtonMetadata(this.metadata());
    return metadata?.shortcut;
  });

  /** CSS classes específicas do button */
  readonly buttonSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();
    const state = this.buttonState();
    
    classes.push('pdx-button');
    classes.push(`pdx-button-variant-${this.buttonVariant()}`);
    
    if (this.isIconOnlyButton()) {
      classes.push('pdx-button-icon-only');
    }
    
    if (this.shouldShowIcon()) {
      classes.push('pdx-button-with-icon');
    }
    
    if (state.isLoading) {
      classes.push('pdx-button-loading');
    }
    
    if (state.isPressed) {
      classes.push('pdx-button-pressed');
    }
    
    if (this.shouldDisableRipple()) {
      classes.push('pdx-button-no-ripple');
    }
    
    return classes.join(' ');
  });

  /** Está desabilitado */
  readonly isDisabled = computed(() => {
    return this.componentState().disabled || this.isLoading();
  });

/** Tooltip text */
  readonly tooltipText = computed(() => {
    const metadata = this.metadata();
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

protected override onComponentInit(): void {
    super.onComponentInit();
    this.setupKeyboardShortcuts();
  }

  override ngOnDestroy(): void {
    // Remover atalho de teclado ao destruir componente
    if (this.unregisterShortcut) {
      this.unregisterShortcut();
    }
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Executa a ação do botão
   */
  async executeAction(): Promise<void> {
    if (this.isDisabled()) return;

    this.updateButtonState({ isPressed: true });
    
    try {
      // Verificar se precisa de confirmação
      const confirmConfig = this.confirmDialogConfig();
      if (confirmConfig?.enabled) {
        const confirmed = await this.showConfirmDialog(confirmConfig);
        if (!confirmed) {
          this.updateButtonState({ isPressed: false });
          return;
        }
      }

      // Executar navegação se configurada
      const link = this.navigationLink();
      if (link) {
        await this.handleNavigation(link);
        this.updateButtonState({ isPressed: false });
        return;
      }

      // Executar ação customizada
      const metadata = this.metadata();
      if (metadata?.action) {
        await this.executeCustomAction(metadata.action);
      }

      // Incrementar contador de cliques
      const state = this.buttonState();
      this.updateButtonState({
        clickCount: state.clickCount + 1,
        lastClickTime: Date.now()
      });

      this.log('debug', 'Button action executed', { 
        action: metadata?.action,
        clickCount: state.clickCount + 1
      });

    } catch (error) {
      this.log('error', 'Button action failed', { error });
    } finally {
      this.updateButtonState({ isPressed: false });
    }
  }

  /**
   * Define estado de loading
   */
  setLoading(loading: boolean): void {
    this.updateButtonState({ isLoading: loading });
  }

  /**
   * Obtém contagem de cliques
   */
  getClickCount(): number {
    return this.buttonState().clickCount;
  }

  /**
   * Reseta contagem de cliques
   */
  resetClickCount(): void {
    this.updateButtonState({ clickCount: 0, lastClickTime: 0 });
  }

  // =============================================================================
  // EVENTOS DO BUTTON
  // =============================================================================

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.executeAction();
  }

  onMouseDown(): void {
    this.updateButtonState({ isPressed: true });
  }

  onMouseUp(): void {
    this.updateButtonState({ isPressed: false });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.executeAction();
    }
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

private async showConfirmDialog(config: NonNullable<MaterialButtonMetadata['confirmDialog']>): Promise<boolean> {
    if (!this.dialog) {
      console.warn('MatDialog not available for confirm dialog');
      // Fallback para confirm() nativo se MatDialog não estiver disponível
      return confirm(`${config.title || 'Confirm'}\n\n${config.message || 'Are you sure?'}`);
    }

    const dialogData: ConfirmDialogData = {
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure you want to proceed?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      type: 'warning', // Pode ser configurado no metadata futuramente
      icon: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      disableClose: true,
      autoFocus: true,
      restoreFocus: true,
      width: '400px',
      maxWidth: '90vw'
    });

    const result = await dialogRef.afterClosed().toPromise();
    return result === true;
  }

  private async handleNavigation(link: string): Promise<void> {
    if (this.shouldOpenInNewTab()) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    if (this.router && link.startsWith('/')) {
      await this.router.navigate([link]);
      return;
    }

    // Navegação externa
    window.location.href = link;
  }

private async executeCustomAction(actionRef: string): Promise<void> {
    if (!this.actionResolver) {
      this.log('warn', 'ActionResolverService not available');
      return;
    }

    const context: ActionContext = {
      fieldName: this.metadata()?.name,
      fieldValue: this.fieldValue(),
      metadata: this.metadata(),
      componentInstance: this
    };

    const result = await this.actionResolver.executeAction(actionRef, context);
    
    if (result.success) {
      this.log('info', 'Custom action executed successfully', { 
        action: actionRef, 
        result: result.data 
      });
    } else {
      this.log('error', 'Custom action failed', { 
        action: actionRef, 
        error: result.error 
      });
      
      // Opcional: mostrar erro para o usuário
      if (this.dialog) {
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Action Failed',
            message: result.error || 'An error occurred while executing the action.',
            confirmText: 'OK',
            cancelText: '',
            type: 'danger',
            icon: 'error'
          } as ConfirmDialogData,
          width: '400px'
        });
      }
    }
  }

private setupKeyboardShortcuts(): void {
    const shortcut = this.keyboardShortcut();
    if (!shortcut || !this.keyboardService) return;

    this.unregisterShortcut = this.keyboardService.registerShortcut(shortcut, {
      callback: () => {
        if (!this.isDisabled()) {
          this.executeAction();
        }
      },
      description: `Execute ${this.metadata()?.label || 'button action'}`,
      componentId: this.componentId(),
      priority: 10 // Prioridade média para botões
    });

    this.log('debug', 'Keyboard shortcut registered', { 
      shortcut,
      formatted: this.keyboardService.formatShortcut(shortcut)
    });
  }

  private updateButtonState(changes: Partial<ButtonState>): void {
    const current = this.buttonState();
    this.buttonState.set({ ...current, ...changes });
  }
}