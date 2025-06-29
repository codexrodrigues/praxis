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
  effect,
  OnInit,
  runInInjectionContext,
  Injector
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
    <mat-tab-group animationDuration="0ms"> <!-- Desabilitar animações pode ajudar em alguns cenários de detecção de mudança -->

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>view_column</mat-icon>
          <span>Colunas</span>
        </ng-template>
        <praxis-table-columns-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-columns-config>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>code</mat-icon>
          <span>JSON</span>
        </ng-template>
        <praxis-table-json-config #jsonEditor [config]="workingConfig()" (configChange)="onJsonChange($event.config, $event.valid)"> </praxis-table-json-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>format_list_numbered</mat-icon>
          <span>Paginação</span>
        </ng-template>
        <praxis-table-pagination-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-pagination-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>tune</mat-icon>
          <span>Grid</span>
        </ng-template>
        <praxis-table-grid-options-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-grid-options-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>dashboard</mat-icon>
          <span>Toolbar</span>
        </ng-template>
        <praxis-table-toolbar-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-toolbar-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>file_download</mat-icon>
          <span>Exportar</span>
        </ng-template>
        <praxis-table-export-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-export-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>message</mat-icon>
          <span>Mensagens</span>
        </ng-template>
        <praxis-table-messages-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-messages-config>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>list</mat-icon>
          <span>Ações da linha</span>
        </ng-template>
        <praxis-table-row-actions-config [config]="workingConfig()" (configChange)="onConfigChange($event)"></praxis-table-row-actions-config>
      </mat-tab>
    </mat-tab-group>
    <div style="margin-top:1rem;text-align:right;">
      <span style="color:red;margin-right:auto; font-size: 0.9em;" *ngIf="!jsonValid()">JSON inválido</span>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onSave()" [disabled]="!canSave()">Salvar</button>
    </div>
  `,
  styles: [`

  `]

})
export class PraxisTableConfigEditor implements OnDestroy  {
  @Input({ required: true }) config: TableConfig = { columns: [] };
  @Output() save = new EventEmitter<TableConfig>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('jsonEditor') jsonEditorRef!: PraxisTableJsonConfig; // Usando definite assignment

  // Signals para gerenciamento reativo de estado
  private readonly configSignal = signal<TableConfig>({ columns: [] });
  private readonly jsonValidSignal = signal<boolean>(true);
  private readonly currentConfigHashSignal = signal<string>(''); // Hash da configuração atual em configSignal
  private readonly initialConfigHashSignal = signal<string>(''); // Hash da configuração inicial (para hasChanges)

  // Computed values
  readonly workingConfig = computed(() => this.configSignal());
  readonly jsonValid = computed(() => this.jsonValidSignal());
  readonly hasChanges = computed(() => this.currentConfigHashSignal() !== this.initialConfigHashSignal());
  readonly canSave = computed(() => this.jsonValid() && this.hasChanges());

  // Subject para cleanup
  private readonly destroy$ = new Subject<void>();
  // Stream para todas as mudanças de configuração (de abas de formulário ou JSON)
  private readonly configUpdates$ = new Subject<TableConfig>();

  constructor(
    private dialogRef: MatDialogRef<PraxisTableConfigEditor>,
    public cdr: ChangeDetectorRef,
    private injector: Injector
  ) {

  }

  ngOnInit (): void {
    const initialDialogConfig = mergeWithDefaults(this.config);
    this.configSignal.set(initialDialogConfig);

    const initialHash = this.calculateConfigHash(initialDialogConfig);
    this.initialConfigHashSignal.set(initialHash);
    this.currentConfigHashSignal.set(initialHash);

    // Processa todas as atualizações de configuração
    this.configUpdates$.pipe(
      debounceTime(75), // Aumentado ligeiramente o debounce
      distinctUntilChanged((prevConfig, currConfig) =>
        this.calculateConfigHash(prevConfig) === this.calculateConfigHash(currConfig)
      ),
      takeUntil(this.destroy$)
    ).subscribe(newConfig => {
      this.configSignal.set(newConfig); // Atualiza o signal central
      this.cdr.markForCheck(); // Garante que a UI reaja se a mudança vier de fora do ciclo Angular
    });

    // Effect para reagir a mudanças no configSignal
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const currentConfig = this.configSignal();
        this.currentConfigHashSignal.set(this.calculateConfigHash(currentConfig));

        // Atualiza o editor JSON, se existir e se a configuração for diferente
        // A lógica interna do jsonEditor (lastEmittedHash) previne loops de re-emissão.
        // A verificação this.jsonEditorRef?.configHashSignal() !== this.currentConfigHashSignal()
        // é uma otimização adicional se o jsonEditor expor seu hash.
        // Por agora, confiamos que updateJsonFromConfig é seguro/idempotente ou tem suas guardas.
        if (this.jsonEditorRef) {
          this.jsonEditorRef.config = this.config;
        }
        this.cdr.markForCheck();
      });
    });
  }

      // Atualiza o editor JSON, se existir e se a configuração for diferente
      // A lógica interna do jsonEditor (lastEmittedHash) previne loops de re-emissão.
      // A verificação this.jsonEditorRef?.configHashSignal() !== this.currentConfigHashSignal()
      // é uma otimização adicional se o jsonEditor expor seu hash.
      // Por agora, confiamos que updateJsonFromConfig é seguro/idempotente ou tem suas guardas.
      if (this.jsonEditorRef) {
        this.jsonEditorRef.config = this.config;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chamado pela aba JSON quando sua configuração muda
  onJsonChange(newConfigFromEditor: TableConfig, isValid: boolean): void {
    this.jsonValidSignal.set(isValid);
    if (isValid) {
      // Não precisamos clonar aqui, pois o editor JSON já deve fornecer um novo objeto
      // ou um objeto que será clonado pelo distinctUntilChanged/structuredClone na stream.
      this.configUpdates$.next(newConfigFromEditor);
    }
  }

  // Chamado pelas abas de formulário quando sua configuração muda
  onConfigChange(newConfigFromTab: TableConfig): void {
    // Os componentes filhos já emitem a configuração completa e clonada.
    this.configUpdates$.next(newConfigFromTab);
  }

  private calculateConfigHash(config: TableConfig): string {
    try {
      // Serialização estável pode ser importante se a ordem das chaves variar,
      // mas para TableConfig geralmente não é um problema.
      return btoa(JSON.stringify(config)).slice(0, 32);
    } catch (e) {
      console.error("Erro ao calcular hash da configuração:", e);
      // Retorna um hash único para tratar como diferente em caso de erro
      return `error-${Date.now()}-${Math.random()}`;
    }
  }

  onSave(): void {
    if (this.canSave()) { // canSave já verifica jsonValid e hasChanges
      const finalConfig = this.workingConfig(); // workingConfig é o configSignal()
      this.save.emit(finalConfig);
      this.dialogRef.close(finalConfig);
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
