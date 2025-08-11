/**
 * @fileoverview Componente Material Textarea dinâmico
 *
 * Textarea avançado com suporte a:
 * ✅ Auto-resize inteligente
 * ✅ Formatação e validação de texto
 * ✅ Contador de caracteres e palavras
 * ✅ Spellcheck configurável
 * ✅ Validação integrada
 */

import {
  Component,
  ElementRef,
  forwardRef,
  ViewChild,
  AfterViewInit,
  computed,
  signal,
  effect,
  inject,
  Injector,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';
import { MaterialTextareaMetadata } from '@praxis/core';

// =============================================================================
// INTERFACES ESPECÍFICAS DO TEXTAREA
// =============================================================================

interface TextareaState {
  autoResize: boolean;
  characterCount: number;
  wordCount: number;
  lineCount: number;
}

// =============================================================================
// COMPONENTE MATERIAL TEXTAREA
// =============================================================================

@Component({
  selector: 'pdx-material-textarea',
  standalone: true,
  templateUrl: './material-textarea.component.html',
  styleUrls: ['./material-textarea.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TextFieldModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialTextareaComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"textarea"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialTextareaComponent
  extends SimpleBaseInputComponent
  implements AfterViewInit
{
  // =============================================================================
  // INJECTED DEPENDENCIES
  // =============================================================================

  private readonly injector = inject(Injector);

  // =============================================================================
  // VIEW CHILDREN
  // =============================================================================

  @ViewChild('textareaElement', { static: false })
  private textareaElement?: ElementRef<HTMLTextAreaElement>;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO TEXTAREA
  // =============================================================================

  /** Estado específico do textarea */
  protected readonly textareaState = signal<TextareaState>({
    autoResize: true,
    characterCount: 0,
    wordCount: 0,
    lineCount: 1,
  });

  // =============================================================================
  // COMPUTED PROPERTIES (material properties herdadas da base)
  // =============================================================================

  /** Comportamento do float label */
  readonly floatLabelBehavior = computed(() => {
    const materialDesign = this.metadata()?.materialDesign;
    const label = materialDesign?.floatLabel;
    return label ?? 'auto';
  });

  /** Deve mostrar contador de caracteres */
  readonly shouldShowCharacterCount = computed(() => {
    const metadata = this.metadata();
    return metadata?.showCharacterCount && metadata?.maxLength;
  });

  /** Deve permitir auto-resize */
  readonly shouldAutoResize = computed(() => {
    const metadata = this.metadata();
    return metadata?.autoSize !== false;
  });

  /** CSS classes específicas do textarea */
  readonly textareaSpecificClasses = computed(() => {
    const classes: string[] = [];
    const metadata = this.metadata();

    if (this.shouldAutoResize()) {
      classes.push('pdx-textarea-auto-resize');
    }

    if (metadata?.spellcheck) {
      classes.push('pdx-textarea-spellcheck');
    }

    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  override ngOnInit(): void {
    super.ngOnInit();
    this.initializeTextareaState();
    this.setupTextAnalysisEffects();
  }

  override ngAfterViewInit(): void {
    this.setupTextareaEventListeners();
  }

  /**
   * Adiciona classes CSS específicas do textarea
   */
  protected override getSpecificCssClasses(): string[] {
    return ['pdx-material-textarea'];
  }

  /**
   * Define metadata e aplica configurações
   */
  setInputMetadata(metadata: MaterialTextareaMetadata): void {
    this.setMetadata(metadata);
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Foca no textarea
   */
  override focus(): void {
    super.focus();

    if (this.textareaElement) {
      this.textareaElement.nativeElement.focus();
    }
  }

  /**
   * Seleciona todo o texto do textarea
   */
  selectAll(): void {
    if (this.textareaElement) {
      this.textareaElement.nativeElement.select();
    }
  }

  /**
   * Limpa o valor do textarea
   */
  clearValue(): void {
    this.setValue('', { emitEvent: true });
    this.focus();
  }

  /**
   * Insere texto na posição do cursor
   */
  insertTextAtCursor(text: string): void {
    if (!this.textareaElement) return;

    const textarea = this.textareaElement.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = this.getValue() || '';

    const newValue =
      currentValue.substring(0, start) + text + currentValue.substring(end);

    this.setValue(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    });
  }

  // =============================================================================
  // EVENTOS DO TEXTAREA
  // =============================================================================

  onTextareaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;

    // Usa handleInput da base class
    this.handleInput(event);
    this.updateCharacterCount(value);
  }

  onTextareaFocus(event: FocusEvent): void {
    this.handleFocus();
  }

  onTextareaBlur(event: FocusEvent): void {
    this.handleBlur();
  }

  onTextareaKeyDown(event: KeyboardEvent): void {
    // Tab para inserir indentação
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertTextAtCursor('  ');
      return;
    }
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeTextareaState(): void {
    const metadata = this.metadata();
    if (!metadata) return;

    this.updateTextareaState({
      autoResize: metadata.autoSize !== false,
    });

    this.updateCharacterCount(this.getValue() || '');
  }

  private setupTextAnalysisEffects(): void {
    effect(
      () => {
        const fieldValue = this.getValue();
        if (fieldValue !== null && fieldValue !== undefined) {
          this.updateCharacterCount(String(fieldValue));
        }
      },
      { injector: this.injector },
    );
  }

  private setupTextareaEventListeners(): void {
    if (!this.textareaElement) return;

    const textarea = this.textareaElement.nativeElement;

    // Listener para paste events
    textarea.addEventListener('paste', (event) => {
      setTimeout(() => {
        this.updateCharacterCount(textarea.value);
      });
    });

    // Listener para cut events
    textarea.addEventListener('cut', (event) => {
      setTimeout(() => {
        this.updateCharacterCount(textarea.value);
      });
    });
  }

  private updateCharacterCount(value: string): void {
    const characterCount = value.length;
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lineCount = value.split('\n').length;

    this.updateTextareaState({
      characterCount,
      wordCount,
      lineCount,
    });
  }

  private updateTextareaState(changes: Partial<TextareaState>): void {
    const current = this.textareaState();
    this.textareaState.set({ ...current, ...changes });
  }
}
