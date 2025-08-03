import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PraxisDynamicForm } from './praxis-dynamic-form';
import {
  GenericCrudService,
  CONFIG_STORAGE,
  ConfigStorage,
} from '@praxis/core';
import {
  DynamicFieldLoaderDirective,
  MaterialSelectComponent,
} from '@praxis/dynamic-fields';

describe('PraxisDynamicForm', () => {
  let fixture: ComponentFixture<PraxisDynamicForm>;
  let component: PraxisDynamicForm;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;
  let configStorage: jasmine.SpyObj<ConfigStorage>;

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

    TestBed.overrideComponent(MaterialSelectComponent, {
      set: {
        providers: [{ provide: GenericCrudService, useValue: crudService }],
      },
    });

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicForm, DynamicFieldLoaderDirective],
      providers: [
        { provide: GenericCrudService, useValue: crudService },
        { provide: CONFIG_STORAGE, useValue: configStorage },
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

  it('renderiza campo select com carregamento remoto', async () => {
    const page = {
      content: [{ id: '1', label: 'Ativo' }],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
    } as any;
    crudService.filter.and.returnValue(of(page));
    crudService.getSchema.and.returnValue(of([]));

    component.config = {
      sections: [
        {
          id: 's1',
          rows: [{ columns: [{ fields: ['status'] }] }],
        },
      ],
      fieldMetadata: [
        {
          name: 'status',
          controlType: 'select',
          resourcePath: 'status',
          optionLabelKey: 'label',
          optionValueKey: 'id',
        } as any,
      ],
    };

    (component as any).buildFormFromConfig();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(crudService.filter).toHaveBeenCalled();
    const select = fixture.nativeElement.querySelector('pdx-material-select');
    expect(select).toBeTruthy();
  });
});
