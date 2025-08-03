import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargosListComponent } from './cargos-list.component';

describe('CargosListComponent', () => {
  let component: CargosListComponent;
  let fixture: ComponentFixture<CargosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CargosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
