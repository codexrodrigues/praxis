import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
  effect
} from '@angular/core';
import { Subject, distinctUntilChanged, debounceTime, takeUntil } from 'rxjs';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { MatButtonModule } from '@angular/material/button';
  import { MatIconModule } from '@angular/material/icon';
  import { TableConfig } from '@praxis/core';
  import { mergeWithDefaults } from './table-config-defaults';
  import { MonacoEditorModule,provideMonacoEditor } from 'ngx-monaco-editor-v2';

  @Component({
    selector: 'praxis-table-json-config',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MonacoEditorModule],
    providers: [],
    template: `
      <div class="editor-container">
        <ngx-monaco-editor
          class="editor"
          [options]="editorOptions"
          [ngModel]="jsonText()"
          (ngModelChange)="onTextChange($event)"
        ></ngx-monaco-editor>

        <div class="actions-container">
          <button mat-button (click)="formatJson()"><mat-icon>format_align_left</mat-icon>Formatar JSON</button>
          <button mat-button (click)="copyJson()"><mat-icon>content_copy</mat-icon>Copiar</button>
        </div>
      </div>
      <div class="error-message" *ngIf="!valid()">JSON inválido</div>

    `,
    styles:[`

      .editor-container {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .editor {
        flex: 1;
        display: block;
        min-height: 780px;
      }
      .actions-container {
        display: flex;
        gap: 8px;
        padding: 8px;
        background: #1e1e1e;
        border-top: 1px solid #444;
      }

    `]
  })
  export class PraxisTableJsonConfig implements OnChanges, OnDestroy {
    @Input({ required: true }) config: TableConfig = { columns: [] };
    @Output() configChange = new EventEmitter<{config: TableConfig; valid: boolean}>();

    // Signals para estado reativo
    private readonly jsonTextSignal = signal<string>('');
    private readonly validSignal = signal<boolean>(true);
    private readonly configHashSignal = signal<string>('');

    // Computed values
    readonly jsonText = computed(() => this.jsonTextSignal());
    readonly valid = computed(() => this.validSignal());

    // Subjects para gerenciamento
    private readonly destroy$ = new Subject<void>();
    private readonly textChanges$ = new Subject<string>();

    // Estado para prevenir loops
    private isUpdating = false;
    private lastEmittedHash = '';

    constructor(private cdr: ChangeDetectorRef) {
      // Setup da stream de mudanças de texto com debounce
      this.textChanges$
        .pipe(
          debounceTime(150),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(text => {
          this.handleTextChange(text);
        });

      // Effect para reagir a mudanças no JSON text
      effect(() => {
        const jsonText = this.jsonText();
        if (!this.isUpdating && jsonText) {
          this.validateAndEmitConfig(jsonText);
        }
      });
    }

    editorOptions = {
      theme: 'vs-dark',
      language: 'json',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      scrollBeyondLastLine: false,
      formatOnPaste: true,
      formatOnType: true,
      rulers: [],
      folding: true,
      renderLineHighlight: 'all',
      suggestOnTriggerCharacters: true,
      wordWrap: 'on',
      fontSize: 14
    };

    ngOnInit() {
      this.updateJsonFromConfig(this.config);
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['config'] && changes['config'].currentValue && !changes['config'].firstChange) {
        const newHash = this.getConfigHash(changes['config'].currentValue);
        if (newHash !== this.configHashSignal()) {
          this.updateJsonFromConfig(changes['config'].currentValue);
        }
      }
    }

    updateJsonFromConfig(config: TableConfig) {
      if (config && !this.isUpdating) {
        this.isUpdating = true;
        const cfg = mergeWithDefaults(config);
        const jsonText = JSON.stringify(cfg, null, 2);
        this.jsonTextSignal.set(jsonText);
        this.validSignal.set(true);
        this.updateConfigHash(config);
        this.isUpdating = false;
        this.cdr.markForCheck();
      }
    }

    private getConfigHash(config: TableConfig): string {
      return btoa(JSON.stringify(config)).slice(0, 32);
    }

    private updateConfigHash(config: TableConfig): void {
      this.configHashSignal.set(this.getConfigHash(config));
    }

    onTextChange(text: string) {
      if (!this.isUpdating) {
        this.jsonTextSignal.set(text);
        this.textChanges$.next(text);
      }
    }

    private handleTextChange(text: string): void {
      this.validateAndEmitConfig(text);
    }

    private validateAndEmitConfig(text: string): void {
      try {
        const cfg = JSON.parse(text);
        const configHash = this.getConfigHash(cfg);

        // Só emite se realmente mudou
        if (configHash !== this.lastEmittedHash) {
          this.lastEmittedHash = configHash;
          this.validSignal.set(true);
          this.configChange.emit({ config: cfg, valid: true });
        }
      } catch {
        this.validSignal.set(false);
        this.configChange.emit({ config: this.config, valid: false });
      }
      this.cdr.markForCheck();
    }

    formatJson() {
      try {
        const obj = JSON.parse(this.jsonText());
        const formatted = JSON.stringify(obj, null, 2);
        this.jsonTextSignal.set(formatted);
        this.cdr.markForCheck();
      } catch {}
    }

    copyJson() {
      navigator.clipboard.writeText(this.jsonText())
        .catch(() => {
          // Fallback caso a API Clipboard não seja suportada
          const textarea = document.createElement('textarea');
          textarea.value = this.jsonText();
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        });
    }
  }
