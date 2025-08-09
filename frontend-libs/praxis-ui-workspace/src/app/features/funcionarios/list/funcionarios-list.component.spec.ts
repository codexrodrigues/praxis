import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuncionariosListComponent } from './funcionarios-list.component';
import { GenericCrudService } from '@praxis/core';

describe('FuncionariosListComponent', () => {
  let component: FuncionariosListComponent;
  let fixture: ComponentFixture<FuncionariosListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(FuncionariosListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [FuncionariosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionariosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
