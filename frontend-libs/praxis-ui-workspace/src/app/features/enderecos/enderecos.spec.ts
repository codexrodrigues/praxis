import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enderecos } from './enderecos';

describe('Enderecos', () => {
  let component: Enderecos;
  let fixture: ComponentFixture<Enderecos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enderecos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Enderecos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
