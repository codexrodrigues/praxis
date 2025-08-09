import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependentesListComponent } from './dependentes-list.component';
import { GenericCrudService } from '@praxis/core';

describe('DependentesListComponent', () => {
  let component: DependentesListComponent;
  let fixture: ComponentFixture<DependentesListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(DependentesListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

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
