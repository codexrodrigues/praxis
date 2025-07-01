import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PraxisVisualBuilder } from './praxis-visual-builder';

describe('PraxisVisualBuilder', () => {
  let component: PraxisVisualBuilder;
  let fixture: ComponentFixture<PraxisVisualBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisVisualBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PraxisVisualBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
