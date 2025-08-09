import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolhaPagamentoViewComponent } from './folha-pagamento-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GenericCrudService } from '@praxis/core';

describe('FolhaPagamentoViewComponent', () => {
  let component: FolhaPagamentoViewComponent;
  let fixture: ComponentFixture<FolhaPagamentoViewComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(FolhaPagamentoViewComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [FolhaPagamentoViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhaPagamentoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
