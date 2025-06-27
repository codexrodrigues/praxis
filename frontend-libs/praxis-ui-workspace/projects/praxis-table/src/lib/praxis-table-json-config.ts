import {Component, EventEmitter, importProvidersFrom, Input, Output} from '@angular/core';
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
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MonacoEditorModule],
    providers: [],
    template: `
      <div class="editor-container">
        <ngx-monaco-editor
          class="editor"
          [options]="editorOptions"
          [(ngModel)]="jsonText"
          (ngModelChange)="onTextChange()"
        ></ngx-monaco-editor>

        <div class="actions-container">
          <button mat-button (click)="formatJson()"><mat-icon>format_align_left</mat-icon>Formatar JSON</button>
          <button mat-button (click)="copyJson()"><mat-icon>content_copy</mat-icon>Copiar</button>
        </div>
      </div>
      <div class="error-message" *ngIf="!valid">JSON inválido</div>

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
  export class PraxisTableJsonConfig {
    @Input() config: TableConfig = { columns: [], data: [] };
    @Output() configChange = new EventEmitter<{config: TableConfig; valid: boolean}>();

    jsonText = '';
    valid = true;

    editorOptions = {
      theme: 'vs-dark',
      language: 'json',
      automaticLayout: true,
      minimap: {
        enabled: true
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
      const cfg = mergeWithDefaults(this.config);
      this.jsonText = JSON.stringify(cfg, null, 2);
    }

    onTextChange() {
      try {
        const cfg = JSON.parse(this.jsonText);
        this.valid = true;
        this.configChange.emit({ config: cfg, valid: true });
      } catch {
        this.valid = false;
        this.configChange.emit({ config: this.config, valid: false });
      }
    }

    formatJson() {
      try {
        const obj = JSON.parse(this.jsonText);
        this.jsonText = JSON.stringify(obj, null, 2);
      } catch {}
    }

    copyJson() {
      navigator.clipboard.writeText(this.jsonText)
        .catch(() => {
          // Fallback caso a API Clipboard não seja suportada
          const textarea = document.createElement('textarea');
          textarea.value = this.jsonText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        });
    }
  }
