import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PraxisSpecification } from './praxis-specification';

describe('PraxisSpecification', () => {
  let component: PraxisSpecification;
  let fixture: ComponentFixture<PraxisSpecification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisSpecification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PraxisSpecification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
