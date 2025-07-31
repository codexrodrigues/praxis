import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionariosListComponent } from './funcionarios-list.component';

describe('FuncionariosListComponent', () => {
  let component: FuncionariosListComponent;
  let fixture: ComponentFixture<FuncionariosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionariosListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuncionariosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
