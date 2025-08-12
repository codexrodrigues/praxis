import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargosCrudComponent } from './cargos-crud.component';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericCrudService } from '@praxis/core';
import { DialogService } from 'praxis-crud';

describe('CargosCrudComponent', () => {
  let component: CargosCrudComponent;
  let fixture: ComponentFixture<CargosCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargosCrudComponent, RouterTestingModule],
      providers: [
        { provide: GenericCrudService, useValue: { configure: () => {} } },
        { provide: DialogService, useValue: { open: () => ({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CargosCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

