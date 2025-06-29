import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import {ColumnDefinition, TableConfig} from '@praxis/core';

@Component({
  selector: 'praxis-table-columns-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSelectModule,
    MatDividerModule,
    MatButtonModule,
    DragDropModule
  ],
  template: `
    <!-- Configurações Globais -->
    <mat-card class="global-config-card">
      <mat-card-header>
        <mat-card-title>Configurações Globais</mat-card-title>
        <mat-card-subtitle>Aplique configurações a todas as colunas de uma vez</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="global-actions-container">
          <div class="global-action">
            <mat-form-field appearance="outline">
              <mat-label>Alinhamento</mat-label>
              <mat-select [(ngModel)]="globalAlignValue" (ngModelChange)="onGlobalAlignChange($event)">
                <mat-option [value]="null">Não alterar</mat-option>
                <mat-option value="left">Esquerda</mat-option>
                <mat-option value="center">Centro</mat-option>
                <mat-option value="right">Direita</mat-option>
              </mat-select>
              <mat-hint>Alinhamento para todas as colunas</mat-hint>
            </mat-form-field>
          </div>

          <div class="global-action">
            <mat-form-field appearance="outline">
              <mat-label>Visibilidade</mat-label>
              <mat-select [(ngModel)]="globalVisibilityValue" (ngModelChange)="onGlobalVisibilityChange($event)">
                <mat-option [value]="null">Não alterar</mat-option>
                <mat-option [value]="true">Mostrar todas</mat-option>
                <mat-option [value]="false">Ocultar todas</mat-option>
              </mat-select>
              <mat-hint>Mostrar/ocultar todas as colunas</mat-hint>
            </mat-form-field>
          </div>

          <div class="global-action">
            <button mat-raised-button color="primary" (click)="applyGlobalSettings()"
                    [disabled]="!hasGlobalChanges()">
              <mat-icon>check_circle</mat-icon>
              Aplicar a todas as colunas
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Barra de Ações Rápidas -->
    <div class="quick-actions">
      <button mat-button color="accent" (click)="showAllColumns()">
        <mat-icon>visibility</mat-icon>
        Mostrar todas
      </button>
      <button mat-button color="warn" (click)="hideAllColumns()">
        <mat-icon>visibility_off</mat-icon>
        Ocultar todas
      </button>
      <span class="spacer"></span>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar coluna</mat-label>
        <input matInput [(ngModel)]="searchQueryValue" (ngModelChange)="onSearchChange($event)" placeholder="Filtrar colunas...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    <div class="columns-config-container" cdkDropList [cdkDropListData]="filteredColumnsArray"
         (cdkDropListDropped)="drop($event)">
      <mat-card class="column-item" *ngFor="let col of filteredColumnsArray; let i = index" cdkDrag>
        <!-- Resto do template de colunas (já existente) -->
        <div class="card-header">
          <div class="drag-handle" cdkDragHandle matTooltip="Arraste para reordenar">
            <mat-icon>drag_handle</mat-icon>
          </div>

          <!-- Informações Principais -->
          <div class="main-info">
            <div class="field-info">
              <strong>{{ col.field }}</strong>
              <mat-checkbox [(ngModel)]="col.visible" (ngModelChange)="onColumnChange()"
                            matTooltip="Mostrar/ocultar esta coluna">
                Visível
              </mat-checkbox>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Título exibido</mat-label>
              <input matInput [(ngModel)]="col.header" (ngModelChange)="onColumnChange()"
                     placeholder="Título da coluna">
              <mat-hint>Nome que será exibido no cabeçalho</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <!-- Configurações Avançadas -->
        <mat-expansion-panel class="advanced-options">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>settings</mat-icon>
              Configurações avançadas
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="options-section">
            <h4>Posicionamento</h4>
            <div class="fields-row">
              <mat-form-field appearance="outline">
                <mat-label>Ordem</mat-label>
                <input matInput type="number" [(ngModel)]="col.order" (ngModelChange)="onColumnChange()"
                       matTooltip="Ordem de exibição da coluna">
                <mat-hint>Prioridade de exibição</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Alinhamento</mat-label>
                <mat-select [(ngModel)]="col.align" (ngModelChange)="onColumnChange()"
                            matTooltip="Alinhamento do texto">
                  <mat-option value="left">Esquerda</mat-option>
                  <mat-option value="center">Centro</mat-option>
                  <mat-option value="right">Direita</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Largura</mat-label>
                <input matInput [(ngModel)]="col.width" (ngModelChange)="onColumnChange()" placeholder="Ex: 150px, 25%">
                <mat-hint>Largura da coluna</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="options-section">
            <h4>Estilização</h4>
            <div class="fields-row">
              <mat-form-field appearance="outline">
                <mat-label>Estilo das células</mat-label>
                <input matInput [(ngModel)]="col.style" (ngModelChange)="onColumnChange()"
                       placeholder="Ex: color: blue; font-weight: bold;">
                <mat-hint>CSS aplicado às células</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estilo do cabeçalho</mat-label>
                <input matInput [(ngModel)]="col.headerStyle" (ngModelChange)="onColumnChange()"
                       placeholder="Ex: background-color: #f5f5f5;">
                <mat-hint>CSS aplicado ao cabeçalho</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .columns-config-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .column-item {
      margin-bottom: 1rem;
      padding: 0;
      border-left: 4px solid var(--mat-sys-primary);
      background-color: var(--mat-sys-surface-container);
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      background-color: var(--mat-sys-surface-container-high);
    }

    .drag-handle {
      cursor: move;
      display: flex;
      align-items: center;
      margin-right: 0.75rem;
      color: var(--mat-sys-on-surface);
    }

    .main-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .field-info strong {
      font-size: 1.1rem;
      color: var(--mat-sys-on-surface);
    }

    .advanced-options {
      margin: 0;
      box-shadow: none !important;
    }

    .options-section {
      padding: 0.5rem 0 1rem;
    }

    .options-section h4 {
      margin: 0.5rem 0;
      color: var(--mat-sys-outline);
      font-weight: 500;
    }

    .fields-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .fields-row mat-form-field {
      flex: 1 1 200px;
    }

    mat-divider {
      margin: 0.5rem 0;
      background-color: var(--mat-sys-outline-variant);
    }

    .global-config-card {
      margin-bottom: 1.5rem;
      border-top: 4px solid var(--mat-sys-secondary);
      background-color: var(--mat-sys-surface-container);
    }

    .global-actions-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-start;
    }

    .global-action {
      flex: 1 1 200px;
      min-width: 200px;
      display: flex;
      align-items: center;
    }

    .global-action mat-form-field {
      width: 100%;
    }

    .quick-actions {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .spacer {
      flex: 1;
    }

    .search-field {
      width: 250px;
    }

  `]
})
export class PraxisTableColumnsConfig implements OnInit, OnChanges, OnDestroy {
  @Input() config: TableConfig = {columns: []};
  @Output() configChange = new EventEmitter<TableConfig>();

  // Signals para estado reativo
  private readonly columnsSignal = signal<ColumnDefinition[]>([]);
  private readonly searchQuerySignal = signal<string>('');
  private readonly globalAlignSignal = signal<'left' | 'center' | 'right' | null>(null);
  private readonly globalVisibilitySignal = signal<boolean | null>(null);
  private readonly configHashSignal = signal<string>('');

  // Computed values
  readonly columns = computed(() => this.columnsSignal());
  readonly searchQuery = computed(() => this.searchQuerySignal());
  readonly globalAlign = computed(() => this.globalAlignSignal());
  readonly globalVisibility = computed(() => this.globalVisibilitySignal());
  readonly filteredColumns = computed(() => this.filterColumns());
  readonly hasGlobalChanges = computed(() =>
    this.globalAlign() !== null || this.globalVisibility() !== null
  );

  // Arrays para compatibilidade com CDK Drag Drop
  columnsArray: ColumnDefinition[] = [];
  filteredColumnsArray: ColumnDefinition[] = [];
  globalAlignValue: 'left' | 'center' | 'right' | null = null;
  globalVisibilityValue: boolean | null = null;
  searchQueryValue: string = '';

  // Estado para prevenir loops
  private isUpdating = false;
  private lastConfigHash = '';

  constructor(private cdr: ChangeDetectorRef) {
    // Effect para reagir a mudanças nas colunas
    effect(() => {
      const columns = this.columns();
      this.columnsArray = [...columns];
      if (!this.isUpdating && columns.length > 0) {
        this.emitChangeIfNeeded();
      }
    });

    // Effect para filteredColumns
    effect(() => {
      this.filteredColumnsArray = [...this.filteredColumns()];
    });

    // Effects para sincronizar valores
    effect(() => {
      this.globalAlignValue = this.globalAlign();
    });

    effect(() => {
      this.globalVisibilityValue = this.globalVisibility();
    });

    effect(() => {
      this.searchQueryValue = this.searchQuery();
    });
  }

  ngOnInit() {
    this.setupColumns();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] && changes['config'].currentValue && !changes['config'].firstChange) {
      const newHash = this.getConfigHash(this.config);
      if (newHash !== this.configHashSignal()) {
        this.setupColumns();
      }
    }
  }

  drop(event: CdkDragDrop<ColumnDefinition[]>) {
    if (event.previousIndex === event.currentIndex) return;

    // Trabalha com o array filtrado primeiro
    const filteredArray = [...this.filteredColumnsArray];
    moveItemInArray(filteredArray, event.previousIndex, event.currentIndex);

    // Reconstroi o array completo mantendo a nova ordem
    const allColumns = [...this.columns()];
    const movedItem = filteredArray[event.currentIndex];
    const originalIndex = allColumns.findIndex(col => col.field === movedItem.field);

    if (originalIndex !== -1) {
      // Remove do local original
      allColumns.splice(originalIndex, 1);

      // Calcula nova posição no array completo
      let newIndex = event.currentIndex;
      if (this.searchQueryValue) {
        // Se há filtro, precisa mapear para posição real
        const beforeItem = filteredArray[event.currentIndex - 1];
        if (beforeItem) {
          newIndex = allColumns.findIndex(col => col.field === beforeItem.field) + 1;
        }
      }

      // Insere na nova posição
      allColumns.splice(newIndex, 0, movedItem);

      // Atualiza ordem
      allColumns.forEach((col, index) => {
        col.order = index;
      });

      this.columnsSignal.set(allColumns);
      this.cdr.markForCheck();
    }
  }

  emitChange() {
    this.emitChangeIfNeeded();
  }

  // Métodos para configurações globais
  applyGlobalSettings() {
    const currentColumns = this.columns();
    const globalAlign = this.globalAlign();
    const globalVisibility = this.globalVisibility();

    const updatedColumns = currentColumns.map(col => ({
      ...col,
      ...(globalAlign !== null && {align: globalAlign}),
      ...(globalVisibility !== null && {visible: globalVisibility})
    }));

    this.columnsSignal.set(updatedColumns);

    // Resetar configurações globais
    this.globalAlignSignal.set(null);
    this.globalVisibilitySignal.set(null);

    this.cdr.markForCheck();
  }

  // Ações rápidas
  showAllColumns() {
    const updatedColumns = this.columns().map(col => ({...col, visible: true}));
    this.columnsSignal.set(updatedColumns);
    this.cdr.markForCheck();
  }

  hideAllColumns() {
    const updatedColumns = this.columns().map(col => ({...col, visible: false}));
    this.columnsSignal.set(updatedColumns);
    this.cdr.markForCheck();
  }

  onColumnChange() {
    if (!this.isUpdating) {
      // Atualiza o sinal com os dados atuais dos arrays sincronizados
      this.columnsSignal.set([...this.columnsArray]);
      this.cdr.markForCheck();
    }
  }

  onSearchChange(query: string) {
    this.searchQuerySignal.set(query);
    this.cdr.markForCheck();
  }

  onGlobalAlignChange(align: 'left' | 'center' | 'right' | null) {
    this.globalAlignSignal.set(align);
    this.cdr.markForCheck();
  }

  onGlobalVisibilityChange(visibility: boolean | null) {
    this.globalVisibilitySignal.set(visibility);
    this.cdr.markForCheck();
  }

private setupColumns() {
  if (this.config && this.config.columns) {
    this.isUpdating = true;
    const newColumns = this.config.columns.map(c => ({
      ...c,
      visible: typeof c.visible === 'boolean' ? c.visible : true
    }));
    this.columnsSignal.set(newColumns);
    this.updateConfigHash();
    this.isUpdating = false;
    this.cdr.markForCheck();
  }
}

  private getConfigHash(config: TableConfig): string {
    return btoa(JSON.stringify(config.columns || [])).slice(0, 32);
  }

  private updateConfigHash(): void {
    this.configHashSignal.set(this.getConfigHash(this.config));
  }

  private emitChangeIfNeeded() {
    // Usa diretamente o estado atual das colunas
    const currentColumns = this.columns();
    const currentHash = this.getConfigHash({columns: currentColumns});

    if (currentHash !== this.lastConfigHash) {
      this.lastConfigHash = currentHash;
      const cfg = structuredClone(this.config);
      cfg.columns = currentColumns;
      this.configChange.emit(cfg);
    }
  }

  // Filtro de colunas
  private filterColumns(): ColumnDefinition[] {
    const query = this.searchQuery()?.trim();
    const columns = this.columns();

    if (!query) {
      return columns;
    }

    const lowerQuery = query.toLowerCase();
    return columns.filter(col =>
      col.field?.toLowerCase().includes(lowerQuery) ||
      col.header?.toLowerCase().includes(lowerQuery)
    );
  }
}
