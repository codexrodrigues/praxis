import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependentesListComponent } from './dependentes-list.component';

describe('DependentesListComponent', () => {
  let component: DependentesListComponent;
  let fixture: ComponentFixture<DependentesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependentesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DependentesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
