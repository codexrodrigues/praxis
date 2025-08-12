import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisDynamicFormConfigEditor } from './praxis-dynamic-form-config-editor';
import { FormConfig, createDefaultFormConfig } from '@praxis/core';
import { FormConfigService } from './services/form-config.service';
import { JsonConfigEditorComponent } from './json-config-editor/json-config-editor.component';
import { SETTINGS_PANEL_DATA } from '@praxis/settings-panel';

describe('PraxisDynamicFormConfigEditor', () => {
  let component: PraxisDynamicFormConfigEditor;
  let fixture: ComponentFixture<PraxisDynamicFormConfigEditor>;
  let service: jasmine.SpyObj<FormConfigService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('FormConfigService', ['loadConfig'], {
      currentConfig: { sections: [] },
    });

    await TestBed.configureTestingModule({
      imports: [PraxisDynamicFormConfigEditor],
      providers: [
        { provide: FormConfigService, useValue: service },
        { provide: SETTINGS_PANEL_DATA, useValue: undefined },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisDynamicFormConfigEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes editedConfig with default config and loads service', () => {
    expect(component.editedConfig).toEqual(createDefaultFormConfig());
    expect(service.loadConfig).toHaveBeenCalled();
  });

  it('clones injected data to prevent external mutation', async () => {
    const injected: FormConfig = {
      sections: [{ id: 's1', rows: [] }],
      fieldMetadata: [],
    } as any;

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PraxisDynamicFormConfigEditor],
      providers: [
        { provide: FormConfigService, useValue: service },
        { provide: SETTINGS_PANEL_DATA, useValue: injected },
      ],
    }).compileComponents();

    const fix = TestBed.createComponent(PraxisDynamicFormConfigEditor);
    const comp = fix.componentInstance;
    fix.detectChanges();
    comp.editedConfig.sections[0].id = 'changed';
    expect(injected.sections[0].id).toBe('s1');
  });

  it('reset sets default config and syncs editor', () => {
    const editorSpy = jasmine.createSpyObj<JsonConfigEditorComponent>(
      'JsonConfigEditorComponent',
      ['updateJsonFromConfig'],
    );
    component.jsonEditor = editorSpy;
    component.editedConfig = { sections: [{ id: 'x', rows: [] }] } as any;

    component.reset();

    expect(component.editedConfig).toEqual(createDefaultFormConfig());
    expect(editorSpy.updateJsonFromConfig).toHaveBeenCalledWith(
      component.editedConfig,
    );
  });

  it('getSettingsValue returns current config', () => {
    const cfg: FormConfig = { sections: [{ id: 's1', rows: [] }] } as any;
    component.editedConfig = cfg;
    expect(component.getSettingsValue()).toBe(cfg);
  });

  it('onJsonConfigChange updates editedConfig', () => {
    const newCfg: FormConfig = { sections: [{ id: 'new', rows: [] }] } as any;
    component.onJsonConfigChange(newCfg);
    expect(component.editedConfig).toEqual(newCfg);
  });
});
