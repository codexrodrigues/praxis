import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import {
  ColumnDataType,
  FormatterConfig,
  DATE_PRESETS,
  NUMBER_PRESETS,
  CURRENCY_PRESETS,
  PERCENTAGE_PRESETS,
  STRING_PRESETS,
  BOOLEAN_PRESETS,
  FormatPreset,
} from './data-formatter-types';
import { DataFormattingService } from './data-formatting.service';

@Component({
  selector: 'data-formatter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="data-formatter">
      <!-- Header -->
      <div class="formatter-header">
        <mat-icon class="header-icon">{{ getTypeIcon() }}</mat-icon>
        <div class="header-content">
          <h4>Formatação de {{ getTypeLabel() }}</h4>
          <p class="header-description">{{ getTypeDescription() }}</p>
        </div>
      </div>

      <!-- Date Formatting -->
      <div *ngIf="columnType === 'date'" class="format-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Formato de Data</mat-label>
          <mat-select
            [(ngModel)]="selectedPreset"
            (ngModelChange)="onPresetChange()"
          >
            <mat-option
              *ngFor="let preset of datePresets"
              [value]="preset.value"
            >
              <div class="preset-option">
                <div class="preset-content">
                  <span class="preset-label">{{ preset.label }}</span>
                  <span class="preset-description">{{
                    preset.description
                  }}</span>
                </div>
                <span class="preset-example">{{ preset.example }}</span>
              </div>
            </mat-option>
          </mat-select>
          <mat-hint>Escolha um formato predefinido ou personalize</mat-hint>
        </mat-form-field>

        <mat-form-field
          *ngIf="selectedPreset === 'custom'"
          appearance="outline"
          class="full-width"
        >
          <mat-label>Formato Personalizado</mat-label>
          <input
            matInput
            [(ngModel)]="customFormat"
            (ngModelChange)="onCustomFormatChange()"
            placeholder="dd/MM/yyyy HH:mm:ss"
            matTooltip="Use padrões do Angular DatePipe: dd, MM, yyyy, HH, mm, ss"
          />
          <mat-hint>Ex: dd/MM/yyyy, HH:mm:ss, EEE dd/MM</mat-hint>
        </mat-form-field>
      </div>

      <!-- Number Formatting -->
      <div *ngIf="columnType === 'number'" class="format-section">
        <div class="format-row">
          <mat-form-field appearance="outline" class="decimal-select">
            <mat-label>Casas Decimais</mat-label>
            <mat-select
              [(ngModel)]="decimalMode"
              (ngModelChange)="onDecimalModeChange()"
            >
              <mat-option value="0">Nenhuma (1.234)</mat-option>
              <mat-option value="1">1 fixa (1.234,5)</mat-option>
              <mat-option value="2">2 fixas (1.234,56)</mat-option>
              <mat-option value="3">3 fixas (1.234,567)</mat-option>
              <mat-option value="variable">Variável (0-3)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-checkbox
            [(ngModel)]="thousandsSeparator"
            (ngModelChange)="onFormatOptionChange()"
            class="format-checkbox"
          >
            Separador de milhares
          </mat-checkbox>
        </div>

        <mat-form-field
          *ngIf="decimalMode === 'variable'"
          appearance="outline"
          class="full-width"
        >
          <mat-label>Faixa de Decimais</mat-label>
          <mat-select
            [(ngModel)]="variableRange"
            (ngModelChange)="onFormatOptionChange()"
          >
            <mat-option value="0-1">0 a 1 casa</mat-option>
            <mat-option value="0-2">0 a 2 casas</mat-option>
            <mat-option value="0-3">0 a 3 casas</mat-option>
            <mat-option value="1-3">1 a 3 casas</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Currency Formatting -->
      <div *ngIf="columnType === 'currency'" class="format-section">
        <div class="format-row">
          <mat-form-field appearance="outline" class="currency-select">
            <mat-label>Moeda</mat-label>
            <mat-select
              [(ngModel)]="currencyCode"
              (ngModelChange)="onFormatOptionChange()"
            >
              <mat-option value="BRL">Real Brasileiro (R$)</mat-option>
              <mat-option value="USD">Dólar Americano (US$)</mat-option>
              <mat-option value="EUR">Euro (€)</mat-option>
              <mat-option value="GBP">Libra Esterlina (£)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="decimal-select">
            <mat-label>Casas Decimais</mat-label>
            <mat-select
              [(ngModel)]="currencyDecimals"
              (ngModelChange)="onFormatOptionChange()"
            >
              <mat-option value="0">Nenhuma</mat-option>
              <mat-option value="2">2 casas</mat-option>
              <mat-option value="3">3 casas</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="format-row">
          <mat-checkbox
            [(ngModel)]="currencySymbol"
            (ngModelChange)="onFormatOptionChange()"
            class="format-checkbox"
          >
            Exibir símbolo da moeda
          </mat-checkbox>

          <mat-checkbox
            [(ngModel)]="currencyThousands"
            (ngModelChange)="onFormatOptionChange()"
            class="format-checkbox"
          >
            Separador de milhares
          </mat-checkbox>
        </div>
      </div>

      <!-- Percentage Formatting -->
      <div *ngIf="columnType === 'percentage'" class="format-section">
        <div class="format-row">
          <mat-form-field appearance="outline" class="decimal-select">
            <mat-label>Casas Decimais</mat-label>
            <mat-select
              [(ngModel)]="percentageDecimals"
              (ngModelChange)="onFormatOptionChange()"
            >
              <mat-option value="0">Nenhuma (12%)</mat-option>
              <mat-option value="1">1 casa (12,3%)</mat-option>
              <mat-option value="2">2 casas (12,34%)</mat-option>
              <mat-option value="3">3 casas (12,345%)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-checkbox
          [(ngModel)]="percentageMultiplier"
          (ngModelChange)="onFormatOptionChange()"
          class="format-checkbox"
        >
          Multiplicar por 100 (0.15 → 15%)
        </mat-checkbox>
      </div>

      <!-- String Formatting -->
      <div *ngIf="columnType === 'string'" class="format-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Transformação de Texto</mat-label>
          <mat-select
            [(ngModel)]="stringTransform"
            (ngModelChange)="onFormatOptionChange()"
          >
            <mat-option
              *ngFor="let preset of stringPresets"
              [value]="preset.value"
            >
              <div class="preset-option">
                <span class="preset-label">{{ preset.label }}</span>
                <span class="preset-example">{{ preset.example }}</span>
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="format-row">
          <mat-checkbox
            [(ngModel)]="enableTruncate"
            (ngModelChange)="onTruncateToggle()"
            class="format-checkbox"
          >
            Truncar texto longo
          </mat-checkbox>
        </div>

        <div *ngIf="enableTruncate" class="truncate-options">
          <div class="format-row">
            <mat-form-field appearance="outline" class="truncate-length">
              <mat-label>Tamanho Máximo</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="truncateLength"
                (ngModelChange)="onFormatOptionChange()"
                [min]="1"
                [max]="500"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="truncate-suffix">
              <mat-label>Sufixo</mat-label>
              <input
                matInput
                [(ngModel)]="truncateSuffix"
                (ngModelChange)="onFormatOptionChange()"
                placeholder="..."
              />
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Boolean Formatting -->
      <div *ngIf="columnType === 'boolean'" class="format-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Exibição de Valores</mat-label>
          <mat-select
            [(ngModel)]="booleanDisplay"
            (ngModelChange)="onBooleanDisplayChange()"
          >
            <mat-option
              *ngFor="let preset of booleanPresets"
              [value]="preset.value"
            >
              <div class="preset-option">
                <span class="preset-label">{{ preset.label }}</span>
                <span class="preset-example">{{ preset.example }}</span>
              </div>
            </mat-option>
            <mat-option value="custom">Personalizado</mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="booleanDisplay === 'custom'" class="custom-boolean">
          <div class="format-row">
            <mat-form-field appearance="outline" class="boolean-value">
              <mat-label>Texto para Verdadeiro</mat-label>
              <input
                matInput
                [(ngModel)]="customTrueValue"
                (ngModelChange)="onFormatOptionChange()"
                placeholder="Verdadeiro"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="boolean-value">
              <mat-label>Texto para Falso</mat-label>
              <input
                matInput
                [(ngModel)]="customFalseValue"
                (ngModelChange)="onFormatOptionChange()"
                placeholder="Falso"
              />
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div *ngIf="previewValue" class="preview-section">
        <mat-divider></mat-divider>
        <div class="preview-content">
          <mat-icon class="preview-icon">visibility</mat-icon>
          <div class="preview-text">
            <span class="preview-label">Pré-visualização:</span>
            <span class="preview-value">{{ previewValue }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .data-formatter {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .formatter-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .header-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--mat-sys-primary);
      }

      .header-content h4 {
        margin: 0 0 4px 0;
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }

      .header-description {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .format-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .format-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .full-width {
        width: 100%;
      }

      .decimal-select,
      .currency-select {
        min-width: 200px;
        flex: 1;
      }

      .truncate-length {
        flex: 1;
        min-width: 120px;
      }

      .truncate-suffix {
        flex: 1;
        min-width: 100px;
      }

      .boolean-value {
        flex: 1;
        min-width: 150px;
      }

      .format-checkbox {
        margin-right: 16px;
      }

      .preset-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 4px 0;
      }

      .preset-content {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .preset-label {
        font-weight: 500;
        font-size: 0.9rem;
      }

      .preset-description {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .preset-example {
        font-family: monospace;
        font-size: 0.8rem;
        color: var(--mat-sys-primary);
        background-color: var(--mat-sys-primary-container);
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
      }

      .truncate-options {
        margin-left: 24px;
        padding-left: 16px;
        border-left: 2px solid var(--mat-sys-outline-variant);
      }

      .custom-boolean {
        margin-top: 8px;
      }

      .preview-section {
        margin-top: 16px;
      }

      .preview-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: var(--mat-sys-surface-container);
        border-radius: 8px;
        margin-top: 16px;
      }

      .preview-icon {
        color: var(--mat-sys-secondary);
      }

      .preview-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .preview-label {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .preview-value {
        font-family: monospace;
        font-size: 1rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
        background-color: var(--mat-sys-surface-container-high);
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid var(--mat-sys-outline-variant);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .format-row {
          flex-direction: column;
          align-items: stretch;
        }

        .decimal-select,
        .currency-select,
        .truncate-length,
        .truncate-suffix,
        .boolean-value {
          min-width: unset;
          width: 100%;
        }

        .format-checkbox {
          margin-right: 0;
          margin-bottom: 8px;
        }
      }
    `,
  ],
})
export class DataFormatterComponent implements OnInit, OnChanges {
  @Input() columnType: ColumnDataType = 'string';
  @Input() currentFormat: string = '';

  @Output() formatChange = new EventEmitter<string>();

  // Preset data
  datePresets = DATE_PRESETS;
  numberPresets = NUMBER_PRESETS;
  currencyPresets = CURRENCY_PRESETS;
  percentagePresets = PERCENTAGE_PRESETS;
  stringPresets = STRING_PRESETS;
  booleanPresets = BOOLEAN_PRESETS;

  // Date formatting state
  selectedPreset = 'shortDate';
  customFormat = '';

  // Number formatting state
  decimalMode = '2';
  variableRange = '0-2';
  thousandsSeparator = true;

  // Currency formatting state
  currencyCode = 'BRL';
  currencyDecimals = '2';
  currencySymbol = true;
  currencyThousands = true;

  // Percentage formatting state
  percentageDecimals = '1';
  percentageMultiplier = true;

  // String formatting state
  stringTransform = 'none';
  enableTruncate = false;
  truncateLength = 50;
  truncateSuffix = '...';

  // Boolean formatting state
  booleanDisplay = 'true-false';
  customTrueValue = 'Verdadeiro';
  customFalseValue = 'Falso';

  // Preview
  previewValue = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private formattingService: DataFormattingService,
  ) {}

  ngOnInit(): void {
    this.parseCurrentFormat();
    this.generatePreview();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFormat'] && !changes['currentFormat'].firstChange) {
      this.parseCurrentFormat();
    }
    if (changes['columnType']) {
      this.generatePreview();
    }
  }

  getTypeIcon(): string {
    switch (this.columnType) {
      case 'date':
        return 'calendar_today';
      case 'number':
        return 'numbers';
      case 'currency':
        return 'attach_money';
      case 'percentage':
        return 'percent';
      case 'string':
        return 'text_fields';
      case 'boolean':
        return 'toggle_on';
      default:
        return 'format_shapes';
    }
  }

  getTypeLabel(): string {
    switch (this.columnType) {
      case 'date':
        return 'Data';
      case 'number':
        return 'Número';
      case 'currency':
        return 'Moeda';
      case 'percentage':
        return 'Percentual';
      case 'string':
        return 'Texto';
      case 'boolean':
        return 'Booleano';
      default:
        return 'Dados';
    }
  }

  getTypeDescription(): string {
    switch (this.columnType) {
      case 'date':
        return 'Configure como as datas serão exibidas';
      case 'number':
        return 'Defina a formatação de números';
      case 'currency':
        return 'Configure a exibição de valores monetários';
      case 'percentage':
        return 'Formate a exibição de percentuais';
      case 'string':
        return 'Transforme a apresentação de texto';
      case 'boolean':
        return 'Escolha como exibir valores verdadeiro/falso';
      default:
        return 'Configure a formatação dos dados';
    }
  }

  private parseCurrentFormat(): void {
    if (!this.currentFormat) {
      this.setDefaultValues();
      return;
    }

    // Parse the current format based on column type
    switch (this.columnType) {
      case 'date':
        this.parseDateFormat();
        break;
      case 'number':
        this.parseNumberFormat();
        break;
      case 'currency':
        this.parseCurrencyFormat();
        break;
      case 'percentage':
        this.parsePercentageFormat();
        break;
      case 'string':
        this.parseStringFormat();
        break;
      case 'boolean':
        this.parseBooleanFormat();
        break;
    }

    this.generatePreview();
    this.cdr.markForCheck();
  }

  private setDefaultValues(): void {
    switch (this.columnType) {
      case 'date':
        this.selectedPreset = 'shortDate';
        break;
      case 'number':
        this.decimalMode = '2';
        this.thousandsSeparator = true;
        break;
      case 'currency':
        this.currencyCode = 'BRL';
        this.currencyDecimals = '2';
        break;
      case 'percentage':
        this.percentageDecimals = '1';
        break;
      case 'string':
        this.stringTransform = 'none';
        break;
      case 'boolean':
        this.booleanDisplay = 'true-false';
        break;
    }
  }

  private parseDateFormat(): void {
    const presetMatch = this.datePresets.find(
      (p) => p.value === this.currentFormat,
    );
    if (presetMatch) {
      this.selectedPreset = presetMatch.value;
    } else {
      this.selectedPreset = 'custom';
      this.customFormat = this.currentFormat;
    }
  }

  private parseNumberFormat(): void {
    // Parse format like "1.2-2" or "1.0-3"
    const match = this.currentFormat.match(/1\.(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      if (min === max) {
        this.decimalMode = min.toString();
      } else {
        this.decimalMode = 'variable';
        this.variableRange = `${min}-${max}`;
      }
    }
    this.thousandsSeparator = !this.currentFormat.includes('|nosep');
  }

  private parseCurrencyFormat(): void {
    // Parse format like "BRL|symbol|2"
    const parts = this.currentFormat.split('|');
    if (parts.length >= 3) {
      this.currencyCode = parts[0];
      this.currencySymbol = parts[1] === 'symbol';
      this.currencyDecimals = parts[2];
      this.currencyThousands = !parts.includes('nosep');
    }
  }

  private parsePercentageFormat(): void {
    this.percentageMultiplier = this.currentFormat.includes('|x100');
    const format = this.currentFormat.replace('|x100', '');
    const match = format.match(/1\.(\d+)-(\d+)/);
    if (match) {
      this.percentageDecimals = match[2];
    }
  }

  private parseStringFormat(): void {
    if (this.currentFormat.includes('|truncate|')) {
      const parts = this.currentFormat.split('|');
      this.stringTransform = parts[0];
      this.enableTruncate = true;
      this.truncateLength = parseInt(parts[2]) || 50;
      this.truncateSuffix = parts[3] || '...';
    } else {
      this.stringTransform = this.currentFormat || 'none';
    }
  }

  private parseBooleanFormat(): void {
    if (this.currentFormat.includes('|custom|')) {
      const parts = this.currentFormat.split('|');
      this.booleanDisplay = 'custom';
      this.customTrueValue = parts[2] || 'Verdadeiro';
      this.customFalseValue = parts[3] || 'Falso';
    } else {
      this.booleanDisplay = this.currentFormat || 'true-false';
    }
  }

  // Event handlers
  onPresetChange(): void {
    this.generateFormatString();
  }

  onCustomFormatChange(): void {
    this.generateFormatString();
  }

  onDecimalModeChange(): void {
    this.generateFormatString();
  }

  onFormatOptionChange(): void {
    this.generateFormatString();
  }

  onTruncateToggle(): void {
    this.generateFormatString();
  }

  onBooleanDisplayChange(): void {
    this.generateFormatString();
  }

  private generateFormatString(): void {
    let formatString = '';

    switch (this.columnType) {
      case 'date':
        formatString =
          this.selectedPreset === 'custom'
            ? this.customFormat
            : this.selectedPreset;
        break;

      case 'number':
        if (this.decimalMode === 'variable') {
          const [min, max] = this.variableRange.split('-');
          formatString = `1.${min}-${max}`;
        } else {
          formatString = `1.${this.decimalMode}-${this.decimalMode}`;
        }
        if (!this.thousandsSeparator) {
          formatString += '|nosep';
        }
        break;

      case 'currency':
        const symbolType = this.currencySymbol ? 'symbol' : 'code';
        formatString = `${this.currencyCode}|${symbolType}|${this.currencyDecimals}`;
        if (!this.currencyThousands) {
          formatString += '|nosep';
        }
        break;

      case 'percentage':
        formatString = `1.${this.percentageDecimals}-${this.percentageDecimals}`;
        if (this.percentageMultiplier) {
          formatString += '|x100';
        }
        break;

      case 'string':
        formatString = this.stringTransform;
        if (this.enableTruncate) {
          formatString += `|truncate|${this.truncateLength}|${this.truncateSuffix}`;
        }
        break;

      case 'boolean':
        if (this.booleanDisplay === 'custom') {
          formatString = `custom|${this.customTrueValue}|${this.customFalseValue}`;
        } else {
          formatString = this.booleanDisplay;
        }
        break;
    }

    this.formatChange.emit(formatString);
    this.generatePreview();
    this.cdr.markForCheck();
  }

  private generatePreview(): void {
    // Generate a preview using the actual DataFormattingService for accuracy
    const formatString = this.getCurrentFormatString();
    if (!formatString) {
      this.previewValue = '';
      return;
    }

    const sampleValue = this.getSampleValue();
    try {
      this.previewValue = this.formattingService.formatValue(
        sampleValue,
        this.columnType,
        formatString,
      );
    } catch (error) {
      this.previewValue = 'Erro na formatação';
      console.warn('Preview generation error:', error);
    }
  }

  /**
   * Get appropriate sample value for each data type
   */
  private getSampleValue(): any {
    switch (this.columnType) {
      case 'date':
        return new Date(); // Current date and time
      case 'number':
        return 1234.5678;
      case 'currency':
        return 1234.56;
      case 'percentage':
        return this.percentageMultiplier ? 0.12345 : 12.345; // Depends on multiplier setting
      case 'string':
        return 'Exemplo de Texto Longo Para Demonstrar Formatação';
      case 'boolean':
        return true;
      default:
        return null;
    }
  }

  /**
   * Get the current format string based on component state
   */
  private getCurrentFormatString(): string {
    switch (this.columnType) {
      case 'date':
        return this.selectedPreset === 'custom'
          ? this.customFormat
          : this.selectedPreset;
      case 'number':
        if (this.decimalMode === 'variable') {
          const [min, max] = this.variableRange.split('-');
          return `1.${min}-${max}${!this.thousandsSeparator ? '|nosep' : ''}`;
        } else {
          return `1.${this.decimalMode}-${this.decimalMode}${!this.thousandsSeparator ? '|nosep' : ''}`;
        }
      case 'currency':
        const symbolType = this.currencySymbol ? 'symbol' : 'code';
        return `${this.currencyCode}|${symbolType}|${this.currencyDecimals}${!this.currencyThousands ? '|nosep' : ''}`;
      case 'percentage':
        return `1.${this.percentageDecimals}-${this.percentageDecimals}${this.percentageMultiplier ? '|x100' : ''}`;
      case 'string':
        let format = this.stringTransform;
        if (this.enableTruncate) {
          format += `|truncate|${this.truncateLength}|${this.truncateSuffix}`;
        }
        return format;
      case 'boolean':
        if (this.booleanDisplay === 'custom') {
          return `custom|${this.customTrueValue}|${this.customFalseValue}`;
        } else {
          return this.booleanDisplay;
        }
      default:
        return '';
    }
  }
}
