import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonConfigEditorComponent } from './json-config-editor.component';
import { FormConfig } from '@praxis/core';
import { FormConfigService } from '../services/form-config.service';

describe('JsonConfigEditorComponent', () => {
  let component: JsonConfigEditorComponent;
  let fixture: ComponentFixture<JsonConfigEditorComponent>;
  let service: jasmine.SpyObj<FormConfigService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('FormConfigService', ['loadConfig', 'validateConfig'], { currentConfig: { sections: [] } });
    service.validateConfig.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [JsonConfigEditorComponent],
      providers: [{ provide: FormConfigService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(JsonConfigEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes with config from service when none provided', () => {
    expect(component.jsonText).toContain('sections');
    expect(component.isValidJson).toBeTrue();
  });

  it('applyJsonChanges emits parsed config and calls service', () => {
    const cfg: FormConfig = { sections: [{ id: 's1', rows: [] }] } as any;
    component.jsonText = JSON.stringify(cfg);
    const changeSpy = jasmine.createSpy('change');
    const eventSpy = jasmine.createSpy('event');
    component.configChange.subscribe(changeSpy);
    component.editorEvent.subscribe(eventSpy);

    component.applyJsonChanges();

    expect(service.loadConfig).toHaveBeenCalledWith(cfg);
    expect(changeSpy).toHaveBeenCalledWith(cfg);
    expect(eventSpy).toHaveBeenCalled();
  });

  it('applyJsonChanges handles invalid JSON gracefully', () => {
    const eventSpy = jasmine.createSpy('event');
    component.editorEvent.subscribe(eventSpy);
    component.jsonText = '{ invalid';

    component.applyJsonChanges();

    expect(service.loadConfig).not.toHaveBeenCalled();
    expect(eventSpy).toHaveBeenCalled();
    expect(component.isValidJson).toBeFalse();
  });

  it('formatJson prettifies JSON and emits event', () => {
    const cfg = { sections: [] };
    component.jsonText = JSON.stringify(cfg);
    const eventSpy = jasmine.createSpy('event');
    component.editorEvent.subscribe(eventSpy);

    component.formatJson();

    expect(component.jsonText).toContain('\n');
    expect(eventSpy).toHaveBeenCalled();
  });

  it('updateJsonFromConfig updates text and validation state', () => {
    const cfg: FormConfig = { sections: [{ id: 'n', rows: [] }] } as any;
    component.updateJsonFromConfig(cfg);

    expect(component.jsonText).toContain('"n"');
    expect(component.isValidJson).toBeTrue();
  });
});
