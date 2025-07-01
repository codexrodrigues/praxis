import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CellStyles, BorderStyle, IconConfig } from './table-rule-engine.service';

@Component({
  selector: 'style-designer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="style-designer">
      <!-- Preview Section -->
      <div class="preview-section">
        <h4>
          <mat-icon>preview</mat-icon>
          Preview do Estilo
        </h4>
        
        <div class="preview-container">
          <div class="preview-cell" [style]="getPreviewStyles()">
            <span *ngIf="currentIcon?.position === 'before'" 
                  class="preview-icon before"
                  [style.color]="currentIcon.color">
              {{ currentIcon.name }}
            </span>
            
            <span class="preview-text">{{ previewText }}</span>
            
            <span *ngIf="currentIcon?.position === 'after'" 
                  class="preview-icon after"
                  [style.color]="currentIcon.color">
              {{ currentIcon.name }}
            </span>
            
            <span *ngIf="currentIcon?.position === 'overlay'" 
                  class="preview-icon overlay"
                  [style.color]="currentIcon.color">
              {{ currentIcon.name }}
            </span>
          </div>
          
          <div class="preview-info">
            <small>Preview com dados: "{{ previewText }}"</small>
          </div>
        </div>
      </div>

      <!-- Style Configuration Tabs -->
      <mat-tab-group class="style-tabs">
        <!-- Colors Tab -->
        <mat-tab label="Cores">
          <div class="tab-content">
            <form [formGroup]="styleForm" class="style-form">
              <!-- Background Color -->
              <mat-expansion-panel class="style-section">
                <mat-expansion-panel-header>
                  <mat-panel-title>Cor de Fundo</mat-panel-title>
                  <mat-panel-description>
                    Configure a cor de fundo da célula
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="color-section">
                  <mat-form-field appearance="outline" class="color-input">
                    <mat-label>Cor de Fundo</mat-label>
                    <input matInput 
                           type="color" 
                           formControlName="backgroundColor"
                           (change)="onStyleChange()">
                  </mat-form-field>
                  
                  <div class="color-presets">
                    <h5>Cores Predefinidas</h5>
                    <div class="preset-colors">
                      <div *ngFor="let color of backgroundPresets" 
                           class="color-preset"
                           [style.background-color]="color.value"
                           [title]="color.name"
                           (click)="setBackgroundColor(color.value)">
                      </div>
                    </div>
                  </div>
                  
                  <mat-slide-toggle formControlName="transparentBackground" 
                                    (change)="onStyleChange()">
                    Fundo Transparente
                  </mat-slide-toggle>
                </div>
              </mat-expansion-panel>

              <!-- Text Color -->
              <mat-expansion-panel class="style-section">
                <mat-expansion-panel-header>
                  <mat-panel-title>Cor do Texto</mat-panel-title>
                  <mat-panel-description>
                    Configure a cor do texto da célula
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="color-section">
                  <mat-form-field appearance="outline" class="color-input">
                    <mat-label>Cor do Texto</mat-label>
                    <input matInput 
                           type="color" 
                           formControlName="textColor"
                           (change)="onStyleChange()">
                  </mat-form-field>
                  
                  <div class="color-presets">
                    <h5>Cores Predefinidas</h5>
                    <div class="preset-colors">
                      <div *ngFor="let color of textPresets" 
                           class="color-preset text-preset"
                           [style.background-color]="color.value"
                           [title]="color.name"
                           (click)="setTextColor(color.value)">
                      </div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </form>
          </div>
        </mat-tab>

        <!-- Typography Tab -->
        <mat-tab label="Tipografia">
          <div class="tab-content">
            <form [formGroup]="styleForm" class="style-form">
              <!-- Font Weight -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Peso da Fonte</mat-label>
                <mat-select formControlName="fontWeight" (selectionChange)="onStyleChange()">
                  <mat-option value="normal">Normal</mat-option>
                  <mat-option value="bold">Negrito</mat-option>
                  <mat-option value="bolder">Mais Negrito</mat-option>
                  <mat-option value="lighter">Mais Leve</mat-option>
                  <mat-option value="100">100</mat-option>
                  <mat-option value="200">200</mat-option>
                  <mat-option value="300">300</mat-option>
                  <mat-option value="400">400</mat-option>
                  <mat-option value="500">500</mat-option>
                  <mat-option value="600">600</mat-option>
                  <mat-option value="700">700</mat-option>
                  <mat-option value="800">800</mat-option>
                  <mat-option value="900">900</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Font Style -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Estilo da Fonte</mat-label>
                <mat-select formControlName="fontStyle" (selectionChange)="onStyleChange()">
                  <mat-option value="normal">Normal</mat-option>
                  <mat-option value="italic">Itálico</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Text Decoration -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Decoração do Texto</mat-label>
                <mat-select formControlName="textDecoration" (selectionChange)="onStyleChange()">
                  <mat-option value="none">Nenhuma</mat-option>
                  <mat-option value="underline">Sublinhado</mat-option>
                  <mat-option value="line-through">Riscado</mat-option>
                  <mat-option value="overline">Linha Superior</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Font Size -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tamanho da Fonte</mat-label>
                <input matInput 
                       formControlName="fontSize"
                       placeholder="Ex: 14px, 1.2em, 120%"
                       (blur)="onStyleChange()">
                <mat-hint>Use px, em, %, rem ou outros valores CSS válidos</mat-hint>
              </mat-form-field>
            </form>
          </div>
        </mat-tab>

        <!-- Borders Tab -->
        <mat-tab label="Bordas">
          <div class="tab-content">
            <form [formGroup]="borderForm" class="style-form">
              <mat-slide-toggle formControlName="enabled" 
                                (change)="onBorderToggle($event.checked)">
                Ativar Bordas
              </mat-slide-toggle>

              <div *ngIf="borderForm.get('enabled')?.value" class="border-config">
                <!-- Border Width -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Espessura da Borda</mat-label>
                  <input matInput 
                         formControlName="width"
                         placeholder="Ex: 1px, 2px, thin"
                         (blur)="onBorderChange()">
                </mat-form-field>

                <!-- Border Style -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Estilo da Borda</mat-label>
                  <mat-select formControlName="style" (selectionChange)="onBorderChange()">
                    <mat-option value="solid">Sólida</mat-option>
                    <mat-option value="dashed">Tracejada</mat-option>
                    <mat-option value="dotted">Pontilhada</mat-option>
                    <mat-option value="double">Dupla</mat-option>
                    <mat-option value="groove">Sulco</mat-option>
                    <mat-option value="ridge">Crista</mat-option>
                    <mat-option value="inset">Interna</mat-option>
                    <mat-option value="outset">Externa</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Border Color -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cor da Borda</mat-label>
                  <input matInput 
                         type="color" 
                         formControlName="color"
                         (change)="onBorderChange()">
                </mat-form-field>

                <!-- Border Radius -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Raio da Borda</mat-label>
                  <input matInput 
                         formControlName="radius"
                         placeholder="Ex: 4px, 8px, 50%"
                         (blur)="onBorderChange()">
                  <mat-hint>Define o arredondamento dos cantos</mat-hint>
                </mat-form-field>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Effects Tab -->
        <mat-tab label="Efeitos">
          <div class="tab-content">
            <form [formGroup]="effectsForm" class="style-form">
              <!-- Opacity -->
              <div class="effect-section">
                <h5>Opacidade</h5>
                <mat-slider 
                  formControlName="opacity"
                  min="0" 
                  max="1" 
                  step="0.1"
                  (change)="onEffectsChange()"
                  class="opacity-slider">
                </mat-slider>
                <div class="slider-labels">
                  <span>Transparente</span>
                  <span>{{ (effectsForm.get('opacity')?.value || 1) * 100 }}%</span>
                  <span>Opaco</span>
                </div>
              </div>

              <!-- Box Shadow -->
              <mat-expansion-panel class="style-section">
                <mat-expansion-panel-header>
                  <mat-panel-title>Sombra</mat-panel-title>
                  <mat-panel-description>
                    Adicionar sombra à célula
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="shadow-config">
                  <mat-slide-toggle formControlName="shadowEnabled" 
                                    (change)="onEffectsChange()">
                    Ativar Sombra
                  </mat-slide-toggle>

                  <div *ngIf="effectsForm.get('shadowEnabled')?.value" class="shadow-controls">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Sombra CSS</mat-label>
                      <input matInput 
                             formControlName="boxShadow"
                             placeholder="Ex: 0 2px 4px rgba(0,0,0,0.1)"
                             (blur)="onEffectsChange()">
                      <mat-hint>Use sintaxe CSS box-shadow</mat-hint>
                    </mat-form-field>

                    <div class="shadow-presets">
                      <h6>Presets de Sombra</h6>
                      <div class="preset-shadows">
                        <div *ngFor="let shadow of shadowPresets" 
                             class="shadow-preset"
                             [style.box-shadow]="shadow.value"
                             [title]="shadow.name"
                             (click)="setShadow(shadow.value)">
                          {{ shadow.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>

              <!-- Spacing -->
              <mat-expansion-panel class="style-section">
                <mat-expansion-panel-header>
                  <mat-panel-title>Espaçamento</mat-panel-title>
                  <mat-panel-description>
                    Padding e margin da célula
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="spacing-config">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Padding Interno</mat-label>
                    <input matInput 
                           formControlName="padding"
                           placeholder="Ex: 8px, 4px 8px, 4px 8px 12px 8px"
                           (blur)="onEffectsChange()">
                    <mat-hint>Espaço interno da célula</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Margin Externa</mat-label>
                    <input matInput 
                           formControlName="margin"
                           placeholder="Ex: 4px, 2px 4px"
                           (blur)="onEffectsChange()">
                    <mat-hint>Espaço externo da célula</mat-hint>
                  </mat-form-field>
                </div>
              </mat-expansion-panel>
            </form>
          </div>
        </mat-tab>

        <!-- Icons Tab -->
        <mat-tab label="Ícones">
          <div class="tab-content">
            <form [formGroup]="iconForm" class="style-form">
              <mat-slide-toggle formControlName="enabled" 
                                (change)="onIconToggle($event.checked)">
                Adicionar Ícone
              </mat-slide-toggle>

              <div *ngIf="iconForm.get('enabled')?.value" class="icon-config">
                <!-- Icon Name -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nome do Ícone</mat-label>
                  <input matInput 
                         formControlName="name"
                         placeholder="Ex: warning, check_circle, star"
                         (blur)="onIconChange()">
                  <mat-hint>Use nomes de ícones do Material Icons</mat-hint>
                </mat-form-field>

                <!-- Icon Position -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Posição do Ícone</mat-label>
                  <mat-select formControlName="position" (selectionChange)="onIconChange()">
                    <mat-option value="before">Antes do Texto</mat-option>
                    <mat-option value="after">Depois do Texto</mat-option>
                    <mat-option value="overlay">Sobreposto</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Icon Color -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Cor do Ícone</mat-label>
                  <input matInput 
                         type="color" 
                         formControlName="color"
                         (change)="onIconChange()">
                </mat-form-field>

                <!-- Icon Size -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tamanho do Ícone</mat-label>
                  <input matInput 
                         formControlName="size"
                         placeholder="Ex: 16px, 1.2em, small"
                         (blur)="onIconChange()">
                </mat-form-field>

                <!-- Icon Tooltip -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tooltip do Ícone</mat-label>
                  <input matInput 
                         formControlName="tooltip"
                         placeholder="Texto explicativo (opcional)"
                         (blur)="onIconChange()">
                </mat-form-field>

                <!-- Common Icons -->
                <div class="common-icons">
                  <h6>Ícones Comuns</h6>
                  <div class="icon-grid">
                    <div *ngFor="let icon of commonIcons" 
                         class="icon-option"
                         [class.selected]="iconForm.get('name')?.value === icon.name"
                         (click)="selectIcon(icon.name)">
                      <mat-icon>{{ icon.name }}</mat-icon>
                      <span>{{ icon.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Advanced Tab -->
        <mat-tab label="Avançado">
          <div class="tab-content">
            <form [formGroup]="advancedForm" class="style-form">
              <!-- Custom CSS Class -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Classe CSS Personalizada</mat-label>
                <input matInput 
                       formControlName="className"
                       placeholder="Ex: highlight-cell, error-state"
                       (blur)="onAdvancedChange()">
                <mat-hint>Adicione classes CSS personalizadas</mat-hint>
              </mat-form-field>

              <!-- Tooltip -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tooltip da Célula</mat-label>
                <input matInput 
                       formControlName="tooltip"
                       placeholder="Texto explicativo ao passar o mouse"
                       (blur)="onAdvancedChange()">
              </mat-form-field>

              <!-- Custom CSS Properties -->
              <mat-expansion-panel class="style-section">
                <mat-expansion-panel-header>
                  <mat-panel-title>CSS Personalizado</mat-panel-title>
                  <mat-panel-description>
                    Propriedades CSS avançadas
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="custom-css">
                  <div *ngFor="let prop of customCssProperties; let i = index" 
                       class="css-property">
                    <mat-form-field appearance="outline" class="property-name">
                      <mat-label>Propriedade</mat-label>
                      <input matInput 
                             [(ngModel)]="prop.name"
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Ex: transform, animation"
                             (blur)="onCustomCssChange()">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="property-value">
                      <mat-label>Valor</mat-label>
                      <input matInput 
                             [(ngModel)]="prop.value"
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Ex: scale(1.1), fade-in 0.3s"
                             (blur)="onCustomCssChange()">
                    </mat-form-field>
                    
                    <button mat-icon-button 
                            color="warn"
                            (click)="removeCustomCssProperty(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  
                  <button mat-button 
                          color="primary"
                          (click)="addCustomCssProperty()">
                    <mat-icon>add</mat-icon>
                    Adicionar Propriedade CSS
                  </button>
                </div>
              </mat-expansion-panel>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button mat-button (click)="resetStyles()">
          <mat-icon>refresh</mat-icon>
          Resetar
        </button>
        
        <button mat-button (click)="previewWithSampleData()">
          <mat-icon>preview</mat-icon>
          Preview com Dados
        </button>
        
        <button mat-raised-button 
                color="primary"
                (click)="applyStyles()">
          <mat-icon>check</mat-icon>
          Aplicar Estilos
        </button>
      </div>
    </div>
  `,
  styles: [`
    .style-designer {
      padding: 16px;
    }

    .preview-section {
      margin-bottom: 24px;
      padding: 16px;
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 8px;
      background: var(--mdc-theme-surface-variant);
    }

    .preview-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .preview-cell {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      min-width: 120px;
      min-height: 36px;
      transition: all 0.2s ease;
    }

    .preview-icon {
      font-family: 'Material Icons';
      font-size: 16px;
      line-height: 1;
    }

    .preview-icon.overlay {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }

    .preview-text {
      flex: 1;
    }

    .preview-info {
      color: var(--mdc-theme-on-surface-variant);
    }

    .style-tabs {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .style-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .style-section {
      margin-bottom: 16px;
    }

    .color-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .color-input {
      max-width: 200px;
    }

    .color-presets h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .preset-colors {
      display: grid;
      grid-template-columns: repeat(8, 32px);
      gap: 4px;
    }

    .color-preset {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }

    .color-preset:hover {
      border-color: var(--mdc-theme-primary);
    }

    .color-preset.text-preset {
      border: 2px solid #ccc;
    }

    .full-width {
      width: 100%;
    }

    .border-config,
    .shadow-config,
    .spacing-config,
    .icon-config {
      padding-top: 16px;
    }

    .effect-section {
      margin-bottom: 24px;
    }

    .effect-section h5 {
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .opacity-slider {
      width: 100%;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
      margin-top: 8px;
    }

    .shadow-controls {
      margin-top: 16px;
    }

    .shadow-presets h6 {
      margin: 16px 0 8px 0;
      font-size: 14px;
    }

    .preset-shadows {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .shadow-preset {
      padding: 8px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      transition: transform 0.2s ease;
    }

    .shadow-preset:hover {
      transform: translateY(-2px);
    }

    .common-icons h6 {
      margin: 16px 0 8px 0;
      font-size: 14px;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .icon-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--mdc-theme-outline);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .icon-option:hover {
      background: var(--mdc-theme-surface-variant);
    }

    .icon-option.selected {
      border-color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
    }

    .icon-option span {
      font-size: 10px;
      margin-top: 4px;
      text-align: center;
    }

    .custom-css {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .css-property {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .property-name {
      flex: 1;
    }

    .property-value {
      flex: 2;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid var(--mdc-theme-outline-variant);
    }
  `]
})
export class StyleDesignerComponent implements OnInit, OnChanges {
  @Input() styles: CellStyles = {};
  @Input() previewData: any[] = [];
  
  @Output() stylesChanged = new EventEmitter<CellStyles>();

  styleForm: FormGroup;
  borderForm: FormGroup;
  effectsForm: FormGroup;
  iconForm: FormGroup;
  advancedForm: FormGroup;

  previewText = 'Exemplo';
  currentIcon: IconConfig | null = null;
  customCssProperties: { name: string; value: string }[] = [];

  backgroundPresets = [
    { name: 'Branco', value: '#ffffff' },
    { name: 'Cinza Claro', value: '#f5f5f5' },
    { name: 'Azul Claro', value: '#e3f2fd' },
    { name: 'Verde Claro', value: '#e8f5e8' },
    { name: 'Amarelo Claro', value: '#fff9c4' },
    { name: 'Rosa Claro', value: '#fce4ec' },
    { name: 'Laranja Claro', value: '#fff3e0' },
    { name: 'Roxo Claro', value: '#f3e5f5' }
  ];

  textPresets = [
    { name: 'Preto', value: '#000000' },
    { name: 'Cinza Escuro', value: '#424242' },
    { name: 'Azul', value: '#1976d2' },
    { name: 'Verde', value: '#2e7d32' },
    { name: 'Vermelho', value: '#c62828' },
    { name: 'Laranja', value: '#ef6c00' },
    { name: 'Roxo', value: '#7b1fa2' },
    { name: 'Branco', value: '#ffffff' }
  ];

  shadowPresets = [
    { name: 'Suave', value: '0 1px 3px rgba(0,0,0,0.1)' },
    { name: 'Médio', value: '0 2px 6px rgba(0,0,0,0.15)' },
    { name: 'Forte', value: '0 4px 12px rgba(0,0,0,0.2)' },
    { name: 'Interno', value: 'inset 0 1px 3px rgba(0,0,0,0.1)' }
  ];

  commonIcons = [
    { name: 'check_circle', label: 'Sucesso' },
    { name: 'warning', label: 'Aviso' },
    { name: 'error', label: 'Erro' },
    { name: 'info', label: 'Info' },
    { name: 'star', label: 'Estrela' },
    { name: 'favorite', label: 'Favorito' },
    { name: 'thumb_up', label: 'Like' },
    { name: 'flag', label: 'Flag' },
    { name: 'priority_high', label: 'Alta Prioridade' },
    { name: 'schedule', label: 'Agendado' },
    { name: 'done', label: 'Feito' },
    { name: 'trending_up', label: 'Crescimento' }
  ];

  constructor(private fb: FormBuilder) {
    this.styleForm = this.createStyleForm();
    this.borderForm = this.createBorderForm();
    this.effectsForm = this.createEffectsForm();
    this.iconForm = this.createIconForm();
    this.advancedForm = this.createAdvancedForm();
  }

  ngOnInit(): void {
    this.updatePreviewText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['styles']) {
      this.loadStylesIntoForms();
    }
    if (changes['previewData']) {
      this.updatePreviewText();
    }
  }

  private createStyleForm(): FormGroup {
    return this.fb.group({
      backgroundColor: [''],
      textColor: [''],
      fontWeight: ['normal'],
      fontStyle: ['normal'],
      textDecoration: ['none'],
      fontSize: [''],
      transparentBackground: [false]
    });
  }

  private createBorderForm(): FormGroup {
    return this.fb.group({
      enabled: [false],
      width: ['1px'],
      style: ['solid'],
      color: ['#cccccc'],
      radius: ['']
    });
  }

  private createEffectsForm(): FormGroup {
    return this.fb.group({
      opacity: [1],
      shadowEnabled: [false],
      boxShadow: [''],
      padding: [''],
      margin: ['']
    });
  }

  private createIconForm(): FormGroup {
    return this.fb.group({
      enabled: [false],
      name: [''],
      position: ['before'],
      color: [''],
      size: [''],
      tooltip: ['']
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.fb.group({
      className: [''],
      tooltip: ['']
    });
  }

  private loadStylesIntoForms(): void {
    // Load main styles
    this.styleForm.patchValue({
      backgroundColor: this.styles.backgroundColor || '',
      textColor: this.styles.textColor || '',
      fontWeight: this.styles.fontWeight || 'normal',
      fontStyle: this.styles.fontStyle || 'normal',
      textDecoration: this.styles.textDecoration || 'none',
      fontSize: this.styles.fontSize || '',
      transparentBackground: !this.styles.backgroundColor
    });

    // Load border styles
    if (this.styles.border) {
      this.borderForm.patchValue({
        enabled: true,
        width: this.styles.border.width || '1px',
        style: this.styles.border.style || 'solid',
        color: this.styles.border.color || '#cccccc',
        radius: this.styles.border.radius || ''
      });
    }

    // Load effects
    this.effectsForm.patchValue({
      opacity: this.styles.opacity || 1,
      shadowEnabled: !!this.styles.boxShadow,
      boxShadow: this.styles.boxShadow || '',
      padding: this.styles.padding || '',
      margin: this.styles.margin || ''
    });

    // Load icon
    if (this.styles.icon) {
      this.currentIcon = this.styles.icon;
      this.iconForm.patchValue({
        enabled: true,
        name: this.styles.icon.name || '',
        position: this.styles.icon.position || 'before',
        color: this.styles.icon.color || '',
        size: this.styles.icon.size || '',
        tooltip: this.styles.icon.tooltip || ''
      });
    }

    // Load advanced
    this.advancedForm.patchValue({
      className: this.styles.className || '',
      tooltip: this.styles.tooltip || ''
    });

    // Load custom CSS
    if (this.styles.customCss) {
      this.customCssProperties = Object.entries(this.styles.customCss).map(([name, value]) => ({
        name,
        value: String(value)
      }));
    }
  }

  private updatePreviewText(): void {
    if (this.previewData && this.previewData.length > 0) {
      const firstRow = this.previewData[0];
      const firstValue = Object.values(firstRow)[0];
      this.previewText = String(firstValue || 'Exemplo');
    }
  }

  // Event Handlers
  onStyleChange(): void {
    this.emitStyles();
  }

  onBorderToggle(enabled: boolean): void {
    if (!enabled) {
      this.borderForm.patchValue({
        width: '1px',
        style: 'solid',
        color: '#cccccc',
        radius: ''
      });
    }
    this.emitStyles();
  }

  onBorderChange(): void {
    this.emitStyles();
  }

  onEffectsChange(): void {
    this.emitStyles();
  }

  onIconToggle(enabled: boolean): void {
    if (!enabled) {
      this.currentIcon = null;
      this.iconForm.patchValue({
        name: '',
        position: 'before',
        color: '',
        size: '',
        tooltip: ''
      });
    }
    this.emitStyles();
  }

  onIconChange(): void {
    if (this.iconForm.get('enabled')?.value) {
      this.currentIcon = {
        name: this.iconForm.get('name')?.value || '',
        position: this.iconForm.get('position')?.value || 'before',
        color: this.iconForm.get('color')?.value || '',
        size: this.iconForm.get('size')?.value || '',
        tooltip: this.iconForm.get('tooltip')?.value || ''
      };
    } else {
      this.currentIcon = null;
    }
    this.emitStyles();
  }

  onAdvancedChange(): void {
    this.emitStyles();
  }

  onCustomCssChange(): void {
    this.emitStyles();
  }

  // Quick Actions
  setBackgroundColor(color: string): void {
    this.styleForm.patchValue({ backgroundColor: color, transparentBackground: false });
    this.onStyleChange();
  }

  setTextColor(color: string): void {
    this.styleForm.patchValue({ textColor: color });
    this.onStyleChange();
  }

  setShadow(shadow: string): void {
    this.effectsForm.patchValue({ boxShadow: shadow, shadowEnabled: true });
    this.onEffectsChange();
  }

  selectIcon(iconName: string): void {
    this.iconForm.patchValue({ name: iconName, enabled: true });
    this.onIconChange();
  }

  addCustomCssProperty(): void {
    this.customCssProperties.push({ name: '', value: '' });
  }

  removeCustomCssProperty(index: number): void {
    this.customCssProperties.splice(index, 1);
    this.onCustomCssChange();
  }

  resetStyles(): void {
    this.styleForm.reset({
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      transparentBackground: false
    });
    this.borderForm.reset({
      enabled: false,
      width: '1px',
      style: 'solid',
      color: '#cccccc'
    });
    this.effectsForm.reset({
      opacity: 1,
      shadowEnabled: false
    });
    this.iconForm.reset({
      enabled: false,
      position: 'before'
    });
    this.advancedForm.reset();
    this.customCssProperties = [];
    this.currentIcon = null;
    this.emitStyles();
  }

  previewWithSampleData(): void {
    this.updatePreviewText();
  }

  applyStyles(): void {
    this.emitStyles();
  }

  // Helper Methods
  getPreviewStyles(): any {
    const formValues = this.styleForm.value;
    const borderValues = this.borderForm.value;
    const effectsValues = this.effectsForm.value;

    const styles: any = {};

    // Basic styles
    if (formValues.backgroundColor && !formValues.transparentBackground) {
      styles['background-color'] = formValues.backgroundColor;
    }
    if (formValues.textColor) {
      styles['color'] = formValues.textColor;
    }
    if (formValues.fontWeight && formValues.fontWeight !== 'normal') {
      styles['font-weight'] = formValues.fontWeight;
    }
    if (formValues.fontStyle && formValues.fontStyle !== 'normal') {
      styles['font-style'] = formValues.fontStyle;
    }
    if (formValues.textDecoration && formValues.textDecoration !== 'none') {
      styles['text-decoration'] = formValues.textDecoration;
    }
    if (formValues.fontSize) {
      styles['font-size'] = formValues.fontSize;
    }

    // Border styles
    if (borderValues.enabled) {
      styles['border'] = `${borderValues.width} ${borderValues.style} ${borderValues.color}`;
      if (borderValues.radius) {
        styles['border-radius'] = borderValues.radius;
      }
    }

    // Effects
    if (effectsValues.opacity !== 1) {
      styles['opacity'] = effectsValues.opacity;
    }
    if (effectsValues.shadowEnabled && effectsValues.boxShadow) {
      styles['box-shadow'] = effectsValues.boxShadow;
    }
    if (effectsValues.padding) {
      styles['padding'] = effectsValues.padding;
    }
    if (effectsValues.margin) {
      styles['margin'] = effectsValues.margin;
    }

    return styles;
  }

  private emitStyles(): void {
    const cellStyles: CellStyles = {};

    // Basic styles
    const styleValues = this.styleForm.value;
    if (styleValues.backgroundColor && !styleValues.transparentBackground) {
      cellStyles.backgroundColor = styleValues.backgroundColor;
    }
    if (styleValues.textColor) {
      cellStyles.textColor = styleValues.textColor;
    }
    if (styleValues.fontWeight && styleValues.fontWeight !== 'normal') {
      cellStyles.fontWeight = styleValues.fontWeight;
    }
    if (styleValues.fontStyle && styleValues.fontStyle !== 'normal') {
      cellStyles.fontStyle = styleValues.fontStyle;
    }
    if (styleValues.textDecoration && styleValues.textDecoration !== 'none') {
      cellStyles.textDecoration = styleValues.textDecoration;
    }
    if (styleValues.fontSize) {
      cellStyles.fontSize = styleValues.fontSize;
    }

    // Border
    const borderValues = this.borderForm.value;
    if (borderValues.enabled) {
      cellStyles.border = {
        width: borderValues.width,
        style: borderValues.style,
        color: borderValues.color,
        radius: borderValues.radius
      };
      if (borderValues.radius) {
        cellStyles.borderRadius = borderValues.radius;
      }
    }

    // Effects
    const effectsValues = this.effectsForm.value;
    if (effectsValues.opacity !== 1) {
      cellStyles.opacity = effectsValues.opacity;
    }
    if (effectsValues.shadowEnabled && effectsValues.boxShadow) {
      cellStyles.boxShadow = effectsValues.boxShadow;
    }
    if (effectsValues.padding) {
      cellStyles.padding = effectsValues.padding;
    }
    if (effectsValues.margin) {
      cellStyles.margin = effectsValues.margin;
    }

    // Icon
    if (this.currentIcon && this.iconForm.get('enabled')?.value) {
      cellStyles.icon = { ...this.currentIcon };
    }

    // Advanced
    const advancedValues = this.advancedForm.value;
    if (advancedValues.className) {
      cellStyles.className = advancedValues.className;
    }
    if (advancedValues.tooltip) {
      cellStyles.tooltip = advancedValues.tooltip;
    }

    // Custom CSS
    if (this.customCssProperties.length > 0) {
      cellStyles.customCss = {};
      this.customCssProperties.forEach(prop => {
        if (prop.name && prop.value) {
          cellStyles.customCss![prop.name] = prop.value;
        }
      });
    }

    this.stylesChanged.emit(cellStyles);
  }
}