import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargosListComponent } from './cargos-list.component';
import { GenericCrudService } from '@praxis/core';

describe('CargosListComponent', () => {
  let component: CargosListComponent;
  let fixture: ComponentFixture<CargosListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(CargosListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

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
