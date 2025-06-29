import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeriasAfastamentos } from './ferias-afastamentos';

describe('FeriasAfastamentos', () => {
  let component: FeriasAfastamentos;
  let fixture: ComponentFixture<FeriasAfastamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeriasAfastamentos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeriasAfastamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
