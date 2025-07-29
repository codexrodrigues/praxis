import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ValueMappingPair {
  key: string | number | boolean;
  value: string;
  keyInput: string; // For UI binding
  hasError?: boolean;
  errorMessage?: string;
}

@Component({
  selector: 'value-mapping-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="value-mapping-editor">
      <!-- Header with Import/Export Actions -->
      <div class="mapping-toolbar">
        <div class="toolbar-title">
          <mat-icon class="title-icon">swap_horiz</mat-icon>
          <h4>Mapeamento de Valores</h4>
          @if (mappingPairs.length > 0) {
            <span class="mapping-count">
              ({{ mappingPairs.length }} {{ mappingPairs.length === 1 ? 'definido' : 'definidos' }})
            </span>
          }
        </div>

        <div class="toolbar-actions">
          <button mat-stroked-button (click)="showImportDialog = true"
                  matTooltip="Importar mapeamentos de um arquivo JSON">
            <mat-icon>upload_file</mat-icon>
            Importar JSON
          </button>
          <button mat-stroked-button (click)="exportToJson()"
                  [disabled]="mappingPairs.length === 0"
                  matTooltip="Exportar mapeamentos para um arquivo JSON">
            <mat-icon>download</mat-icon>
            Exportar JSON
          </button>
        </div>
      </div>

      <!-- Mappings Table -->
      <div class="mappings-container">
        <table mat-table [dataSource]="dataSource" class="mappings-table">

          <!-- Key Column -->
          <ng-container matColumnDef="key">
            <th mat-header-cell *matHeaderCellDef>{{ labelKey }}</th>
            <td mat-cell *matCellDef="let pair; let i = index" class="key-cell">

              <!-- Text/Number Input -->
              @if (keyInputType !== 'boolean') {
                <mat-form-field appearance="outline" class="key-input">
                  <input matInput
                         [(ngModel)]="pair.keyInput"
                         [type]="keyInputType === 'number' ? 'number' : 'text'"
                         [placeholder]="getKeyPlaceholder()"
                         (ngModelChange)="onKeyChange(i, $event)"
                         [class.error-input]="pair.hasError">
                  @if (pair.hasError) {
                    <mat-error>{{ pair.errorMessage }}</mat-error>
                  }
                </mat-form-field>
              }

              <!-- Boolean Checkbox -->
              @if (keyInputType === 'boolean') {
                <div class="boolean-key-container">
                  <mat-checkbox
                    [checked]="isKeyTruthy(pair)"
                    (change)="onBooleanKeyChange(i, $event.checked)">
                    {{ pair.key === true || pair.keyInput === 'true' ? 'Verdadeiro' : 'Falso' }}
                  </mat-checkbox>
                </div>
              }
            </td>
          </ng-container>

          <!-- Value Column -->
          <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef>{{ labelValue }}</th>
            <td mat-cell *matCellDef="let pair; let i = index" class="value-cell">
              <mat-form-field appearance="outline" class="value-input">
                <input matInput
                       [(ngModel)]="pair.value"
                       placeholder="Digite o texto de exibição"
                       (ngModelChange)="onValueChange(i, $event)">
              </mat-form-field>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
            <td mat-cell *matCellDef="let pair; let i = index" class="actions-cell">
              <button mat-icon-button color="warn"
                      (click)="removePair(i)"
                      matTooltip="Remover mapeamento">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <!-- Empty State -->
        @if (mappingPairs.length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">swap_horiz</mat-icon>
            <h4>Nenhum mapeamento definido</h4>
            <p>Adicione mapeamentos para converter valores brutos em texto amigável</p>
          </div>
        }
      </div>

      <!-- Add New Mapping Button -->
      <div class="add-mapping-section">
        <button mat-raised-button color="primary"
                (click)="addNewPair()"
                class="add-mapping-button">
          <mat-icon>add_circle_outline</mat-icon>
          Adicionar Mapeamento
        </button>
      </div>

      <!-- Import Dialog -->
      @if (showImportDialog) {
        <mat-expansion-panel class="import-panel" [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>upload_file</mat-icon>
            Importar JSON
          </mat-panel-title>
          <mat-panel-description>
            Cole ou digite o JSON dos mapeamentos
          </mat-panel-description>
        </mat-expansion-panel-header>

        <div class="import-content">
          <mat-form-field appearance="outline" class="json-input">
            <mat-label>JSON dos Mapeamentos</mat-label>
            <textarea matInput
                      [(ngModel)]="importJsonText"
                      rows="8"
                      placeholder='{"1": "Ativo", "0": "Inativo"}'
                      class="json-textarea"></textarea>
            <mat-hint>Cole um objeto JSON com pares chave-valor</mat-hint>
          </mat-form-field>

          <div class="import-actions">
            <button mat-button (click)="cancelImport()">
              Cancelar
            </button>
            <button mat-raised-button color="primary"
                    (click)="importFromJson()"
                    [disabled]="!importJsonText">
              <mat-icon>check</mat-icon>
              Importar
            </button>
          </div>

          @if (importError) {
            <div class="import-error">
              <mat-icon>error</mat-icon>
              {{ importError }}
            </div>
          }
        </div>
      </mat-expansion-panel>
      }
    </div>
  `,
  styles: [`
    .value-mapping-editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mapping-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title-icon {
      color: var(--mat-sys-primary);
    }

    .toolbar-title h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .mapping-count {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }

    .mappings-container {
      min-height: 200px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      overflow: hidden;
    }

    .mappings-table {
      width: 100%;
    }

    .key-cell,
    .value-cell {
      padding: 8px 12px;
    }

    .key-input,
    .value-input {
      width: 100%;
    }

    .key-input .mat-mdc-form-field-infix,
    .value-input .mat-mdc-form-field-infix {
      min-height: 40px;
    }

    .boolean-key-container {
      display: flex;
      align-items: center;
      min-height: 40px;
    }

    .error-input {
      border-color: var(--mat-sys-error) !important;
    }

    .actions-header {
      width: 80px;
      text-align: center;
    }

    .actions-cell {
      text-align: center;
      padding: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    .add-mapping-section {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }

    .add-mapping-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .import-panel {
      margin-top: 16px;
    }

    .import-content {
      padding: 16px 0;
    }

    .json-input {
      width: 100%;
      margin-bottom: 16px;
    }

    .json-textarea {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
    }

    .import-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .import-error {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      border-radius: 4px;
      font-size: 0.875rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .mapping-toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .toolbar-actions {
        justify-content: center;
      }

      .mappings-table {
        font-size: 0.875rem;
      }

      .key-input,
      .value-input {
        font-size: 0.875rem;
      }
    }
  `]
})
export class ValueMappingEditorComponent implements OnInit, OnChanges {

  @Input() currentMapping: { [key: string | number]: string } = {};
  @Input() keyInputType: 'text' | 'number' | 'boolean' = 'text';
  @Input() labelKey: string = 'Valor Original';
  @Input() labelValue: string = 'Valor Exibido';

  @Output() mappingChange = new EventEmitter<{ [key: string | number]: string }>();

  // Component state
  mappingPairs: ValueMappingPair[] = [];
  dataSource = new MatTableDataSource<ValueMappingPair>([]);
  displayedColumns = ['key', 'value', 'actions'];

  // Import/Export state
  showImportDialog = false;
  importJsonText = '';
  importError = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeMappingPairs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMapping']) {
      this.initializeMappingPairs();
    }
  }


  private initializeMappingPairs(): void {
    this.mappingPairs = Object.entries(this.currentMapping || {}).map(([key, value]) => ({
      key: this.parseKeyByType(key),
      value: value,
      keyInput: String(key)
    }));
    this.updateDataSource();
  }

  private updateDataSource(): void {
    console.log('🔄 updateDataSource() - Atualizando MatTable DataSource:', {
      newDataLength: this.mappingPairs.length,
      newData: [...this.mappingPairs]
    });
    
    this.dataSource.data = [...this.mappingPairs];
    
    // 🔍 LOG: Verificar estado após atualização do DataSource
    console.log('🔍 Estado após update do DataSource:', {
      mappingPairsLength: this.mappingPairs.length,
      dataSourceLength: this.dataSource.data.length,
      shouldShowEmptyState: this.mappingPairs.length === 0,
      shouldShowTable: this.mappingPairs.length > 0
    });
    
    this.cdr.markForCheck();
    
    // 🔍 LOG: Forçar detecção adicional após markForCheck
    setTimeout(() => {
      console.log('🎯 Estado após ChangeDetection (async):', {
        mappingPairsLength: this.mappingPairs.length,
        dataSourceLength: this.dataSource.data.length,
        DOMShouldUpdate: true
      });
    }, 10);
    
    console.log('✅ DataSource atualizado - Tabela será re-renderizada');
  }

  private parseKeyByType(key: string): string | number | boolean {
    switch (this.keyInputType) {
      case 'number':
        const num = parseFloat(key);
        return isNaN(num) ? key : num;
      case 'boolean':
        return key.toLowerCase() === 'true';
      default:
        return key;
    }
  }

  isKeyTruthy(pair: ValueMappingPair): boolean {
    return pair.key === true || pair.keyInput === 'true';
  }


  getKeyPlaceholder(): string {
    switch (this.keyInputType) {
      case 'number':
        return 'Ex: 1, 2, 3';
      case 'text':
        return 'Ex: ACTIVE, PENDING';
      default:
        return 'Digite o valor';
    }
  }

  addNewPair(): void {
    const newPair: ValueMappingPair = {
      key: this.keyInputType === 'boolean' ? false : (this.keyInputType === 'number' ? 0 : ''),
      value: '',
      keyInput: this.keyInputType === 'boolean' ? 'false' : (this.keyInputType === 'number' ? '0' : '')
    };

    this.mappingPairs.push(newPair);
    this.updateDataSource();
    this.validateAndEmitMapping();
  }


  removePair(index: number): void {
    if (index >= 0 && index < this.mappingPairs.length) {
      this.mappingPairs.splice(index, 1);
      this.updateDataSource();
      this.validateAndEmitMapping();
    }
  }

  onKeyChange(index: number, value: string): void {
    if (index >= 0 && index < this.mappingPairs.length) {
      this.mappingPairs[index].keyInput = value;
      this.mappingPairs[index].key = this.parseKeyByType(value);
      this.validateAndEmitMapping();
    }
  }

  onBooleanKeyChange(index: number, checked: boolean): void {
    if (index >= 0 && index < this.mappingPairs.length) {
      this.mappingPairs[index].key = checked;
      this.mappingPairs[index].keyInput = String(checked);
      this.validateAndEmitMapping();
    }
  }

  onValueChange(index: number, value: string): void {
    if (index >= 0 && index < this.mappingPairs.length) {
      this.mappingPairs[index].value = value;
      this.validateAndEmitMapping();
    }
  }

  private validateAndEmitMapping(): void {
    // Clear previous errors
    this.mappingPairs.forEach(pair => {
      pair.hasError = false;
      pair.errorMessage = '';
    });

    // Validate for duplicate keys
    const keyMap = new Map<string, number[]>();
    this.mappingPairs.forEach((pair, index) => {
      const keyStr = String(pair.key);
      if (!keyMap.has(keyStr)) {
        keyMap.set(keyStr, []);
      }
      keyMap.get(keyStr)!.push(index);
    });

    // Mark duplicates
    let hasErrors = false;
    keyMap.forEach((indices, key) => {
      if (indices.length > 1) {
        indices.forEach(index => {
          this.mappingPairs[index].hasError = true;
          this.mappingPairs[index].errorMessage = 'Chave duplicada';
          hasErrors = true;
        });
      }
    });

    // Validate empty keys/values
    this.mappingPairs.forEach(pair => {
      if (!pair.hasError) {
        if (pair.keyInput.trim() === '' || pair.value.trim() === '') {
          pair.hasError = true;
          pair.errorMessage = 'Campo obrigatório';
          hasErrors = true;
        }
      }
    });

    // Emit mapping if no errors
    if (!hasErrors) {
      const mapping: { [key: string | number]: string } = {};
      this.mappingPairs.forEach(pair => {
        if (pair.keyInput.trim() !== '' && pair.value.trim() !== '') {
          mapping[String(pair.key)] = pair.value;
        }
      });
      
      this.mappingChange.emit(mapping);
    }

    // Update the visual state to show validation errors
    this.cdr.markForCheck();
  }

  // Import/Export functionality
  exportToJson(): void {
    const mapping = this.currentMapping || {};
    const jsonString = JSON.stringify(mapping, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'value-mapping.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.snackBar.open('Mapeamento exportado com sucesso', 'Fechar', {
      duration: 3000
    });
  }

  importFromJson(): void {
    this.importError = '';

    try {
      const parsed = JSON.parse(this.importJsonText);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('JSON deve ser um objeto');
      }

      // Validate key-value pairs
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== 'string') {
          throw new Error(`Valor para chave "${key}" deve ser uma string`);
        }
      }

      // Update mapping
      this.currentMapping = parsed;
      this.initializeMappingPairs();
      this.mappingChange.emit(this.currentMapping);

      this.cancelImport();
      this.snackBar.open('Mapeamento importado com sucesso', 'Fechar', {
        duration: 3000
      });

    } catch (error) {
      this.importError = error instanceof Error ? error.message : 'Erro ao importar JSON';
      this.cdr.markForCheck();
    }
  }

  cancelImport(): void {
    this.showImportDialog = false;
    this.importJsonText = '';
    this.importError = '';
    this.cdr.markForCheck();
  }
}
