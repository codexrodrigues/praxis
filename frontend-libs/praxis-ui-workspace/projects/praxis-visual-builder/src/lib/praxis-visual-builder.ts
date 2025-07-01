import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RuleEditorComponent } from './components/rule-editor.component';
import { RuleBuilderConfig, ExportOptions, ImportOptions } from './models/rule-builder.model';

@Component({
  selector: 'praxis-visual-builder',
  standalone: true,
  imports: [RuleEditorComponent],
  template: `
    <div class="praxis-visual-builder mat-app-background">
      <praxis-rule-editor
        [config]="config"
        [initialRules]="initialRules"
        (rulesChanged)="onRulesChanged($event)"
        (exportRequested)="onExportRequested($event)"
        (importRequested)="onImportRequested($event)">
      </praxis-rule-editor>
    </div>
  `,
  styleUrls: ['./styles/visual-builder-theme.scss'],
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .praxis-visual-builder {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `]
})
export class PraxisVisualBuilder {
  @Input() config: RuleBuilderConfig | null = null;
  @Input() initialRules: any = null;
  
  @Output() rulesChanged = new EventEmitter<any>();
  @Output() exportRequested = new EventEmitter<ExportOptions>();
  @Output() importRequested = new EventEmitter<ImportOptions>();

  onRulesChanged(rules: any): void {
    this.rulesChanged.emit(rules);
  }

  onExportRequested(options: ExportOptions): void {
    this.exportRequested.emit(options);
  }

  onImportRequested(options: ImportOptions): void {
    this.importRequested.emit(options);
  }
}
