import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'praxis-dsl-viewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dsl-viewer-container">
      <!-- Toolbar -->
      <mat-toolbar class="dsl-toolbar" color="primary">
        <span class="toolbar-title">
          <mat-icon>code</mat-icon>
          DSL Editor
        </span>
        
        <span class="toolbar-spacer"></span>
        
        <div class="toolbar-actions">
          <!-- Validation Status -->
          <div class="validation-status" [class]="getValidationStatusClass()">
            <mat-icon>{{ getValidationIcon() }}</mat-icon>
            <span>{{ getValidationText() }}</span>
          </div>
          
          <mat-divider vertical></mat-divider>
          
          <!-- Editor Actions -->
          <button mat-icon-button 
                  [disabled]="!editable"
                  (click)="formatCode()"
                  matTooltip="Format Code">
            <mat-icon>auto_fix_high</mat-icon>
          </button>
          
          <button mat-icon-button 
                  [disabled]="!editable"
                  (click)="validateSyntax()"
                  matTooltip="Validate Syntax">
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
            
            <button mat-menu-item (click)="downloadDsl()" [disabled]="!dsl">
              <mat-icon>download</mat-icon>
              <span>Download DSL</span>
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
            
            <button mat-menu-item (click)="toggleMinimap()">
              <mat-icon>map</mat-icon>
              <span>{{ showMinimap ? 'Hide' : 'Show' }} Minimap</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Editor Container -->
      <div class="editor-container" [class.readonly]="!editable">
        <!-- Monaco Editor Placeholder -->
        <div #editorContainer 
             class="monaco-editor-container"
             [class.loading]="isLoading">
        </div>
        
        <!-- Loading Overlay -->
        <div *ngIf="isLoading" class="loading-overlay">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <span class="loading-text">Loading editor...</span>
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
          <span *ngIf="cursorPosition" class="cursor-position">
            Line {{ cursorPosition.line }}, Column {{ cursorPosition.column }}
          </span>
        </div>
        
        <div class="status-center">
          <!-- Syntax Errors -->
          <div *ngIf="syntaxErrors.length > 0" class="syntax-errors">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ syntaxErrors.length }} error(s)</span>
            <button mat-button 
                    size="small" 
                    color="warn"
                    (click)="showErrorDetails()">
              Details
            </button>
          </div>
          
          <!-- Warnings -->
          <div *ngIf="warnings.length > 0" class="warnings">
            <mat-icon color="accent">warning</mat-icon>
            <span>{{ warnings.length }} warning(s)</span>
          </div>
        </div>
        
        <div class="status-right">
          <span class="language-mode">DSL</span>
          <span *ngIf="hasChanges" class="unsaved-indicator">•</span>
        </div>
      </div>

      <!-- Error Panel -->
      <div *ngIf="showErrors && (syntaxErrors.length > 0 || warnings.length > 0)" 
           class="error-panel">
        <div class="error-panel-header">
          <h4>Issues</h4>
          <button mat-icon-button (click)="hideErrorDetails()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="error-list">
          <!-- Syntax Errors -->
          <div *ngFor="let error of syntaxErrors" 
               class="error-item severity-error"
               (click)="goToError(error)">
            <mat-icon>error</mat-icon>
            <div class="error-content">
              <div class="error-message">{{ error.message }}</div>
              <div class="error-location">Line {{ error.line }}, Column {{ error.column }}</div>
            </div>
          </div>
          
          <!-- Warnings -->
          <div *ngFor="let warning of warnings" 
               class="error-item severity-warning"
               (click)="goToError(warning)">
            <mat-icon>warning</mat-icon>
            <div class="error-content">
              <div class="error-message">{{ warning.message }}</div>
              <div class="error-location">Line {{ warning.line }}, Column {{ warning.column }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dsl-viewer-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .dsl-toolbar {
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

    .validation-status.warning {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
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

    .monaco-editor-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .monaco-editor-container.loading {
      opacity: 0.5;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--mdc-theme-surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 1000;
    }

    .loading-text {
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
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

    .cursor-position {
      font-family: monospace;
    }

    .syntax-errors,
    .warnings {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .syntax-errors mat-icon,
    .warnings mat-icon {
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

    .error-panel {
      background: var(--mdc-theme-surface);
      border-top: 1px solid var(--mdc-theme-outline);
      max-height: 200px;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .error-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: var(--mdc-theme-surface-variant);
      border-bottom: 1px solid var(--mdc-theme-outline);
    }

    .error-panel-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .error-list {
      padding: 8px;
    }

    .error-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .error-item:hover {
      background: var(--mdc-theme-surface-variant);
    }

    .error-item.severity-error {
      border-left: 3px solid var(--mdc-theme-error);
    }

    .error-item.severity-warning {
      border-left: 3px solid var(--mdc-theme-warning);
    }

    .error-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-top: 2px;
    }

    .error-item.severity-error mat-icon {
      color: var(--mdc-theme-error);
    }

    .error-item.severity-warning mat-icon {
      color: var(--mdc-theme-warning);
    }

    .error-content {
      flex: 1;
    }

    .error-message {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .error-location {
      font-size: 11px;
      color: var(--mdc-theme-on-surface-variant);
      font-family: monospace;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .toolbar-actions {
        gap: 4px;
      }
      
      .status-bar {
        flex-direction: column;
        gap: 4px;
        align-items: stretch;
      }
      
      .status-left,
      .status-center,
      .status-right {
        justify-content: center;
      }
    }
  `]
})
export class DslViewerComponent implements OnInit, OnChanges {
  @Input() dsl: string = '';
  @Input() editable: boolean = true;
  @Input() language: string = 'dsl';
  @Input() theme: string = 'vs';
  
  @Output() dslChanged = new EventEmitter<string>();
  @Output() validationChanged = new EventEmitter<{valid: boolean; errors: any[]; warnings: any[]}>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private monacoEditor: any = null;
  private originalDsl: string = '';

  // Component state
  isLoading = true;
  hasChanges = false;
  showErrors = false;
  syntaxErrors: any[] = [];
  warnings: any[] = [];
  cursorPosition: {line: number; column: number} | null = null;
  
  // Editor settings
  showLineNumbers = true;
  wordWrap = false;
  showMinimap = true;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initializeMonacoEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dsl'] && this.monacoEditor) {
      this.updateEditorContent();
    }
    
    if (changes['editable'] && this.monacoEditor) {
      this.updateEditorOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.monacoEditor) {
      this.monacoEditor.dispose();
    }
  }

  private async initializeMonacoEditor(): Promise<void> {
    try {
      this.isLoading = true;
      
      // In a real implementation, you would load Monaco Editor here
      // For now, we'll simulate the loading and create a simple textarea fallback
      await this.loadMonacoEditor();
      
      this.createEditor();
      this.setupEditorEvents();
      this.updateEditorContent();
      this.updateEditorOptions();
      
      this.isLoading = false;
    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
      this.createFallbackEditor();
      this.isLoading = false;
    }
  }

  private async loadMonacoEditor(): Promise<void> {
    // Simulate loading Monaco Editor
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  private createEditor(): void {
    // In a real implementation, this would create a Monaco Editor instance
    // For now, we'll create a simple textarea fallback
    this.createFallbackEditor();
  }

  private createFallbackEditor(): void {
    const textarea = document.createElement('textarea');
    textarea.className = 'fallback-editor';
    textarea.style.width = '100%';
    textarea.style.height = '100%';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '14px';
    textarea.style.padding = '16px';
    textarea.style.background = 'var(--mdc-theme-surface)';
    textarea.style.color = 'var(--mdc-theme-on-surface)';
    
    this.editorContainer.nativeElement.appendChild(textarea);
    
    // Mock Monaco Editor interface
    this.monacoEditor = {
      setValue: (value: string) => {
        textarea.value = value;
      },
      getValue: () => textarea.value,
      updateOptions: (options: any) => {
        textarea.readOnly = !this.editable;
      },
      onDidChangeModelContent: (callback: Function) => {
        textarea.addEventListener('input', () => {
          this.onContentChanged();
          callback();
        });
      },
      onDidChangeCursorPosition: (callback: Function) => {
        textarea.addEventListener('click', () => {
          this.updateCursorPosition();
          callback();
        });
        textarea.addEventListener('keyup', () => {
          this.updateCursorPosition();
          callback();
        });
      },
      setPosition: (position: any) => {
        // Mock cursor positioning
      },
      focus: () => textarea.focus(),
      dispose: () => {
        if (textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
      }
    };
  }

  private setupEditorEvents(): void {
    if (!this.monacoEditor) return;

    // Content change events
    this.monacoEditor.onDidChangeModelContent(() => {
      this.onContentChanged();
    });

    // Cursor position events
    this.monacoEditor.onDidChangeCursorPosition(() => {
      this.updateCursorPosition();
    });
  }

  private updateEditorContent(): void {
    if (!this.monacoEditor) return;
    
    this.originalDsl = this.dsl || '';
    this.monacoEditor.setValue(this.originalDsl);
    this.hasChanges = false;
    this.validateSyntax();
  }

  private updateEditorOptions(): void {
    if (!this.monacoEditor) return;
    
    this.monacoEditor.updateOptions({
      readOnly: !this.editable,
      lineNumbers: this.showLineNumbers ? 'on' : 'off',
      wordWrap: this.wordWrap ? 'on' : 'off',
      minimap: { enabled: this.showMinimap }
    });
  }

  private onContentChanged(): void {
    if (!this.monacoEditor) return;
    
    const currentValue = this.monacoEditor.getValue();
    this.hasChanges = currentValue !== this.originalDsl;
    
    // Debounced validation
    this.validateSyntaxDebounced();
  }

  private updateCursorPosition(): void {
    // Mock cursor position for fallback editor
    this.cursorPosition = { line: 1, column: 1 };
  }

  private validateSyntaxDebounced = this.debounce(() => {
    this.validateSyntax();
  }, 500);

  private debounce(func: Function, wait: number): Function {
    let timeout: any;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Template methods
  getValidationStatusClass(): string {
    if (this.syntaxErrors.length > 0) return 'invalid';
    if (this.warnings.length > 0) return 'warning';
    return 'valid';
  }

  getValidationIcon(): string {
    if (this.syntaxErrors.length > 0) return 'error';
    if (this.warnings.length > 0) return 'warning';
    return 'check_circle';
  }

  getValidationText(): string {
    if (this.syntaxErrors.length > 0) return 'Invalid';
    if (this.warnings.length > 0) return 'Warnings';
    return 'Valid';
  }

  getEditorInfo(): string {
    const lines = this.dsl ? this.dsl.split('\n').length : 0;
    const chars = this.dsl ? this.dsl.length : 0;
    return `${lines} lines, ${chars} characters`;
  }

  // Action methods
  formatCode(): void {
    if (!this.editable || !this.monacoEditor) return;
    
    try {
      const currentValue = this.monacoEditor.getValue();
      const formatted = this.formatDslCode(currentValue);
      this.monacoEditor.setValue(formatted);
      this.snackBar.open('Code formatted', 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open('Failed to format code', 'Close', { duration: 3000 });
    }
  }

  validateSyntax(): void {
    if (!this.monacoEditor) return;
    
    const currentValue = this.monacoEditor.getValue();
    const validation = this.validateDslSyntax(currentValue);
    
    this.syntaxErrors = validation.errors;
    this.warnings = validation.warnings;
    
    this.validationChanged.emit({
      valid: this.syntaxErrors.length === 0,
      errors: this.syntaxErrors,
      warnings: this.warnings
    });
  }

  applyChanges(): void {
    if (!this.hasChanges || !this.monacoEditor) return;
    
    const currentValue = this.monacoEditor.getValue();
    this.originalDsl = currentValue;
    this.hasChanges = false;
    
    this.dslChanged.emit(currentValue);
    this.snackBar.open('Changes applied', 'Close', { duration: 2000 });
  }

  discardChanges(): void {
    if (!this.hasChanges || !this.monacoEditor) return;
    
    this.monacoEditor.setValue(this.originalDsl);
    this.hasChanges = false;
    this.snackBar.open('Changes discarded', 'Close', { duration: 2000 });
  }

  copyToClipboard(): void {
    if (!this.monacoEditor) return;
    
    const content = this.monacoEditor.getValue();
    navigator.clipboard.writeText(content).then(() => {
      this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy to clipboard', 'Close', { duration: 3000 });
    });
  }

  downloadDsl(): void {
    if (!this.dsl) return;
    
    const blob = new Blob([this.dsl], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specification.dsl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  toggleLineNumbers(): void {
    this.showLineNumbers = !this.showLineNumbers;
    this.updateEditorOptions();
  }

  toggleWordWrap(): void {
    this.wordWrap = !this.wordWrap;
    this.updateEditorOptions();
  }

  toggleMinimap(): void {
    this.showMinimap = !this.showMinimap;
    this.updateEditorOptions();
  }

  showErrorDetails(): void {
    this.showErrors = true;
  }

  hideErrorDetails(): void {
    this.showErrors = false;
  }

  goToError(error: any): void {
    if (!this.monacoEditor) return;
    
    this.monacoEditor.setPosition({
      lineNumber: error.line,
      column: error.column
    });
    this.monacoEditor.focus();
  }

  // DSL-specific methods
  private formatDslCode(code: string): string {
    // Simple DSL formatting - in a real implementation, this would use a proper parser
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Add proper indentation based on nesting level
        const depth = this.calculateIndentationDepth(line);
        return '  '.repeat(depth) + line;
      })
      .join('\n');
  }

  private calculateIndentationDepth(line: string): number {
    // Mock indentation calculation
    if (line.includes('{')) return 1;
    if (line.includes('}')) return 0;
    return 0;
  }

  private validateDslSyntax(code: string): {errors: any[]; warnings: any[]} {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Simple DSL validation - in a real implementation, this would use a proper parser
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for basic syntax errors
      if (line.trim() && !line.trim().endsWith(';') && !line.includes('{') && !line.includes('}')) {
        warnings.push({
          line: lineNumber,
          column: line.length,
          message: 'Line should end with semicolon',
          severity: 'warning'
        });
      }
      
      // Check for unmatched braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push({
          line: lineNumber,
          column: 1,
          message: 'Unmatched braces',
          severity: 'error'
        });
      }
    });
    
    return { errors, warnings };
  }
}