import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRuleEditorComponent } from './form-rule-editor.component';

describe('FormRuleEditorComponent', () => {
  let component: FormRuleEditorComponent;
  let fixture: ComponentFixture<FormRuleEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRuleEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRuleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
