import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { PraxisDynamicForm } from './praxis-dynamic-form';
import {
  GenericCrudService,
  CONFIG_STORAGE,
  ConfigStorage,
  FieldControlType,
  MaterialDatepickerMetadata,
  MaterialDateRangeMetadata,
  DateRangeValue,
  MaterialPriceRangeMetadata,
  FormConfig,
} from '@praxis/core';
import {
  DynamicFieldLoaderDirective,
  MaterialSelectComponent,
  MaterialCheckboxGroupComponent,
  MaterialRadioGroupComponent,
} from '@praxis/dynamic-fields';
import { SettingsPanelService } from '@praxis/settings-panel';

describe('PraxisDynamicForm', () => {
  let fixture: ComponentFixture<PraxisDynamicForm>;
  let component: PraxisDynamicForm;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;
  let configStorage: jasmine.SpyObj<ConfigStorage>;
  let settingsPanel: jasmine.SpyObj<SettingsPanelService>;

  beforeEach(async () => {
    crudService = jasmine.createSpyObj('GenericCrudService', [
      'configure',
      'configureEndpoints',
      'getSchema',
      'getById',
      'create',
      'update',
      'filter',
    ]);

    configStorage = jasmine.createSpyObj('ConfigStorage', [
      'loadConfig',
      'saveConfig',
      'clearConfig',
    ]);
    settingsPanel = jasmine.createSpyObj('SettingsPanelService', ['open']);

    TestBed.overrideComponent(MaterialSelectComponent, {
      set: {
        providers: [{ provide: GenericCrudService, useValue: crudService }],
      },
    });

    TestBed.overrideComponent(MaterialCheckboxGroupComponent, {
      set: {
        providers: [{ provide: GenericCrudService, useValue: crudService }],
      },
    });

    TestBed.overrideComponent(MaterialRadioGroupComponent, {
      set: {
        providers: [{ provide: GenericCrudService, useValue: crudService }],
      },
    });

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicForm, DynamicFieldLoaderDirective],
      providers: [
        { provide: GenericCrudService, useValue: crudService },
        { provide: CONFIG_STORAGE, useValue: configStorage },
        { provide: SettingsPanelService, useValue: settingsPanel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisDynamicForm);
    component = fixture.componentInstance;
  });

  it('gera formulário a partir do resourcePath', async () => {
    const schema = [{ name: 'nome', controlType: 'input' }];
    crudService.getSchema.and.returnValue(of(schema as any));
    configStorage.loadConfig.and.returnValue(null); // No local config
    component.resourcePath = 'usuarios';
    component.formId = 'test-form';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.config.fieldMetadata?.length).toBe(1);
    expect(configStorage.saveConfig).toHaveBeenCalled();
  });

  it('altera para modo edit ao receber resourceId', () => {
    crudService.getById.and.returnValue(of({ id: 1, nome: 'Teste' }));
    component.mode = 'edit';
    component.resourceId = 1;
    component.resourcePath = 'usuarios';
    crudService.getSchema.and.returnValue(of([]));
    component.ngOnChanges({
      resourcePath: {
        currentValue: 'usuarios',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
      resourceId: {
        currentValue: 1,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(crudService.getById).toHaveBeenCalled();
  });

  it('mostra botão de edição quando editModeEnabled é verdadeiro', () => {
    const schema = [{ name: 'nome', controlType: 'input' }];
    crudService.getSchema.and.returnValue(of(schema as any));
    component.resourcePath = 'usuarios';
    component.editModeEnabled = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[mat-icon-button]',
    );
    expect(button).toBeTruthy();
  });

  it('emite formReady após construir o formulário', async () => {
    const schema = [{ name: 'nome', controlType: 'input' }];
    crudService.getSchema.and.returnValue(of(schema as any));
    const readySpy = jasmine.createSpy('formReady');
    component.formReady.subscribe(readySpy);
    component.resourcePath = 'usuarios';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(readySpy).toHaveBeenCalled();
  });

  it('propaga alterações aplicadas, salvas e resetadas via painel de configurações', () => {
    const ref: any = {
      applied$: new Subject<FormConfig>(),
      saved$: new Subject<FormConfig>(),
      reset$: new Subject<void>(),
    };
    settingsPanel.open.and.returnValue(ref);

    component.formId = 'f1';
    component.config = { sections: [], fieldMetadata: [] } as any;
    const changeSpy = jasmine.createSpy('configChange');
    component.configChange.subscribe(changeSpy);

    component.openConfigEditor();

    const applied = {
      sections: [{ id: 'a', rows: [] }],
      fieldMetadata: [],
    } as any;
    ref.applied$.next(applied);
    expect(component.config).toEqual(applied);
    expect(changeSpy).toHaveBeenCalledWith(applied);

    const saved = {
      sections: [{ id: 'b', rows: [] }],
      fieldMetadata: [],
    } as any;
    ref.saved$.next(saved);
    expect(configStorage.saveConfig).toHaveBeenCalledWith(
      'form-config:f1',
      saved,
    );
    expect(changeSpy).toHaveBeenCalledWith(saved);

    ref.reset$.next();
    expect(component.config).toEqual({
      sections: [],
      fieldMetadata: [],
    } as any);
    expect(changeSpy).toHaveBeenCalledWith(component.config);
  });

  it('configura endpoints customizados quando informados', () => {
    const endpoints = { create: '/custom' };
    component.customEndpoints = endpoints;
    expect(crudService.configureEndpoints).toHaveBeenCalledWith(endpoints);
  });

  it('emite evento de submit após criação', () => {
    crudService.create.and.returnValue(of({ id: 1 } as any));
    const submitSpy = jasmine.createSpy('submit');
    component.formSubmit.subscribe(submitSpy);
    component.config = {
      sections: [],
      fieldMetadata: [{ name: 'nome', controlType: 'input' } as any],
    };
    (component as any).buildFormFromConfig();
    component.form.setValue({ nome: 'Teste' });
    component.onSubmit();
    expect(submitSpy).toHaveBeenCalled();
  });

  it('aplica validadores de min/max em campos de data', () => {
    component.config = {
      sections: [],
      fieldMetadata: [
        {
          name: 'birth',
          controlType: FieldControlType.DATE_PICKER,
          minDate: '2024-01-01',
          maxDate: '2024-12-31',
        } as MaterialDatepickerMetadata,
      ],
    };
    (component as any).buildFormFromConfig();
    const ctrl = component.form.get('birth')!;
    ctrl.setValue(new Date('2023-12-31'));
    expect(ctrl.hasError('minDate')).toBeTrue();
    ctrl.setValue(new Date('2024-06-15'));
    expect(ctrl.valid).toBeTrue();
    ctrl.setValue(new Date('2025-01-01'));
    expect(ctrl.hasError('maxDate')).toBeTrue();
  });

  it('valida campos de intervalo de datas', () => {
    component.config = {
      sections: [],
      fieldMetadata: [
        {
          name: 'period',
          controlType: FieldControlType.DATE_RANGE,
          minDate: '2024-01-01',
          maxDate: '2024-12-31',
        } as MaterialDateRangeMetadata,
      ],
    };
    (component as any).buildFormFromConfig();
    const ctrl = component.form.get('period')!;
    ctrl.setValue({
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-01-01'),
    } as DateRangeValue);
    expect(ctrl.hasError('rangeOrder')).toBeTrue();
    ctrl.setValue({
      startDate: new Date('2023-12-31'),
      endDate: new Date('2024-01-05'),
    } as DateRangeValue);
    expect(ctrl.hasError('minDate')).toBeTrue();
    ctrl.setValue({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    } as DateRangeValue);
    expect(ctrl.valid).toBeTrue();
  });

  it('exige início e fim quando campo de intervalo é obrigatório', () => {
    component.config = {
      sections: [],
      fieldMetadata: [
        {
          name: 'period',
          controlType: FieldControlType.DATE_RANGE,
          required: true,
        } as MaterialDateRangeMetadata,
      ],
    };
    (component as any).buildFormFromConfig();
    const ctrl = component.form.get('period')!;

    expect(ctrl.hasError('required')).toBeTrue();

    ctrl.setValue({ startDate: new Date('2024-01-01'), endDate: null });
    expect(ctrl.hasError('required')).toBeTrue();

    ctrl.setValue({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
    });
    expect(ctrl.valid).toBeTrue();
  });

  it('valida campos de faixa de preço', () => {
    component.config = {
      sections: [],
      fieldMetadata: [
        {
          name: 'price',
          controlType: FieldControlType.RANGE_SLIDER,
          min: 0,
          max: 1000,
        } as MaterialPriceRangeMetadata,
      ],
    };
    (component as any).buildFormFromConfig();
    const ctrl = component.form.get('price')!;
    ctrl.setValue({ minPrice: 500, maxPrice: 400 });
    expect(ctrl.hasError('rangeOrder')).toBeTrue();
    ctrl.setValue({ minPrice: -10, maxPrice: 100 });
    expect(ctrl.hasError('minValue')).toBeTrue();
    ctrl.setValue({ minPrice: 100, maxPrice: 1500 });
    expect(ctrl.hasError('maxValue')).toBeTrue();
    ctrl.setValue({ minPrice: 100, maxPrice: 200 });
    expect(ctrl.valid).toBeTrue();
  });

  it('exige mínimo e máximo quando faixa de preço é obrigatória', () => {
    component.config = {
      sections: [],
      fieldMetadata: [
        {
          name: 'budget',
          controlType: FieldControlType.RANGE_SLIDER,
          required: true,
        } as MaterialPriceRangeMetadata,
      ],
    };
    (component as any).buildFormFromConfig();
    const ctrl = component.form.get('budget')!;

    expect(ctrl.hasError('required')).toBeTrue();

    ctrl.setValue({ minPrice: 100, maxPrice: null });
    expect(ctrl.hasError('required')).toBeTrue();

    ctrl.setValue({ minPrice: 100, maxPrice: 200 });
    expect(ctrl.valid).toBeTrue();
  });
});
