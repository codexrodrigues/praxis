import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartamentosListComponent } from './departamentos-list.component';
import { GenericCrudService } from '@praxis/core';

describe('DepartamentosListComponent', () => {
  let component: DepartamentosListComponent;
  let fixture: ComponentFixture<DepartamentosListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(DepartamentosListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [DepartamentosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartamentosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
