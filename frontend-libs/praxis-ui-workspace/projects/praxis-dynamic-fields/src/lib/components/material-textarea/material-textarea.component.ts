/**
 * @fileoverview Componente Material Textarea dinâmico
 * 
 * Textarea avançado com suporte a:
 * ✅ Auto-resize inteligente
 * ✅ Formatação e validação de texto  
 * ✅ Contador de caracteres e palavras
 * ✅ Preview markdown
 * ✅ Templates de texto
 * ✅ Spellcheck configurável
 */

import { 
  Component, 
  ElementRef, 
  forwardRef,
  ViewChild,
  AfterViewInit,
  computed,
  signal,
  effect
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

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
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
TextFieldModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialTextareaComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"textarea"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialTextareaComponent 
  extends BaseDynamicFieldComponent<MaterialTextareaMetadata> 
  implements AfterViewInit {

  // =============================================================================
  // VIEW CHILDREN
  // =============================================================================

  @ViewChild('textareaElement', { static: false })
  private textareaElement?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('labelEditor', { static: false })
  private labelEditor?: ElementRef<HTMLInputElement>;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO TEXTAREA
  // =============================================================================

/** Estado específico do textarea */
  protected readonly textareaState = signal<TextareaState>({
    autoResize: true,
    characterCount: 0,
    wordCount: 0,
    lineCount: 1
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

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
    return label === 'never' ? 'auto' : (label ?? 'auto');
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

  /** Label sendo editado */
  readonly editingLabel = computed(() => {
    const editState = this.labelEditingState();
    return editState.isEditing ? editState.currentLabel : '';
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

protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeTextareaState();
    this.setupTextAnalysisEffects();
  }

  ngAfterViewInit(): void {
    this.setupTextareaEventListeners();
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
    const currentValue = this.fieldValue() || '';
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    
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
    
this.setValue(value);
    this.updateCharacterCount(value);
  }

  onTextareaFocus(event: FocusEvent): void {
    this.focus();
  }

  onTextareaBlur(event: FocusEvent): void {
    this.blur();
  }

  onTextareaKeyDown(event: KeyboardEvent): void {
    const metadata = this.metadata();
    
// Tab para inserir indentação
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertTextAtCursor('  ');
      return;
    }
  }

  // =============================================================================
  // EVENTOS DE LABEL
  // =============================================================================

  onLabelDoubleClick(): void {
    if (!this.componentState().disabled) {
      this.startLabelEditing();
      
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

private initializeTextareaState(): void {
    const metadata = this.metadata();
    if (!metadata) return;

    this.updateTextareaState({
      autoResize: metadata.autoSize !== false
    });

    this.updateCharacterCount(this.fieldValue() || '');
  }

private setupTextAnalysisEffects(): void {
    effect(() => {
      const fieldValue = this.fieldValue();
      if (fieldValue !== null && fieldValue !== undefined) {
        this.updateCharacterCount(String(fieldValue));
      }
    });
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
      lineCount
    });
  }

  private updateTextareaState(changes: Partial<TextareaState>): void {
    const current = this.textareaState();
    this.textareaState.set({ ...current, ...changes });
  }
}