import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PraxisDynamicForm, FormSubmitEvent } from './praxis-dynamic-form';
import { GenericCrudService } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';

describe('PraxisDynamicForm', () => {
  let fixture: ComponentFixture<PraxisDynamicForm>;
  let component: PraxisDynamicForm;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;

  beforeEach(async () => {
    crudService = jasmine.createSpyObj('GenericCrudService', ['configure', 'getSchema', 'get', 'create', 'update']);

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicForm, DynamicFieldLoaderDirective],
      providers: [{ provide: GenericCrudService, useValue: crudService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisDynamicForm);
    component = fixture.componentInstance;
  });

  it('gera formulário a partir do resourcePath', async () => {
    const schema = [{ name: 'nome', controlType: 'input' }];
    crudService.getSchema.and.returnValue(of(schema as any));
    component.resourcePath = 'usuarios';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component['fieldMetadata'].length).toBe(1);
  });

  it('altera para modo edit ao receber resourceId', () => {
    crudService.get.and.returnValue(of({ id: 1, nome: 'Teste' }));
    component.mode = 'edit';
    component.resourceId = 1;
    component.resourcePath = 'usuarios';
    crudService.getSchema.and.returnValue(of([]));
    component.ngOnChanges({ resourcePath: { currentValue: 'usuarios', previousValue: undefined, firstChange: true, isFirstChange: () => true }, resourceId: { currentValue: 1, previousValue: undefined, firstChange: true, isFirstChange: () => true } });
    expect(crudService.get).toHaveBeenCalled();
  });

  it('mostra botão de edição quando editModeEnabled é verdadeiro', () => {
    const schema = [{ name: 'nome', controlType: 'input' }];
    crudService.getSchema.and.returnValue(of(schema as any));
    component.resourcePath = 'usuarios';
    component.editModeEnabled = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(button).toBeTruthy();
  });
});
