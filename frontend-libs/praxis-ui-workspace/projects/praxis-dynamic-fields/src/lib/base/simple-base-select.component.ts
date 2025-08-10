import {
  Directive,
  signal,
  output,
  computed,
  inject,
  viewChild,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentMetadata, GenericCrudService, Page } from '@praxis/core';
import { SimpleBaseInputComponent } from './simple-base-input.component';
import { take } from 'rxjs';
import { MatSelect } from '@angular/material/select';

/**
 * Generic option definition for select components.
 */
export interface SelectOption<T = any> {
  /** Display label for the option */
  label: string;
  /** Value associated with the option */
  value: T;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * Metadata configuration for simple select components.
 */
export interface SimpleSelectMetadata<T = any> extends ComponentMetadata {
  /** Available options */
  options?: SelectOption<T>[];
  /** Allow multiple selections */
  multiple?: boolean;
  /** Whether search input should be displayed */
  searchable?: boolean;
  /** Show select all option */
  selectAll?: boolean;
  /** Maximum number of selections allowed */
  maxSelections?: number;
  /** Backend resource for dynamic options */
  resourcePath?: string;
  /** API endpoint for dynamic options (alias for resourcePath) */
  endpoint?: string;
  /** Additional filter criteria for backend requests */
  filterCriteria?: Record<string, any>;
  /** Key for option label when loading from backend */
  optionLabelKey?: string;
  /** Key for option value when loading from backend */
  optionValueKey?: string;
}

/**
 * Base directive providing common select behaviour. Extends
 * `SimpleBaseInputComponent` and manages option handling, multiple
 * selection, selection change events and helper utilities used by the
 * concrete Material components.
 */
@Directive()
export abstract class SimpleBaseSelectComponent<
  T = any,
> extends SimpleBaseInputComponent {
  protected readonly matSelectRef = viewChild(MatSelect);
  /** Available options */
  readonly options = signal<SelectOption<T>[]>([]);

  /** Whether multiple selection is enabled */
  readonly multiple = signal<boolean>(false);

  /** Whether the component should allow searching */
  readonly searchable = signal<boolean>(false);

  /** Current search term when `searchable` is enabled */
  readonly searchTerm = signal<string>('');

  /** Emits whenever the search term changes */
  readonly searchTermChange = output<string>();

  /** Whether a "select all" helper should be displayed */
  readonly selectAll = signal<boolean>(false);

  /** Maximum number of selections allowed (only applies when multiple=true) */
  readonly maxSelections = signal<number | null>(null);

  /** Backend resource path for dynamic option loading */
  readonly resourcePath = signal<string | null>(null);
  /** Criteria applied to backend filtering */
  readonly filterCriteria = signal<Record<string, any>>({});
  /** Field used for option labels when loading from backend */
  readonly optionLabelKey = signal<string>('label');
  /** Field used for option values when loading from backend */
  readonly optionValueKey = signal<string>('value');
  /** Current page index when fetching remote options */
  readonly pageIndex = signal(0);
  /** Number of options retrieved per request */
  readonly pageSize = signal(50);

  /** Indicates options are being loaded from backend */
  readonly loading = signal<boolean>(false);
  /** Holds error message when option loading fails */
  readonly error = signal<string | null>(null);

  private readonly matSelectInitEffect = effect(() => {
    const select = this.matSelectRef();
    if (select && select !== this.matSelect) {
      this.registerMatSelect(select);
    }
  });

  /** CRUD service for remote option loading (optional) */
  protected readonly crudService = inject(GenericCrudService as any, {
    optional: true,
  }) as GenericCrudService<any> | null;

  /** Emits whenever the selected value(s) change */
  readonly selectionChange = output<T | T[]>();

  /** Emits whenever a specific option is selected */
  readonly optionSelected = output<SelectOption<T>>();

  /** Emits whenever options are loaded remotely */
  readonly optionsLoaded = output<SelectOption<T>[]>();
  readonly openedChange = output<boolean>();

  protected matSelect: MatSelect | null = null;

  /** Options filtered according to the current `searchTerm` */
  readonly filteredOptions = computed(() => {
    if (this.resourcePath()) {
      return this.options();
    }
    const term = this.searchTerm().toLowerCase();
    return term
      ? this.options().filter((o) => o.label.toLowerCase().includes(term))
      : this.options();
  });

  /**
   * Applies typed metadata to the select component.
   */
  setSelectMetadata(metadata: SimpleSelectMetadata<T>): void {
    this.setMetadata(metadata);
    if (metadata.options) {
      this.options.set(metadata.options);
    }
    this.multiple.set(!!metadata.multiple);
    this.searchable.set(!!metadata.searchable);
    this.selectAll.set(!!metadata.selectAll);
    this.maxSelections.set(metadata.maxSelections ?? null);

    const path = metadata.resourcePath || metadata.endpoint;
    if (path) {
      this.resourcePath.set(path);
      this.filterCriteria.set(metadata.filterCriteria ?? {});
      const needLabel = !metadata.optionLabelKey;
      const needValue = !metadata.optionValueKey;
      if (metadata.optionLabelKey) {
        this.optionLabelKey.set(metadata.optionLabelKey);
      }
      if (metadata.optionValueKey) {
        this.optionValueKey.set(metadata.optionValueKey);
      }
      this.configureCrudService(path);
      if (needLabel || needValue) {
        this.loadSchema(needLabel, needValue);
      } else {
        this.loadOptions();
      }
    }
  }

  protected override setMetadata(metadata: ComponentMetadata): void {
    const { placeholder, ...rest } = metadata as any;
    super.setMetadata(rest);
    this.placeholder = undefined;
    this.applySelectAttributes();
  }

  protected registerMatSelect(select: MatSelect): void {
    this.matSelect = select;
    this.registerInputElement(select._elementRef.nativeElement);
    this.applySelectAttributes();
    select.openedChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.openedChange.emit(v));
    select.selectionChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.selectionChange.emit(event.value as any);
      });
  }

  protected applySelectAttributes(): void {
    if (!this.matSelect) return;
    const meta: any = this.metadata();
    if (!meta) return;

    if (meta.compareWith) this.matSelect.compareWith = meta.compareWith;
    if (meta.panelClass) this.matSelect.panelClass = meta.panelClass;
    if (meta.disableRipple !== undefined)
      this.matSelect.disableRipple = meta.disableRipple;
    if (meta.disableOptionCentering !== undefined)
      this.matSelect.disableOptionCentering = meta.disableOptionCentering;
    if (meta.tabIndex !== undefined) this.matSelect.tabIndex = meta.tabIndex;
    if (meta.required !== undefined) this.matSelect.required = meta.required;
    if (meta.errorStateMatcher)
      this.matSelect.errorStateMatcher = meta.errorStateMatcher;
    if (meta.ariaLabel) this.matSelect.ariaLabel = meta.ariaLabel;
    if (meta.ariaLabelledby)
      this.matSelect.ariaLabelledby = meta.ariaLabelledby;
  }

  /**
   * Updates the current search term and emits the change event.
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.searchTermChange.emit(term);
    if (this.resourcePath()) {
      this.loadOptions(this.pageIndex(), term);
    }
  }

  /**
   * Applies metadata after the component is initialized by the
   * DynamicFieldLoader, ensuring options and remote configuration are
   * processed when using the component declaratively.
   */
  override onComponentInit(): void {
    const meta = this.metadata();
    if (meta) {
      this.setSelectMetadata(meta as SimpleSelectMetadata<T>);
    }
  }

  /**
   * Selects the given option. Handles both single and multiple selection
   * modes and emits the proper events.
   */
  selectOption(option: SelectOption<T>): void {
    if (option.disabled) return;

    if (this.multiple()) {
      const current = Array.isArray(this.internalControl.value)
        ? [...this.internalControl.value]
        : [];
      const exists = current.includes(option.value);

      if (exists) {
        // remove if already selected
        const updated = current.filter((v) => v !== option.value);
        this.setValue(updated);
      } else {
        if (this.maxSelections() && current.length >= this.maxSelections()!) {
          return; // respect max selection limit
        }
        current.push(option.value);
        this.setValue(current);
      }
    } else {
      this.setValue(option.value);
    }

    this.optionSelected.emit(option);
    this.selectionChange.emit(this.internalControl.value as any);
  }

  /** Checks if the provided value is currently selected */
  isSelected(value: T): boolean {
    const current = this.internalControl.value as any;
    return this.multiple()
      ? Array.isArray(current) && current.includes(value)
      : current === value;
  }

  /**
   * Toggles selection of all options when `selectAll` is enabled in multiple
   * selection mode.
   */
  toggleSelectAll(): void {
    if (!this.multiple() || !this.selectAll()) return;

    const selectable = this.options()
      .filter((o) => !o.disabled)
      .map((o) => o.value);
    const target = selectable.slice(
      0,
      this.maxSelections() ?? selectable.length,
    );

    if (this.isAllSelected()) {
      this.setValue([]);
    } else {
      this.setValue(target);
    }

    this.selectionChange.emit(this.internalControl.value as any);
  }

  /** Checks whether all options are currently selected */
  isAllSelected(): boolean {
    if (!this.multiple()) return false;
    const current = Array.isArray(this.internalControl.value)
      ? this.internalControl.value
      : [];
    const selectable = this.options()
      .filter((o) => !o.disabled)
      .map((o) => o.value);
    const target = selectable.slice(
      0,
      this.maxSelections() ?? selectable.length,
    );
    return (
      current.length === target.length &&
      target.length > 0 &&
      target.every((v) => current.includes(v))
    );
  }

  /** TrackBy function to optimize ngFor over options */
  trackByOption(index: number, option: SelectOption<T>): T {
    return option.value;
  }

  /** Adds CSS class hook for select components */
  protected override getSpecificCssClasses(): string[] {
    return ['pdx-simple-select'];
  }

  /** Configures the CRUD service with the given resource path */
  protected configureCrudService(path: string): void {
    this.crudService?.configure(path);
  }

  /**
   * Loads schema metadata to infer label/value keys when not provided.
   * After resolving the keys, options are fetched from the backend.
   */
  protected loadSchema(resolveLabel: boolean, resolveValue: boolean): void {
    if (!this.crudService) {
      return;
    }
    this.crudService
      .getSchema()
      .pipe(take(1))
      .subscribe({
        next: (fields: any[]) => {
          const names = fields.map((f: any) => f.name);
          if (resolveLabel) {
            if (names.includes('name')) {
              this.optionLabelKey.set('name');
            } else if (names.includes('label')) {
              this.optionLabelKey.set('label');
            } else if (names.length > 1) {
              this.optionLabelKey.set(names[1]);
            } else if (names.length) {
              this.optionLabelKey.set(names[0]);
            }
          }
          if (resolveValue) {
            if (names.includes('id')) {
              this.optionValueKey.set('id');
            } else if (names.length) {
              this.optionValueKey.set(names[0]);
            }
          }
          this.loadOptions();
        },
        error: (err: any) => {
          this.error.set(err.message || 'Error loading schema');
        },
      });
  }

  /** Loads options from backend using GenericCrudService */
  protected loadOptions(
    page = 0,
    searchTerm = this.searchTerm(),
    criteria: Record<string, any> = this.filterCriteria(),
  ): void {
    if (!this.crudService || !this.resourcePath()) {
      return;
    }

    const filter = { ...criteria };
    if (searchTerm) {
      filter[this.optionLabelKey()] = searchTerm;
    }

    this.loading.set(true);
    this.crudService
      .filter(filter, { pageNumber: page, pageSize: this.pageSize() })
      .pipe(take(1))
      .subscribe({
        next: (resp: Page<any>) => {
          const opts = resp.content.map((item: any) => ({
            label: item[this.optionLabelKey()],
            value: item[this.optionValueKey()],
          }));
          this.options.set(opts);
          this.optionsLoaded.emit(opts);
          this.loading.set(false);
          this.error.set(null);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error loading options');
        },
      });
  }
}
