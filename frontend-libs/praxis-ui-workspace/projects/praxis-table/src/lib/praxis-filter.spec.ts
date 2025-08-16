import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, SimpleChange, ViewChild } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import {
  GenericCrudService,
  ConfigStorage,
  CONFIG_STORAGE,
} from '@praxis/core';
import { PraxisFilter, I18n, FilterTag } from './praxis-filter';
import {
  FilterConfigService,
  FilterConfig,
} from './services/filter-config.service';
import { SettingsPanelService } from '@praxis/settings-panel';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PraxisFilter', () => {
  let component: PraxisFilter;
  let fixture: ComponentFixture<PraxisFilter>;
  let crud: jasmine.SpyObj<GenericCrudService<any>>;
  let storage: jasmine.SpyObj<ConfigStorage>;
  let configService: FilterConfigService;
  let settingsPanel: jasmine.SpyObj<SettingsPanelService>;
  let overlayContainer: OverlayContainer;
  let overlayElement: HTMLElement;

  beforeEach(async () => {
    crud = jasmine.createSpyObj('GenericCrudService', [
      'configure',
      'getFilteredSchema',
      'getSchema',
    ]);
    crud.getFilteredSchema.and.returnValue(of([]));
    crud.getSchema.and.returnValue(of([]));

    storage = jasmine.createSpyObj('ConfigStorage', [
      'loadConfig',
      'saveConfig',
      'clearConfig',
    ]);

    settingsPanel = jasmine.createSpyObj('SettingsPanelService', ['open']);

    await TestBed.configureTestingModule({
      imports: [PraxisFilter, NoopAnimationsModule],
      providers: [
        { provide: GenericCrudService, useValue: crud },
        { provide: CONFIG_STORAGE, useValue: storage },
        FilterConfigService,
        { provide: SettingsPanelService, useValue: settingsPanel },
      ],
    }).compileComponents();
    configService = TestBed.inject(FilterConfigService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function createComponent(
    quickField?: string,
    alwaysVisible: string[] = [],
    persistenceKey?: string,
    value?: Record<string, any>,
    i18n?: Partial<I18n>,
    summary?: any,
    summaryMap?: {
      avatar?: (s: any) => string;
      title: (s: any) => string;
      subtitle?: (s: any) => string;
      badges?: Array<(s: any) => string>;
    },
    tags?: FilterTag[],
    allowSaveTags = false,
    resourcePath = '/test',
  ): void {
    fixture = TestBed.createComponent(PraxisFilter);
    component = fixture.componentInstance;
    component.resourcePath = resourcePath;
    component.formId = 'f1';
    if (quickField) {
      component.quickField = quickField;
    }
    if (alwaysVisible.length) {
      component.alwaysVisibleFields = alwaysVisible;
    }
    if (persistenceKey) {
      component.persistenceKey = persistenceKey;
    }
    if (value) {
      component.value = value;
    }
    if (i18n) {
      component.i18n = i18n;
    }
    if (summary) {
      component.summary = summary;
    }
    if (summaryMap) {
      component.summaryMap = summaryMap;
    }
    if (tags) {
      component.tags = tags;
    }
    if (allowSaveTags) {
      component.allowSaveTags = true;
    }
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should emit submit', () => {
    createComponent();
    const spy = jasmine.createSpy('submit');
    component.submit.subscribe(spy);
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it('should submit latest quick field value without waiting for debounce', () => {
    createComponent('q');
    const submitSpy = jasmine.createSpy('submit');
    component.submit.subscribe(submitSpy);
    component.quickControl.setValue('abc');
    component.onSubmit();
    expect(submitSpy).toHaveBeenCalledWith({ q: 'abc' });
  });

  it('should emit change respecting changeDebounceMs', fakeAsync(() => {
    createComponent();
    const spy = jasmine.createSpy('change');
    component.quickField = 'q';
    component.changeDebounceMs = 100;
    component.change.subscribe(spy);
    component.quickControl.setValue('abc');
    tick(99);
    expect(spy).not.toHaveBeenCalled();
    tick(1);
    expect(spy).toHaveBeenCalledWith({ q: 'abc' });
  }));

  it('should emit clear', () => {
    createComponent();
    const spy = jasmine.createSpy('clear');
    component.clear.subscribe(spy);
    component.onClear();
    expect(spy).toHaveBeenCalled();
    expect(component.quickControl.value).toBe('');
  });

  it('should load filter schema from /filter endpoint', () => {
    createComponent();
    expect(crud.getFilteredSchema).toHaveBeenCalledWith(
      jasmine.objectContaining({
        path: '/test/filter',
        operation: 'post',
        schemaType: 'request',
      }),
    );
  });

  it('normalizes resourcePath without leading slash', () => {
    createComponent(
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      'test',
    );
    expect(crud.getFilteredSchema).toHaveBeenCalledWith(
      jasmine.objectContaining({ path: '/test/filter' }),
    );
  });

  it('should fallback to generic schema when filter schema fails', () => {
    crud.getFilteredSchema.and.returnValue(throwError(() => new Error('x')));
    crud.getSchema.and.returnValue(of([]));
    createComponent();
    expect(crud.getFilteredSchema).toHaveBeenCalledWith(
      jasmine.objectContaining({ path: '/test/filter' }),
    );
    expect(crud.getSchema).toHaveBeenCalled();
    expect(component.schemaError).toBeFalse();
  });

  it('should resolve quick field using dynamic component', () => {
    const defs = [{ name: 'cpf', label: 'CPF', controlType: 'input' } as any];
    crud.getFilteredSchema.and.returnValue(of(defs));
    createComponent('cpf');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('pdx-text-input')).toBeTruthy();
  });

  it('should fallback to text input when field missing', () => {
    crud.getFilteredSchema.and.returnValue(of([]));
    createComponent('cpf');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('input[matinput]')).toBeTruthy();
  });

  it('should apply i18n to quick field fallback hint', () => {
    crud.getFilteredSchema.and.returnValue(of([]));
    createComponent('cpf', [], undefined, undefined, {
      quickFieldNotFound: 'Nenhum campo',
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.fallback-hint')?.textContent?.trim()).toBe(
      'Nenhum campo',
    );
  });

  it('should show schema load error with retry', fakeAsync(() => {
    crud.getFilteredSchema.and.returnValue(throwError(() => new Error('x')));
    crud.getSchema.and.returnValue(throwError(() => new Error('y')));
    createComponent('cpf');
    expect(component.schemaError).toBeTrue();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.schema-error')).toBeTruthy();
    crud.getFilteredSchema.calls.reset();
    crud.getSchema.calls.reset();
    crud.getFilteredSchema.and.returnValue(of([]));
    (component as any).loadSchema();
    expect(component.schemaError).toBeFalse();
    expect(crud.getFilteredSchema).toHaveBeenCalled();
  }));

  it('should render always visible field', () => {
    const defs = [
      { name: 'cpf', label: 'CPF', controlType: 'input' } as any,
      { name: 'age', label: 'Idade', controlType: 'input' } as any,
    ];
    crud.getFilteredSchema.and.returnValue(of(defs));
    createComponent('cpf', ['age']);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('pdx-text-input').length).toBe(2);
  });

  it('should emit change from advanced form', fakeAsync(() => {
    const defs = [
      { name: 'cpf', label: 'CPF', controlType: 'input' } as any,
      { name: 'age', label: 'Idade', controlType: 'input' } as any,
    ];
    crud.getFilteredSchema.and.returnValue(of(defs));
    createComponent('cpf');
    const spy = jasmine.createSpy('change');
    component.change.subscribe(spy);
    component.onAdvancedChange({ formData: { age: 30 } });
    tick(300);
    expect(spy).toHaveBeenCalledWith({ age: 30 });
  }));

  it('should load persisted dto', () => {
    storage.loadConfig.and.returnValue({ cpf: '123' });
    createComponent('cpf', [], 'key1');
    expect(component.quickControl.value).toBe('123');
    expect(storage.loadConfig).toHaveBeenCalledWith('key1');
  });

  it('should save dto on change', fakeAsync(() => {
    storage.loadConfig.and.returnValue(null);
    createComponent('cpf', [], 'key2');
    component.quickControl.setValue('999');
    tick(300);
    expect(storage.saveConfig).toHaveBeenCalledWith('key2', { cpf: '999' });
  }));

  it('should clear persistence on clear', () => {
    createComponent(undefined, [], 'key3');
    component.onClear();
    expect(storage.clearConfig).toHaveBeenCalledWith('key3');
  });

  it('should apply i18n labels', () => {
    createComponent(undefined, [], undefined, undefined, {
      searchPlaceholder: 'Buscar CPF',
      apply: 'Ir',
      advanced: 'Detalhes',
      clear: 'Apagar',
      edit: 'Editar',
      noData: 'Nada',
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe(
      'Buscar CPF',
    );
    expect(
      el.querySelector('button.mat-raised-button')?.textContent?.trim(),
    ).toBe('Ir');
  });

  it('should load config and apply quickField and placeholder', () => {
    spyOn(configService, 'load').and.returnValue({
      quickField: 'cpf',
      placeholder: 'Buscar CPF',
    });
    createComponent();
    expect(component.quickField).toBe('cpf');
    expect(component.i18nLabels.searchPlaceholder).toBe('Buscar CPF');
  });

  it('should give precedence to input over loaded config', () => {
    spyOn(configService, 'load').and.returnValue({ quickField: 'cpf' });
    createComponent('name');
    expect(component.quickField).toBe('name');
  });

  it('should save showAdvanced on toggle', () => {
    spyOn(configService, 'load').and.returnValue({ showAdvanced: false });
    const saveSpy = spyOn(configService, 'save');
    createComponent();
    component.toggleAdvanced();
    expect(saveSpy).toHaveBeenCalledWith('f1', {
      quickField: undefined,
      alwaysVisibleFields: [],
      placeholder: undefined,
      showAdvanced: true,
    });
  });

  it('should cache schema per resourcePath', () => {
    const defs = [
      { name: 'cpf', label: 'CPF', controlType: 'input' } as any,
      { name: 'age', label: 'Idade', controlType: 'input' } as any,
    ];
    crud.getFilteredSchema.and.returnValue(of(defs));
    createComponent('cpf');
    expect(crud.getFilteredSchema).toHaveBeenCalledTimes(1);
    component.quickField = 'age';
    component.ngOnChanges({
      quickField: new SimpleChange('cpf', 'age', false),
    });
    expect(crud.getFilteredSchema).toHaveBeenCalledTimes(1);
    component.resourcePath = '/other';
    component.ngOnChanges({
      resourcePath: new SimpleChange('/test', '/other', false),
    });
    expect(crud.getFilteredSchema).toHaveBeenCalledTimes(2);
  });

  it('should apply tag patch and submit', () => {
    const defs = [{ name: 'cpf', label: 'CPF', controlType: 'input' } as any];
    crud.getFilteredSchema.and.returnValue(of(defs));
    const tags: FilterTag[] = [
      { id: 't1', label: 'CPF 123', patch: { cpf: '123' } },
    ];
    createComponent(
      'cpf',
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      tags,
    );
    const submitSpy = jasmine.createSpy('submit');
    const changeSpy = jasmine.createSpy('change');
    component.submit.subscribe(submitSpy);
    component.change.subscribe(changeSpy);
    const el: HTMLElement = fixture.nativeElement;
    const chip = el.querySelector('mat-chip') as HTMLElement;
    chip.click();
    expect(component.quickControl.value).toBe('123');
    expect(changeSpy).toHaveBeenCalledWith({ cpf: '123' });
    expect(submitSpy).toHaveBeenCalledWith({ cpf: '123' });
  });

  it('should create, rename and delete local tags', fakeAsync(() => {
    storage.loadConfig.and.returnValue(null);
    createComponent(
      'cpf',
      [],
      'keyT',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    component.quickControl.setValue('123');
    tick(300);
    const tagsSpy = jasmine.createSpy('tagsChange');
    component.tagsChange.subscribe(tagsSpy);
    component.createTag('CPF 123');
    expect(tagsSpy).toHaveBeenCalled();
    expect(storage.saveConfig).toHaveBeenCalledWith(
      'keyT:tags',
      jasmine.any(Array),
    );
    const tag = (component as any).savedTags[0];
    tagsSpy.calls.reset();
    component.renameTag(tag, 'CPF 321');
    expect(tag.label).toBe('CPF 321');
    expect(tagsSpy).toHaveBeenCalled();
    component.deleteTag(tag);
    expect((component as any).savedTags.length).toBe(0);
    expect(tagsSpy).toHaveBeenCalled();
  }));

  it('should render native summary in card mode', () => {
    const summary = { name: 'Ana', status: 'ok' };
    const map = { title: (s: any) => s.name, badges: [(s: any) => s.status] };
    createComponent(
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      summary,
      map,
    );
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.praxis-filter-card')).toBeTruthy();
    expect(el.textContent).toContain('Ana');
    expect(el.textContent).toContain('ok');
  });

  it('should render summary using template', () => {
    @Component({
      template: `
        <praxis-filter
          [resourcePath]="'/test'"
          formId="f1"
          [summary]="summary"
          [summaryTemplate]="tmpl"
        ></praxis-filter>
        <ng-template #tmpl let-s>
          <div class="tmpl">{{ s.name }}</div>
        </ng-template>
      `,
      standalone: true,
      imports: [PraxisFilter],
    })
    class HostComponent {
      summary = { name: 'Bob' };
      @ViewChild(PraxisFilter) filter!: PraxisFilter;
    }

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const el: HTMLElement = hostFixture.nativeElement;
    expect(el.querySelector('.tmpl')?.textContent).toContain('Bob');
  });

  it('should switch to filter mode on switchToFilter()', () => {
    const summary = { name: 'Ana' };
    const map = { title: (s: any) => s.name };
    createComponent(
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      summary,
      map,
    );
    component.switchToFilter();
    expect(component.modeState).toBe('filter');
  });

  it('should switch to filter mode when pressing Enter on edit', () => {
    const summary = { name: 'Ana' };
    const map = { title: (s: any) => s.name };
    createComponent(
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      summary,
      map,
    );
    const el: HTMLElement = fixture.nativeElement;
    const editBtn = el.querySelector('.card-actions button') as HTMLElement;
    const modeSpy = jasmine.createSpy('mode');
    component.modeChange.subscribe(modeSpy);
    editBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.modeState).toBe('filter');
    expect(modeSpy).toHaveBeenCalledWith('filter');
  });

  it('should clear when pressing Escape on card', () => {
    const summary = { name: 'Ana' };
    const map = { title: (s: any) => s.name };
    createComponent(
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      summary,
      map,
    );
    const el: HTMLElement = fixture.nativeElement;
    const card = el.querySelector('.praxis-filter-card') as HTMLElement;
    const clearSpy = jasmine.createSpy('clear');
    component.clear.subscribe(clearSpy);
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should open settings panel and apply configuration', () => {
    const applied$ = new Subject<FilterConfig>();
    const saved$ = new Subject<FilterConfig>();
    const ref = { applied$, saved$, close: jasmine.createSpy('close') } as any;
    settingsPanel.open.and.returnValue(ref);
    spyOn(configService, 'save');

    createComponent('cpf', ['age']);
    (component as any).schemaMetas = [
      { name: 'cpf' } as any,
      { name: 'age' } as any,
      { name: 'name' } as any,
    ];

    component.openSettings();

    const newConfig: FilterConfig = {
      quickField: 'name',
      alwaysVisibleFields: ['cpf'],
      placeholder: 'Buscar',
      showAdvanced: true,
    };
    applied$.next(newConfig);

    expect(component.quickField).toBe('name');
    expect(component.alwaysVisibleFields).toEqual(['cpf']);
    expect(component.placeholder).toBe('Buscar');
    expect(component.advancedOpen).toBeTrue();
    expect(ref.close).toHaveBeenCalled();

    const savedConfig: FilterConfig = { quickField: 'id' };
    saved$.next(savedConfig);
    expect(configService.save).toHaveBeenCalledWith('f1', {
      quickField: 'id',
      alwaysVisibleFields: [],
      placeholder: undefined,
      showAdvanced: false,
    });
  });

  it('should open advanced filter as overlay, close with ESC and restore focus', fakeAsync(() => {
    createComponent();
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector('button[cdkoverlayorigin]') as HTMLElement;
    btn.click();
    fixture.detectChanges();
    expect(
      overlayElement.querySelector('.praxis-filter-advanced'),
    ).toBeTruthy();
    overlayElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    tick();
    fixture.detectChanges();
    expect(component.advancedOpen).toBeFalse();
    expect(document.activeElement).toBe(btn);
  }));
});
