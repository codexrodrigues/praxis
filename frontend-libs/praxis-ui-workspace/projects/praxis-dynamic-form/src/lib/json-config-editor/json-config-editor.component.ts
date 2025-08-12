import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormConfig } from '@praxis/core';
import { FormConfigService } from '../services/form-config.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  config?: FormConfig;
}

export interface JsonEditorEvent {
  type: 'apply' | 'format' | 'validation';
  payload: JsonValidationResult;
}

@Component({
  selector: 'form-json-config-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  template: `
    <div class="json-config-editor">
      <mat-card class="educational-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="card-icon">data_object</mat-icon>
          <mat-card-title>Edição Avançada JSON</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>
            <strong>Para usuários avançados:</strong> Edite todas as
            configurações do formulário diretamente em JSON.
          </p>
        </mat-card-content>
      </mat-card>

      <div class="json-editor-section">
        <div class="json-editor-toolbar">
          <button mat-button (click)="refreshJson()">
            <mat-icon>refresh</mat-icon>
            Atualizar JSON
          </button>
          <button mat-button (click)="formatJson()" [disabled]="!isValidJson">
            <mat-icon>format_align_left</mat-icon>
            Formatar JSON
          </button>
          <button
            mat-button
            color="primary"
            (click)="applyJsonChanges()"
            [disabled]="!isValidJson"
          >
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
            rows="20"
            spellcheck="false"
            class="json-textarea"
          ></textarea>
          <mat-hint *ngIf="isValidJson" class="valid-hint"
            >JSON válido</mat-hint
          >
          <mat-error *ngIf="!isValidJson && jsonText"
            >JSON inválido: {{ jsonError }}</mat-error
          >
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
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
        font-family:
          'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        height: 100% !important;
        min-height: 300px !important;
        white-space: pre !important;
        overflow-wrap: normal !important;
        overflow-x: auto !important;
        resize: none !important;
      }
      .valid-hint {
        color: var(--mat-sys-primary) !important;
      }
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
    `,
  ],
})
export class JsonConfigEditorComponent implements OnInit, OnDestroy {
  @Input() config: FormConfig | null = null;
  @Output() configChange = new EventEmitter<FormConfig>();
  @Output() validationChange = new EventEmitter<JsonValidationResult>();
  @Output() editorEvent = new EventEmitter<JsonEditorEvent>();

  jsonText = '';
  isValidJson = true;
  jsonError = '';

  private destroy$ = new Subject<void>();
  private jsonTextChanges$ = new Subject<string>();

  constructor(
    private cdr: ChangeDetectorRef,
    private configService: FormConfigService,
  ) {
    this.jsonTextChanges$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((text) => this.validateJson(text));
  }

  ngOnInit(): void {
    const cfg = this.config || this.configService.currentConfig;
    try {
      this.jsonText = JSON.stringify(cfg, null, 2);
    } catch {
      this.jsonText = '{}';
    }
    this.validateJson(this.jsonText);
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
      const newConfig = JSON.parse(this.jsonText) as FormConfig;
      this.configService.loadConfig(newConfig);
      this.configChange.emit(newConfig);
      this.editorEvent.emit({
        type: 'apply',
        payload: { isValid: true, config: newConfig },
      });
    } catch {
      const errorResult: JsonValidationResult = {
        isValid: false,
        error: 'Erro ao aplicar configuração JSON',
      };
      this.editorEvent.emit({ type: 'apply', payload: errorResult });
    }
  }

  formatJson(): void {
    if (!this.isValidJson) {
      return;
    }
    try {
      const parsed = JSON.parse(this.jsonText);
      this.jsonText = JSON.stringify(parsed, null, 2);
      this.editorEvent.emit({
        type: 'format',
        payload: { isValid: true, config: parsed as FormConfig },
      });
      this.cdr.markForCheck();
    } catch {
      this.editorEvent.emit({
        type: 'format',
        payload: { isValid: false, error: 'Erro ao formatar JSON' },
      });
    }
  }

  updateJsonFromConfig(config: FormConfig): void {
    this.jsonText = JSON.stringify(config, null, 2);
    this.validateJson(this.jsonText);
  }

  /**
   * Força atualização do JSON com a configuração atual
   */
  refreshJson(): void {
    const cfg = this.config || this.configService.currentConfig;
    this.updateJsonFromConfig(cfg);
  }

  getCurrentConfig(): FormConfig | null {
    if (!this.isValidJson) {
      return null;
    }
    try {
      return JSON.parse(this.jsonText) as FormConfig;
    } catch {
      return null;
    }
  }

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
    const result: JsonValidationResult = { isValid: false };
    if (!text.trim()) {
      result.error = 'JSON não pode estar vazio';
      this.updateValidationState(result);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Configuração deve ser um objeto');
      }
      const errors = this.configService.validateConfig(parsed as FormConfig);
      if (errors.length > 0) {
        result.error = errors.join('; ');
      } else {
        result.isValid = true;
        result.config = parsed as FormConfig;
      }
      this.updateValidationState(result);
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : 'Erro de sintaxe JSON';
      this.updateValidationState(result);
    }
  }

  private updateValidationState(result: JsonValidationResult): void {
    this.isValidJson = result.isValid;
    this.jsonError = result.error || '';
    this.validationChange.emit(result);
    this.editorEvent.emit({ type: 'validation', payload: result });
    this.cdr.markForCheck();
  }
}
