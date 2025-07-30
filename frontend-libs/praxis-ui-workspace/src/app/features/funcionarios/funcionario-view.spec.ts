import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuncionarioView } from './funcionario-view';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FuncionarioView', () => {
  let component: FuncionarioView;
  let fixture: ComponentFixture<FuncionarioView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionarioView],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
