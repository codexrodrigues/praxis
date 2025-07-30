import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSettingsEditorComponent } from './form-settings-editor.component';

describe('FormSettingsEditorComponent', () => {
  let component: FormSettingsEditorComponent;
  let fixture: ComponentFixture<FormSettingsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSettingsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSettingsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
