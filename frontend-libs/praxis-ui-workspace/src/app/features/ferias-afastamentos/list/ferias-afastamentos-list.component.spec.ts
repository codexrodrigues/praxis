import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeriasAfastamentosListComponent } from './ferias-afastamentos-list.component';

describe('FeriasAfastamentosListComponent', () => {
  let component: FeriasAfastamentosListComponent;
  let fixture: ComponentFixture<FeriasAfastamentosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeriasAfastamentosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeriasAfastamentosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
