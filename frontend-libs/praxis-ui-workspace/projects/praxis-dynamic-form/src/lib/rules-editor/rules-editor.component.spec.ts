import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RulesEditorComponent } from './rules-editor.component';
import { FormConfig } from '@praxis/core';

describe('RulesEditorComponent', () => {
  let component: RulesEditorComponent;
  let fixture: ComponentFixture<RulesEditorComponent>;

  const mockConfig: FormConfig = {
    fieldMetadata: [],
    layout: { sections: [] },
    formRules: {
      field1: { visibleWhen: { field2: 'value' } },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesEditorComponent, NoopAnimationsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RulesEditorComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(mockConfig));
    fixture.detectChanges(); // This calls ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with stringified rules', () => {
    expect(component.rulesAsString).toBe(JSON.stringify(mockConfig.formRules, null, 2));
  });

  it('should update config on valid JSON change', () => {
    spyOn(component.configChange, 'emit');
    const newRules = { field3: { requiredWhen: { field4: 'anotherValue' } } };
    const newRulesString = JSON.stringify(newRules);
    component.onRulesChange(newRulesString);

    const expectedConfig = { ...mockConfig, formRules: newRules };
    expect(component.configChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      formRules: newRules
    }));
    expect(component.parsingError).toBeNull();
  });

  it('should set parsingError on invalid JSON change', () => {
    spyOn(component.configChange, 'emit');
    const invalidJson = '{"field":}';
    component.onRulesChange(invalidJson);

    expect(component.configChange.emit).not.toHaveBeenCalled();
    expect(component.parsingError).not.toBeNull();
  });
});
