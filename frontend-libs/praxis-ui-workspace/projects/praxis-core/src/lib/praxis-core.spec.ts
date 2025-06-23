import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PraxisCore } from './praxis-core';

describe('PraxisCore', () => {
  let component: PraxisCore;
  let fixture: ComponentFixture<PraxisCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisCore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PraxisCore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
