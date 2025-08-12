import { Component, ViewChild, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormConfig, createDefaultFormConfig } from '@praxis/core';
import {
  SETTINGS_PANEL_DATA,
  SettingsValueProvider,
} from '@praxis/settings-panel';
import { FormConfigService } from './services/form-config.service';
import {
  JsonConfigEditorComponent,
  JsonValidationResult,
  JsonEditorEvent,
} from './json-config-editor/json-config-editor.component';
import { normalizeFormConfig } from './utils/normalize-form-config';

@Component({
  selector: 'praxis-dynamic-form-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    JsonConfigEditorComponent,
  ],
  providers: [FormConfigService],
  styles: [
    `
      .config-editor-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .config-editor-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .config-tabs {
        height: 100%;
      }
      .tab-content {
        padding: 16px;
      }
      .json-field {
        width: 100%;
      }
    `,
  ],
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
              <form-json-config-editor
                [config]="editedConfig"
                (configChange)="onJsonConfigChange($event)"
                (validationChange)="onJsonValidationChange($event)"
                (editorEvent)="onJsonEditorEvent($event)"
              >
              </form-json-config-editor>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
})
export class PraxisDynamicFormConfigEditor implements SettingsValueProvider {
  @ViewChild(JsonConfigEditorComponent) jsonEditor?: JsonConfigEditorComponent;

  editedConfig: FormConfig;

  constructor(
    private configService: FormConfigService,
    @Optional() @Inject(SETTINGS_PANEL_DATA) private injectedData?: FormConfig,
  ) {
    this.editedConfig = normalizeFormConfig(this.injectedData);
    this.configService.loadConfig(structuredClone(this.editedConfig));
  }

  reset(): void {
    this.editedConfig = createDefaultFormConfig();
    this.jsonEditor?.updateJsonFromConfig(this.editedConfig);
  }

  getSettingsValue(): FormConfig {
    return this.editedConfig;
  }

  onJsonConfigChange(newConfig: FormConfig): void {
    this.editedConfig = newConfig;
  }

  onJsonValidationChange(_result: JsonValidationResult): void {
    // placeholder for future validation status handling
  }

  onJsonEditorEvent(_event: JsonEditorEvent): void {
    // no-op for now
  }
}
