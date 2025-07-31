import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisDynamicFormConfigEditor } from './praxis-dynamic-form-config-editor';
import { FormConfig, createDefaultFormConfig } from '@praxis/core';
import { FormConfigService } from './services/form-config.service';
import { JsonConfigEditorComponent } from './json-config-editor/json-config-editor.component';

describe('PraxisDynamicFormConfigEditor', () => {
  let component: PraxisDynamicFormConfigEditor;
  let fixture: ComponentFixture<PraxisDynamicFormConfigEditor>;
  let service: jasmine.SpyObj<FormConfigService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('FormConfigService', ['loadConfig'], { currentConfig: { sections: [] } });

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicFormConfigEditor],
      providers: [{ provide: FormConfigService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisDynamicFormConfigEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes editedConfig from service', () => {
    expect(component.editedConfig).toEqual(service.currentConfig);
  });

  it('onReset sets default config and syncs editor', () => {
    const editorSpy = jasmine.createSpyObj<JsonConfigEditorComponent>('JsonConfigEditorComponent', ['updateJsonFromConfig']);
    component.jsonEditor = editorSpy;
    component.editedConfig = { sections: [{ id: 'x', rows: [] }] } as any;

    component.onReset();

    expect(component.editedConfig).toEqual(createDefaultFormConfig());
    expect(editorSpy.updateJsonFromConfig).toHaveBeenCalledWith(component.editedConfig);
  });

  it('onSave persists config via service and emits', () => {
    const cfg: FormConfig = { sections: [{ id: 's1', rows: [] }] } as any;
    component.editedConfig = cfg;
    const saveSpy = jasmine.createSpy('saved');
    component.configSaved.subscribe(saveSpy);

    component.onSave();

    expect(service.loadConfig).toHaveBeenCalledWith(cfg);
    expect(saveSpy).toHaveBeenCalledWith(cfg);
  });

  it('onCancel emits cancelled', () => {
    const cancelSpy = jasmine.createSpy('cancelled');
    component.cancelled.subscribe(cancelSpy);
    component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('onJsonConfigChange updates editedConfig', () => {
    const newCfg: FormConfig = { sections: [{ id: 'new', rows: [] }] } as any;
    component.onJsonConfigChange(newCfg);
    expect(component.editedConfig).toEqual(newCfg);
  });
});
