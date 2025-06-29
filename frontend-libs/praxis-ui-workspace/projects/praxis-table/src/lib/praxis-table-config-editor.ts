import {
  Component,
  EventEmitter,
  Input,
  Output,
  Inject,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableConfig } from '@praxis/core';
import { PraxisTableJsonConfig } from './praxis-table-json-config';
import { PraxisTablePaginationConfig } from './praxis-table-pagination-config';
import { PraxisTableGridOptionsConfig } from './praxis-table-grid-options-config';
import { PraxisTableToolbarConfig } from './praxis-table-toolbar-config';
import { PraxisTableExportConfig } from './praxis-table-export-config';
import { PraxisTableMessagesConfig } from './praxis-table-messages-config';
import { PraxisTableRowActionsConfig } from './praxis-table-row-actions-config';
import { PraxisTableColumnsConfig } from './praxis-table-columns-config';
import { mergeWithDefaults } from './table-config-defaults';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'praxis-table-config-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    PraxisTableJsonConfig,
    PraxisTablePaginationConfig,
    PraxisTableGridOptionsConfig,
    PraxisTableToolbarConfig,
    PraxisTableExportConfig,
    PraxisTableMessagesConfig,
    PraxisTableRowActionsConfig,
    PraxisTableColumnsConfig
  ],
  template: `
    <h2>Editor de Configuração da Tabela</h2>
    <mat-tab-group>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>view_column</mat-icon>
          <span>Colunas</span>
        </ng-template>
        <praxis-table-columns-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'columns')"></praxis-table-columns-config>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>code</mat-icon>
          <span>JSON</span>
        </ng-template>
        <praxis-table-json-config [config]="workingConfig()" (configChange)="onJsonChange($event.config, $event.valid)"> </praxis-table-json-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>format_list_numbered</mat-icon>
          <span>Paginação</span>
        </ng-template>
        <praxis-table-pagination-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'pagination')"></praxis-table-pagination-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>tune</mat-icon>
          <span>Grid</span>
        </ng-template>
        <praxis-table-grid-options-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'grid')"></praxis-table-grid-options-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>dashboard</mat-icon>
          <span>Toolbar</span>
        </ng-template>
        <praxis-table-toolbar-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'toolbar')"></praxis-table-toolbar-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>file_download</mat-icon>
          <span>Exportar</span>
        </ng-template>
        <praxis-table-export-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'export')"></praxis-table-export-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>message</mat-icon>
          <span>Mensagens</span>
        </ng-template>
        <praxis-table-messages-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'messages')"></praxis-table-messages-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>list</mat-icon>
          <span>Ações da linha</span>
        </ng-template>
        <praxis-table-row-actions-config [config]="workingConfig()" (configChange)="onConfigChange($event, 'actions')"></praxis-table-row-actions-config>
      </mat-tab>
    </mat-tab-group>
    <div style="margin-top:1rem;text-align:right;">
      <span style="color:red;margin-right:auto;" *ngIf="!jsonValid()">JSON inválido</span>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onSave()" [disabled]="!canSave()">Salvar</button>
    </div>
  `,
  styles: [`

  `]

})
export class PraxisTableConfigEditor implements OnDestroy {
  @Input({ required: true }) config: TableConfig = { columns: [] };
  @Output() save = new EventEmitter<TableConfig>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild(PraxisTableJsonConfig) jsonEditor: PraxisTableJsonConfig | undefined;

  // Signals para gerenciamento reativo de estado
  private readonly configSignal = signal<TableConfig>({ columns: [] });
  private readonly jsonValidSignal = signal<boolean>(true);
  private readonly configHashSignal = signal<string>('');

  // Computed values
  readonly workingConfig = computed(() => this.configSignal());
  readonly jsonValid = computed(() => this.jsonValidSignal());
  readonly canSave = computed(() => this.jsonValid() && this.hasChanges());

  // Subject para cleanup
  private readonly destroy$ = new Subject<void>();
  private readonly configChanges$ = new Subject<{config: TableConfig, source: string}>();

  // Estado para prevenir loops
  private isUpdating = false;
  private lastUpdateSource = '';

  constructor(
    private dialogRef: MatDialogRef<PraxisTableConfigEditor>,
    @Inject(MAT_DIALOG_DATA) public data: { config?: TableConfig },
    private cdr: ChangeDetectorRef
  ) {
    const initialConfig = data?.config || this.config;
    this.configSignal.set(mergeWithDefaults(initialConfig));
    this.updateConfigHash(this.configSignal());

    // Setup da stream de mudanças com debounce e distinct
    this.configChanges$
      .pipe(
        debounceTime(50),
        distinctUntilChanged((prev, curr) =>
          this.getConfigHash(prev.config) === this.getConfigHash(curr.config)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ config, source }) => {
        this.handleConfigChange(config, source);
      });

    // Effect para reagir a mudanças no sinal
    effect(() => {
      const config = this.configSignal();
      this.updateJsonEditor(config);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onJsonChange(cfg: TableConfig, valid: boolean): void {
    this.jsonValidSignal.set(valid);
    if (valid) {
      this.onConfigChange(cfg, 'json');
    }
  }

  onConfigChange(cfg: TableConfig, source: string = 'unknown'): void {
    if (this.isUpdating || this.lastUpdateSource === source) {
      return;
    }

    this.configChanges$.next({ config: cfg, source });
  }

  private handleConfigChange(cfg: TableConfig, source: string): void {
    const newHash = this.getConfigHash(cfg);
    const currentHash = this.configHashSignal();

    if (newHash === currentHash) {
      return; // Sem mudanças reais
    }

    this.isUpdating = true;
    this.lastUpdateSource = source;

    this.configSignal.set(structuredClone(cfg));
    this.updateConfigHash(cfg);

    // Reset state after update
    setTimeout(() => {
      this.isUpdating = false;
      this.lastUpdateSource = '';
      this.cdr.markForCheck();
    }, 100);
  }

  private updateJsonEditor(config: TableConfig): void {
    if (this.jsonEditor && !this.isUpdating && this.lastUpdateSource !== 'json') {
      this.jsonEditor.updateJsonFromConfig(config);
    }
  }

  private getConfigHash(config: TableConfig): string {
    // Usar uma estratégia de hash eficiente
    return btoa(JSON.stringify(config)).slice(0, 32);
  }

  private updateConfigHash(config: TableConfig): void {
    this.configHashSignal.set(this.getConfigHash(config));
  }

  private hasChanges(): boolean {
    const originalHash = this.getConfigHash(mergeWithDefaults(this.config));
    return this.configHashSignal() !== originalHash;
  }

  onSave(): void {
    if (this.canSave()) {
      const finalConfig = this.workingConfig();
      console.log('Salvando configuração:', JSON.stringify(finalConfig, null, 2));
      this.save.emit(finalConfig);
      this.dialogRef.close(finalConfig);
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
