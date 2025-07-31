import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormConfig, createDefaultFormConfig } from '@praxis/core';
import { FormConfigService } from './services/form-config.service';

@Component({
  selector: 'praxis-dynamic-form-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [FormConfigService],
  styles: [`
    .config-editor-container{display:flex;flex-direction:column;height:100%;}
    .config-editor-content{flex:1;overflow:hidden;display:flex;flex-direction:column;}
    .config-tabs{height:100%;}
    .tab-content{padding:16px;}
    .config-editor-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px;border-top:1px solid rgba(0,0,0,0.12);}
    .json-field{width:100%;}
  `],
  template: `
    <div class="config-editor-container">
      <div class="config-editor-content">
        <mat-tab-group class="config-tabs">
          <mat-tab label="Layout">
            <div class="tab-content">
              <!-- Layout editor placeholder -->
              <p>Layout editor coming soon.</p>
            </div>
          </mat-tab>
          <mat-tab label="Comportamento">
            <div class="tab-content">
              <!-- Behavior editor placeholder -->
              <p>Behavior editor coming soon.</p>
            </div>
          </mat-tab>
          <mat-tab label="Regras">
            <div class="tab-content">
              <!-- Rules editor placeholder -->
              <p>Rules editor coming soon.</p>
            </div>
          </mat-tab>
          <mat-tab label="Mensagens">
            <div class="tab-content">
              <!-- Messages editor placeholder -->
              <p>Messages editor coming soon.</p>
            </div>
          </mat-tab>
          <mat-tab label="JSON">
            <div class="tab-content">
              <mat-form-field appearance="outline" class="json-field">
                <textarea matInput [(ngModel)]="jsonText" rows="20"></textarea>
              </mat-form-field>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
      <div class="config-editor-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-stroked-button (click)="onReset()">Redefinir</button>
        <button mat-raised-button color="primary" (click)="onSave()">Salvar</button>
      </div>
    </div>
  `
})
export class PraxisDynamicFormConfigEditor {
  editedConfig: FormConfig;
  jsonText: string;

  @Output() configSaved = new EventEmitter<FormConfig>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(private configService: FormConfigService) {
    this.editedConfig = { ...this.configService.currentConfig };
    this.jsonText = JSON.stringify(this.editedConfig, null, 2);
  }

  onReset(): void {
    this.editedConfig = createDefaultFormConfig();
    this.updateJsonText();
  }

  onSave(): void {
    try {
      const parsed = JSON.parse(this.jsonText) as FormConfig;
      this.configService.loadConfig(parsed);
      this.editedConfig = parsed;
      this.configSaved.emit(parsed);
    } catch {
      // ignore invalid JSON
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private updateJsonText(): void {
    this.jsonText = JSON.stringify(this.editedConfig, null, 2);
  }
}
