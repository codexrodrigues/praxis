import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolhaPagamento } from './folha-pagamento';

describe('FolhaPagamento', () => {
  let component: FolhaPagamento;
  let fixture: ComponentFixture<FolhaPagamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolhaPagamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolhaPagamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
