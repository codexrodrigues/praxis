import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRowHeaderComponent } from './form-row-header.component';

describe('RowHeaderComponent', () => {
  let component: FormRowHeaderComponent;
  let fixture: ComponentFixture<FormRowHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRowHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRowHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
