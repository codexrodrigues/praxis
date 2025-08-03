import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependenteViewComponent } from './dependente-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DependenteViewComponent', () => {
  let component: DependenteViewComponent;
  let fixture: ComponentFixture<DependenteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenteViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DependenteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
