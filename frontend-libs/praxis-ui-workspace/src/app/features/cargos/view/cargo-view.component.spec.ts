import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargoViewComponent } from './cargo-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GenericCrudService } from '@praxis/core';

describe('CargoViewComponent', () => {
  let component: CargoViewComponent;
  let fixture: ComponentFixture<CargoViewComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(CargoViewComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [CargoViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CargoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
