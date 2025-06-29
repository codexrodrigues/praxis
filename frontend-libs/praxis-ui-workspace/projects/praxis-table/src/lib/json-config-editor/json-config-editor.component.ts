import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {TableConfig} from '@praxis/core';
import {debounceTime, Subject, takeUntil} from 'rxjs';

export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  config?: TableConfig;
}

export interface JsonEditorEvent {
  type: 'apply' | 'format' | 'validation';
  payload: JsonValidationResult;
}

@Component({
  selector: 'json-config-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  template: `
    <div class="json-config-editor">
      <!-- Educational Card -->
      <mat-card class="educational-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="card-icon">data_object</mat-icon>
          <mat-card-title>Edição Avançada JSON</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Para usuários avançados:</strong> Esta seção permite ajustar todas as configurações da tabela
            diretamente via JSON. <strong>Atenção:</strong> Alterações aqui podem sobrescrever configurações
            visuais nas outras abas.</p>
        </mat-card-content>
      </mat-card>

      <!-- JSON Editor Section -->
      <div class="json-editor-section">
        <div class="json-editor-toolbar">
          <button mat-button (click)="formatJson()" [disabled]="!isValidJson">
            <mat-icon>format_align_left</mat-icon>
            Formatar JSON
          </button>
          <button mat-button (click)="applyJsonChanges()" [disabled]="!isValidJson" color="primary">
            <mat-icon>check</mat-icon>
            Aplicar JSON
          </button>
        </div>

        <mat-form-field appearance="outline" class="json-textarea-field">
          <mat-label>Configuração JSON</mat-label>
          <textarea
            matInput
            [(ngModel)]="jsonText"
            (ngModelChange)="onJsonTextChange($event)"
            placeholder="Edite a configuração JSON aqui..."
            rows="20"
            spellcheck="false"
            class="json-textarea">
          </textarea>
          <mat-hint *ngIf="isValidJson" class="valid-hint">JSON válido</mat-hint>
          <mat-error *ngIf="!isValidJson && jsonText">JSON inválido: {{ jsonError }}</mat-error>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .json-config-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .educational-card {
      margin-bottom: 24px;
      background-color: var(--mat-sys-surface-container-low);
      border-left: 4px solid var(--mat-sys-primary);
    }

    .educational-card .mat-mdc-card-header {
      padding-bottom: 8px;
    }

    .card-icon {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .educational-card .mat-mdc-card-title {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .educational-card .mat-mdc-card-content {
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
    }

    .json-editor-section {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .json-editor-toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .json-textarea-field {
      width: 100%;
      flex: 1;
    }

    .json-textarea {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      min-height: 400px !important;
      white-space: pre !important;
      overflow-wrap: normal !important;
      overflow-x: auto !important;
    }

    .valid-hint {
      color: var(--mat-sys-primary) !important;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .json-editor-toolbar {
        flex-direction: column;
        gap: 8px;
      }

      .json-textarea {
        font-size: 12px !important;
        min-height: 300px !important;
      }
    }
  `]
})
export class JsonConfigEditorComponent implements OnInit, OnDestroy {

  @Input() config: TableConfig | null = null;
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() validationChange = new EventEmitter<JsonValidationResult>();
  @Output() editorEvent = new EventEmitter<JsonEditorEvent>();

  // JSON editing state
  jsonText = '';
  isValidJson = true;
  jsonError = '';

  // Subjects para cleanup e debouncing
  private destroy$ = new Subject<void>();
  private jsonTextChanges$ = new Subject<string>();

  constructor(private cdr: ChangeDetectorRef) {
    // Setup debounced JSON validation
    this.jsonTextChanges$
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(text => {
        this.validateJson(text);
      });
  }

  ngOnInit(): void {
    // Inicializar texto JSON com a configuração recebida
    if (this.config) {
      this.jsonText = JSON.stringify(this.config, null, 2);
      this.validateJson(this.jsonText);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onJsonTextChange(text: string): void {
    this.jsonTextChanges$.next(text);
  }

  applyJsonChanges(): void {
    if (!this.isValidJson) {
      return;
    }

    try {
      const newConfig = JSON.parse(this.jsonText) as TableConfig;

      // Emitir a nova configuração
      this.configChange.emit(newConfig);

      // Emitir evento de aplicação
      this.editorEvent.emit({
        type: 'apply',
        payload: {
          isValid: true,
          config: newConfig
        }
      });

    } catch (error) {
      const errorResult: JsonValidationResult = {
        isValid: false,
        error: 'Erro ao aplicar configuração JSON'
      };

      this.editorEvent.emit({
        type: 'apply',
        payload: errorResult
      });
    }
  }

  formatJson(): void {
    if (!this.isValidJson) {
      return;
    }

    try {
      const parsed = JSON.parse(this.jsonText);
      this.jsonText = JSON.stringify(parsed, null, 2);

      // Emitir evento de formatação
      this.editorEvent.emit({
        type: 'format',
        payload: {
          isValid: true,
          config: parsed as TableConfig
        }
      });

      this.cdr.markForCheck();

    } catch (error) {
      this.editorEvent.emit({
        type: 'format',
        payload: {
          isValid: false,
          error: 'Erro ao formatar JSON'
        }
      });
    }
  }

  /**
   * Método público para atualizar o JSON externamente
   */
  updateJsonFromConfig(config: TableConfig): void {
    this.jsonText = JSON.stringify(config, null, 2);
    this.validateJson(this.jsonText);
  }

  /**
   * Método público para obter a configuração atual validada
   */
  getCurrentConfig(): TableConfig | null {
    if (!this.isValidJson) {
      return null;
    }

    try {
      return JSON.parse(this.jsonText) as TableConfig;
    } catch {
      return null;
    }
  }

  /**
   * Método público para verificar se há alterações
   */
  hasChanges(): boolean {
    if (!this.config) {
      return false;
    }

    const currentConfig = this.getCurrentConfig();
    if (!currentConfig) {
      return false;
    }

    return JSON.stringify(this.config) !== JSON.stringify(currentConfig);
  }

  private validateJson(text: string): void {
    const result: JsonValidationResult = {
      isValid: false,
      error: undefined,
      config: undefined
    };

    if (!text.trim()) {
      result.error = 'JSON não pode estar vazio';
      this.updateValidationState(result);
      return;
    }

    try {
      const parsed = JSON.parse(text);

      // Validação básica da estrutura TableConfig
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Configuração deve ser um objeto');
      }

      if (!Array.isArray(parsed.columns)) {
        throw new Error('Campo "columns" deve ser um array');
      }

      // Validação adicional para campos críticos
      if (parsed.gridOptions && typeof parsed.gridOptions !== 'object') {
        throw new Error('Campo "gridOptions" deve ser um objeto');
      }

      if (parsed.toolbar && typeof parsed.toolbar !== 'object') {
        throw new Error('Campo "toolbar" deve ser um objeto');
      }

      result.isValid = true;
      result.config = parsed as TableConfig;
      this.updateValidationState(result);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erro de sintaxe JSON';
      this.updateValidationState(result);
    }
  }

  private updateValidationState(result: JsonValidationResult): void {
    this.isValidJson = result.isValid;
    this.jsonError = result.error || '';

    // Emitir evento de validação
    this.validationChange.emit(result);

    // Emitir evento genérico do editor
    this.editorEvent.emit({
      type: 'validation',
      payload: result
    });

    this.cdr.markForCheck();
  }
}
