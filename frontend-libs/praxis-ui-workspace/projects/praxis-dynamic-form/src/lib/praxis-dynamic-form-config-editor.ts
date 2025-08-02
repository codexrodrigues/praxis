import { Component, EventEmitter, Output, ViewChild, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormConfig, createDefaultFormConfig, WINDOW_DATA, WINDOW_REF, PraxisResizableWindowRef } from '@praxis/core';
import { FormConfigService } from './services/form-config.service';
import { JsonConfigEditorComponent, JsonValidationResult, JsonEditorEvent } from './json-config-editor/json-config-editor.component';

@Component({
  selector: 'praxis-dynamic-form-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    JsonConfigEditorComponent
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
              <form-json-config-editor
                [config]="editedConfig"
                (configChange)="onJsonConfigChange($event)"
                (validationChange)="onJsonValidationChange($event)"
                (editorEvent)="onJsonEditorEvent($event)">
              </form-json-config-editor>
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
  @ViewChild(JsonConfigEditorComponent) jsonEditor?: JsonConfigEditorComponent;

  editedConfig: FormConfig;

  @Output() configSaved = new EventEmitter<FormConfig>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    private configService: FormConfigService,
    @Optional() @Inject(WINDOW_DATA) private injectedData?: FormConfig,
    @Optional() @Inject(WINDOW_REF) private windowRef?: PraxisResizableWindowRef
  ) {
    console.log('🚀 [PraxisDynamicFormConfigEditor] Inicializando...');
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData:', this.injectedData);
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData type:', typeof this.injectedData);
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData properties:', this.injectedData ? Object.keys(this.injectedData) : 'N/A');
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData.sections:', this.injectedData?.sections);
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData.sections.length:', this.injectedData?.sections?.length || 0);
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData.fieldMetadata:', this.injectedData?.fieldMetadata);
    console.log('🚀 [PraxisDynamicFormConfigEditor] injectedData.fieldMetadata.length:', this.injectedData?.fieldMetadata?.length || 0);
    console.log('🚀 [PraxisDynamicFormConfigEditor] configService.currentConfig:', this.configService.currentConfig);
    
    // Priorizar dados injetados (dados reais do formulário) sobre o serviço
    const configToUse = this.injectedData || { 
      sections: this.configService.currentConfig?.sections || [],
      fieldMetadata: []
    };
    console.log('🚀 [PraxisDynamicFormConfigEditor] Configuração escolhida:', configToUse);
    console.log('🚀 [PraxisDynamicFormConfigEditor] Configuração escolhida type:', typeof configToUse);
    console.log('🚀 [PraxisDynamicFormConfigEditor] Configuração escolhida properties:', configToUse ? Object.keys(configToUse) : 'N/A');
    
    this.editedConfig = { ...configToUse };
    
    // Sincronizar o serviço com os dados reais completos
    if (this.injectedData) {
      console.log('🚀 [PraxisDynamicFormConfigEditor] Sincronizando FormConfigService com dados reais...');
      this.configService.loadConfig(this.injectedData);
    }
    
    console.log('🚀 [PraxisDynamicFormConfigEditor] editedConfig criado:', this.editedConfig);
    console.log('🚀 [PraxisDynamicFormConfigEditor] editedConfig type:', typeof this.editedConfig);
    console.log('🚀 [PraxisDynamicFormConfigEditor] Propriedades do editedConfig:', this.editedConfig ? Object.keys(this.editedConfig) : 'N/A');
    console.log('🚀 [PraxisDynamicFormConfigEditor] editedConfig.sections:', this.editedConfig?.sections);
    console.log('🚀 [PraxisDynamicFormConfigEditor] Seções disponíveis:', this.editedConfig?.sections?.length || 0);
    
    // Se ainda assim o config está vazio, vamos verificar detalhadamente
    if (!this.editedConfig?.sections || this.editedConfig.sections.length === 0) {
      console.log('⚠️ [PraxisDynamicFormConfigEditor] Config tem seções vazias! Investigando...');
      console.log('⚠️ [PraxisDynamicFormConfigEditor] injectedData JSON:', this.injectedData ? JSON.stringify(this.injectedData, null, 2) : 'null');
      console.log('⚠️ [PraxisDynamicFormConfigEditor] configService.currentConfig JSON:', this.configService.currentConfig ? JSON.stringify(this.configService.currentConfig, null, 2) : 'null');
      console.log('⚠️ [PraxisDynamicFormConfigEditor] editedConfig JSON:', JSON.stringify(this.editedConfig, null, 2));
    }
  }

  onReset(): void {
    this.editedConfig = createDefaultFormConfig();
    this.jsonEditor?.updateJsonFromConfig(this.editedConfig);
  }

  onSave(): void {
    this.configService.loadConfig(this.editedConfig);
    this.configSaved.emit(this.editedConfig);
    
    // Close window if available
    if (this.windowRef) {
      this.windowRef.close(this.editedConfig);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    
    // Close window if available
    if (this.windowRef) {
      this.windowRef.close();
    }
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
