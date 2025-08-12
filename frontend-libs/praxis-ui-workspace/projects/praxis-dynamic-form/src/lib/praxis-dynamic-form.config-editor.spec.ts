import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisDynamicForm } from './praxis-dynamic-form';
import { GenericCrudService, FormConfig } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';
import { SettingsPanelService } from '@praxis/settings-panel';
import { of } from 'rxjs';

describe('PraxisDynamicForm openConfigEditor', () => {
  let component: PraxisDynamicForm;
  let fixture: ComponentFixture<PraxisDynamicForm>;
  let panelService: jasmine.SpyObj<SettingsPanelService>;
  let layoutService: jasmine.SpyObj<FormLayoutService>;

  beforeEach(async () => {
    const crud = jasmine.createSpyObj('GenericCrudService', [
      'configure',
      'configureEndpoints',
      'getSchema',
      'get',
      'create',
      'update',
    ]);
    layoutService = jasmine.createSpyObj('FormLayoutService', [
      'saveLayout',
      'loadLayout',
    ]);
    const contextService = jasmine.createSpyObj('FormContextService', [
      'setAvailableFields',
      'setFormRules',
    ]);
    panelService = jasmine.createSpyObj('SettingsPanelService', ['open']);

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicForm, DynamicFieldLoaderDirective],
      providers: [
        { provide: GenericCrudService, useValue: crud },
        { provide: FormLayoutService, useValue: layoutService },
        { provide: FormContextService, useValue: contextService },
        { provide: SettingsPanelService, useValue: panelService },
      ],
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
    panelService.open.and.returnValue({
      applied$: of(null),
      saved$: of(returned),
      reset$: of(void 0),
    } as any);

    component.openConfigEditor();

    expect(panelService.open).toHaveBeenCalled();
    expect(component.config).toEqual(returned);
  });

  it('ignores close event without result', () => {
    panelService.open.and.returnValue({
      applied$: of(null),
      saved$: of(null),
      reset$: of(void 0),
    } as any);
    component.openConfigEditor();
    expect(component.config.sections.length).toBe(0);
  });
});
