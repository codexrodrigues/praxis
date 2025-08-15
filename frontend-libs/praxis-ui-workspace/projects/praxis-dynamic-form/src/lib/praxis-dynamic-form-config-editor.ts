import { Component, ViewChild, Inject, Optional, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormConfig, FieldMetadata } from '@praxis/core';
import type { FieldDataType } from '@praxis/core';
import { BehaviorSubject } from 'rxjs';
import {
  SETTINGS_PANEL_DATA,
  SettingsValueProvider,
} from '@praxis/settings-panel';
import {
  PraxisVisualBuilder,
  RuleBuilderConfig,
  FieldSchema,
  FieldType,
} from '@praxis/visual-builder';
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
    PraxisVisualBuilder,
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
        height: calc(100% - 48px); /* Account for tab header height */
        overflow-y: auto;
      }
      .visual-builder-content {
        padding: 0;
        height: 100%;
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
            <div class="tab-content visual-builder-content">
              <praxis-visual-builder
                [config]="ruleBuilderConfig"
                [initialRules]="editedConfig.formRules"
                (rulesChanged)="onRulesChanged($event)"
              ></praxis-visual-builder>
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
export class PraxisDynamicFormConfigEditor
  implements SettingsValueProvider, OnInit, OnDestroy
{
  @ViewChild(JsonConfigEditorComponent) jsonEditor?: JsonConfigEditorComponent;

  editedConfig: FormConfig;
  ruleBuilderConfig!: RuleBuilderConfig;
  private initialConfig: FormConfig;

  // Observables obrigatórios da interface SettingsValueProvider
  isDirty$ = new BehaviorSubject<boolean>(false);
  isValid$ = new BehaviorSubject<boolean>(true);
  isBusy$ = new BehaviorSubject<boolean>(false);

  constructor(
    private configService: FormConfigService,
    @Optional() @Inject(SETTINGS_PANEL_DATA) injectedData?: FormConfig,
  ) {
    this.initialConfig = normalizeFormConfig(injectedData);
    this.editedConfig = structuredClone(this.initialConfig);
    this.configService.loadConfig(structuredClone(this.initialConfig));
  }

  ngOnInit(): void {
    this.ruleBuilderConfig = this.createRuleBuilderConfig(
      this.editedConfig.fieldMetadata || [],
    );
    // Inicializar estado de validação - assumir válido por padrão
    this.isValid$.next(true);
    this.updateDirtyState();
  }

  reset(): void {
    this.isBusy$.next(true);
    
    try {
      this.editedConfig = structuredClone(this.initialConfig);
      this.jsonEditor?.updateJsonFromConfig(this.editedConfig);
      // Resetar validação para estado válido
      this.isValid$.next(true);
      this.updateDirtyState();
    } finally {
      this.isBusy$.next(false);
    }
  }

  private updateDirtyState(): void {
    // Verificar se há alterações em relação à configuração inicial
    const hasChanges = 
      JSON.stringify(this.initialConfig) !== JSON.stringify(this.editedConfig);
    
    this.isDirty$.next(hasChanges);
    // Nota: isValid$ é atualizado em onJsonValidationChange quando necessário
    // Para outras validações futuras, verificar se não há validação JSON em andamento
  }

  getSettingsValue(): FormConfig {
    return this.editedConfig;
  }

  onSave(): FormConfig {
    this.isBusy$.next(true);
    
    try {
      // Realizar qualquer validação ou processamento final aqui
      return this.editedConfig;
    } finally {
      this.isBusy$.next(false);
    }
  }

  onJsonConfigChange(newConfig: FormConfig): void {
    this.editedConfig = newConfig;
    this.ruleBuilderConfig = this.createRuleBuilderConfig(
      newConfig.fieldMetadata || [],
    );
    this.updateDirtyState();
  }

  onJsonValidationChange(result: JsonValidationResult): void {
    // Atualizar estado de validação baseado no resultado do JSON
    this.isValid$.next(result.isValid);
    this.updateDirtyState();
  }

  onJsonEditorEvent(_event: JsonEditorEvent): void {
    // no-op for now
  }

  onConfigChange(newConfig: FormConfig): void {
    this.editedConfig = newConfig;
    // Potentially update rule builder config if fields change
    if (
      JSON.stringify(newConfig.fieldMetadata) !==
      JSON.stringify(this.ruleBuilderConfig.fieldSchemas)
    ) {
      this.ruleBuilderConfig = this.createRuleBuilderConfig(
        newConfig.fieldMetadata || [],
      );
    }
    this.updateDirtyState();
  }

  onRulesChanged(rules: any): void {
    this.editedConfig = {
      ...this.editedConfig,
      formRules: rules.rootNodes.map((nodeId: string) => rules.nodes[nodeId]),
    };
    this.updateDirtyState();
  }

  private createRuleBuilderConfig(
    fieldMetadata: FieldMetadata[],
  ): RuleBuilderConfig {
    return {
      fieldSchemas: this.mapMetadataToSchema(fieldMetadata),
      // Add any other necessary configurations for the visual builder here
    };
  }

  private mapMetadataToSchema(
    metadata: FieldMetadata[],
  ): Record<string, FieldSchema> {
    const schemas: Record<string, FieldSchema> = {};
    for (const field of metadata) {
      schemas[field.name] = {
        name: field.name,
        label: field.label,
        type: this.mapDataTypeToFieldType(field.dataType),
        description: field.description,
        required: field.required,
        allowedValues: field.options?.map((opt) => ({
          label: opt.text,
          value: opt.value,
        })),
      };
    }
    return schemas;
  }

  private mapDataTypeToFieldType(dataType?: FieldDataType): FieldType {
    const mapping: Record<FieldDataType, FieldType> = {
      text: FieldType.STRING,
      number: FieldType.NUMBER,
      email: FieldType.EMAIL,
      date: FieldType.DATE,
      password: FieldType.STRING,
      file: FieldType.STRING,
      url: FieldType.URL,
      boolean: FieldType.BOOLEAN,
      json: FieldType.JSON,
    };
    return mapping[dataType ?? 'text'];
  }

  ngOnDestroy(): void {
    // Finalizar observables para evitar memory leaks
    this.isDirty$.complete();
    this.isValid$.complete();
    this.isBusy$.complete();
  }
}
