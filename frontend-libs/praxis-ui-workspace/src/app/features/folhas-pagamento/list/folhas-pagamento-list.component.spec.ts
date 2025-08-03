import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolhasPagamentoListComponent } from './folhas-pagamento-list.component';

describe('FolhasPagamentoListComponent', () => {
  let component: FolhasPagamentoListComponent;
  let fixture: ComponentFixture<FolhasPagamentoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolhasPagamentoListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhasPagamentoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
