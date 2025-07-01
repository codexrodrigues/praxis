import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

import { ColumnDefinition } from '@praxis/core';
import { ConditionalStyle, CellStyles, TableRuleEngineService } from './table-rule-engine.service';

interface PreviewRow {
  originalData: any;
  cellValue: any;
  appliedStyles: CellStyles | null;
  appliedRuleId: string | null;
  appliedRuleName: string | null;
  rowIndex: number;
}

@Component({
  selector: 'style-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="style-preview">
      <!-- Preview Header -->
      <div class="preview-header">
        <div class="header-info">
          <h4>
            <mat-icon>preview</mat-icon>
            Preview das Regras de Estilo
          </h4>
          <p>Veja como suas regras são aplicadas aos dados de exemplo</p>
        </div>
        
        <div class="preview-stats">
          <mat-chip class="stat-chip">
            <mat-icon>rule</mat-icon>
            {{ enabledRulesCount }} regra(s) ativa(s)
          </mat-chip>
          
          <mat-chip class="stat-chip">
            <mat-icon>data_array</mat-icon>
            {{ previewRows.length }} linha(s) de exemplo
          </mat-chip>
          
          <mat-chip 
            class="stat-chip coverage-chip"
            [class.good-coverage]="coveragePercentage >= 50"
            [class.low-coverage]="coveragePercentage < 50">
            <mat-icon>analytics</mat-icon>
            {{ coveragePercentage }}% cobertura
          </mat-chip>
        </div>
      </div>

      <!-- No Data State -->
      <div *ngIf="previewRows.length === 0" class="no-data-state">
        <mat-icon class="no-data-icon">table_view</mat-icon>
        <h4>Nenhum dado de exemplo disponível</h4>
        <p>Adicione dados de exemplo para ver como suas regras de estilo são aplicadas</p>
      </div>

      <!-- Preview Table -->
      <div *ngIf="previewRows.length > 0" class="preview-table-container">
        <table mat-table [dataSource]="previewRows" class="preview-table">
          <!-- Row Index Column -->
          <ng-container matColumnDef="rowIndex">
            <th mat-header-cell *matHeaderCellDef class="index-header">#</th>
            <td mat-cell *matCellDef="let row" class="index-cell">{{ row.rowIndex + 1 }}</td>
          </ng-container>

          <!-- Sample Data Columns -->
          <ng-container *ngFor="let col of contextColumns" [matColumnDef]="col.field">
            <th mat-header-cell *matHeaderCellDef class="context-header">
              {{ col.header }}
              <mat-icon 
                *ngIf="col.field === column.field" 
                class="target-column-icon"
                matTooltip="Coluna sendo configurada">
                gps_fixed
              </mat-icon>
            </th>
            <td mat-cell *matCellDef="let row" 
                class="context-cell"
                [class.target-column]="col.field === column.field">
              {{ getDisplayValue(row.originalData, col.field) }}
            </td>
          </ng-container>

          <!-- Styled Result Column -->
          <ng-container matColumnDef="styledResult">
            <th mat-header-cell *matHeaderCellDef class="result-header">
              <mat-icon>palette</mat-icon>
              Resultado com Estilo
            </th>
            <td mat-cell *matCellDef="let row" 
                class="result-cell"
                [style]="getAppliedStyles(row)"
                [class.has-styles]="row.appliedStyles"
                (click)="onStyledCellClick(row)"
                matTooltip="{{ getStyleTooltip(row) }}">
              
              <!-- Cell Content -->
              <span class="cell-content">
                {{ row.cellValue }}
              </span>
              
              <!-- Applied Rule Indicator -->
              <div *ngIf="row.appliedRuleId" class="rule-indicator">
                <mat-chip 
                  class="rule-chip"
                  [style.background-color]="getRuleColor(row.appliedRuleId)"
                  (click)="onRuleChipClick(row.appliedRuleId); $event.stopPropagation()">
                  <mat-icon>rule</mat-icon>
                  {{ row.appliedRuleName }}
                </mat-chip>
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="status-header">Status</th>
            <td mat-cell *matCellDef="let row" class="status-cell">
              <div class="status-indicators">
                <mat-icon 
                  *ngIf="row.appliedStyles"
                  class="status-icon styled"
                  matTooltip="Regra aplicada">
                  check_circle
                </mat-icon>
                
                <mat-icon 
                  *ngIf="!row.appliedStyles"
                  class="status-icon unstyled"
                  matTooltip="Nenhuma regra aplicada">
                  radio_button_unchecked
                </mat-icon>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="preview-row"
              [class.has-applied-rule]="row.appliedRuleId">
          </tr>
        </table>
      </div>

      <!-- Rules Legend -->
      <div *ngIf="conditionalStyles.length > 0" class="rules-legend">
        <h5>
          <mat-icon>legend_toggle</mat-icon>
          Legenda das Regras
        </h5>
        
        <div class="legend-items">
          <div *ngFor="let rule of conditionalStyles" 
               class="legend-item"
               [class.rule-disabled]="!rule.enabled"
               (click)="onRuleChipClick(rule.id)">
            
            <div class="legend-color" 
                 [style.background-color]="rule.styles.backgroundColor || '#f5f5f5'"
                 [style.border-color]="rule.styles.textColor || '#666'">
            </div>
            
            <div class="legend-info">
              <span class="legend-name">{{ rule.name }}</span>
              <span class="legend-description">{{ rule.description || 'Sem descrição' }}</span>
            </div>
            
            <div class="legend-stats">
              <mat-chip 
                class="usage-chip"
                [class.used]="getRuleUsageCount(rule.id) > 0"
                [class.unused]="getRuleUsageCount(rule.id) === 0">
                {{ getRuleUsageCount(rule.id) }} uso(s)
              </mat-chip>
              
              <mat-chip class="priority-chip">
                P{{ rule.priority }}
              </mat-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Coverage Analysis -->
      <div class="coverage-analysis">
        <h5>
          <mat-icon>analytics</mat-icon>
          Análise de Cobertura
        </h5>
        
        <div class="coverage-stats">
          <div class="coverage-item">
            <span class="coverage-label">Linhas com estilo aplicado:</span>
            <span class="coverage-value">{{ styledRowsCount }} de {{ previewRows.length }}</span>
          </div>
          
          <div class="coverage-item">
            <span class="coverage-label">Regras utilizadas:</span>
            <span class="coverage-value">{{ usedRulesCount }} de {{ enabledRulesCount }}</span>
          </div>
          
          <div class="coverage-item">
            <span class="coverage-label">Cobertura geral:</span>
            <span class="coverage-value" 
                  [class.good-coverage]="coveragePercentage >= 50"
                  [class.low-coverage]="coveragePercentage < 50">
              {{ coveragePercentage }}%
            </span>
          </div>
        </div>

        <!-- Coverage Recommendations -->
        <div *ngIf="coverageRecommendations.length > 0" class="coverage-recommendations">
          <h6>Recomendações:</h6>
          <ul>
            <li *ngFor="let recommendation of coverageRecommendations">
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .style-preview {
      padding: 16px;
      background: var(--mdc-theme-surface);
      border-radius: 8px;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
    }

    .header-info h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: var(--mdc-theme-primary);
    }

    .header-info p {
      margin: 0;
      color: var(--mdc-theme-on-surface-variant);
      font-size: 14px;
    }

    .preview-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      min-height: 28px;
    }

    .coverage-chip.good-coverage {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .coverage-chip.low-coverage {
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
    }

    .no-data-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mdc-theme-outline);
      margin-bottom: 16px;
    }

    .preview-table-container {
      margin-bottom: 24px;
      border: 1px solid var(--mdc-theme-outline-variant);
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-table {
      width: 100%;
    }

    .index-header,
    .index-cell {
      width: 40px;
      text-align: center;
      font-weight: 600;
      background: var(--mdc-theme-surface-variant);
    }

    .context-header {
      position: relative;
      background: var(--mdc-theme-surface-variant);
      font-weight: 500;
    }

    .target-column-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mdc-theme-primary);
    }

    .context-cell {
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .context-cell.target-column {
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
      font-weight: 500;
    }

    .result-header {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
      font-weight: 500;
    }

    .result-cell {
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 48px;
      padding: 8px;
    }

    .result-cell:hover {
      box-shadow: inset 0 0 0 2px var(--mdc-theme-primary);
    }

    .result-cell.has-styles {
      font-weight: 500;
    }

    .cell-content {
      display: block;
      margin-bottom: 4px;
    }

    .rule-indicator {
      position: absolute;
      top: 2px;
      right: 2px;
    }

    .rule-chip {
      font-size: 10px;
      min-height: 16px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .rule-chip:hover {
      transform: scale(1.1);
    }

    .rule-chip mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .status-header {
      width: 80px;
      text-align: center;
      background: var(--mdc-theme-surface-variant);
    }

    .status-cell {
      text-align: center;
    }

    .status-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-icon.styled {
      color: var(--mdc-theme-tertiary);
    }

    .status-icon.unstyled {
      color: var(--mdc-theme-outline);
    }

    .preview-row {
      transition: background-color 0.2s ease;
    }

    .preview-row:hover {
      background: var(--mdc-theme-surface-variant);
    }

    .preview-row.has-applied-rule {
      border-left: 3px solid var(--mdc-theme-tertiary);
    }

    .rules-legend {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 8px;
    }

    .rules-legend h5 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .legend-item:hover {
      background: var(--mdc-theme-surface);
    }

    .legend-item.rule-disabled {
      opacity: 0.5;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid;
      flex-shrink: 0;
    }

    .legend-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .legend-name {
      font-weight: 500;
      font-size: 14px;
    }

    .legend-description {
      font-size: 12px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .legend-stats {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .usage-chip {
      font-size: 11px;
      min-height: 20px;
    }

    .usage-chip.used {
      background: var(--mdc-theme-tertiary-container);
      color: var(--mdc-theme-on-tertiary-container);
    }

    .usage-chip.unused {
      background: var(--mdc-theme-outline-variant);
      color: var(--mdc-theme-on-surface-variant);
    }

    .priority-chip {
      font-size: 11px;
      min-height: 20px;
      background: var(--mdc-theme-primary-container);
      color: var(--mdc-theme-on-primary-container);
    }

    .coverage-analysis {
      padding: 16px;
      background: var(--mdc-theme-surface-variant);
      border-radius: 8px;
    }

    .coverage-analysis h5 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
    }

    .coverage-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .coverage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--mdc-theme-surface);
      border-radius: 4px;
    }

    .coverage-label {
      font-size: 14px;
      color: var(--mdc-theme-on-surface-variant);
    }

    .coverage-value {
      font-weight: 600;
      font-size: 14px;
    }

    .coverage-value.good-coverage {
      color: var(--mdc-theme-tertiary);
    }

    .coverage-value.low-coverage {
      color: var(--mdc-theme-warning);
    }

    .coverage-recommendations {
      margin-top: 16px;
      padding: 12px;
      background: var(--mdc-theme-warning-container);
      color: var(--mdc-theme-on-warning-container);
      border-radius: 4px;
    }

    .coverage-recommendations h6 {
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .coverage-recommendations ul {
      margin: 0;
      padding-left: 16px;
    }

    .coverage-recommendations li {
      font-size: 13px;
      margin-bottom: 4px;
    }
  `]
})
export class StylePreviewComponent implements OnChanges {
  @Input() column!: ColumnDefinition;
  @Input() conditionalStyles: ConditionalStyle[] = [];
  @Input() sampleData: any[] = [];

  @Output() styleClicked = new EventEmitter<string>();

  previewRows: PreviewRow[] = [];
  displayedColumns: string[] = [];
  contextColumns: Array<{ field: string; header: string }> = [];

  // Statistics
  enabledRulesCount = 0;
  styledRowsCount = 0;
  usedRulesCount = 0;
  coveragePercentage = 0;
  coverageRecommendations: string[] = [];

  constructor(private tableRuleEngine: TableRuleEngineService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sampleData'] || changes['conditionalStyles'] || changes['column']) {
      this.updatePreview();
    }
  }

  private updatePreview(): void {
    this.setupContextColumns();
    this.generatePreviewRows();
    this.calculateStatistics();
    this.generateRecommendations();
    this.setupDisplayedColumns();
  }

  private setupContextColumns(): void {
    this.contextColumns = [];
    
    if (this.sampleData.length > 0) {
      const sampleRow = this.sampleData[0];
      const fieldNames = Object.keys(sampleRow);
      
      // Show target column first, then other relevant columns
      if (this.column?.field && fieldNames.includes(this.column.field)) {
        this.contextColumns.push({
          field: this.column.field,
          header: this.column.header || this.column.field
        });
      }
      
      // Add other columns (limit to prevent overflow)
      const otherFields = fieldNames
        .filter(field => field !== this.column?.field)
        .slice(0, 3); // Limit to 3 additional columns
      
      otherFields.forEach(field => {
        this.contextColumns.push({
          field,
          header: this.capitalize(field)
        });
      });
    }
  }

  private generatePreviewRows(): void {
    this.previewRows = [];
    
    if (!this.sampleData.length || !this.column?.field) {
      return;
    }

    // Compile conditional styles into executable function
    const styleFunction = this.tableRuleEngine.compileConditionalStyles(
      this.conditionalStyles.filter(style => style.enabled)
    );

    this.sampleData.forEach((rowData, index) => {
      const cellValue = this.getNestedValue(rowData, this.column.field);
      
      // Apply conditional styles
      const appliedStyles = styleFunction(rowData, cellValue, 0, index);
      
      // Find which rule was applied
      let appliedRuleId: string | null = null;
      let appliedRuleName: string | null = null;
      
      if (appliedStyles) {
        // Find the rule that would apply (highest priority)
        const enabledRules = this.conditionalStyles
          .filter(rule => rule.enabled)
          .sort((a, b) => b.priority - a.priority);
        
        for (const rule of enabledRules) {
          try {
            // Simple DSL evaluation for demo purposes
            // In a real implementation, this would use the proper rule engine
            if (rule.condition.dsl && rule.condition.dsl.trim()) {
              const context = {
                ...rowData,
                value: cellValue,
                _cellValue: cellValue,
                _rowIndex: index,
                _columnIndex: 0,
                _now: new Date()
              };
              
              // Basic evaluation (unsafe - for demo only)
              try {
                const evaluationFunction = new Function('context', `
                  const { ${Object.keys(context).join(', ')} } = context;
                  return ${rule.condition.dsl};
                `);
                
                if (evaluationFunction(context)) {
                  appliedRuleId = rule.id;
                  appliedRuleName = rule.name;
                  break;
                }
              } catch (evalError) {
                // Rule evaluation failed, continue to next rule
              }
            }
          } catch (error) {
            // Rule evaluation failed, continue to next rule
          }
        }
      }

      this.previewRows.push({
        originalData: rowData,
        cellValue,
        appliedStyles,
        appliedRuleId,
        appliedRuleName,
        rowIndex: index
      });
    });
  }

  private calculateStatistics(): void {
    this.enabledRulesCount = this.conditionalStyles.filter(rule => rule.enabled).length;
    this.styledRowsCount = this.previewRows.filter(row => row.appliedStyles).length;
    
    // Calculate used rules
    const usedRuleIds = new Set(
      this.previewRows
        .filter(row => row.appliedRuleId)
        .map(row => row.appliedRuleId!)
    );
    this.usedRulesCount = usedRuleIds.size;
    
    // Calculate coverage percentage
    this.coveragePercentage = this.previewRows.length > 0 
      ? Math.round((this.styledRowsCount / this.previewRows.length) * 100)
      : 0;
  }

  private generateRecommendations(): void {
    this.coverageRecommendations = [];
    
    if (this.enabledRulesCount === 0) {
      this.coverageRecommendations.push('Adicione regras de estilo para personalizar a aparência dos dados');
      return;
    }
    
    if (this.coveragePercentage === 0) {
      this.coverageRecommendations.push('Nenhuma regra está sendo aplicada. Verifique as condições das regras');
    } else if (this.coveragePercentage < 25) {
      this.coverageRecommendations.push('Baixa cobertura de regras. Considere adicionar mais regras ou revisar as condições');
    }
    
    if (this.usedRulesCount < this.enabledRulesCount) {
      const unusedCount = this.enabledRulesCount - this.usedRulesCount;
      this.coverageRecommendations.push(`${unusedCount} regra(s) ativa(s) não estão sendo utilizadas`);
    }
    
    if (this.coveragePercentage === 100) {
      this.coverageRecommendations.push('Todas as linhas têm regras aplicadas. Considere adicionar regras específicas para casos especiais');
    }
  }

  private setupDisplayedColumns(): void {
    this.displayedColumns = [
      'rowIndex',
      ...this.contextColumns.map(col => col.field),
      'styledResult',
      'status'
    ];
  }

  // Template Methods
  getDisplayValue(data: any, field: string): any {
    const value = this.getNestedValue(data, field);
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  getAppliedStyles(row: PreviewRow): any {
    if (!row.appliedStyles) {
      return {};
    }

    return {
      'background-color': row.appliedStyles.backgroundColor,
      'color': row.appliedStyles.textColor,
      'font-weight': row.appliedStyles.fontWeight,
      'font-style': row.appliedStyles.fontStyle,
      'text-decoration': row.appliedStyles.textDecoration,
      'border': this.getBorderStyle(row.appliedStyles.border),
      'border-radius': row.appliedStyles.borderRadius,
      'opacity': row.appliedStyles.opacity,
      'box-shadow': row.appliedStyles.boxShadow,
      'padding': row.appliedStyles.padding,
      'margin': row.appliedStyles.margin
    };
  }

  getStyleTooltip(row: PreviewRow): string {
    if (!row.appliedStyles || !row.appliedRuleName) {
      return 'Nenhuma regra aplicada';
    }
    
    return `Regra aplicada: ${row.appliedRuleName}`;
  }

  getRuleColor(ruleId: string): string {
    const rule = this.conditionalStyles.find(r => r.id === ruleId);
    return rule?.styles.backgroundColor || '#e0e0e0';
  }

  getRuleUsageCount(ruleId: string): number {
    return this.previewRows.filter(row => row.appliedRuleId === ruleId).length;
  }

  onStyledCellClick(row: PreviewRow): void {
    if (row.appliedRuleId) {
      this.styleClicked.emit(row.appliedRuleId);
    }
  }

  onRuleChipClick(ruleId: string): void {
    this.styleClicked.emit(ruleId);
  }

  // Utility Methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private getBorderStyle(border: any): string | undefined {
    if (!border) return undefined;
    
    const width = border.width || '1px';
    const style = border.style || 'solid';
    const color = border.color || '#ccc';
    
    return `${width} ${style} ${color}`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}