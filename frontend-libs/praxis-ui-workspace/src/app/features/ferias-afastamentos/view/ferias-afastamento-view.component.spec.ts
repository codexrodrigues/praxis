import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeriasAfastamentoViewComponent } from './ferias-afastamento-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FeriasAfastamentoViewComponent', () => {
  let component: FeriasAfastamentoViewComponent;
  let fixture: ComponentFixture<FeriasAfastamentoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeriasAfastamentoViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeriasAfastamentoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
