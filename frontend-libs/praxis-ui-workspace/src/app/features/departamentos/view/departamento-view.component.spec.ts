import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartamentoViewComponent } from './departamento-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DepartamentoViewComponent', () => {
  let component: DepartamentoViewComponent;
  let fixture: ComponentFixture<DepartamentoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentoViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartamentoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
