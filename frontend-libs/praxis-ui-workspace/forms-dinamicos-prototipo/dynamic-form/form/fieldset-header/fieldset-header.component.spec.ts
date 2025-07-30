import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsetHeaderComponent } from './fieldset-header.component';

describe('FieldsetHeaderComponent', () => {
  let component: FieldsetHeaderComponent;
  let fixture: ComponentFixture<FieldsetHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldsetHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldsetHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
