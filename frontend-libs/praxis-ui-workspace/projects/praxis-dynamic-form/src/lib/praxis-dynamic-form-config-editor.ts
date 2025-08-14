import { Component, ViewChild, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormConfig } from '@praxis/core';
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
import { LayoutEditorComponent } from './layout-editor/layout-editor.component';
import { BehaviorEditorComponent } from './behavior-editor/behavior-editor.component';
import { ActionsEditorComponent } from './actions-editor/actions-editor.component';
import { MessagesEditorComponent } from './messages-editor/messages-editor.component';
import { RulesEditorComponent } from './rules-editor/rules-editor.component';
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
    LayoutEditorComponent,
    BehaviorEditorComponent,
    ActionsEditorComponent,
    MessagesEditorComponent,
    RulesEditorComponent,
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
              <praxis-layout-editor
                [config]="editedConfig"
                (configChange)="onConfigChange($event)"
              ></praxis-layout-editor>
            </div>
          </mat-tab>
          <mat-tab label="Comportamento">
            <div class="tab-content">
              <praxis-behavior-editor
                [config]="editedConfig"
                (configChange)="onConfigChange($event)"
              ></praxis-behavior-editor>
            </div>
          </mat-tab>
          <mat-tab label="Ações">
            <div class="tab-content">
              <praxis-actions-editor
                [config]="editedConfig"
                (configChange)="onConfigChange($event)"
              ></praxis-actions-editor>
            </div>
          </mat-tab>
          <mat-tab label="Regras">
            <div class="tab-content">
              <praxis-rules-editor
                [config]="editedConfig"
                (configChange)="onConfigChange($event)"
              ></praxis-rules-editor>
            </div>
          </mat-tab>
          <mat-tab label="Mensagens">
            <div class="tab-content">
              <praxis-messages-editor
                [config]="editedConfig"
                (configChange)="onConfigChange($event)"
              ></praxis-messages-editor>
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
  private initialConfig: FormConfig;

  constructor(
    private configService: FormConfigService,
    @Optional() @Inject(SETTINGS_PANEL_DATA) injectedData?: FormConfig,
  ) {
    this.initialConfig = normalizeFormConfig(injectedData);
    this.editedConfig = structuredClone(this.initialConfig);
    this.configService.loadConfig(structuredClone(this.initialConfig));
  }

  reset(): void {
    this.editedConfig = structuredClone(this.initialConfig);
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

  onConfigChange(newConfig: FormConfig): void {
    this.editedConfig = newConfig;
  }
}
