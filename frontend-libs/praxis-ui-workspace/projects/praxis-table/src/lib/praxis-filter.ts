import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  DestroyRef,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import {
  GenericCrudService,
  FieldMetadata,
  FormConfig,
  mapFieldDefinitionsToMetadata,
  ConfigStorage,
  CONFIG_STORAGE,
} from '@praxis/core';
import {
  FilterConfigService,
  FilterConfig,
} from './services/filter-config.service';
import { FilterSettingsComponent } from './filter-settings/filter-settings.component';
import { SettingsPanelService } from '@praxis/settings-panel';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, map, take, takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type FilterTag = {
  id: string;
  label: string;
  patch: Record<string, any>;
};
export type I18n = {
  searchPlaceholder: string;
  advanced: string;
  clear: string;
  apply: string;
  edit: string;
  noData: string;
  quickFieldNotFound: string;
};

const DEFAULT_I18N: I18n = {
  searchPlaceholder: 'Buscar',
  advanced: 'Avançado',
  clear: 'Limpar',
  apply: 'Pesquisar',
  edit: 'Editar filtro',
  noData: 'Nenhum dado',
  quickFieldNotFound: 'Campo não encontrado',
};

@Component({
  selector: 'praxis-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    DynamicFieldLoaderDirective,
    PraxisDynamicForm,
  ],
  template: `
    <ng-container *ngIf="modeState === 'filter'; else summaryCard">
      <mat-progress-bar *ngIf="saving" mode="indeterminate"></mat-progress-bar>
      <div class="praxis-filter-bar">
        <div class="quick-field" *ngIf="quickFieldMeta; else fallbackQuick">
          <ng-container
            dynamicFieldLoader
            [fields]="[quickFieldMeta]"
            [formGroup]="quickForm"
          ></ng-container>
        </div>
        <ng-template #fallbackQuick>
          <mat-form-field appearance="outline" class="quick-field">
            <mat-label>{{ i18nLabels.searchPlaceholder }}</mat-label>
            <input
              matInput
              [formControl]="quickControl"
              [attr.aria-label]="i18nLabels.searchPlaceholder"
              (keydown.enter)="onSubmit()"
              (keydown.escape)="onQuickClear()"
            />
            <mat-hint *ngIf="quickField" class="fallback-hint">
              {{ i18nLabels.quickFieldNotFound }}
            </mat-hint>
          </mat-form-field>
        </ng-template>
        <div class="always-fields" *ngIf="alwaysVisibleMetas.length">
          <ng-container
            dynamicFieldLoader
            [fields]="alwaysVisibleMetas"
            [formGroup]="alwaysForm"
          ></ng-container>
        </div>
        <button mat-raised-button color="primary" (click)="onSubmit()">
          {{ i18nLabels.apply }}
        </button>
        <button mat-button type="button" (click)="toggleAdvanced()">
          {{ advancedOpen ? i18nLabels.edit : i18nLabels.advanced }}
        </button>
        <button mat-button type="button" (click)="onClear()">
          {{ i18nLabels.clear }}
        </button>
        <button
          mat-icon-button
          type="button"
          aria-label="Configurações do filtro"
          (click)="openSettings()"
        >
          <mat-icon>settings</mat-icon>
        </button>
        <button
          mat-button
          type="button"
          *ngIf="allowSaveTags"
          (click)="createTag()"
        >
          Salvar como atalho
        </button>
      </div>
      <div class="praxis-filter-tags" *ngIf="displayedTags.length">
        <mat-chip-set>
          <mat-chip
            *ngFor="let tag of displayedTags"
            (click)="applyTag(tag)"
            (keydown.enter)="applyTag(tag)"
            (dblclick)="isUserTag(tag) && renameTag(tag)"
            tabindex="0"
            role="button"
          >
            {{ tag.label }}
            <mat-icon
              *ngIf="isUserTag(tag)"
              matChipRemove
              (click)="deleteTag(tag)"
              aria-label="Remover atalho"
              >close</mat-icon
            >
          </mat-chip>
        </mat-chip-set>
      </div>
      <div class="praxis-filter-advanced" *ngIf="advancedOpen">
        <mat-progress-bar
          *ngIf="schemaLoading"
          mode="indeterminate"
        ></mat-progress-bar>
        <p *ngIf="schemaError" class="schema-error">
          Erro ao carregar filtros.
          <button mat-button type="button" (click)="loadSchema()">
            Tentar novamente
          </button>
        </p>
        <praxis-dynamic-form
          *ngIf="!schemaLoading && !schemaError && advancedConfig"
          [formId]="formId"
          [resourcePath]="resourcePath"
          [mode]="'edit'"
          [config]="advancedConfig"
          (formReady)="onAdvancedReady($event)"
          (valueChange)="onAdvancedChange($event)"
        ></praxis-dynamic-form>
        <p *ngIf="!schemaLoading && !schemaError && !advancedConfig">
          {{ i18nLabels.noData }}
        </p>
      </div>
    </ng-container>
    <ng-template #summaryCard>
      <div class="praxis-filter-card" (keydown.escape)="onClear()">
        <ng-container
          *ngIf="summaryTemplate; else nativeSummary"
          [ngTemplateOutlet]="summaryTemplate"
          [ngTemplateOutletContext]="{ $implicit: summary }"
        ></ng-container>
        <ng-template #nativeSummary>
          <div class="summary-header">
            <img
              *ngIf="summaryMap?.avatar && summaryMap.avatar(summary)"
              [src]="summaryMap.avatar(summary)"
              class="summary-avatar"
              alt=""
            />
            <div class="summary-text">
              <div class="summary-title">
                {{ summaryMap?.title ? summaryMap.title(summary) : '' }}
              </div>
              <div class="summary-subtitle" *ngIf="summaryMap?.subtitle">
                {{ summaryMap.subtitle(summary) }}
              </div>
            </div>
          </div>
          <div class="summary-badges" *ngIf="summaryMap?.badges?.length">
            <span *ngFor="let b of summaryMap!.badges">{{ b(summary) }}</span>
          </div>
        </ng-template>
        <div class="card-actions">
          <button
            mat-button
            type="button"
            (click)="switchToFilter()"
            (keydown.enter)="switchToFilter()"
          >
            {{ i18nLabels.edit }}
          </button>
          <button mat-button type="button" (click)="onClear()">
            {{ i18nLabels.clear }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .praxis-filter-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .quick-field {
        flex: 1 1 200px;
        min-width: 200px;
      }
      .always-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      @media (max-width: 599px) {
        .praxis-filter-bar button {
          flex: 1 1 100%;
        }
      }
      .praxis-filter-tags {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .praxis-filter-advanced {
        margin-top: 16px;
      }
      .fallback-hint {
        color: #666;
        font-size: 11px;
      }
      .praxis-filter-card {
        margin-top: 16px;
      }
      .summary-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .summary-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      .summary-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
      }
      .card-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class PraxisFilter implements OnInit, OnChanges {
  @Input({ required: true }) resourcePath!: string;
  @Input({ required: true }) formId!: string;
  @Input() mode: 'auto' | 'filter' | 'card' = 'auto';

  @Input() value?: Record<string, any>;
  @Input() quickField?: string;
  @Input() alwaysVisibleFields?: string[] = [];
  @Input() tags?: FilterTag[];
  @Input() allowSaveTags?: boolean;
  @Input() persistenceKey?: string;
  @Input() i18n?: Partial<I18n>;
  @Input() changeDebounceMs = 300;
  /** Data used to render the summary card when mode resolves to 'card'. */
  @Input() summary?: any;
  /** Custom template to render the summary card; receives the summary as $implicit. */
  @Input() summaryTemplate?: TemplateRef<any>;
  /** Mapping functions to build the native summary card. */
  @Input() summaryMap?: {
    avatar?: (s: any) => string;
    title: (s: any) => string;
    subtitle?: (s: any) => string;
    badges?: Array<(s: any) => string>;
  };

  @Output() submit = new EventEmitter<Record<string, any>>();
  @Output() change = new EventEmitter<Record<string, any>>();
  @Output() clear = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<'filter' | 'card'>();
  @Output() requestSearch = this.submit;
  @Output() tagsChange = new EventEmitter<FilterTag[]>();

  quickControl = new FormControl<string>('', { nonNullable: true });
  quickForm = new FormGroup<Record<string, FormControl<unknown>>>({});
  alwaysForm = new FormGroup<Record<string, FormControl<unknown>>>({});
  quickFieldMeta?: FieldMetadata;
  alwaysVisibleMetas: FieldMetadata[] = [];
  advancedConfig?: FormConfig;
  displayedTags: FilterTag[] = [];
  private savedTags: FilterTag[] = [];
  schemaLoading = false;
  schemaError = false;
  private schemaMetas?: FieldMetadata[];
  private advancedChange$ = new Subject<Record<string, any>>();
  private alwaysFormReset$ = new Subject<void>();
  private dto: Record<string, any> = {};
  modeState: 'filter' | 'card' = 'filter';
  advancedOpen = false;
  saving = false;
  i18nLabels: I18n = DEFAULT_I18N;
  private placeholder?: string;
  private configKey!: string;

  constructor(
    private crud: GenericCrudService<any>,
    @Inject(CONFIG_STORAGE) private configStorage: ConfigStorage,
    private destroyRef: DestroyRef,
    private filterConfig: FilterConfigService,
    private settingsPanel: SettingsPanelService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    console.log('PFILTER:init');
    this.crud.configure(this.resourcePath);
    this.configKey = this.persistenceKey ?? this.formId;
    const cfg = this.filterConfig.load(this.configKey);
    if (cfg) {
      console.log('PFILTER:config:load', cfg);
      if (!this.quickField && cfg.quickField) {
        this.quickField = cfg.quickField;
      }
      if (!this.alwaysVisibleFields?.length && cfg.alwaysVisibleFields) {
        this.alwaysVisibleFields = cfg.alwaysVisibleFields;
      }
      if (!this.i18n?.searchPlaceholder && cfg.placeholder) {
        this.placeholder = cfg.placeholder;
      }
      if (cfg.showAdvanced !== undefined) {
        this.advancedOpen = cfg.showAdvanced;
      }
    }
    this.mergeI18n();
    if (this.allowSaveTags && this.persistenceKey) {
      const stored = this.configStorage.loadConfig<FilterTag[]>(
        `${this.persistenceKey}:tags`,
      );
      if (stored) {
        this.savedTags = stored;
      }
    }
    this.updateDisplayedTags();
    if (this.persistenceKey) {
      const saved = this.configStorage.loadConfig<Record<string, any>>(
        this.persistenceKey,
      );
      if (saved) {
        this.dto = { ...saved };
        console.log('PFILTER:persist:load', this.dto);
        if (this.quickField && saved[this.quickField]) {
          this.quickControl.setValue(saved[this.quickField], {
            emitEvent: false,
          });
        }
      }
    }
    if (!Object.keys(this.dto).length && this.value) {
      this.dto = { ...this.value };
      if (this.quickField && this.value[this.quickField]) {
        this.quickControl.setValue(this.value[this.quickField]);
      }
    }
    this.evaluateMode();
    this.quickControl.valueChanges
      .pipe(
        debounceTime(this.changeDebounceMs),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((val) => {
        if (this.quickField) {
          if (val) {
            this.dto[this.quickField] = val;
          } else {
            delete this.dto[this.quickField];
          }
        }
        console.log('PFILTER:change', this.dto);
        this.change.emit({ ...this.dto });
        this.persist();
      });
    this.advancedChange$
      .pipe(
        debounceTime(this.changeDebounceMs),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((val) => {
        Object.keys(val).forEach((k) => {
          const v = (val as any)[k];
          if (v === undefined || v === null || v === '') {
            delete this.dto[k];
          } else {
            this.dto[k] = v;
          }
        });
        console.log('PFILTER:change', this.dto);
        this.change.emit({ ...this.dto });
        this.persist();
      });
    this.loadSchema();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['summary']) {
      this.evaluateMode();
    }
    if (changes['tags'] && !changes['tags'].firstChange) {
      this.updateDisplayedTags();
    }
    if (changes['resourcePath'] && !changes['resourcePath'].firstChange) {
      this.crud.configure(this.resourcePath);
      this.quickControl.setValue('', { emitEvent: false });
      this.dto = {};
      this.clearPersisted();
      this.schemaMetas = undefined;
      this.loadSchema();
    }
    if (
      (changes['quickField'] && !changes['quickField'].firstChange) ||
      (changes['alwaysVisibleFields'] &&
        !changes['alwaysVisibleFields'].firstChange)
    ) {
      if (this.schemaMetas) {
        this.applySchemaMetas();
      } else {
        this.loadSchema();
      }
    }
    if (changes['i18n']) {
      this.mergeI18n();
    }
  }

  onSubmit(): void {
    console.log('PFILTER:submit', this.dto);
    this.submit.emit({ ...this.dto });
    this.persist();
  }

  onClear(): void {
    this.quickControl.setValue('', { emitEvent: false });
    this.alwaysForm.reset(undefined, { emitEvent: false });
    this.advancedForm?.reset(undefined, { emitEvent: false });
    this.dto = {};
    console.log('PFILTER:clear');
    this.clear.emit();
    console.log('PFILTER:change', this.dto);
    this.change.emit({});
    this.clearPersisted();
  }

  onQuickClear(): void {
    this.quickControl.setValue('');
  }

  toggleAdvanced(): void {
    this.advancedOpen = !this.advancedOpen;
    console.log(
      this.advancedOpen ? 'PFILTER:advanced:open' : 'PFILTER:advanced:close',
    );
    this.saveConfig();
  }

  openSettings(): void {
    try {
      const currentConfig = {
        metadata: this.schemaMetas ?? [],
        settings: {
          quickField: this.quickField,
          alwaysVisibleFields: this.alwaysVisibleFields,
          placeholder: this.placeholder,
          showAdvanced: this.advancedOpen,
        },
      };

      const ref = this.settingsPanel.open({
        id: `filter.${this.configKey}`,
        title: 'Configurações do Filtro',
        content: { component: FilterSettingsComponent, inputs: currentConfig },
      });

      const applyChanges = (cfg: FilterConfig): void => {
        this.quickField = cfg.quickField;
        this.alwaysVisibleFields = cfg.alwaysVisibleFields ?? [];
        this.placeholder = cfg.placeholder;
        this.advancedOpen = cfg.showAdvanced ?? false;
        this.mergeI18n();
        this.applySchemaMetas();
      };

      const persistConfig = (cfg: FilterConfig, message: string): void => {
        this.saving = true;
        try {
          this.filterConfig.save(this.configKey, cfg);
          this.snackBar.open(message, 'Fechar', { duration: 3000 });
        } catch (err) {
          console.error('PFILTER:config:save:error', err);
          this.snackBar.open('Erro ao salvar configurações', 'Fechar', {
            duration: 3000,
          });
        } finally {
          this.saving = false;
        }
      };

      const validateConfig = (cfg: FilterConfig): FilterConfig => {
        const names = new Set(this.schemaMetas?.map((m) => m.name));
        const quickField =
          cfg.quickField && names.has(cfg.quickField)
            ? cfg.quickField
            : undefined;
        const alwaysVisibleFields = cfg.alwaysVisibleFields?.filter((f) =>
          names.has(f),
        );
        return {
          ...cfg,
          quickField,
          alwaysVisibleFields,
        };
      };

      ref.applied$.pipe(take(1)).subscribe((cfg: FilterConfig) => {
        const safe = validateConfig(cfg);
        applyChanges(safe);
        persistConfig(safe, 'Configurações aplicadas');
        ref.close('apply');
      });

      ref.saved$.pipe(take(1)).subscribe((cfg: FilterConfig) => {
        const safe = validateConfig(cfg);
        applyChanges(safe);
        persistConfig(safe, 'Configurações salvas');
      });
    } catch (err) {
      console.error('PFILTER:openSettings:error', err);
      this.snackBar.open('Erro ao abrir configurações', 'Fechar', {
        duration: 3000,
      });
    }
  }

  switchToFilter(): void {
    if (this.modeState !== 'filter') {
      this.modeState = 'filter';
      console.log('PFILTER:mode:switch filter');
      this.modeChange.emit('filter');
    }
  }

  createTag(label?: string): void {
    if (!this.allowSaveTags) {
      return;
    }
    const tagLabel =
      label ?? (typeof prompt === 'function' ? prompt('Nome do atalho') : '');
    if (!tagLabel) {
      return;
    }
    const tag: FilterTag = {
      id: Date.now().toString(),
      label: tagLabel,
      patch: { ...this.dto },
    };
    this.savedTags.push(tag);
    this.persistTags();
    this.updateDisplayedTags();
    this.tagsChange.emit([...this.displayedTags]);
    console.log('PFILTER:tag:create', tag.id);
  }

  renameTag(tag: FilterTag, label?: string): void {
    const newLabel =
      label ??
      (typeof prompt === 'function'
        ? prompt('Renomear atalho', tag.label)
        : tag.label);
    if (!newLabel || newLabel === tag.label) {
      return;
    }
    tag.label = newLabel;
    this.persistTags();
    this.updateDisplayedTags();
    this.tagsChange.emit([...this.displayedTags]);
    console.log('PFILTER:tag:rename', tag.id);
  }

  deleteTag(tag: FilterTag): void {
    this.savedTags = this.savedTags.filter((t) => t.id !== tag.id);
    this.persistTags();
    this.updateDisplayedTags();
    this.tagsChange.emit([...this.displayedTags]);
    console.log('PFILTER:tag:delete', tag.id);
  }

  isUserTag(tag: FilterTag): boolean {
    return this.savedTags.some((t) => t.id === tag.id);
  }

  applyTag(tag: FilterTag): void {
    Object.keys(tag.patch).forEach((k) => {
      const v = tag.patch[k];
      if (v === undefined || v === null || v === '') {
        delete this.dto[k];
      } else {
        this.dto[k] = v;
      }
    });
    if (this.quickField && tag.patch.hasOwnProperty(this.quickField)) {
      const qv = tag.patch[this.quickField];
      this.quickControl.setValue(qv ?? '', { emitEvent: false });
    }
    this.alwaysForm.patchValue(tag.patch, { emitEvent: false });
    this.advancedForm?.patchValue(tag.patch, { emitEvent: false });
    console.log('PFILTER:tag:apply', tag.id);
    console.log('PFILTER:change', this.dto);
    this.change.emit({ ...this.dto });
    this.persist();
    this.onSubmit();
  }

  private advancedForm?: FormGroup<Record<string, any>>;

  private loadSchema(): void {
    if (this.schemaMetas) {
      this.applySchemaMetas();
      return;
    }
    console.log('PFILTER:schema:load:start');
    this.schemaLoading = true;
    this.schemaError = false;
    this.crud
      .getFilteredSchema({
        path: this.resourcePath,
        operation: 'post',
        schemaType: 'request',
      })
      .pipe(
        catchError((err) => {
          console.error('PFILTER:schema:load:error', err);
          console.error('PFILTER:error:schema', err);
          return this.crud.getSchema().pipe(
            catchError((err2) => {
              console.error('PFILTER:schema:load:error', err2);
              console.error('PFILTER:error:schema', err2);
              this.schemaLoading = false;
              this.schemaError = true;
              return of([]);
            }),
          );
        }),
        map((defs) => mapFieldDefinitionsToMetadata(defs)),
        take(1),
      )
      .subscribe((metas) => {
        if (this.schemaError) {
          return;
        }
        this.schemaLoading = false;
        console.log('PFILTER:schema:load:success');
        this.schemaMetas = metas;
        this.applySchemaMetas();
      });
  }

  private applySchemaMetas(): void {
    const metas = this.schemaMetas ?? [];
    this.quickFieldMeta = undefined;
    this.alwaysVisibleMetas = [];
    this.alwaysFormReset$.next();
    this.alwaysForm = new FormGroup<Record<string, FormControl<unknown>>>({});
    this.advancedConfig = undefined;
    if (this.quickField) {
      const found = metas.find((m) => m.name === this.quickField);
      if (found) {
        this.quickFieldMeta = {
          ...found,
          density: 'compact',
        } as FieldMetadata;
        this.quickForm = new FormGroup<Record<string, FormControl<unknown>>>(
          {},
        );
        this.quickForm.addControl(this.quickField, this.quickControl);
        console.log('PFILTER:quick-field:resolved', this.quickField);
      } else {
        console.warn('PFILTER:quick-field:fallback', this.quickField);
      }
    }
    this.alwaysVisibleMetas = metas.filter((m) =>
      this.alwaysVisibleFields?.includes(m.name),
    );
    this.alwaysVisibleMetas.forEach((m) => {
      const ctrl = new FormControl<any>(this.dto[m.name] ?? null);
      this.alwaysForm.addControl(m.name, ctrl);
    });
    this.alwaysForm.valueChanges
      .pipe(
        debounceTime(this.changeDebounceMs),
        takeUntil(this.alwaysFormReset$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((val) => this.advancedChange$.next(val));
    const advancedMetas = metas.filter(
      (m) =>
        m.name !== this.quickField &&
        !this.alwaysVisibleFields?.includes(m.name),
    );
    if (advancedMetas.length) {
      this.advancedConfig = {
        sections: [
          {
            id: 'advanced',
            rows: advancedMetas.map((m) => ({
              columns: [{ fields: [m.name] }],
            })),
          },
        ],
        fieldMetadata: advancedMetas,
      } as FormConfig;
    }
  }

  onAdvancedReady(event: { formGroup: FormGroup<Record<string, any>> }): void {
    this.advancedForm = event.formGroup;
    this.advancedForm.patchValue(this.dto, { emitEvent: false });
  }

  onAdvancedChange(event: { formData: Record<string, any> }): void {
    this.advancedChange$.next(event.formData);
  }

  private mergeI18n(): void {
    this.i18nLabels = {
      ...DEFAULT_I18N,
      ...(this.placeholder ? { searchPlaceholder: this.placeholder } : {}),
      ...this.i18n,
    };
  }

  private persist(): void {
    if (this.persistenceKey) {
      this.configStorage.saveConfig(this.persistenceKey, this.dto);
      console.log('PFILTER:persist:save', this.dto);
    }
  }

  private clearPersisted(): void {
    if (this.persistenceKey) {
      this.configStorage.clearConfig(this.persistenceKey);
      console.log('PFILTER:persist:clear');
    }
  }

  private saveConfig(): void {
    const config: FilterConfig = {
      quickField: this.quickField,
      alwaysVisibleFields: this.alwaysVisibleFields,
      placeholder: this.placeholder,
      showAdvanced: this.advancedOpen,
    };
    this.filterConfig.save(this.configKey, config);
    console.log('PFILTER:config:save', config);
  }

  private persistTags(): void {
    if (this.allowSaveTags && this.persistenceKey) {
      this.configStorage.saveConfig(
        `${this.persistenceKey}:tags`,
        this.savedTags,
      );
    }
  }

  private updateDisplayedTags(): void {
    this.displayedTags = [...(this.tags ?? []), ...this.savedTags];
  }

  private evaluateMode(): void {
    const prev = this.modeState;
    if (this.mode === 'filter' || this.mode === 'card') {
      this.modeState = this.mode;
    } else {
      this.modeState = this.summary ? 'card' : 'filter';
    }
    if (this.modeState !== prev) {
      if (this.modeState === 'card') {
        this.advancedOpen = false;
      }
      console.log(`PFILTER:mode:switch ${this.modeState}`);
      this.modeChange.emit(this.modeState);
      if (this.modeState === 'card') {
        console.log(
          `PFILTER:summary:render:${
            this.summaryTemplate ? 'template' : 'native'
          }`,
        );
      }
    }
  }
}
