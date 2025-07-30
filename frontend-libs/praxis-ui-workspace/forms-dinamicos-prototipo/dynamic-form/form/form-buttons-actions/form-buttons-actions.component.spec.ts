import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormButtonsActionsComponent } from './form-buttons-actions.component';

describe('FormActionsComponent', () => {
  let component: FormButtonsActionsComponent;
  let fixture: ComponentFixture<FormButtonsActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormButtonsActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormButtonsActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
