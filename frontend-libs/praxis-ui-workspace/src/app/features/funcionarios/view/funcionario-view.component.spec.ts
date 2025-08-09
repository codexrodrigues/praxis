import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuncionarioViewComponent } from './funcionario-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GenericCrudService } from '@praxis/core';

describe('FuncionarioViewComponent', () => {
  let component: FuncionarioViewComponent;
  let fixture: ComponentFixture<FuncionarioViewComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(FuncionarioViewComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [FuncionarioViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
