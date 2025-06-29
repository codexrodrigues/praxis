import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dependentes } from './dependentes';

describe('Dependentes', () => {
  let component: Dependentes;
  let fixture: ComponentFixture<Dependentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dependentes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dependentes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
