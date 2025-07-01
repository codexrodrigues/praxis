import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'praxis-json-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="json-viewer-container">
      <!-- Toolbar -->
      <mat-toolbar class="json-toolbar" color="primary">
        <span class="toolbar-title">
          <mat-icon>data_object</mat-icon>
          JSON Viewer
        </span>
        
        <span class="toolbar-spacer"></span>
        
        <div class="toolbar-actions">
          <!-- Validation Status -->
          <div class="validation-status" [class]="getValidationStatusClass()">
            <mat-icon>{{ getValidationIcon() }}</mat-icon>
            <span>{{ getValidationText() }}</span>
          </div>
          
          <mat-divider vertical></mat-divider>
          
          <!-- Actions -->
          <button mat-icon-button 
                  [disabled]="!editable"
                  (click)="formatJson()"
                  matTooltip="Format JSON">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [disabled]="!editable"
                  (click)="validateJson()"
                  matTooltip="Validate JSON">
            <mat-icon>check_circle</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [disabled]="!editable || !hasChanges"
                  (click)="applyChanges()"
                  matTooltip="Apply Changes">
            <mat-icon>save</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [disabled]="!editable || !hasChanges"
                  (click)="discardChanges()"
                  matTooltip="Discard Changes">
            <mat-icon>undo</mat-icon>
          </button>
          
          <!-- More Actions Menu -->
          <button mat-icon-button [matMenuTriggerFor]="moreMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #moreMenu="matMenu">
            <button mat-menu-item (click)="copyToClipboard()">
              <mat-icon>content_copy</mat-icon>
              <span>Copy to Clipboard</span>
            </button>
            
            <button mat-menu-item (click)="downloadJson()" [disabled]="!json">
              <mat-icon>download</mat-icon>
              <span>Download JSON</span>
            </button>
            
            <mat-divider></mat-divider>
            
            <button mat-menu-item (click)="toggleLineNumbers()">
              <mat-icon>format_list_numbered</mat-icon>
              <span>{{ showLineNumbers ? 'Hide' : 'Show' }} Line Numbers</span>
            </button>
            
            <button mat-menu-item (click)="toggleWordWrap()">
              <mat-icon>wrap_text</mat-icon>
              <span>{{ wordWrap ? 'Disable' : 'Enable' }} Word Wrap</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Editor Container -->
      <div class="editor-container" [class.readonly]="!editable">
        <div class="json-editor">
          <textarea 
            #jsonTextarea
            class="json-textarea"
            [value]="formattedJson"
            [readonly]="!editable"
            (input)="onJsonInput($event)"
            [class.line-numbers]="showLineNumbers"
            [class.word-wrap]="wordWrap"
            placeholder="Enter JSON here...">
          </textarea>
          
          <!-- Line Numbers -->
          <div *ngIf="showLineNumbers" class="line-numbers">
            <div *ngFor="let lineNum of getLineNumbers()" class="line-number">
              {{ lineNum }}
            </div>
          </div>
        </div>
        
        <!-- Readonly Overlay -->
        <div *ngIf="!editable" class="readonly-overlay">
          <div class="readonly-message">
            <mat-icon>visibility</mat-icon>
            <span>Read-only mode</span>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          <span class="editor-info">{{ getEditorInfo() }}</span>
        </div>
        
        <div class="status-center">
          <!-- Validation Errors -->
          <div *ngIf="validationError" class="validation-error">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ validationError }}</span>
          </div>
        </div>
        
        <div class="status-right">
          <span class="language-mode">JSON</span>
          <span *ngIf="hasChanges" class="unsaved-indicator">•</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .json-viewer-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .json-toolbar {
      flex-shrink: 0;
      padding: 0 16px;
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .validation-status {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .validation-status.valid {
      background: var(--mdc-theme-success-container);
      color: var(--mdc-theme-on-success-container);
    }

    .validation-status.invalid {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
    }

    .validation-status mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .editor-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .json-editor {
      position: relative;
      height: 100%;
      display: flex;
    }

    .json-textarea {
      flex: 1;
      border: none;
      outline: none;
      resize: none;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      padding: 16px;
      background: var(--mdc-theme-surface);
      color: var(--mdc-theme-on-surface);
      white-space: pre;
      overflow-wrap: normal;
      overflow: auto;
    }

    .json-textarea.line-numbers {
      padding-left: 60px;
    }

    .json-textarea.word-wrap {
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .json-textarea:read-only {
      background: var(--mdc-theme-surface-variant);
      color: var(--mdc-theme-on-surface-variant);
    }

    .line-numbers {
      position: absolute;
      left: 0;
      top: 0;
      width: 50px;
      height: 100%;
      background: var(--mdc-theme-surface-variant);
      border-right: 1px solid var(--mdc-theme-outline);
      padding: 16px 8px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      color: var(--mdc-theme-on-surface-variant);
      text-align: right;
      overflow: hidden;
      user-select: none;
    }

    .line-number {
      height: 21px; /* Match line height */
    }

    .readonly-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 100;
    }

    .readonly-message {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--mdc-theme-surface-variant);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .readonly-message mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 16px;
      background: var(--mdc-theme-surface-variant);
      border-top: 1px solid var(--mdc-theme-outline);
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      flex-shrink: 0;
    }

    .status-left,
    .status-center,
    .status-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .validation-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--mdc-theme-error);
    }

    .validation-error mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .language-mode {
      font-family: monospace;
      font-weight: 600;
    }

    .unsaved-indicator {
      color: var(--mdc-theme-primary);
      font-weight: bold;
      font-size: 16px;
    }
  `]
})
export class JsonViewerComponent implements OnInit, OnChanges {
  @Input() json: any = null;
  @Input() editable: boolean = true;
  
  @Output() jsonChanged = new EventEmitter<any>();

  // Component state
  formattedJson: string = '';
  originalJson: string = '';
  hasChanges = false;
  validationError: string = '';
  
  // Editor settings
  showLineNumbers = true;
  wordWrap = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.updateJsonContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['json']) {
      this.updateJsonContent();
    }
  }

  private updateJsonContent(): void {
    try {
      if (this.json !== null && this.json !== undefined) {
        this.formattedJson = typeof this.json === 'string' 
          ? this.json 
          : JSON.stringify(this.json, null, 2);
      } else {
        this.formattedJson = '';
      }
      
      this.originalJson = this.formattedJson;
      this.hasChanges = false;
      this.validationError = '';
    } catch (error) {
      this.validationError = 'Invalid JSON format';
      this.formattedJson = '';
    }
  }

  onJsonInput(event: any): void {
    this.formattedJson = event.target.value;
    this.hasChanges = this.formattedJson !== this.originalJson;
    this.validateJson();
  }

  getValidationStatusClass(): string {
    return this.validationError ? 'invalid' : 'valid';
  }

  getValidationIcon(): string {
    return this.validationError ? 'error' : 'check_circle';
  }

  getValidationText(): string {
    return this.validationError ? 'Invalid' : 'Valid';
  }

  getEditorInfo(): string {
    const lines = this.formattedJson ? this.formattedJson.split('\n').length : 0;
    const chars = this.formattedJson ? this.formattedJson.length : 0;
    return `${lines} lines, ${chars} characters`;
  }

  getLineNumbers(): number[] {
    const lineCount = this.formattedJson ? this.formattedJson.split('\n').length : 1;
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }

  formatJson(): void {
    if (!this.editable) return;
    
    try {
      const parsed = JSON.parse(this.formattedJson);
      this.formattedJson = JSON.stringify(parsed, null, 2);
      this.validationError = '';
      this.snackBar.open('JSON formatted', 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open('Invalid JSON format', 'Close', { duration: 3000 });
    }
  }

  validateJson(): void {
    try {
      if (this.formattedJson.trim()) {
        JSON.parse(this.formattedJson);
      }
      this.validationError = '';
    } catch (error) {
      this.validationError = 'Invalid JSON syntax';
    }
  }

  applyChanges(): void {
    if (!this.hasChanges || this.validationError) return;
    
    try {
      const parsed = this.formattedJson.trim() ? JSON.parse(this.formattedJson) : null;
      this.originalJson = this.formattedJson;
      this.hasChanges = false;
      
      this.jsonChanged.emit(parsed);
      this.snackBar.open('Changes applied', 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open('Invalid JSON format', 'Close', { duration: 3000 });
    }
  }

  discardChanges(): void {
    if (!this.hasChanges) return;
    
    this.formattedJson = this.originalJson;
    this.hasChanges = false;
    this.validateJson();
    this.snackBar.open('Changes discarded', 'Close', { duration: 2000 });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.formattedJson).then(() => {
      this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy to clipboard', 'Close', { duration: 3000 });
    });
  }

  downloadJson(): void {
    if (!this.formattedJson) return;
    
    const blob = new Blob([this.formattedJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specification.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  toggleLineNumbers(): void {
    this.showLineNumbers = !this.showLineNumbers;
  }

  toggleWordWrap(): void {
    this.wordWrap = !this.wordWrap;
  }
}