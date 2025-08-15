import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TableConfig, isTableConfigV2 } from '@praxis/core';
import { Subject, takeUntil } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface BehaviorConfigChange {
  type:
    | 'pagination'
    | 'sorting'
    | 'filtering'
    | 'selection'
    | 'interaction'
    | 'general';
  property: string;
  value: any;
  fullConfig: TableConfig;
}

@Component({
  selector: 'behavior-config-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonModule,
  ],
  template: `
    <div class="behavior-config-container">
      <form [formGroup]="behaviorForm">
        <!-- Paginação -->
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">table_rows</mat-icon>
              Paginação
            </mat-panel-title>
            <mat-panel-description>
              Configure como os dados são divididos em páginas
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-section">
            <mat-slide-toggle
              formControlName="paginationEnabled"
              class="toggle-field"
            >
              Habilitar paginação
            </mat-slide-toggle>

            <div
              class="config-fields"
              *ngIf="behaviorForm.get('paginationEnabled')?.value"
            >
              <mat-form-field appearance="outline">
                <mat-label>Itens por página</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="pageSize"
                  min="1"
                  max="100"
                />
                <mat-hint>Número de registros exibidos por página</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Opções de tamanho de página</mat-label>
                <input
                  matInput
                  formControlName="pageSizeOptions"
                  placeholder="5, 10, 25, 50"
                />
                <mat-hint>Valores separados por vírgula</mat-hint>
              </mat-form-field>

              <mat-slide-toggle
                formControlName="showFirstLastButtons"
                class="toggle-field"
              >
                Mostrar botões primeira/última página
              </mat-slide-toggle>

              <mat-form-field appearance="outline" *ngIf="isV2">
                <mat-label>Estratégia de paginação</mat-label>
                <mat-select formControlName="paginationStrategy">
                  <mat-option value="client">Cliente (dados locais)</mat-option>
                  <mat-option value="server"
                    >Servidor (paginação remota)</mat-option
                  >
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Ordenação -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">sort</mat-icon>
              Ordenação
            </mat-panel-title>
            <mat-panel-description>
              Controle como as colunas podem ser ordenadas
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-section">
            <mat-slide-toggle
              formControlName="sortingEnabled"
              class="toggle-field"
            >
              Habilitar ordenação
            </mat-slide-toggle>

            <div
              class="config-fields"
              *ngIf="behaviorForm.get('sortingEnabled')?.value && isV2"
            >
              <mat-slide-toggle
                formControlName="multiSort"
                class="toggle-field"
              >
                Ordenação múltipla
                <mat-icon
                  class="info-icon"
                  matTooltip="Permite ordenar por múltiplas colunas simultaneamente"
                >
                  info_outline
                </mat-icon>
              </mat-slide-toggle>

              <mat-form-field appearance="outline">
                <mat-label>Estratégia de ordenação</mat-label>
                <mat-select formControlName="sortingStrategy">
                  <mat-option value="client"
                    >Cliente (ordenação local)</mat-option
                  >
                  <mat-option value="server"
                    >Servidor (ordenação remota)</mat-option
                  >
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle
                formControlName="allowClearSort"
                class="toggle-field"
              >
                Permitir limpar ordenação
              </mat-slide-toggle>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Filtragem -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">filter_list</mat-icon>
              Filtragem
            </mat-panel-title>
            <mat-panel-description>
              Configure opções de busca e filtros
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-section">
            <mat-slide-toggle
              formControlName="filteringEnabled"
              class="toggle-field"
            >
              Habilitar filtragem
            </mat-slide-toggle>

            <div
              class="config-fields"
              *ngIf="behaviorForm.get('filteringEnabled')?.value"
            >
              <div *ngIf="isV2">
                <mat-slide-toggle
                  formControlName="columnFiltersEnabled"
                  class="toggle-field"
                >
                  Filtros por coluna
                  <mat-icon
                    class="info-icon"
                    matTooltip="Adiciona filtros individuais em cada coluna"
                  >
                    info_outline
                  </mat-icon>
                </mat-slide-toggle>

                <mat-slide-toggle
                  formControlName="advancedFiltersEnabled"
                  class="toggle-field"
                >
                  Filtros avançados
                  <mat-icon
                    class="info-icon"
                    matTooltip="Editor visual de queries complexas"
                  >
                    info_outline
                  </mat-icon>
                </mat-slide-toggle>

                <mat-form-field appearance="outline">
                  <mat-label>Tempo de debounce (ms)</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="filterDebounce"
                    min="0"
                    max="2000"
                  />
                  <mat-hint>Atraso antes de aplicar filtros</mat-hint>
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Seleção -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">check_box</mat-icon>
              Seleção
            </mat-panel-title>
            <mat-panel-description>
              Configure seleção de linhas para ações em lote
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-section">
            <mat-slide-toggle
              formControlName="selectionEnabled"
              class="toggle-field"
            >
              Habilitar seleção
            </mat-slide-toggle>

            <div
              class="config-fields"
              *ngIf="behaviorForm.get('selectionEnabled')?.value"
            >
              <mat-form-field appearance="outline">
                <mat-label>Tipo de seleção</mat-label>
                <mat-select formControlName="selectionType">
                  <mat-option value="single">Única</mat-option>
                  <mat-option value="multiple">Múltipla</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="isV2">
                <mat-label>Modo de seleção</mat-label>
                <mat-select formControlName="selectionMode">
                  <mat-option value="checkbox">Checkbox</mat-option>
                  <mat-option value="row">Clique na linha</mat-option>
                  <mat-option value="both">Ambos</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle
                formControlName="allowSelectAll"
                class="toggle-field"
                *ngIf="behaviorForm.get('selectionType')?.value === 'multiple'"
              >
                Botão selecionar todos
              </mat-slide-toggle>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Interação (V2 only) -->
        <mat-expansion-panel *ngIf="isV2">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="section-icon">touch_app</mat-icon>
              Interação
            </mat-panel-title>
            <mat-panel-description>
              Configure comportamentos de interação do usuário
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="config-section">
            <div class="config-fields">
              <mat-slide-toggle
                formControlName="rowClickEnabled"
                class="toggle-field"
              >
                Ação ao clicar na linha
              </mat-slide-toggle>

              <mat-form-field
                appearance="outline"
                *ngIf="behaviorForm.get('rowClickEnabled')?.value"
              >
                <mat-label>Ação do clique</mat-label>
                <mat-select formControlName="rowClickAction">
                  <mat-option value="view">Visualizar</mat-option>
                  <mat-option value="edit">Editar</mat-option>
                  <mat-option value="select">Selecionar</mat-option>
                  <mat-option value="custom">Personalizada</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle
                formControlName="rowDoubleClickEnabled"
                class="toggle-field"
              >
                Ação ao duplo clique
              </mat-slide-toggle>

              <mat-slide-toggle
                formControlName="hoverEnabled"
                class="toggle-field"
              >
                Efeitos de hover
              </mat-slide-toggle>

              <mat-slide-toggle
                formControlName="keyboardEnabled"
                class="toggle-field"
              >
                Navegação por teclado
                <mat-icon
                  class="info-icon"
                  matTooltip="Permite navegação com setas e atalhos"
                >
                  info_outline
                </mat-icon>
              </mat-slide-toggle>
            </div>
          </div>
        </mat-expansion-panel>
      </form>
    </div>
  `,
  styles: [
    `
      .behavior-config-container {
        width: 100%;
        padding: 8px;
      }

      .config-section {
        padding: 16px;
      }

      .config-fields {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 16px;
      }

      .toggle-field {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-icon {
        margin-right: 8px;
        color: var(--mat-sys-primary);
      }

      .info-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-on-surface-variant);
        cursor: help;
      }

      mat-form-field {
        width: 100%;
      }

      mat-expansion-panel {
        margin-bottom: 8px;
        border-radius: 8px;
        overflow: hidden;
      }

      mat-expansion-panel-header {
        min-height: 56px;
      }

      mat-panel-description {
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class BehaviorConfigEditorComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();
  @Output() behaviorChange = new EventEmitter<BehaviorConfigChange>();

  behaviorForm!: FormGroup;
  isV2 = false;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isV2 = isTableConfigV2(this.config);
    this.initializeForm();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Use type guards to safely access properties
    const v1Config = this.isV2 ? null : (this.config as any);
    const gridOptions = v1Config?.gridOptions || {};
    const pagination = gridOptions.pagination || {};

    // Build form with values from config
    this.behaviorForm = this.fb.group({
      // Pagination
      paginationEnabled: [!!gridOptions.pagination],
      pageSize: [pagination.pageSize || 10],
      pageSizeOptions: [
        this.arrayToString(pagination.pageSizeOptions || [5, 10, 25, 50]),
      ],
      showFirstLastButtons: [pagination.showFirstLastButtons !== false],
      paginationStrategy: ['client'], // V2 only

      // Sorting
      sortingEnabled: [gridOptions.sortable !== false],
      multiSort: [false], // V2 only
      sortingStrategy: ['client'], // V2 only
      allowClearSort: [true], // V2 only

      // Filtering
      filteringEnabled: [!!gridOptions.filterable],
      columnFiltersEnabled: [false], // V2 only
      advancedFiltersEnabled: [false], // V2 only
      filterDebounce: [300], // V2 only

      // Selection
      selectionEnabled: [!!v1Config?.selection?.enabled],
      selectionType: [v1Config?.selection?.type || 'single'],
      selectionMode: ['checkbox'], // V2 only
      allowSelectAll: [true],

      // Interaction (V2 only)
      rowClickEnabled: [false],
      rowClickAction: ['view'],
      rowDoubleClickEnabled: [false],
      hoverEnabled: [true],
      keyboardEnabled: [false],
    });

    // If V2, load advanced settings
    if (this.isV2) {
      const v2Config = this.config as TableConfig;
      const behavior = v2Config.behavior || {};

      if (behavior.pagination) {
        this.behaviorForm.patchValue({
          paginationEnabled: behavior.pagination.enabled !== false,
          pageSize: behavior.pagination.pageSize || 10,
          pageSizeOptions: this.arrayToString(
            behavior.pagination.pageSizeOptions || [5, 10, 25, 50],
          ),
          showFirstLastButtons:
            behavior.pagination.showFirstLastButtons !== false,
          paginationStrategy: behavior.pagination.strategy || 'client',
        });
      }

      if (behavior.sorting) {
        this.behaviorForm.patchValue({
          sortingEnabled: behavior.sorting.enabled !== false,
          multiSort: behavior.sorting.multiSort || false,
          sortingStrategy: behavior.sorting.strategy || 'client',
          allowClearSort: behavior.sorting.allowClearSort !== false,
        });
      }

      if (behavior.filtering) {
        this.behaviorForm.patchValue({
          filteringEnabled: behavior.filtering.enabled !== false,
          columnFiltersEnabled:
            behavior.filtering.columnFilters?.enabled || false,
          advancedFiltersEnabled:
            behavior.filtering.advancedFilters?.enabled || false,
          filterDebounce: behavior.filtering.debounceTime || 300,
        });
      }

      if (behavior.selection) {
        this.behaviorForm.patchValue({
          selectionEnabled: behavior.selection.enabled || false,
          selectionType: behavior.selection.type || 'single',
          selectionMode: behavior.selection.mode || 'checkbox',
          allowSelectAll: behavior.selection.allowSelectAll !== false,
        });
      }

      if (behavior.interaction) {
        this.behaviorForm.patchValue({
          rowClickEnabled: behavior.interaction.rowClick?.enabled || false,
          rowClickAction: behavior.interaction.rowClick?.action || 'view',
          rowDoubleClickEnabled:
            behavior.interaction.rowDoubleClick?.enabled || false,
          hoverEnabled: behavior.interaction.hover?.enabled !== false,
          keyboardEnabled: behavior.interaction.keyboard?.enabled || false,
        });
      }
    }
  }

  private setupFormListeners(): void {
    this.behaviorForm.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((values) => {
        this.updateConfig(values);
      });
  }

  /**
   * Applies current form values to the configuration immediately.
   * Useful to flush pending changes before external save operations.
   */
  applyFormChanges(): void {
    if (this.behaviorForm) {
      this.updateConfig(this.behaviorForm.value);
    }
  }

  private updateConfig(values: any): void {
    const updatedConfig = { ...this.config };

    if (this.isV2) {
      // Update V2 config structure
      const v2Config = updatedConfig as TableConfig;

      v2Config.behavior = v2Config.behavior || {};

      // Pagination
      v2Config.behavior.pagination = {
        enabled: values.paginationEnabled,
        pageSize: values.pageSize,
        pageSizeOptions: this.stringToArray(values.pageSizeOptions),
        showFirstLastButtons: values.showFirstLastButtons,
        strategy: values.paginationStrategy,
        showPageNumbers: true,
        showPageInfo: true,
        position: 'bottom',
        style: 'default',
      };

      // Sorting
      v2Config.behavior.sorting = {
        enabled: values.sortingEnabled,
        multiSort: values.multiSort,
        strategy: values.sortingStrategy,
        allowClearSort: values.allowClearSort,
        showSortIndicators: true,
        indicatorPosition: 'end',
      };

      // Filtering
      v2Config.behavior.filtering = {
        enabled: values.filteringEnabled,
        columnFilters: {
          enabled: values.columnFiltersEnabled,
          defaultType: 'text',
          position: 'header',
        },
        advancedFilters: {
          enabled: values.advancedFiltersEnabled,
          queryBuilder: true,
          savePresets: true,
        },
        strategy: 'client',
        debounceTime: values.filterDebounce,
      };

      // Selection
      v2Config.behavior.selection = {
        enabled: values.selectionEnabled,
        type: values.selectionType,
        mode: values.selectionMode,
        allowSelectAll: values.allowSelectAll,
        checkboxPosition: 'start',
        persistSelection: false,
        persistOnDataUpdate: false,
      };

      // Interaction
      v2Config.behavior.interaction = {
        rowClick: {
          enabled: values.rowClickEnabled,
          action: values.rowClickAction,
        },
        rowDoubleClick: {
          enabled: values.rowDoubleClickEnabled,
          action: 'edit',
        },
        hover: {
          enabled: values.hoverEnabled,
          highlightRow: true,
          showActionsOnHover: false,
        },
        keyboard: {
          enabled: values.keyboardEnabled,
          arrowNavigation: true,
          spaceSelection: true,
        },
      };
    } else {
      // Update V1 config structure
      const v1UpdatedConfig = updatedConfig as any;
      v1UpdatedConfig.gridOptions = v1UpdatedConfig.gridOptions || {};

      if (values.paginationEnabled) {
        v1UpdatedConfig.gridOptions.pagination = {
          pageSize: values.pageSize,
          pageSizeOptions: this.stringToArray(values.pageSizeOptions),
          showFirstLastButtons: values.showFirstLastButtons,
        };
      } else {
        delete v1UpdatedConfig.gridOptions.pagination;
      }

      v1UpdatedConfig.gridOptions.sortable = values.sortingEnabled;
      v1UpdatedConfig.gridOptions.filterable = values.filteringEnabled;

      if (values.selectionEnabled) {
        (updatedConfig as any).selection = {
          enabled: true,
          type: values.selectionType,
        };
      } else {
        delete (updatedConfig as any).selection;
      }
    }

    this.configChange.emit(updatedConfig);
  }

  private arrayToString(arr: number[]): string {
    return arr.join(', ');
  }

  private stringToArray(str: string): number[] {
    return str
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }
}
