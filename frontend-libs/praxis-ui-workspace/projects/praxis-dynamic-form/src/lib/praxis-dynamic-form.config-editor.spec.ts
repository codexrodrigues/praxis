import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisDynamicForm } from './praxis-dynamic-form';
import { GenericCrudService, FormConfig } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';
import { PraxisResizableWindowService } from '@praxis/core';
import { of } from 'rxjs';

describe('PraxisDynamicForm openConfigEditor', () => {
  let component: PraxisDynamicForm;
  let fixture: ComponentFixture<PraxisDynamicForm>;
  let windowService: jasmine.SpyObj<PraxisResizableWindowService>;
  let layoutService: jasmine.SpyObj<FormLayoutService>;

  beforeEach(async () => {
    const crud = jasmine.createSpyObj('GenericCrudService', ['configure', 'configureEndpoints', 'getSchema', 'get', 'create', 'update']);
    layoutService = jasmine.createSpyObj('FormLayoutService', ['saveLayout', 'loadLayout']);
    const contextService = jasmine.createSpyObj('FormContextService', ['setAvailableFields', 'setFormRules']);
    windowService = jasmine.createSpyObj('PraxisResizableWindowService', ['open']);

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicForm, DynamicFieldLoaderDirective],
      providers: [
        { provide: GenericCrudService, useValue: crud },
        { provide: FormLayoutService, useValue: layoutService },
        { provide: FormContextService, useValue: contextService },
        { provide: PraxisResizableWindowService, useValue: windowService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisDynamicForm);
    component = fixture.componentInstance;
    component.editModeEnabled = true;
    component.formId = 'f1';
    component.layout = { fieldsets: [] } as any;
    component.config = { sections: [] };
    fixture.detectChanges();
  });

  it('applies result when window closes with config', () => {
    const returned: FormConfig = { sections: [{ id: 'n', rows: [] }] } as any;
    windowService.open.and.returnValue({ closed: of(returned) } as any);

    component.openConfigEditor();

    expect(windowService.open).toHaveBeenCalled();
    expect(component.config).toEqual(returned);
    expect(layoutService.saveLayout).toHaveBeenCalledWith('f1', component.layout as any);
  });

  it('ignores close event without result', () => {
    windowService.open.and.returnValue({ closed: of(null) } as any);
    component.openConfigEditor();
    expect(component.config.sections.length).toBe(0);
  });
});
